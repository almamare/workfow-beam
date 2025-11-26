# متطلبات API للباك إند PHP - نظام الصلاحيات
# Permissions System PHP Backend API Requirements

## نظرة عامة / Overview
هذا الملف يحتوي على جميع متطلبات الـ API endpoints لنظام الصلاحيات. يجب تنفيذ جميع الـ endpoints التالية في PHP.

This file contains all API endpoint requirements for the permissions system. All the following endpoints must be implemented in PHP.

---

## 1. Permissions Management APIs

### 1.1 GET /permissions/fetch
**الوصف:** جلب قائمة الصلاحيات مع إمكانية البحث والفلترة  
**Description:** Fetch list of permissions with search and filtering

**Query Parameters:**
- `page` (optional, int): رقم الصفحة - Page number (default: 1)
- `limit` (optional, int): عدد النتائج في الصفحة - Results per page (default: 10)
- `search` (optional, string): البحث في الاسم والوصف - Search in name and description
- `module` (optional, string): فلترة حسب الوحدة - Filter by module

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permissions fetched successfully"
    },
    "body": {
        "permissions": {
            "total": 100,
            "pages": 10,
            "items": [
                {
                    "id": "perm-001",
                    "name": "User Management",
                    "description": "إدارة المستخدمين",
                    "module": "Users",
                    "actions": ["create", "read", "update", "delete"],
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            ]
        }
    }
}
```

**SQL Query Example:**
```sql
SELECT * FROM permissions 
WHERE (? IS NULL OR name LIKE ? OR description LIKE ?)
AND (? IS NULL OR module = ?)
ORDER BY module, name
LIMIT ? OFFSET ?;
```

---

### 1.2 GET /permissions/fetch/{id}
**الوصف:** جلب صلاحية واحدة بالتفصيل  
**Description:** Fetch single permission details

**Path Parameters:**
- `id` (required, string): معرف الصلاحية - Permission ID

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z"
    },
    "body": {
        "permission": {
            "id": "perm-001",
            "name": "User Management",
            "description": "إدارة المستخدمين",
            "module": "Users",
            "actions": ["create", "read", "update", "delete"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    }
}
```

---

### 1.3 POST /permissions/create
**الوصف:** إنشاء صلاحية جديدة  
**Description:** Create a new permission

**Request Body (params):**
```json
{
    "name": "User Management",
    "description": "إدارة المستخدمين",
    "module": "Users",
    "actions": ["create", "read", "update", "delete"]
}
```

**Validation Rules:**
- `name`: مطلوب، لا يمكن أن يكون فارغاً - Required, cannot be empty
- `module`: مطلوب، يجب أن يكون من القائمة المسموحة - Required, must be from allowed list
- `actions`: مطلوب، يجب أن يحتوي على عنصر واحد على الأقل - Required, must contain at least one action
- `actions`: يجب أن تكون من القائمة: create, read, update, delete, approve, reject

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 201,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permission created successfully"
    },
    "body": {
        "permission": {
            "id": "perm-001",
            "name": "User Management",
            "description": "إدارة المستخدمين",
            "module": "Users",
            "actions": ["create", "read", "update", "delete"],
            "created_at": "2024-01-01T00:00:00Z"
        }
    }
}
```

**SQL Query Example:**
```sql
INSERT INTO permissions (id, name, description, module, actions)
VALUES (UUID(), ?, ?, ?, JSON_ARRAY(?));
```

---

### 1.4 PUT /permissions/update/{id}
**الوصف:** تحديث صلاحية موجودة  
**Description:** Update an existing permission

**Path Parameters:**
- `id` (required, string): معرف الصلاحية - Permission ID

**Request Body (params):**
```json
{
    "name": "Updated User Management",
    "description": "وصف محدث",
    "module": "Users",
    "actions": ["create", "read", "update"]
}
```

**Note:** جميع الحقول اختيارية - All fields are optional

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permission updated successfully"
    },
    "body": {
        "permission": {
            "id": "perm-001",
            "name": "Updated User Management",
            "description": "وصف محدث",
            "module": "Users",
            "actions": ["create", "read", "update"],
            "updated_at": "2024-01-01T00:00:00Z"
        }
    }
}
```

