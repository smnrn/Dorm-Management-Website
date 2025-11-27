-- ============================================================================
-- DormGuard Database Setup - Production Ready
-- ============================================================================
-- Clean database with role-based authentication:
-- - Admin table with role field (Admin or HelpDesk)
-- - Empty rooms ready for tenant assignment
-- - 2 production users: Simon Roaring (Admin), Kenrick Cham (HelpDesk)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CLEAN EXISTING DATA
-- ============================================================================

DROP TABLE IF EXISTS "Visitor_Log" CASCADE;
DROP TABLE IF EXISTS "Visitor" CASCADE;
DROP TABLE IF EXISTS "Tenant" CASCADE;
DROP TABLE IF EXISTS "Help_Desk" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "Rooms" CASCADE;

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

-- 1. Rooms Table
CREATE TABLE "Rooms" (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    building VARCHAR(20) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    current_occupants INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_capacity CHECK (capacity > 0),
    CONSTRAINT check_occupants CHECK (current_occupants >= 0 AND current_occupants <= capacity)
);

-- 2. Admin Table (includes both Admin and HelpDesk roles)
CREATE TABLE "Admin" (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    employed_date DATE DEFAULT CURRENT_DATE,
    role VARCHAR(20) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_role CHECK (role IN ('Admin', 'HelpDesk'))
);

-- 3. Tenant Table
CREATE TABLE "Tenant" (
    tenant_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    move_in_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    emergency_contact_name VARCHAR(100),
    emergency_contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES "Rooms"(room_id) ON DELETE RESTRICT,
    CONSTRAINT check_status CHECK (status IN ('Active', 'Moved Out', 'Suspended'))
);

-- 4. Visitor Table
CREATE TABLE "Visitor" (
    visitor_id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    purpose VARCHAR(150) NOT NULL,
    expected_date DATE NOT NULL,
    expected_time VARCHAR(10),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES "Tenant"(tenant_id) ON DELETE CASCADE,
    CONSTRAINT check_approval CHECK (approval_status IN ('Pending', 'Approved', 'Denied'))
);

-- 5. Visitor_Log Table
CREATE TABLE "Visitor_Log" (
    log_id SERIAL PRIMARY KEY,
    visitor_id INT NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    id_left VARCHAR(50),
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_visitor FOREIGN KEY (visitor_id) REFERENCES "Visitor"(visitor_id) ON DELETE CASCADE,
    CONSTRAINT fk_processed_by FOREIGN KEY (processed_by) REFERENCES "Admin"(admin_id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_admin_username ON "Admin"(username);
CREATE INDEX idx_admin_role ON "Admin"(role);
CREATE INDEX idx_tenant_username ON "Tenant"(username);
CREATE INDEX idx_tenant_room ON "Tenant"(room_id);
CREATE INDEX idx_tenant_status ON "Tenant"(status);
CREATE INDEX idx_room_building ON "Rooms"(building);
CREATE INDEX idx_room_number ON "Rooms"(room_number);
CREATE INDEX idx_visitor_tenant ON "Visitor"(tenant_id);
CREATE INDEX idx_visitor_date ON "Visitor"(expected_date);
CREATE INDEX idx_visitor_status ON "Visitor"(approval_status);
CREATE INDEX idx_log_visitor ON "Visitor_Log"(visitor_id);
CREATE INDEX idx_log_checkin ON "Visitor_Log"(check_in_time);

-- ============================================================================
-- PRODUCTION DATA
-- ============================================================================

-- Default password for both users: "admin123"
-- Bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Insert 30 empty rooms across 3 buildings
INSERT INTO "Rooms" (room_number, building, capacity, current_occupants) VALUES
-- Building A (10 rooms)
('A-101', 'Building A', 2, 0),
('A-102', 'Building A', 2, 0),
('A-103', 'Building A', 2, 0),
('A-104', 'Building A', 2, 0),
('A-105', 'Building A', 2, 0),
('A-201', 'Building A', 2, 0),
('A-202', 'Building A', 2, 0),
('A-203', 'Building A', 2, 0),
('A-204', 'Building A', 2, 0),
('A-205', 'Building A', 2, 0),
-- Building B (10 rooms)
('B-101', 'Building B', 2, 0),
('B-102', 'Building B', 2, 0),
('B-103', 'Building B', 2, 0),
('B-104', 'Building B', 2, 0),
('B-105', 'Building B', 2, 0),
('B-201', 'Building B', 2, 0),
('B-202', 'Building B', 2, 0),
('B-203', 'Building B', 2, 0),
('B-204', 'Building B', 2, 0),
('B-205', 'Building B', 2, 0),
-- Building C (10 rooms)
('C-101', 'Building C', 2, 0),
('C-102', 'Building C', 2, 0),
('C-103', 'Building C', 2, 0),
('C-104', 'Building C', 2, 0),
('C-105', 'Building C', 2, 0),
('C-201', 'Building C', 2, 0),
('C-202', 'Building C', 2, 0),
('C-203', 'Building C', 2, 0),
('C-204', 'Building C', 2, 0),
('C-205', 'Building C', 2, 0);

-- Insert production users
INSERT INTO "Admin" (username, password, full_name, email, contact_number, employed_date, role) VALUES
('simon.roaring', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Simon Roaring', 'simon.roaring@dormguard.edu', '(555) 100-0001', CURRENT_DATE, 'Admin'),
('kenrick.cham', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kenrick Cham', 'kenrick.cham@dormguard.edu', '(555) 200-0001', CURRENT_DATE, 'HelpDesk');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Database Setup Complete' as status;

SELECT 'Table Counts:' as info;
SELECT 'Rooms' as table_name, COUNT(*) as count FROM "Rooms"
UNION ALL
SELECT 'Admin (Total)', COUNT(*) FROM "Admin"
UNION ALL
SELECT 'Admin (Admin Role)', COUNT(*) FROM "Admin" WHERE role = 'Admin'
UNION ALL
SELECT 'Admin (HelpDesk Role)', COUNT(*) FROM "Admin" WHERE role = 'HelpDesk'
UNION ALL
SELECT 'Tenant', COUNT(*) FROM "Tenant"
UNION ALL
SELECT 'Visitor', COUNT(*) FROM "Visitor"
UNION ALL
SELECT 'Visitor_Log', COUNT(*) FROM "Visitor_Log";

SELECT 'Production Users:' as info;
SELECT 
    admin_id,
    username, 
    full_name, 
    role,
    email
FROM "Admin" 
ORDER BY role, admin_id;

SELECT 'Room Availability:' as info;
SELECT 
    building,
    COUNT(*) as total_rooms,
    SUM(capacity) as total_capacity,
    SUM(current_occupants) as occupied_beds,
    SUM(capacity - current_occupants) as available_beds
FROM "Rooms"
GROUP BY building
ORDER BY building;

-- ============================================================================
-- LOGIN CREDENTIALS (CHANGE AFTER FIRST LOGIN)
-- ============================================================================
-- Admin: username=simon.roaring, password=admin123
-- HelpDesk: username=kenrick.cham, password=admin123
-- ============================================================================
