-- Admin user (password: admin123)
INSERT INTO "User" (id, email, password, name, role, active, "updatedAt") VALUES
  ('admin_001', 'admin@hrweb.com', '$2b$10$Ol0kQ5tQjUZQ4ezqPYFyCOKICSq7gwvMHop3bQeMgtp3T26eq2sZi', 'ผู้ดูแลระบบ', 'ADMIN', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- HR user (password: hr123)
INSERT INTO "User" (id, email, password, name, role, department, active, "updatedAt") VALUES
  ('hr_001', 'hr@hrweb.com', '$2b$10$XzBP14ufhpW2S0UX5aL/eu2h/iuC06OqW3UoxuIR82Mw7tYuq/FqK', 'ฝ่ายบุคคล', 'HR', 'ฝ่ายบุคคล', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Manager user (password: manager123)
INSERT INTO "User" (id, email, password, name, role, department, active, "updatedAt") VALUES
  ('mgr_001', 'manager@hrweb.com', '$2b$10$QfpAHmKXePGP9baSWRD2u.HKpIHFt/1P8sO68XbVnTSJvNSEDYMIG', 'หัวหน้าแผนก', 'MANAGER', 'ฝ่ายขาย', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Departments
INSERT INTO "Department" (id, name, active) VALUES
  ('dept_001', 'ฝ่ายบุคคล', true),
  ('dept_002', 'ฝ่ายขาย', true),
  ('dept_003', 'ฝ่ายบัญชี', true),
  ('dept_004', 'ฝ่ายไอที', true),
  ('dept_005', 'ฝ่ายการตลาด', true)
ON CONFLICT (name) DO NOTHING;

-- Job Positions
INSERT INTO "JobPosition" (id, title, "departmentId", active) VALUES
  ('pos_001', 'เจ้าหน้าที่บุคคล', 'dept_001', true),
  ('pos_002', 'พนักงานขาย', 'dept_002', true),
  ('pos_003', 'ผู้จัดการฝ่ายขาย', 'dept_002', true),
  ('pos_004', 'นักบัญชี', 'dept_003', true),
  ('pos_005', 'โปรแกรมเมอร์', 'dept_004', true),
  ('pos_006', 'นักการตลาดดิจิทัล', 'dept_005', true)
ON CONFLICT (id) DO NOTHING;