**SQL Query Example:**
```sql
UPDATE permissions 
SET name = COALESCE(?, name),
    description = COALESCE(?, description),
    module = COALESCE(?, module),
    actions = COALESCE(JSON_ARRAY(?), actions),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

---

### 1.5 DELETE /permissions/delete/{id}
**الوصف:** حذف صلاحية  
**Description:** Delete a permission

**Path Parameters:**
- `id` (required, string): معرف الصلاحية - Permission ID

**Important:** عند حذف صلاحية، يتم حذف جميع الروابط مع المستخدمين تلقائياً بسبب CASCADE  
**Important:** When deleting a permission, all user links are automatically deleted due to CASCADE

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permission deleted successfully"
    }
}
```

**SQL Query Example:**
```sql
DELETE FROM permissions WHERE id = ?;
```

---

## 2. User Permissions Management APIs

### 2.1 GET /permissions/user/{user_id}
**الوصف:** جلب جميع صلاحيات مستخدم معين  
**Description:** Fetch all permissions for a specific user

**Path Parameters:**
- `user_id` (required, string): معرف المستخدم - User ID

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z"
    },
    "body": {
        "user_permissions": [
            {
                "id": "up-001",
                "user_id": "user-001",
                "permission_id": "perm-001",
                "permission": {
                    "id": "perm-001",
                    "name": "User Management",
                    "description": "إدارة المستخدمين",
                    "module": "Users",
                    "actions": ["create", "read", "update", "delete"]
                },
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }
}
```

**SQL Query Example:**
```sql
SELECT 
    up.id,
    up.user_id,
    up.permission_id,
    p.name AS permission_name,
    p.description AS permission_description,
    p.module,
    p.actions,
    up.created_at
FROM user_permissions up
INNER JOIN permissions p ON up.permission_id = p.id
WHERE up.user_id = ?;
```

---

### 2.2 POST /permissions/assign
**الوصف:** تعيين صلاحية لمستخدم  
**Description:** Assign a permission to a user

**Request Body (params):**
```json
{
    "user_id": "user-001",
    "permission_id": "perm-001"
}
```

**Validation:**
- يجب التحقق من وجود المستخدم - Verify user exists
- يجب التحقق من وجود الصلاحية - Verify permission exists
- يجب التحقق من عدم تكرار الصلاحية للمستخدم - Verify permission is not already assigned

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 201,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permission assigned successfully"
    },
    "body": {
        "user_permission": {
            "id": "up-001",
            "user_id": "user-001",
            "permission_id": "perm-001",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }
}
```

**SQL Query Example:**
```sql
INSERT INTO user_permissions (id, user_id, permission_id)
VALUES (UUID(), ?, ?)
ON DUPLICATE KEY UPDATE id = id;
```

---

### 2.3 DELETE /permissions/unassign
**الوصف:** إزالة صلاحية من مستخدم  
**Description:** Remove a permission from a user

**Request Body (params):**
```json
{
    "user_id": "user-001",
    "permission_id": "perm-001"
}
```

**Response Format:**
```json
{
    "header": {
        "requestId": "string",
        "success": true,
        "status": 200,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Permission removed successfully"
    }
}
```

**SQL Query Example:**
```sql
DELETE FROM user_permissions 
WHERE user_id = ? AND permission_id = ?;
```

---

## 3. Helper Functions / دوال مساعدة

### 3.1 Check User Permission
**الوصف:** التحقق من صلاحية مستخدم لتنفيذ إجراء معين  
**Description:** Check if user has permission to perform a specific action

**Function Signature (PHP):**
```php
function checkUserPermission($userId, $module, $action) {
    // Use stored procedure: sp_check_user_permission
    // Returns: true/false
}
```

**SQL Query:**
```sql
CALL sp_check_user_permission(?, ?, ?);
```

---

## 4. Error Handling / معالجة الأخطاء

### Error Response Format:
```json
{
    "header": {
        "requestId": "string",
        "success": false,
        "status": 400,
        "responseTime": "2024-01-01T00:00:00Z",
        "message": "Error message",
        "messages": [
            {
                "code": 400,
                "type": "validation_error",
                "message": "Field 'name' is required"
            }
        ]
    }
}
```

### Common Error Codes:
- `400`: Bad Request - طلب غير صحيح
- `401`: Unauthorized - غير مصرح
- `403`: Forbidden - محظور
- `404`: Not Found - غير موجود
- `409`: Conflict - تعارض (مثل تكرار الصلاحية)
- `500`: Internal Server Error - خطأ في الخادم

---

## 5. PHP Implementation Example / مثال على التنفيذ

### Example Controller Structure:
```php
<?php
class PermissionsController {
    
    public function fetch($request) {
        // Get query parameters
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 10);
        $search = $request->get('search');
        $module = $request->get('module');
        
        // Build SQL query
        $sql = "SELECT * FROM permissions WHERE 1=1";
        $params = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($module) {
            $sql .= " AND module = ?";
            $params[] = $module;
        }
        
        $sql .= " ORDER BY module, name LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = ($page - 1) * $limit;
        
        // Execute query and return response
        // ...
    }
    
    public function create($request) {
        $name = $request->get('name');
        $description = $request->get('description');
        $module = $request->get('module');
        $actions = $request->get('actions'); // Array
        
        // Validation
        if (empty($name) || empty($module) || empty($actions)) {
            return $this->errorResponse(400, "Required fields missing");
        }
        
        // Validate actions
        $allowedActions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];
        foreach ($actions as $action) {
            if (!in_array($action, $allowedActions)) {
                return $this->errorResponse(400, "Invalid action: $action");
            }
        }
        
        // Insert into database
        $id = $this->generateUUID();
        $actionsJson = json_encode($actions);
        
        $sql = "INSERT INTO permissions (id, name, description, module, actions) 
                VALUES (?, ?, ?, ?, ?)";
        // Execute...
    }
    
    // Other methods...
}
```

---

## 6. Database Connection / اتصال قاعدة البيانات

### Recommended PDO Connection:
```php
$pdo = new PDO(
    "mysql:host=localhost;dbname=your_database;charset=utf8mb4",
    "username",
    "password",
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]
);
```

---

## 7. Security Considerations / اعتبارات الأمان

1. **Authentication:** جميع الـ endpoints تحتاج إلى مصادقة - All endpoints require authentication
2. **Authorization:** التحقق من صلاحيات المستخدم قبل تنفيذ العمليات - Check user permissions before operations
3. **Input Validation:** التحقق من جميع المدخلات - Validate all inputs
4. **SQL Injection:** استخدام Prepared Statements دائماً - Always use Prepared Statements
5. **XSS Protection:** تنظيف البيانات قبل العرض - Sanitize data before display
6. **Rate Limiting:** تحديد معدل الطلبات - Implement rate limiting

---

## 8. Testing Checklist / قائمة الاختبار

- [ ] Create permission
- [ ] Update permission
- [ ] Delete permission
- [ ] Fetch permissions list with pagination
- [ ] Search permissions
- [ ] Filter by module
- [ ] Assign permission to user
- [ ] Remove permission from user
- [ ] Fetch user permissions
- [ ] Error handling for invalid inputs
- [ ] Error handling for duplicate assignments
- [ ] Error handling for non-existent records

---

## ملاحظات إضافية / Additional Notes

1. جميع التواريخ يجب أن تكون بصيغة ISO 8601 - All dates should be in ISO 8601 format
2. استخدام UUID للمعرفات - Use UUID for IDs
3. JSON للـ actions - JSON for actions array
4. دعم UTF-8 للعربية - UTF-8 support for Arabic
5. استخدام Transactions للعمليات المتعددة - Use Transactions for multiple operations

---

**تاريخ الإنشاء / Created:** 2024-01-01  
**الإصدار / Version:** 1.0.0

