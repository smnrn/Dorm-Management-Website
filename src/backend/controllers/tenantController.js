const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all tenants
const getAllTenants = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        t.*,
        r.room_number,
        r.capacity as room_capacity,
        r.current_occupants as room_current_occupants
      FROM "Tenant" t
      LEFT JOIN "Rooms" r ON t.room_id = r.room_id
      ORDER BY t.full_name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve tenants',
      message: error.message 
    });
  }
};

// Get tenant by ID
const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        t.*,
        r.room_number,
        r.capacity as room_capacity,
        r.current_occupants as room_current_occupants
      FROM "Tenant" t
      LEFT JOIN "Rooms" r ON t.room_id = r.room_id
      WHERE t.tenant_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Tenant not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve tenant',
      message: error.message 
    });
  }
};

// Create new tenant
const createTenant = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const {
      username,
      password,
      full_name,
      email,
      contact_number,
      room_id,
      emergency_contact_name,
      emergency_contact_number,
      move_in_date
    } = req.body;

    // Validate required fields
    if (!username || !password || !full_name || !email || !contact_number || !room_id) {
      return res.status(400).json({ 
        error: 'All required fields must be provided' 
      });
    }

    // Check if username or email already exists
    const existingResult = await client.query(
      'SELECT * FROM "Tenant" WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Check room availability
    const roomResult = await client.query(
      'SELECT * FROM "Rooms" WHERE room_id = $1',
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Room not found' 
      });
    }

    const room = roomResult.rows[0];
    if (room.current_occupants >= room.capacity) {
      return res.status(400).json({ 
        error: 'Room is at full capacity' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await client.query('BEGIN');

    try {
      // Insert tenant
      const result = await client.query(
        `INSERT INTO "Tenant" 
         (username, password, full_name, email, contact_number, room_id, 
          emergency_contact_name, emergency_contact_number, move_in_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING tenant_id`,
        [username, hashedPassword, full_name, email, contact_number, room_id,
         emergency_contact_name, emergency_contact_number, move_in_date || new Date(), 'Active']
      );

      // Update room occupancy
      await client.query(
        'UPDATE "Rooms" SET current_occupants = current_occupants + 1 WHERE room_id = $1',
        [room_id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        tenantId: result.rows[0].tenant_id
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ 
      error: 'Failed to create tenant',
      message: error.message 
    });
  } finally {
    client.release();
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.tenant_id;
    delete updates.password; // Password updates should use separate endpoint
    delete updates.username; // Username shouldn't be changed

    // If updating status, handle room occupancy changes
    if (updates.status) {
      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');

        // Get tenant's current status and room
        const tenantResult = await client.query(
          'SELECT status, room_id FROM "Tenant" WHERE tenant_id = $1',
          [id]
        );

        if (tenantResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Tenant not found' });
        }

        const currentStatus = tenantResult.rows[0].status;
        const roomId = tenantResult.rows[0].room_id;
        const newStatus = updates.status;

        // Handle room occupancy changes based on status transitions
        if (roomId) {
          // Moving Out: Active → Moved Out (decrement occupancy)
          if (currentStatus === 'Active' && newStatus === 'Moved Out') {
            await client.query(
              'UPDATE "Rooms" SET current_occupants = current_occupants - 1 WHERE room_id = $1',
              [roomId]
            );
            console.log(`Room ${roomId} occupancy decreased (tenant moved out)`);
          }
          // Returning: Moved Out → Active (increment occupancy)
          else if (currentStatus === 'Moved Out' && newStatus === 'Active') {
            await client.query(
              'UPDATE "Rooms" SET current_occupants = current_occupants + 1 WHERE room_id = $1',
              [roomId]
            );
            console.log(`Room ${roomId} occupancy increased (tenant returned)`);
          }
        }

        // Update tenant status
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');

        await client.query(
          `UPDATE "Tenant" SET ${setClause} WHERE tenant_id = $${fields.length + 1}`,
          [...values, id]
        );

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Tenant updated successfully'
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      // Regular update without status/room occupancy changes
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      if (fields.length === 0) {
        return res.status(400).json({ 
          error: 'No fields to update' 
        });
      }

      const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');

      const result = await db.query(
        `UPDATE "Tenant" SET ${setClause} WHERE tenant_id = $${fields.length + 1}`,
        [...values, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ 
          error: 'Tenant not found' 
        });
      }

      res.json({
        success: true,
        message: 'Tenant updated successfully'
      });
    }
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ 
      error: 'Failed to update tenant',
      message: error.message 
    });
  }
};

// Delete tenant
const deleteTenant = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    try {
      // Get tenant's room
      const tenantResult = await client.query(
        'SELECT room_id FROM "Tenant" WHERE tenant_id = $1',
        [id]
      );

      if (tenantResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          error: 'Tenant not found' 
        });
      }

      // Decrease room occupancy
      if (tenantResult.rows[0].room_id) {
        await client.query(
          'UPDATE "Rooms" SET current_occupants = current_occupants - 1 WHERE room_id = $1',
          [tenantResult.rows[0].room_id]
        );
      }

      // Delete tenant
      await client.query('DELETE FROM "Tenant" WHERE tenant_id = $1', [id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Tenant deleted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ 
      error: 'Failed to delete tenant',
      message: error.message 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
};