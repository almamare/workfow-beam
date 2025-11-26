-- =========================================================
-- Permissions System Database Schema
-- نظام الصلاحيات لقاعدة البيانات
-- =========================================================

-- Table: permissions
-- جدول الصلاحيات الأساسي
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL COMMENT 'اسم الصلاحية',
    `description` TEXT COMMENT 'وصف الصلاحية',
    `module` VARCHAR(100) NOT NULL COMMENT 'الوحدة/القسم (Users, Projects, etc.)',
    `actions` JSON NOT NULL COMMENT 'الإجراءات المسموحة (create, read, update, delete, approve, reject)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_module` (`module`),
    INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول الصلاحيات';

-- Table: user_permissions
-- جدول ربط الصلاحيات بالمستخدمين
CREATE TABLE IF NOT EXISTS `user_permissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL COMMENT 'معرف المستخدم',
    `permission_id` VARCHAR(36) NOT NULL COMMENT 'معرف الصلاحية',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_user_permission` (`user_id`, `permission_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_permission_id` (`permission_id`),
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول ربط الصلاحيات بالمستخدمين';

-- =========================================================
-- Sample Data - بيانات تجريبية
-- =========================================================

-- Insert sample permissions
INSERT INTO `permissions` (`id`, `name`, `description`, `module`, `actions`) VALUES
('perm-001', 'User Management', 'إدارة المستخدمين - إنشاء وتعديل وحذف المستخدمين', 'Users', '["create", "read", "update", "delete"]'),
('perm-002', 'User View Only', 'عرض المستخدمين فقط', 'Users', '["read"]'),
('perm-003', 'Project Management', 'إدارة المشاريع - إنشاء وتعديل وحذف المشاريع', 'Projects', '["create", "read", "update", "delete"]'),
('perm-004', 'Project View Only', 'عرض المشاريع فقط', 'Projects', '["read"]'),
('perm-005', 'Financial Management', 'إدارة المالية - إدارة الميزانيات والمدفوعات', 'Financial', '["create", "read", "update", "delete", "approve"]'),
('perm-006', 'Financial View Only', 'عرض البيانات المالية فقط', 'Financial', '["read"]'),
('perm-007', 'Reports Access', 'الوصول إلى التقارير', 'Reports', '["read"]'),
('perm-008', 'Inventory Management', 'إدارة المخزون', 'Inventory', '["create", "read", "update", "delete"]'),
('perm-009', 'Contractor Management', 'إدارة المقاولين', 'Contractors', '["create", "read", "update", "delete"]'),
('perm-010', 'Task Management', 'إدارة المهام', 'Tasks', '["create", "read", "update", "delete", "approve", "reject"]'),
('perm-011', 'Employee Management', 'إدارة الموظفين', 'Employees', '["create", "read", "update", "delete"]'),
('perm-012', 'Permissions Management', 'إدارة الصلاحيات', 'Settings', '["create", "read", "update", "delete"]'),
('perm-013', 'System Settings', 'إعدادات النظام', 'Settings', '["read", "update"]')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- =========================================================
-- Views - واجهات عرض
-- =========================================================

-- View: user_permissions_view
-- عرض شامل لصلاحيات المستخدم
CREATE OR REPLACE VIEW `user_permissions_view` AS
SELECT 
    up.id,
    up.user_id,
    u.name AS user_name,
    u.surname AS user_surname,
    u.email AS user_email,
    up.permission_id,
    p.name AS permission_name,
    p.description AS permission_description,
    p.module,
    p.actions,
    up.created_at
FROM `user_permissions` up
INNER JOIN `users` u ON up.user_id = u.id
INNER JOIN `permissions` p ON up.permission_id = p.id;

-- =========================================================
-- Stored Procedures - الإجراءات المخزنة
-- =========================================================

-- Procedure: Get User Permissions
-- الحصول على جميع صلاحيات مستخدم معين
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `sp_get_user_permissions`(IN p_user_id VARCHAR(36))
BEGIN
    SELECT 
        p.id,
        p.name,
        p.description,
        p.module,
        p.actions,
        p.created_at
    FROM `permissions` p
    INNER JOIN `user_permissions` up ON p.id = up.permission_id
    WHERE up.user_id = p_user_id
    ORDER BY p.module, p.name;
END //
DELIMITER ;

-- Procedure: Check User Permission
-- التحقق من صلاحية مستخدم معين
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `sp_check_user_permission`(
    IN p_user_id VARCHAR(36),
    IN p_module VARCHAR(100),
    IN p_action VARCHAR(50)
)
BEGIN
    SELECT 
        COUNT(*) AS has_permission
    FROM `user_permissions` up
    INNER JOIN `permissions` p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND p.module = p_module
    AND JSON_CONTAINS(p.actions, JSON_QUOTE(p_action));
END //
DELIMITER ;

-- =========================================================
-- Indexes for Performance - فهارس للأداء
-- =========================================================

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_permissions_module_name` ON `permissions`(`module`, `name`);
CREATE INDEX IF NOT EXISTS `idx_user_permissions_user_module` ON `user_permissions`(`user_id`, `permission_id`);

-- =========================================================
-- Notes - ملاحظات
-- =========================================================
-- 1. يتم استخدام JSON لحفظ قائمة الإجراءات (actions)
-- 2. يتم استخدام UUID/VARCHAR(36) لمعرفات السجلات
-- 3. Foreign Keys تضمن سلامة البيانات
-- 4. Indexes تحسن أداء الاستعلامات
-- 5. يمكن إضافة جدول roles لاحقاً إذا لزم الأمر

