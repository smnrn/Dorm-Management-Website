const express = require('express');
const router = express.Router();
const {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
} = require('../controllers/tenantController');
const { authenticate, isAdmin } = require('../middleware/auth');

// GET /api/tenants - Get all tenants (admin only)
router.get('/', authenticate, isAdmin, getAllTenants);

// GET /api/tenants/:id - Get tenant by ID
router.get('/:id', authenticate, getTenantById);

// POST /api/tenants - Create new tenant (admin only)
router.post('/', authenticate, isAdmin, createTenant);

// PUT /api/tenants/:id - Update tenant (admin only)
router.put('/:id', authenticate, isAdmin, updateTenant);

// DELETE /api/tenants/:id - Delete tenant (admin only)
router.delete('/:id', authenticate, isAdmin, deleteTenant);

module.exports = router;
