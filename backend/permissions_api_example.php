<?php
/**
 * Permissions API Example - PHP Backend
 * مثال على API الصلاحيات - الباك إند PHP
 * 
 * هذا ملف مثال يحتوي على جميع الـ endpoints المطلوبة
 * This is an example file containing all required endpoints
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_CHARSET', 'utf8mb4');

class PermissionsAPI {
    private $pdo;
    private $requestId;
    
    public function __construct() {
        $this->requestId = uniqid('req_', true);
        $this->connectDatabase();
    }
    
    private function connectDatabase() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            $this->errorResponse(500, "Database connection failed: " . $e->getMessage());
        }
    }
    
    private function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    private function successResponse($data = null, $message = "Success", $status = 200) {
        $response = [
            'header' => [
                'requestId' => $this->requestId,
                'success' => true,
                'status' => $status,
                'responseTime' => date('c'),
                'message' => $message
            ]
        ];
        
        if ($data !== null) {
            $response['body'] = $data;
        }
        
        http_response_code($status);
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    private function errorResponse($status, $message, $messages = null) {
        $response = [
            'header' => [
                'requestId' => $this->requestId,
                'success' => false,
                'status' => $status,
                'responseTime' => date('c'),
                'message' => $message
            ]
        ];
        
        if ($messages !== null) {
            $response['header']['messages'] = $messages;
        }
        
        http_response_code($status);
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    private function getParams() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            return $_GET;
        } else {
            $input = file_get_contents('php://input');
            $params = json_decode($input, true);
            
            // Also check $_POST for form data
            if (empty($params)) {
                $params = $_POST;
            }
            
            return $params ?? [];
        }
    }
    
    // =========================================================
    // 1. Permissions Management
    // =========================================================
    
    /**
     * GET /permissions/fetch
     * Fetch list of permissions
     */
    public function fetchPermissions() {
        $params = $this->getParams();
        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 10;
        $search = $params['search'] ?? null;
        $module = $params['module'] ?? null;
        
        $offset = ($page - 1) * $limit;
        
        // Build query
        $sql = "SELECT * FROM permissions WHERE 1=1";
        $queryParams = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $searchTerm = "%$search%";
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
        }
        
        if ($module) {
            $sql .= " AND module = ?";
            $queryParams[] = $module;
        }
        
        // Get total count
        $countSql = str_replace('SELECT *', 'SELECT COUNT(*) as total', $sql);
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($queryParams);
        $total = $countStmt->fetch()['total'];
        $pages = ceil($total / $limit);
        
        // Get paginated results
        $sql .= " ORDER BY module, name LIMIT ? OFFSET ?";
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($queryParams);
        $permissions = $stmt->fetchAll();
        
        // Decode JSON actions
        foreach ($permissions as &$permission) {
            $permission['actions'] = json_decode($permission['actions'], true);
        }
        
        $this->successResponse([
            'permissions' => [
                'total' => $total,
                'pages' => $pages,
                'items' => $permissions
            ]
        ], "Permissions fetched successfully");
    }
    
    /**
     * GET /permissions/fetch/{id}
     * Fetch single permission
     */
    public function fetchPermission($id) {
        $sql = "SELECT * FROM permissions WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $permission = $stmt->fetch();
        
        if (!$permission) {
            $this->errorResponse(404, "Permission not found");
        }
        
        $permission['actions'] = json_decode($permission['actions'], true);
        
        $this->successResponse(['permission' => $permission], "Permission fetched successfully");
    }
    
    /**
     * POST /permissions/create
     * Create new permission
     */
    public function createPermission() {
        $params = $this->getParams();
        
        $name = $params['name'] ?? null;
        $description = $params['description'] ?? '';
        $module = $params['module'] ?? null;
        $actions = $params['actions'] ?? null;
        
        // Validation
        if (empty($name) || empty($module) || empty($actions)) {
            $this->errorResponse(400, "Required fields missing", [
                [
                    'code' => 400,
                    'type' => 'validation_error',
                    'message' => 'Fields name, module, and actions are required'
                ]
            ]);
        }
        
        if (!is_array($actions) || count($actions) === 0) {
            $this->errorResponse(400, "Actions must be a non-empty array");
        }
        
        // Validate actions
        $allowedActions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];
        foreach ($actions as $action) {
            if (!in_array($action, $allowedActions)) {
                $this->errorResponse(400, "Invalid action: $action. Allowed actions: " . implode(', ', $allowedActions));
            }
        }
        
        // Validate module
        $allowedModules = ['Users', 'Projects', 'Financial', 'Reports', 'Inventory', 'Contractors', 'Tasks', 'Employees', 'Settings'];
        if (!in_array($module, $allowedModules)) {
            $this->errorResponse(400, "Invalid module: $module");
        }
        
        // Insert
        $id = $this->generateUUID();
        $actionsJson = json_encode($actions);
        
        $sql = "INSERT INTO permissions (id, name, description, module, actions) 
                VALUES (?, ?, ?, ?, ?)";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id, $name, $description, $module, $actionsJson]);
            
            // Fetch created permission
            $this->fetchPermission($id);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                $this->errorResponse(409, "Permission with this name already exists");
            }
            $this->errorResponse(500, "Failed to create permission: " . $e->getMessage());
        }
    }
    
    /**
     * PUT /permissions/update/{id}
     * Update permission
     */
    public function updatePermission($id) {
        $params = $this->getParams();
        
        // Check if permission exists
        $checkSql = "SELECT id FROM permissions WHERE id = ?";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            $this->errorResponse(404, "Permission not found");
        }
        
        // Build update query
        $updates = [];
        $values = [];
        
        if (isset($params['name'])) {
            $updates[] = "name = ?";
            $values[] = $params['name'];
        }
        
        if (isset($params['description'])) {
            $updates[] = "description = ?";
            $values[] = $params['description'];
        }
        
        if (isset($params['module'])) {
            $allowedModules = ['Users', 'Projects', 'Financial', 'Reports', 'Inventory', 'Contractors', 'Tasks', 'Employees', 'Settings'];
            if (!in_array($params['module'], $allowedModules)) {
                $this->errorResponse(400, "Invalid module: " . $params['module']);
            }
            $updates[] = "module = ?";
            $values[] = $params['module'];
        }
        
        if (isset($params['actions'])) {
            if (!is_array($params['actions']) || count($params['actions']) === 0) {
                $this->errorResponse(400, "Actions must be a non-empty array");
            }
            
            $allowedActions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];
            foreach ($params['actions'] as $action) {
                if (!in_array($action, $allowedActions)) {
                    $this->errorResponse(400, "Invalid action: $action");
                }
            }
            
            $updates[] = "actions = ?";
            $values[] = json_encode($params['actions']);
        }
        
        if (empty($updates)) {
            $this->errorResponse(400, "No fields to update");
        }
        
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $values[] = $id;
        
        $sql = "UPDATE permissions SET " . implode(', ', $updates) . " WHERE id = ?";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);
            
            $this->fetchPermission($id);
        } catch (PDOException $e) {
            $this->errorResponse(500, "Failed to update permission: " . $e->getMessage());
        }
    }
    
    /**
     * DELETE /permissions/delete/{id}
     * Delete permission
     */
    public function deletePermission($id) {
        // Check if permission exists
        $checkSql = "SELECT id FROM permissions WHERE id = ?";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            $this->errorResponse(404, "Permission not found");
        }
        
        $sql = "DELETE FROM permissions WHERE id = ?";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);
            
            $this->successResponse(null, "Permission deleted successfully");
        } catch (PDOException $e) {
            $this->errorResponse(500, "Failed to delete permission: " . $e->getMessage());
        }
    }
    
    // =========================================================
    // 2. User Permissions Management
    // =========================================================
    
    /**
     * GET /permissions/user/{user_id}
     * Fetch user permissions
     */
    public function fetchUserPermissions($userId) {
        $sql = "SELECT 
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
                WHERE up.user_id = ?
                ORDER BY p.module, p.name";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        $userPermissions = $stmt->fetchAll();
        
        // Format response
        $formatted = [];
        foreach ($userPermissions as $up) {
            $formatted[] = [
                'id' => $up['id'],
                'user_id' => $up['user_id'],
                'permission_id' => $up['permission_id'],
                'permission' => [
                    'id' => $up['permission_id'],
                    'name' => $up['permission_name'],
                    'description' => $up['permission_description'],
                    'module' => $up['module'],
                    'actions' => json_decode($up['actions'], true)
                ],
                'created_at' => $up['created_at']
            ];
        }
        
        $this->successResponse(['user_permissions' => $formatted], "User permissions fetched successfully");
    }
    
    /**
     * POST /permissions/assign
     * Assign permission to user
     */
    public function assignPermission() {
        $params = $this->getParams();
        
        $userId = $params['user_id'] ?? null;
        $permissionId = $params['permission_id'] ?? null;
        
        if (empty($userId) || empty($permissionId)) {
            $this->errorResponse(400, "user_id and permission_id are required");
        }
        
        // Check if user exists
        $userSql = "SELECT id FROM users WHERE id = ?";
        $userStmt = $this->pdo->prepare($userSql);
        $userStmt->execute([$userId]);
        if (!$userStmt->fetch()) {
            $this->errorResponse(404, "User not found");
        }
        
        // Check if permission exists
        $permSql = "SELECT id FROM permissions WHERE id = ?";
        $permStmt = $this->pdo->prepare($permSql);
        $permStmt->execute([$permissionId]);
        if (!$permStmt->fetch()) {
            $this->errorResponse(404, "Permission not found");
        }
        
        // Check if already assigned
        $checkSql = "SELECT id FROM user_permissions WHERE user_id = ? AND permission_id = ?";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([$userId, $permissionId]);
        if ($checkStmt->fetch()) {
            $this->errorResponse(409, "Permission already assigned to user");
        }
        
        // Insert
        $id = $this->generateUUID();
        $sql = "INSERT INTO user_permissions (id, user_id, permission_id) VALUES (?, ?, ?)";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id, $userId, $permissionId]);
            
            $this->successResponse([
                'user_permission' => [
                    'id' => $id,
                    'user_id' => $userId,
                    'permission_id' => $permissionId,
                    'created_at' => date('c')
                ]
            ], "Permission assigned successfully", 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->errorResponse(409, "Permission already assigned to user");
            }
            $this->errorResponse(500, "Failed to assign permission: " . $e->getMessage());
        }
    }
    
    /**
     * DELETE /permissions/unassign
     * Remove permission from user
     */
    public function removePermission() {
        $params = $this->getParams();
        
        $userId = $params['user_id'] ?? null;
        $permissionId = $params['permission_id'] ?? null;
        
        if (empty($userId) || empty($permissionId)) {
            $this->errorResponse(400, "user_id and permission_id are required");
        }
        
        $sql = "DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$userId, $permissionId]);
            
            if ($stmt->rowCount() === 0) {
                $this->errorResponse(404, "User permission not found");
            }
            
            $this->successResponse(null, "Permission removed successfully");
        } catch (PDOException $e) {
            $this->errorResponse(500, "Failed to remove permission: " . $e->getMessage());
        }
    }
    
    /**
     * Helper: Check user permission
     */
    public function checkUserPermission($userId, $module, $action) {
        $sql = "SELECT COUNT(*) as has_permission
                FROM user_permissions up
                INNER JOIN permissions p ON up.permission_id = p.id
                WHERE up.user_id = ?
                AND p.module = ?
                AND JSON_CONTAINS(p.actions, ?)";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $module, json_encode($action)]);
        $result = $stmt->fetch();
        
        return $result['has_permission'] > 0;
    }
}

