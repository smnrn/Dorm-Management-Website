// Backend API Configuration
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  
  // Admin
  ADMIN_REGISTER_TENANT: '/api/admin/create-tenant',
  ADMIN_GET_TENANTS: '/api/tenants',
  ADMIN_UPDATE_TENANT: '/api/tenants/:id',
  ADMIN_DELETE_TENANT: '/api/tenants/:id',
  ADMIN_APPROVE_VISITOR: '/api/admin/approve-visitor/:id',
  ADMIN_REJECT_VISITOR: '/api/admin/reject-visitor/:id',
  
  // Tenant
  TENANT_PROFILE: '/api/tenant/profile',
  TENANT_REGISTER_VISITOR: '/api/tenant/register-visitor',
  TENANT_GET_VISITORS: '/api/tenant/visitors',
  TENANT_UPDATE_VISITOR: '/api/tenant/visitors/:id',
  TENANT_DELETE_VISITOR: '/api/tenant/visitors/:id',
  
  // Visitor
  GET_ALL_VISITORS: '/api/visitors',
  GET_VISITOR: '/api/visitors/:id',
  
  // Visitor Logs
  GET_VISITOR_LOGS: '/api/visitor-logs',
  CHECKIN_VISITOR: '/api/visitor-logs/checkin',
  CHECKOUT_VISITOR: '/api/visitor-logs/checkout',
  
  // Rooms
  GET_ROOMS: '/api/admin/rooms',
};