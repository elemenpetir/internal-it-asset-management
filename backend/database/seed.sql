-- ============================================================
-- SEED DATA - Internal IT Asset Management System
-- Password untuk semua user: password123
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE maintenance_requests;
TRUNCATE TABLE asset_assignments;
TRUNCATE TABLE assets;
TRUNCATE TABLE asset_categories;
TRUNCATE TABLE employees;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, name) VALUES
(1, 'IT Department'),
(2, 'Finance Department'),
(3, 'Human Resources'),
(4, 'Operations');

-- ============================================================
-- USERS
-- password: password123
-- hash: $2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW
-- ============================================================
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Budi Santoso',    'budi.santoso@company.com',   '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'employee'),
(2, 'Siti Rahayu',     'siti.rahayu@company.com',    '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'employee'),
(3, 'Ahmad Fauzi',     'ahmad.fauzi@company.com',    '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'employee'),
(4, 'Dewi Lestari',    'dewi.lestari@company.com',   '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'employee'),
(5, 'Rafi Andika',     'rafi.andika@company.com',    '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'employee'),
(6, 'Admin IT',        'admin@company.com',           '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'asset_admin'),
(7, 'Rina Marlina',    'rina.marlina@company.com',   '$2b$10$6wNZFY3UkQYH4/FcSnwKl.CeDay.JxRVvEICeJRaFjoIxZslEscbW', 'manager');

-- ============================================================
-- EMPLOYEES
-- ============================================================
INSERT INTO employees (id, user_id, name, employee_number, email, department_id, position, status) VALUES
(1, 1, 'Budi Santoso',  'EMP-0001', 'budi.santoso@company.com',  1, 'IT Support Staff',        'active'),
(2, 2, 'Siti Rahayu',   'EMP-0002', 'siti.rahayu@company.com',   2, 'Finance Staff',            'active'),
(3, 3, 'Ahmad Fauzi',   'EMP-0003', 'ahmad.fauzi@company.com',   3, 'HR Staff',                 'active'),
(4, 4, 'Dewi Lestari',  'EMP-0004', 'dewi.lestari@company.com',  4, 'Operations Staff',         'active'),
(5, 5, 'Rafi Andika',   'EMP-0005', 'rafi.andika@company.com',   1, 'System Administrator',     'active'),
(6, 6, 'Admin IT',      'ADM-0001', 'admin@company.com',          1, 'IT Asset Administrator',  'active'),
(9, 7, 'Rina Marlina', 'MGR-0001', 'rina.marlina@company.com', 1, 'IT Manager', 'active'),
-- Employee belum aktivasi akun
(7, NULL, 'Hendro Wijaya',  'EMP-0006', 'hendro.wijaya@company.com',  2, 'Senior Finance Staff', 'active'),
(8, NULL, 'Maya Putri',     'EMP-0007', 'maya.putri@company.com',     3, 'HR Manager',           'active');

-- ============================================================
-- ASSET CATEGORIES
-- ============================================================
INSERT INTO asset_categories (id, name) VALUES
(1, 'Laptop'),
(2, 'Monitor'),
(3, 'Printer'),
(4, 'Network Equipment'),
(5, 'Peripheral');

-- ============================================================
-- ASSETS
-- Note: purchase_date bervariasi untuk test risk scoring
-- Ada yang > 2 tahun untuk test replacement candidates
-- ============================================================
INSERT INTO assets (id, asset_code, name, category_id, brand, model, serial_number, purchase_date, status, location, notes) VALUES
-- Laptops (beberapa sudah tua > 2 tahun)
(1,  'AST-LPT-001', 'Laptop Lenovo ThinkPad T14',      1, 'Lenovo',  'ThinkPad T14',    'SN-LNV-001', '2022-03-15', 'assigned',          'IT Room',          'Laptop utama IT Support'),
(2,  'AST-LPT-002', 'Laptop Dell Latitude 5520',        1, 'Dell',    'Latitude 5520',   'SN-DEL-002', '2021-07-20', 'assigned',          'Finance Room',     'Laptop Finance Staff'),
(3,  'AST-LPT-003', 'Laptop HP EliteBook 840',          1, 'HP',      'EliteBook 840',   'SN-HP--003', '2020-11-10', 'assigned',          'HR Room',          'Laptop HR Staff - sudah cukup tua'),
(4,  'AST-LPT-004', 'Laptop Lenovo ThinkPad E15',       1, 'Lenovo',  'ThinkPad E15',    'SN-LNV-004', '2023-01-05', 'assigned',          'Operations Room',  'Laptop Operations Staff'),
(5,  'AST-LPT-005', 'Laptop Asus ExpertBook B5',        1, 'Asus',    'ExpertBook B5',   'SN-ASS-005', '2024-06-01', 'available',         'IT Storage Room',  'Laptop cadangan'),
(6,  'AST-LPT-006', 'Laptop Dell Inspiron 15',          1, 'Dell',    'Inspiron 15',     'SN-DEL-006', '2020-05-18', 'under_maintenance', 'IT Storage Room',  'Sedang diperbaiki - baterai rusak'),
-- Monitors
(7,  'AST-MON-001', 'Monitor LG UltraWide 29"',         2, 'LG',      'UltraWide 29WP',  'SN-LG--007', '2022-08-12', 'assigned',          'IT Room',          'Monitor tambahan IT'),
(8,  'AST-MON-002', 'Monitor Samsung 24"',               2, 'Samsung', 'F24T450',         'SN-SAM-008', '2021-03-25', 'available',         'IT Storage Room',  'Monitor cadangan'),
(9,  'AST-MON-003', 'Monitor Dell 27" 4K',               2, 'Dell',    'U2722D',          'SN-DEL-009', '2023-09-10', 'assigned',          'Finance Room',     'Monitor Finance'),
-- Printers
(10, 'AST-PRT-001', 'Printer Canon PIXMA G3010',        3, 'Canon',   'PIXMA G3010',     'SN-CAN-010', '2021-04-20', 'available',         'Admin Room',       'Printer warna'),
(11, 'AST-PRT-002', 'Printer Epson L3250',               3, 'Epson',   'L3250',           'SN-EPS-011', '2019-08-15', 'retired',           'IT Storage Room',  'Sudah tidak layak pakai'),
-- Network Equipment
(12, 'AST-NET-001', 'Cisco Switch 24-Port',              4, 'Cisco',   'Catalyst 2960',   'SN-CSC-012', '2020-02-10', 'available',         'Server Room',      'Network switch utama'),
(13, 'AST-NET-002', 'Wireless Access Point TP-Link',    4, 'TP-Link', 'EAP245',          'SN-TPL-013', '2022-11-30', 'available',         'Server Room',      'Access point lantai 2'),
-- Peripherals
(14, 'AST-PRP-001', 'Keyboard Logitech MX Keys',        5, 'Logitech','MX Keys',         'SN-LGT-014', '2023-04-15', 'assigned',          'IT Room',          'Keyboard wireless IT'),
(15, 'AST-PRP-002', 'Mouse Logitech MX Master 3',       5, 'Logitech','MX Master 3',     'SN-LGT-015', '2023-04-15', 'assigned',          'IT Room',          'Mouse wireless IT');

-- ============================================================
-- ASSET ASSIGNMENTS
-- ============================================================
INSERT INTO asset_assignments (id, asset_id, employee_id, assigned_by, assigned_at, returned_at, status, notes) VALUES
-- Active assignments
(1,  1,  1, 6, '2022-03-20 08:00:00', NULL,                  'active',   'Assigned untuk kebutuhan harian IT Support'),
(2,  2,  2, 6, '2021-07-25 08:00:00', NULL,                  'active',   'Laptop utama Finance Staff'),
(3,  3,  3, 6, '2020-11-15 08:00:00', NULL,                  'active',   'Laptop utama HR Staff'),
(4,  4,  4, 6, '2023-01-10 08:00:00', NULL,                  'active',   'Laptop Operations Staff'),
(5,  7,  1, 6, '2022-08-15 08:00:00', NULL,                  'active',   'Monitor tambahan untuk IT Support'),
(6,  9,  2, 6, '2023-09-15 08:00:00', NULL,                  'active',   'Monitor Finance'),
(7,  14, 5, 6, '2023-04-20 08:00:00', NULL,                  'active',   'Keyboard untuk System Admin'),
(8,  15, 5, 6, '2023-04-20 08:00:00', NULL,                  'active',   'Mouse untuk System Admin'),
-- Returned assignments (history)
(9,  5,  5, 6, '2023-06-01 08:00:00', '2023-12-31 17:00:00', 'returned', 'Laptop sementara sebelum dapat unit baru'),
(10, 8,  3, 6, '2022-01-10 08:00:00', '2023-01-10 17:00:00', 'returned', 'Monitor pinjaman sementara'),
(11, 6,  4, 6, '2021-05-01 08:00:00', '2024-01-15 17:00:00', 'returned', 'Dikembalikan karena bermasalah');

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
INSERT INTO maintenance_requests (id, asset_id, requested_by, issue_description, status, handled_by, resolution_note, created_at, updated_at, completed_at) VALUES
-- Completed
(1, 3, 3, 'Laptop sering hang dan lemot, performa menurun drastis',                       'completed', 6, 'RAM ditambah dari 8GB ke 16GB, performa sudah normal kembali',      '2023-06-10 09:00:00', '2023-06-15 14:00:00', '2023-06-15 14:00:00'),
(2, 3, 3, 'Baterai tidak bisa mengisi daya, harus selalu terhubung ke charger',           'completed', 6, 'Baterai diganti dengan unit baru, sudah berfungsi normal',           '2023-11-20 10:00:00', '2023-11-25 16:00:00', '2023-11-25 16:00:00'),
(3, 2, 2, 'Keyboard beberapa tombol tidak berfungsi (tombol A dan S)',                    'completed', 6, 'Keyboard dibersihkan dan diperbaiki, semua tombol sudah berfungsi',  '2024-02-05 08:30:00', '2024-02-07 15:00:00', '2024-02-07 15:00:00'),
(4, 1, 1, 'Laptop mengalami overheat saat digunakan lebih dari 2 jam',                    'completed', 6, 'Thermal paste diganti dan kipas dibersihkan, suhu sudah normal',     '2024-05-12 11:00:00', '2024-05-14 17:00:00', '2024-05-14 17:00:00'),
-- In Progress
(5, 6, 4, 'Laptop tidak bisa menyala, kemungkinan masalah pada motherboard atau power',   'in_progress', 6, NULL, '2026-06-20 09:00:00', '2026-06-21 10:00:00', NULL);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (entity_type, entity_id, action, old_value, new_value, changed_by, created_at) VALUES
-- Asset created
('asset', 1,  'CREATE_ASSET', NULL, '{"asset_code":"AST-LPT-001","name":"Laptop Lenovo ThinkPad T14","status":"available"}',  6, '2022-03-16 08:00:00'),
('asset', 2,  'CREATE_ASSET', NULL, '{"asset_code":"AST-LPT-002","name":"Laptop Dell Latitude 5520","status":"available"}',    6, '2021-07-21 08:00:00'),
('asset', 3,  'CREATE_ASSET', NULL, '{"asset_code":"AST-LPT-003","name":"Laptop HP EliteBook 840","status":"available"}',      6, '2020-11-11 08:00:00'),
('asset', 6,  'CREATE_ASSET', NULL, '{"asset_code":"AST-LPT-006","name":"Laptop Dell Inspiron 15","status":"available"}',      6, '2020-05-19 08:00:00'),
('asset', 11, 'CREATE_ASSET', NULL, '{"asset_code":"AST-PRT-002","name":"Printer Epson L3250","status":"available"}',          6, '2019-08-16 08:00:00'),
-- Asset assigned
('asset_assignment', 1, 'ASSIGN_ASSET', NULL, '{"asset_id":1,"employee_id":1,"asset_status":"assigned"}', 6, '2022-03-20 08:00:00'),
('asset_assignment', 2, 'ASSIGN_ASSET', NULL, '{"asset_id":2,"employee_id":2,"asset_status":"assigned"}', 6, '2021-07-25 08:00:00'),
('asset_assignment', 3, 'ASSIGN_ASSET', NULL, '{"asset_id":3,"employee_id":3,"asset_status":"assigned"}', 6, '2020-11-15 08:00:00'),
('asset_assignment', 4, 'ASSIGN_ASSET', NULL, '{"asset_id":4,"employee_id":4,"asset_status":"assigned"}', 6, '2023-01-10 08:00:00'),
-- Asset returned
('asset_assignment', 9,  'RETURN_ASSET', '{"status":"active","asset_status":"assigned"}', '{"status":"returned","asset_status":"available"}', 6, '2023-12-31 17:00:00'),
('asset_assignment', 10, 'RETURN_ASSET', '{"status":"active","asset_status":"assigned"}', '{"status":"returned","asset_status":"available"}', 6, '2023-01-10 17:00:00'),
-- Maintenance created
('maintenance_requests', 1, 'MAINTENANCE_CREATED', NULL, '{"asset_id":3,"status":"reported","issue_description":"Laptop sering hang dan lemot"}',  3, '2023-06-10 09:00:00'),
('maintenance_requests', 2, 'MAINTENANCE_CREATED', NULL, '{"asset_id":3,"status":"reported","issue_description":"Baterai tidak bisa mengisi daya"}', 3, '2023-11-20 10:00:00'),
('maintenance_requests', 5, 'MAINTENANCE_CREATED', NULL, '{"asset_id":6,"status":"reported","issue_description":"Laptop tidak bisa menyala"}',       4, '2026-06-20 09:00:00'),
-- Maintenance status updated
('maintenance_requests', 1, 'UPDATE_STATUS', '{"status":"reported"}',     '{"status":"in_progress"}', 6, '2023-06-11 08:00:00'),
('maintenance_requests', 1, 'UPDATE_STATUS', '{"status":"in_progress"}',  '{"status":"completed"}',   6, '2023-06-15 14:00:00'),
('maintenance_requests', 5, 'UPDATE_STATUS', '{"status":"reported"}',     '{"status":"in_progress"}', 6, '2026-06-21 10:00:00'),
-- Asset status updated
('asset', 11, 'UPDATE_ASSET_STATUS', '{"status":"available"}', '{"status":"retired"}', 6, '2024-01-01 08:00:00'),
('asset', 6,  'UPDATE_ASSET_STATUS', '{"status":"assigned"}',  '{"status":"available"}', 6, '2024-01-15 08:00:00');