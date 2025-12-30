# Backend API - Financial Operations System
# نظام العمليات المالية - واجهة برمجة التطبيقات للباك إند

## Overview / نظرة عامة
This document provides comprehensive API specifications for implementing the Financial Operations System backend in PHP. The system includes Cash Ledger, Contractor Payments, Loans, Budgets, Financial Requests, and Invoices with their relationships to other tables.

هذا المستند يوفر مواصفات شاملة لواجهة برمجة التطبيقات لتنفيذ نظام العمليات المالية في الباك إند باستخدام PHP. يتضمن النظام سجل النقدية، مدفوعات المقاولين، القروض، الميزانيات، الطلبات المالية، والفواتير مع ارتباطاتها بالجداول الأخرى.

---

## Database Schema / هيكل قاعدة البيانات

### 1. Cash Ledger Table / جدول سجل النقدية
```sql
CREATE TABLE `cash_ledger` (
    `id` VARCHAR(36) PRIMARY KEY,
    `entry_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم القيد',
    `date` DATE NOT NULL COMMENT 'تاريخ القيد',
    `description` TEXT NOT NULL COMMENT 'الوصف',
    `type` ENUM('income', 'expense') NOT NULL COMMENT 'النوع: دخل أو مصروف',
    `category` VARCHAR(100) NOT NULL COMMENT 'الفئة',
    `amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `payment_method` ENUM('cash', 'bank_transfer', 'check', 'card') NOT NULL COMMENT 'طريقة الدفع',
    `reference` VARCHAR(100) COMMENT 'المرجع',
    `project_id` VARCHAR(36) COMMENT 'معرف المشروع',
    `contractor_id` VARCHAR(36) COMMENT 'معرف المقاول',
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'الحالة',
    `created_by` VARCHAR(36) NOT NULL COMMENT 'منشئ القيد',
    `approved_by` VARCHAR(36) COMMENT 'موافق القيد',
    `approval_date` DATE COMMENT 'تاريخ الموافقة',
    `notes` TEXT COMMENT 'ملاحظات',
    `balance` DECIMAL(15,2) DEFAULT 0 COMMENT 'الرصيد بعد القيد',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_date` (`date`),
    INDEX `idx_type` (`type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_project_id` (`project_id`),
    INDEX `idx_contractor_id` (`contractor_id`),
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`contractor_id`) REFERENCES `contractors`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل النقدية';
```

### 2. Contractor Payments Table / جدول مدفوعات المقاولين
```sql
CREATE TABLE `contractor_payments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `payment_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الدفعة',
    `contractor_id` VARCHAR(36) NOT NULL COMMENT 'معرف المقاول',
    `project_id` VARCHAR(36) NOT NULL COMMENT 'معرف المشروع',
    `amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `payment_method` ENUM('bank_transfer', 'cash', 'check', 'card') NOT NULL COMMENT 'طريقة الدفع',
    `payment_date` DATE NOT NULL COMMENT 'تاريخ الدفع',
    `description` TEXT COMMENT 'الوصف',
    `status` ENUM('pending', 'approved', 'paid', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT 'الحالة',
    `invoice_number` VARCHAR(100) COMMENT 'رقم الفاتورة',
    `invoice_date` DATE COMMENT 'تاريخ الفاتورة',
    `approval_date` DATE COMMENT 'تاريخ الموافقة',
    `approved_by` VARCHAR(36) COMMENT 'موافق الدفعة',
    `payment_reference` VARCHAR(100) COMMENT 'مرجع الدفع',
    `created_by` VARCHAR(36) NOT NULL COMMENT 'منشئ الدفعة',
    `notes` TEXT COMMENT 'ملاحظات',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_payment_date` (`payment_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_contractor_id` (`contractor_id`),
    INDEX `idx_project_id` (`project_id`),
    INDEX `idx_invoice_number` (`invoice_number`),
    FOREIGN KEY (`contractor_id`) REFERENCES `contractors`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='مدفوعات المقاولين';
```

### 3. Loans Table / جدول القروض
```sql
CREATE TABLE `loans` (
    `id` VARCHAR(36) PRIMARY KEY,
    `loan_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم القرض',
    `borrower_id` VARCHAR(36) NOT NULL COMMENT 'معرف المقترض',
    `borrower_type` ENUM('employee', 'contractor', 'client', 'other') NOT NULL COMMENT 'نوع المقترض',
    `principal_amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ الأساسي',
    `interest_rate` DECIMAL(5,2) DEFAULT 0 COMMENT 'معدل الفائدة',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `loan_purpose` VARCHAR(255) NOT NULL COMMENT 'الغرض من القرض',
    `loan_type` ENUM('personal', 'business', 'emergency', 'advance') NOT NULL COMMENT 'نوع القرض',
    `start_date` DATE NOT NULL COMMENT 'تاريخ البدء',
    `end_date` DATE NOT NULL COMMENT 'تاريخ الانتهاء',
    `term_months` INT NOT NULL COMMENT 'مدة القرض بالأشهر',
    `monthly_payment` DECIMAL(15,2) NOT NULL COMMENT 'الدفعة الشهرية',
    `total_interest` DECIMAL(15,2) DEFAULT 0 COMMENT 'إجمالي الفائدة',
    `total_amount` DECIMAL(15,2) NOT NULL COMMENT 'إجمالي المبلغ',
    `paid_amount` DECIMAL(15,2) DEFAULT 0 COMMENT 'المبلغ المدفوع',
    `remaining_amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ المتبقي',
    `status` ENUM('active', 'completed', 'defaulted', 'cancelled') DEFAULT 'active' COMMENT 'الحالة',
    `approval_date` DATE COMMENT 'تاريخ الموافقة',
    `approved_by` VARCHAR(36) COMMENT 'موافق القرض',
    `created_by` VARCHAR(36) NOT NULL COMMENT 'منشئ القرض',
    `notes` TEXT COMMENT 'ملاحظات',
    `collateral` VARCHAR(255) COMMENT 'الضمان',
    `guarantor` VARCHAR(255) COMMENT 'الكفيل',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_loan_number` (`loan_number`),
    INDEX `idx_borrower_id` (`borrower_id`),
    INDEX `idx_borrower_type` (`borrower_type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_date` (`start_date`),
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='القروض';
```

### 4. Budgets Table / جدول الميزانيات
```sql
CREATE TABLE `budgets` (
    `id` VARCHAR(36) PRIMARY KEY,
    `budget_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الميزانية',
    `name` VARCHAR(255) NOT NULL COMMENT 'اسم الميزانية',
    `department` VARCHAR(100) COMMENT 'القسم',
    `category` VARCHAR(100) NOT NULL COMMENT 'الفئة',
    `fiscal_year` VARCHAR(10) NOT NULL COMMENT 'السنة المالية',
    `allocated_amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ المخصص',
    `spent_amount` DECIMAL(15,2) DEFAULT 0 COMMENT 'المبلغ المنفق',
    `remaining_amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ المتبقي',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `status` ENUM('draft', 'approved', 'active', 'closed', 'exceeded') DEFAULT 'draft' COMMENT 'الحالة',
    `start_date` DATE NOT NULL COMMENT 'تاريخ البدء',
    `end_date` DATE NOT NULL COMMENT 'تاريخ الانتهاء',
    `description` TEXT COMMENT 'الوصف',
    `created_by` VARCHAR(36) NOT NULL COMMENT 'منشئ الميزانية',
    `approved_by` VARCHAR(36) COMMENT 'موافق الميزانية',
    `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_budget_number` (`budget_number`),
    INDEX `idx_department` (`department`),
    INDEX `idx_category` (`category`),
    INDEX `idx_fiscal_year` (`fiscal_year`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='الميزانيات';
```

### 5. Financial Requests Table / جدول الطلبات المالية
```sql
CREATE TABLE `financial_requests` (
    `id` VARCHAR(36) PRIMARY KEY,
    `request_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الطلب',
    `requester_id` VARCHAR(36) NOT NULL COMMENT 'معرف مقدم الطلب',
    `request_type` ENUM('budget', 'expense', 'payment', 'advance', 'refund', 'other') NOT NULL COMMENT 'نوع الطلب',
    `title` VARCHAR(255) NOT NULL COMMENT 'عنوان الطلب',
    `description` TEXT NOT NULL COMMENT 'الوصف',
    `amount` DECIMAL(15,2) NOT NULL COMMENT 'المبلغ',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `category` VARCHAR(100) COMMENT 'الفئة',
    `project_id` VARCHAR(36) COMMENT 'معرف المشروع',
    `department` VARCHAR(100) COMMENT 'القسم',
    `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT 'الأولوية',
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'paid') DEFAULT 'pending' COMMENT 'الحالة',
    `submitted_date` DATE NOT NULL COMMENT 'تاريخ التقديم',
    `reviewed_date` DATE COMMENT 'تاريخ المراجعة',
    `reviewed_by` VARCHAR(36) COMMENT 'مراجع الطلب',
    `approved_date` DATE COMMENT 'تاريخ الموافقة',
    `approved_by` VARCHAR(36) COMMENT 'موافق الطلب',
    `payment_date` DATE COMMENT 'تاريخ الدفع',
    `payment_method` ENUM('bank_transfer', 'cash', 'check', 'card') COMMENT 'طريقة الدفع',
    `reference` VARCHAR(100) COMMENT 'المرجع',
    `comments` TEXT COMMENT 'تعليقات',
    `metadata` JSON COMMENT 'بيانات إضافية',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_request_number` (`request_number`),
    INDEX `idx_requester_id` (`requester_id`),
    INDEX `idx_request_type` (`request_type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_project_id` (`project_id`),
    INDEX `idx_submitted_date` (`submitted_date`),
    FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='الطلبات المالية';
```

### 6. Invoices Table / جدول الفواتير
```sql
CREATE TABLE `invoices` (
    `id` VARCHAR(36) PRIMARY KEY,
    `invoice_no` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الفاتورة',
    `invoice_date` DATE NOT NULL COMMENT 'تاريخ الفاتورة',
    `due_date` DATE NOT NULL COMMENT 'تاريخ الاستحقاق',
    `client_id` VARCHAR(36) COMMENT 'معرف العميل',
    `project_id` VARCHAR(36) COMMENT 'معرف المشروع',
    `subtotal` DECIMAL(15,2) NOT NULL COMMENT 'المجموع الفرعي',
    `tax_rate` DECIMAL(5,2) DEFAULT 0 COMMENT 'معدل الضريبة',
    `tax_amount` DECIMAL(15,2) DEFAULT 0 COMMENT 'مبلغ الضريبة',
    `discount` DECIMAL(15,2) DEFAULT 0 COMMENT 'الخصم',
    `total` DECIMAL(15,2) NOT NULL COMMENT 'الإجمالي',
    `currency` VARCHAR(10) DEFAULT 'USD' COMMENT 'العملة',
    `status` ENUM('Draft', 'Issued', 'Paid', 'Cancelled', 'Overdue') DEFAULT 'Draft' COMMENT 'الحالة',
    `payment_terms` VARCHAR(255) COMMENT 'شروط الدفع',
    `notes` TEXT COMMENT 'ملاحظات',
    `created_by` VARCHAR(36) NOT NULL COMMENT 'منشئ الفاتورة',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_invoice_no` (`invoice_no`),
    INDEX `idx_invoice_date` (`invoice_date`),
    INDEX `idx_due_date` (`due_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_client_id` (`client_id`),
    INDEX `idx_project_id` (`project_id`),
    FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='الفواتير';
```

### 7. Invoice Items Table / جدول عناصر الفاتورة
```sql
CREATE TABLE `invoice_items` (
    `id` VARCHAR(36) PRIMARY KEY,
    `invoice_id` VARCHAR(36) NOT NULL COMMENT 'معرف الفاتورة',
    `item_description` VARCHAR(255) NOT NULL COMMENT 'وصف العنصر',
    `quantity` DECIMAL(10,2) NOT NULL COMMENT 'الكمية',
    `unit_price` DECIMAL(15,2) NOT NULL COMMENT 'سعر الوحدة',
    `total` DECIMAL(15,2) NOT NULL COMMENT 'الإجمالي',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='عناصر الفاتورة';
```

---

## API Endpoints / نقاط نهاية واجهة برمجة التطبيقات

### Base URL / الرابط الأساسي
```
/api/v1/financial
```

### Authentication / المصادقة
All endpoints require JWT authentication token in the Authorization header:
```
Authorization: Bearer {token}
```

جميع نقاط النهاية تتطلب رمز مصادقة JWT في رأس الطلب.

---

## 1. Cash Ledger APIs / واجهات سجل النقدية

### 1.1 Create Cash Ledger Entry / إنشاء قيد في سجل النقدية
**POST** `/cash-ledger/create`

**Request Body:**
```json
{
    "date": "2024-01-15",
    "description": "Office rent payment",
    "type": "expense",
    "category": "Rent",
    "amount": 5000.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "reference": "TXN-001",
    "project_id": "project-uuid-here",
    "contractor_id": "contractor-uuid-here",
    "notes": "Monthly office rent"
}
```

**Response:**
```json
{
    "header": {
        "requestId": "uuid",
        "success": true,
        "message": "Cash ledger entry created successfully"
    },
    "body": {
        "cash_ledger": {
            "id": "uuid",
            "entry_number": "CL-001",
            "date": "2024-01-15",
            "description": "Office rent payment",
            "type": "expense",
            "category": "Rent",
            "amount": 5000.00,
            "currency": "USD",
            "payment_method": "bank_transfer",
            "reference": "TXN-001",
            "project_id": "project-uuid-here",
            "project_name": "Office Building",
            "contractor_id": "contractor-uuid-here",
            "contractor_name": "ABC Construction",
            "status": "pending",
            "created_by": "user-uuid-here",
            "created_by_name": "Ahmed Ali",
            "balance": 95000.00,
            "notes": "Monthly office rent",
            "created_at": "2024-01-15 10:30:00"
        }
    }
}
```

**Business Logic:**
- Auto-generate `entry_number` in format: `CL-{sequential_number}`
- Calculate `balance` based on previous entries (sum of income - sum of expenses)
- Set `status` to 'pending' by default
- Set `created_by` from JWT token
- Link to project and contractor if provided
- Update project budget if linked

**المنطق التجاري:**
- توليد تلقائي لـ `entry_number` بصيغة: `CL-{رقم_تسلسلي}`
- حساب `balance` بناءً على القيود السابقة (مجموع الدخل - مجموع المصروفات)
- تعيين `status` إلى 'pending' افتراضياً
- تعيين `created_by` من رمز JWT
- ربط بالمشروع والمقاول إن وجد
- تحديث ميزانية المشروع إذا كان مرتبطاً

### 1.2 Fetch Cash Ledger Entries / جلب قيود سجل النقدية
**GET** `/cash-ledger/fetch`

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `search` (string, optional) - Search in entry_number, description, reference
- `type` (string, optional) - Filter by type: 'income' or 'expense'
- `category` (string, optional) - Filter by category
- `status` (string, optional) - Filter by status
- `from_date` (date, optional) - Filter from date
- `to_date` (date, optional) - Filter to date
- `project_id` (string, optional) - Filter by project
- `contractor_id` (string, optional) - Filter by contractor

**Response:**
```json
{
    "header": {
        "requestId": "uuid",
        "success": true
    },
    "body": {
        "cash_ledger": {
            "total": 100,
            "pages": 10,
            "items": [
                {
                    "id": "uuid",
                    "entry_number": "CL-001",
                    "date": "2024-01-15",
                    "description": "Office rent payment",
                    "type": "expense",
                    "category": "Rent",
                    "amount": 5000.00,
                    "currency": "USD",
                    "payment_method": "bank_transfer",
                    "reference": "TXN-001",
                    "project_id": "project-uuid",
                    "project_name": "Office Building",
                    "contractor_id": "contractor-uuid",
                    "contractor_name": "ABC Construction",
                    "status": "approved",
                    "created_by": "user-uuid",
                    "created_by_name": "Ahmed Ali",
                    "approved_by": "user-uuid",
                    "approved_by_name": "Fatima Mohamed",
                    "approval_date": "2024-01-15",
                    "balance": 95000.00,
                    "notes": "Monthly office rent",
                    "created_at": "2024-01-15 10:30:00",
                    "updated_at": "2024-01-15 11:00:00"
                }
            ]
        }
    }
}
```

### 1.3 Update Cash Ledger Entry / تحديث قيد في سجل النقدية
**PUT** `/cash-ledger/update/{id}`

**Request Body:** (Same as create, all fields optional)

### 1.4 Approve/Reject Cash Ledger Entry / الموافقة/الرفض على قيد
**POST** `/cash-ledger/approve/{id}`

**Request Body:**
```json
{
    "action": "approve", // or "reject"
    "notes": "Approved for payment"
}
```

**Business Logic:**
- Only users with approval permissions can approve/reject
- Update `status`, `approved_by`, `approval_date`
- If approved and type is 'expense', update project budget spent amount
- If approved and type is 'income', update project budget received amount
- Recalculate balance for all subsequent entries

### 1.5 Delete Cash Ledger Entry / حذف قيد من سجل النقدية
**DELETE** `/cash-ledger/delete/{id}`

**Business Logic:**
- Only allow deletion if status is 'pending'
- Recalculate balance for all subsequent entries
- Update project budget if linked

---

## 2. Contractor Payments APIs / واجهات مدفوعات المقاولين

### 2.1 Create Contractor Payment / إنشاء دفعة لمقاول
**POST** `/contractor-payments/create`

**Request Body:**
```json
{
    "contractor_id": "contractor-uuid-here",
    "project_id": "project-uuid-here",
    "amount": 50000.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "payment_date": "2024-01-15",
    "description": "Monthly progress payment for foundation work",
    "invoice_number": "INV-2024-001",
    "invoice_date": "2024-01-10",
    "notes": "Payment processed successfully"
}
```

**Response:**
```json
{
    "header": {
        "requestId": "uuid",
        "success": true,
        "message": "Contractor payment created successfully"
    },
    "body": {
        "contractor_payment": {
            "id": "uuid",
            "payment_number": "PAY-001",
            "contractor_id": "contractor-uuid",
            "contractor_name": "ABC Construction Ltd.",
            "project_id": "project-uuid",
            "project_name": "Office Building Construction",
            "amount": 50000.00,
            "currency": "USD",
            "payment_method": "bank_transfer",
            "payment_date": "2024-01-15",
            "description": "Monthly progress payment for foundation work",
            "status": "pending",
            "invoice_number": "INV-2024-001",
            "invoice_date": "2024-01-10",
            "created_by": "user-uuid",
            "created_by_name": "Fatima Mohamed",
            "notes": "Payment processed successfully",
            "created_at": "2024-01-15 10:30:00"
        }
    }
}
```

**Business Logic:**
- Auto-generate `payment_number` in format: `PAY-{sequential_number}`
- Set `status` to 'pending' by default
- Validate contractor and project exist
- Link to invoice if `invoice_number` provided
- Create corresponding cash ledger entry (expense type)
- Update project budget spent amount

### 2.2 Fetch Contractor Payments / جلب مدفوعات المقاولين
**GET** `/contractor-payments/fetch`

**Query Parameters:**
- `page`, `limit`, `search`
- `contractor_id` (string, optional)
- `project_id` (string, optional)
- `status` (string, optional)
- `payment_method` (string, optional)
- `from_date`, `to_date` (date, optional)

### 2.3 Approve Contractor Payment / الموافقة على دفعة مقاول
**POST** `/contractor-payments/approve/{id}`

**Business Logic:**
- Update status to 'approved'
- Set `approved_by` and `approval_date`
- Create cash ledger entry if not exists
- Update project budget

### 2.4 Mark Payment as Paid / تعليم الدفعة كمُدفوعة
**POST** `/contractor-payments/mark-paid/{id}`

**Request Body:**
```json
{
    "payment_reference": "TXN-123456789"
}
```

**Business Logic:**
- Update status to 'paid'
- Set `payment_reference`
- Update cash ledger entry status to 'approved'
- Update project budget

---

## 3. Loans APIs / واجهات القروض

### 3.1 Create Loan / إنشاء قرض
**POST** `/loans/create`

**Request Body:**
```json
{
    "borrower_id": "employee-uuid-here",
    "borrower_type": "employee",
    "principal_amount": 50000.00,
    "interest_rate": 5.5,
    "currency": "USD",
    "loan_purpose": "Home purchase",
    "loan_type": "personal",
    "start_date": "2024-01-01",
    "end_date": "2026-01-01",
    "term_months": 24,
    "collateral": "Property deed",
    "guarantor": "Sara Ahmed",
    "notes": "Employee personal loan for home purchase"
}
```

**Response:**
```json
{
    "header": {
        "requestId": "uuid",
        "success": true,
        "message": "Loan created successfully"
    },
    "body": {
        "loan": {
            "id": "uuid",
            "loan_number": "LOAN-001",
            "borrower_id": "employee-uuid",
            "borrower_name": "Ahmed Ali",
            "borrower_type": "employee",
            "principal_amount": 50000.00,
            "interest_rate": 5.5,
            "currency": "USD",
            "loan_purpose": "Home purchase",
            "loan_type": "personal",
            "start_date": "2024-01-01",
            "end_date": "2026-01-01",
            "term_months": 24,
            "monthly_payment": 2208.33,
            "total_interest": 2992.00,
            "total_amount": 52992.00,
            "paid_amount": 0.00,
            "remaining_amount": 52992.00,
            "status": "active",
            "approval_date": "2023-12-15",
            "approved_by": "user-uuid",
            "approved_by_name": "Fatima Mohamed",
            "collateral": "Property deed",
            "guarantor": "Sara Ahmed",
            "notes": "Employee personal loan for home purchase",
            "created_at": "2023-12-15 10:30:00"
        }
    }
}
```

**Business Logic:**
- Auto-generate `loan_number` in format: `LOAN-{sequential_number}`
- Calculate `monthly_payment` using loan formula: `PMT = (P * r * (1+r)^n) / ((1+r)^n - 1)`
- Calculate `total_interest` = (monthly_payment * term_months) - principal_amount
- Calculate `total_amount` = principal_amount + total_interest
- Set `remaining_amount` = total_amount initially
- Validate borrower exists based on `borrower_type`
- Set status to 'active' after approval

### 3.2 Record Loan Payment / تسجيل دفعة قرض
**POST** `/loans/payment/{id}`

**Request Body:**
```json
{
    "payment_amount": 2208.33,
    "payment_date": "2024-02-01",
    "notes": "Monthly payment"
}
```

**Business Logic:**
- Update `paid_amount` += payment_amount
- Update `remaining_amount` -= payment_amount
- If `remaining_amount` <= 0, set status to 'completed'
- Create cash ledger entry (expense type) for loan payment
- Record payment in loan_payments table (if exists)

---

## 4. Budgets APIs / واجهات الميزانيات

### 4.1 Create Budget / إنشاء ميزانية
**POST** `/budgets/create`

**Request Body:**
```json
{
    "name": "IT Department Budget",
    "department": "Information Technology",
    "category": "Technology",
    "fiscal_year": "2024",
    "allocated_amount": 500000.00,
    "currency": "USD",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "description": "Annual budget for IT department operations and equipment"
}
```

**Business Logic:**
- Auto-generate `budget_number` in format: `BUD-{fiscal_year}-{sequential_number}`
- Set `remaining_amount` = `allocated_amount` initially
- Set `spent_amount` = 0 initially
- Set status to 'draft' by default
- Validate dates (start_date < end_date)

### 4.2 Update Budget Spent Amount / تحديث المبلغ المنفق
**POST** `/budgets/update-spent/{id}`

**Request Body:**
```json
{
    "amount": 35000.00,
    "operation": "add" // or "subtract"
}
```

**Business Logic:**
- Update `spent_amount` based on operation
- Recalculate `remaining_amount` = `allocated_amount` - `spent_amount`
- If `remaining_amount` < 0, set status to 'exceeded'
- If `remaining_amount` >= 0 and status was 'exceeded', set status to 'active'

---

## 5. Financial Requests APIs / واجهات الطلبات المالية

### 5.1 Create Financial Request / إنشاء طلب مالي
**POST** `/financial-requests/create`

**Request Body:**
```json
{
    "request_type": "expense",
    "title": "Office Supplies Purchase",
    "description": "Request for office supplies including paper, pens, and stationery",
    "amount": 2500.00,
    "currency": "USD",
    "category": "Office Supplies",
    "project_id": "project-uuid-here",
    "department": "Project Management",
    "priority": "medium",
    "metadata": {
        "vendor": "Office Supplies Co.",
        "items": ["Paper", "Pens", "Stationery"]
    }
}
```

**Business Logic:**
- Auto-generate `request_number` in format: `REQ-FIN-{sequential_number}`
- Set `requester_id` from JWT token
- Set `submitted_date` to current date
- Set `status` to 'pending' by default
- Link to project if provided
- Validate amount > 0

### 5.2 Approve Financial Request / الموافقة على طلب مالي
**POST** `/financial-requests/approve/{id}`

**Request Body:**
```json
{
    "comments": "Approved for project needs"
}
```

**Business Logic:**
- Update status to 'approved'
- Set `approved_by` and `approved_date`
- If request_type is 'payment' or 'expense', create cash ledger entry
- If linked to project, update project budget
- If request_type is 'budget', create budget entry

---

## 6. Invoices APIs / واجهات الفواتير

### 6.1 Create Invoice / إنشاء فاتورة
**POST** `/invoices/create`

**Request Body:**
```json
{
    "invoice_date": "2024-01-15",
    "due_date": "2024-02-15",
    "client_id": "client-uuid-here",
    "project_id": "project-uuid-here",
    "items": [
        {
            "item_description": "Construction Services",
            "quantity": 100.00,
            "unit_price": 500.00,
            "total": 50000.00
        }
    ],
    "tax_rate": 5.0,
    "discount": 0.00,
    "currency": "USD",
    "payment_terms": "Net 30",
    "notes": "Invoice for project completion"
}
```

**Business Logic:**
- Auto-generate `invoice_no` in format: `INV-{year}-{sequential_number}`
- Calculate `subtotal` = sum of items total
- Calculate `tax_amount` = subtotal * (tax_rate / 100)
- Calculate `total` = subtotal + tax_amount - discount
- Set status to 'Draft' by default
- Create invoice_items records
- Link to client and project if provided

### 6.2 Mark Invoice as Paid / تعليم الفاتورة كمُدفوعة
**POST** `/invoices/mark-paid/{id}`

**Request Body:**
```json
{
    "payment_date": "2024-01-20",
    "payment_method": "bank_transfer",
    "reference": "TXN-123456"
}
```

**Business Logic:**
- Update status to 'Paid'
- Create cash ledger entry (income type)
- Update project budget received amount
- Link payment to invoice

---

## Relationships & Business Rules / العلاقات والقواعد التجارية

### Cash Ledger Relationships:
- **Projects**: One entry can link to one project (optional)
- **Contractors**: One entry can link to one contractor (optional)
- **Users**: `created_by` and `approved_by` link to users table
- **Auto-balance calculation**: Each entry's balance = previous balance + (income) or - (expense)

### Contractor Payments Relationships:
- **Contractors**: Required relationship (one payment to one contractor)
- **Projects**: Required relationship (one payment for one project)
- **Invoices**: Optional relationship via `invoice_number`
- **Cash Ledger**: Auto-create expense entry when payment is approved/paid
- **Project Budget**: Update spent amount when payment is made

### Loans Relationships:
- **Borrowers**: Links to employees/contractors/clients based on `borrower_type`
- **Users**: `created_by` and `approved_by` link to users
- **Cash Ledger**: Create expense entry for each loan payment

### Budgets Relationships:
- **Users**: `created_by` and `approved_by` link to users
- **Projects**: Can link to specific projects (via metadata or separate table)
- **Auto-tracking**: `spent_amount` updated automatically when linked expenses are created

### Financial Requests Relationships:
- **Users**: `requester_id`, `reviewed_by`, `approved_by` link to users
- **Projects**: Optional relationship
- **Cash Ledger**: Auto-create entry when approved (if expense/payment type)
- **Budgets**: Can create budget entry if request_type is 'budget'

### Invoices Relationships:
- **Clients**: Optional relationship
- **Projects**: Optional relationship
- **Invoice Items**: One-to-many relationship
- **Cash Ledger**: Create income entry when invoice is marked as paid
- **Project Budget**: Update received amount when invoice is paid

---

## Error Handling / معالجة الأخطاء

All endpoints should return errors in this format:
```json
{
    "header": {
        "requestId": "uuid",
        "success": false,
        "status": 400,
        "message": "Validation error",
        "messages": [
            {
                "code": 400,
                "type": "validation",
                "message": "Amount must be greater than 0"
            }
        ]
    }
}
```

---

## Security Considerations / اعتبارات الأمان

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Check user permissions for create/update/delete/approve operations
3. **Validation**: Validate all input data (amounts, dates, IDs)
4. **Audit Trail**: Log all financial transactions
5. **Balance Integrity**: Ensure balance calculations are atomic and consistent
6. **Approval Workflow**: Enforce approval workflow for financial operations

---

## Implementation Notes / ملاحظات التنفيذ

1. Use database transactions for operations that affect multiple tables
2. Implement soft deletes for financial records (add `deleted_at` column)
3. Add audit log table to track all changes
4. Implement number generation using database sequences or auto-increment
5. Use decimal type for all monetary amounts (DECIMAL(15,2))
6. Implement proper indexing for performance
7. Add validation for date ranges and business rules
8. Implement proper error handling and logging

---

## Testing Checklist / قائمة الاختبار

- [ ] Create cash ledger entry (income)
- [ ] Create cash ledger entry (expense)
- [ ] Balance calculation accuracy
- [ ] Approve/reject cash ledger entry
- [ ] Create contractor payment
- [ ] Link contractor payment to invoice
- [ ] Approve and mark payment as paid
- [ ] Create loan with interest calculation
- [ ] Record loan payment
- [ ] Create budget
- [ ] Update budget spent amount
- [ ] Budget exceeded status
- [ ] Create financial request
- [ ] Approve financial request
- [ ] Create invoice with items
- [ ] Mark invoice as paid
- [ ] All relationships work correctly
- [ ] Authorization checks
- [ ] Validation errors
- [ ] Pagination and filtering

---

## Contact / الاتصال

For questions or clarifications, please contact the development team.

للأسئلة أو التوضيحات، يرجى الاتصال بفريق التطوير.

