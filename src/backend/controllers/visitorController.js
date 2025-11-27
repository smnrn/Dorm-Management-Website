const db = require('../config/db');

// Get all visitors (with tenant and room details)
const getAllVisitors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.*,
        t.full_name as tenant_name,
        t.contact_number as tenant_contact,
        r.room_number as tenant_room_number,
        vl.log_id,
        vl.check_in_time,
        vl.check_out_time,
        vl.processed_by,
        a.full_name as processed_by_name
      FROM "Visitor" v
      LEFT JOIN "Tenant" t ON v.tenant_id = t.tenant_id
      LEFT JOIN "Rooms" r ON t.room_id = r.room_id
      LEFT JOIN "Visitor_Log" vl ON v.visitor_id = vl.visitor_id
      LEFT JOIN "Admin" a ON vl.processed_by = a.admin_id
      ORDER BY v.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve visitors',
      message: error.message 
    });
  }
};

// Get visitor by ID
const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        v.*,
        t.full_name as tenant_name,
        t.contact_number as tenant_contact,
        r.room_number as tenant_room_number,
        vl.check_in_time,
        vl.check_out_time
      FROM "Visitor" v
      LEFT JOIN "Tenant" t ON v.tenant_id = t.tenant_id
      LEFT JOIN "Rooms" r ON t.room_id = r.room_id
      LEFT JOIN "Visitor_Log" vl ON v.visitor_id = vl.visitor_id
      WHERE v.visitor_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Visitor not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get visitor error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve visitor',
      message: error.message 
    });
  }
};

// Get visitors by tenant ID
const getVisitorsByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const result = await db.query(`
      SELECT 
        v.*,
        t.full_name as tenant_name,
        r.room_number as tenant_room_number,
        vl.check_in_time,
        vl.check_out_time
      FROM "Visitor" v
      LEFT JOIN "Tenant" t ON v.tenant_id = t.tenant_id
      LEFT JOIN "Rooms" r ON t.room_id = r.room_id
      LEFT JOIN "Visitor_Log" vl ON v.visitor_id = vl.visitor_id
      WHERE v.tenant_id = $1
      ORDER BY v.created_at DESC
    `, [tenantId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get tenant visitors error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve tenant visitors',
      message: error.message 
    });
  }
};

// Create new visitor request
const createVisitor = async (req, res) => {
  try {
    const {
      tenant_id,
      full_name,
      contact_number,
      purpose,
      expected_date,
      expected_time,
      // Backwards compatibility with old field names
      visitor_name,
      visit_date
    } = req.body;

    // Use new field names, fallback to old names for backwards compatibility
    const visitorFullName = full_name || visitor_name;
    const visitorDate = expected_date || visit_date;

    // Validate required fields (matching actual database schema)
    if (!tenant_id || !visitorFullName || !purpose || !visitorDate) {
      return res.status(400).json({ 
        error: 'All required fields must be provided (tenant_id, full_name, purpose, expected_date)' 
      });
    }

    // Validate 12-hour advance notice
    const visitDateTime = new Date(visitorDate);
    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    if (visitDateTime < twelveHoursFromNow) {
      return res.status(400).json({ 
        error: 'Visitor registration must be submitted at least 12 hours before the visit date' 
      });
    }

    const result = await db.query(
      `INSERT INTO "Visitor" 
       (tenant_id, full_name, contact_number, purpose, expected_date, expected_time, approval_status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING visitor_id`,
      [tenant_id, visitorFullName, contact_number, purpose, visitorDate, expected_time || null, 'Pending']
    );

    res.status(201).json({
      success: true,
      message: 'Visitor registration submitted successfully',
      visitorId: result.rows[0].visitor_id
    });
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ 
      error: 'Failed to create visitor registration',
      message: error.message 
    });
  }
};

// Update visitor approval status
const updateVisitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['Pending', 'Approved', 'Denied'].includes(approval_status)) {
      return res.status(400).json({ 
        error: 'Invalid approval status' 
      });
    }

    const result = await db.query(
      `UPDATE "Visitor" 
       SET approval_status = $1
       WHERE visitor_id = $2`,
      [approval_status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Visitor not found' 
      });
    }

    res.json({
      success: true,
      message: `Visitor ${approval_status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Update visitor status error:', error);
    res.status(500).json({ 
      error: 'Failed to update visitor status',
      message: error.message 
    });
  }
};

// Delete visitor
const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete any associated visitor logs
    await db.query('DELETE FROM "Visitor_Log" WHERE visitor_id = $1', [id]);

    // Then delete the visitor
    const result = await db.query('DELETE FROM "Visitor" WHERE visitor_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Visitor not found' 
      });
    }

    res.json({
      success: true,
      message: 'Visitor deleted successfully'
    });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ 
      error: 'Failed to delete visitor',
      message: error.message 
    });
  }
};

module.exports = {
  getAllVisitors,
  getVisitorById,
  getVisitorsByTenant,
  createVisitor,
  updateVisitorStatus,
  deleteVisitor
};