// =========================================================
// Router / التوجيه
// =========================================================

$api = new PermissionsAPI();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? $_SERVER['REQUEST_URI'];
$path = parse_url($path, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Remove 'permissions' from path if present
if (isset($pathParts[0]) && $pathParts[0] === 'permissions') {
    array_shift($pathParts);
}

try {
    if ($method === 'GET' && count($pathParts) === 0) {
        // GET /permissions/fetch
        $api->fetchPermissions();
    } elseif ($method === 'GET' && $pathParts[0] === 'fetch' && isset($pathParts[1])) {
        // GET /permissions/fetch/{id}
        $api->fetchPermission($pathParts[1]);
    } elseif ($method === 'GET' && $pathParts[0] === 'user' && isset($pathParts[1])) {
        // GET /permissions/user/{user_id}
        $api->fetchUserPermissions($pathParts[1]);
    } elseif ($method === 'POST' && $pathParts[0] === 'create') {
        // POST /permissions/create
        $api->createPermission();
    } elseif ($method === 'POST' && $pathParts[0] === 'assign') {
        // POST /permissions/assign
        $api->assignPermission();
    } elseif ($method === 'PUT' && $pathParts[0] === 'update' && isset($pathParts[1])) {
        // PUT /permissions/update/{id}
        $api->updatePermission($pathParts[1]);
    } elseif ($method === 'DELETE' && $pathParts[0] === 'delete' && isset($pathParts[1])) {
        // DELETE /permissions/delete/{id}
        $api->deletePermission($pathParts[1]);
    } elseif ($method === 'DELETE' && $pathParts[0] === 'unassign') {
        // DELETE /permissions/unassign
        $api->removePermission();
    } else {
        http_response_code(404);
        echo json_encode([
            'header' => [
                'success' => false,
                'status' => 404,
                'message' => 'Endpoint not found'
            ]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'header' => [
            'success' => false,
            'status' => 500,
            'message' => 'Internal server error: ' . $e->getMessage()
        ]
    ]);
}

