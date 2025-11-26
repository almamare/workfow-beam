# نظام الصلاحيات - دليل التنفيذ
# Permissions System - Implementation Guide

## الملفات المتوفرة / Available Files

1. **database/permissions_schema.sql** - كود SQL لإنشاء الجداول
2. **backend/PHP_API_Requirements.md** - متطلبات الـ API بالتفصيل
3. **backend/permissions_api_example.php** - مثال كامل على تنفيذ الـ API

## خطوات التنفيذ / Implementation Steps

### 1. إنشاء قاعدة البيانات / Database Setup

```bash
# قم بتشغيل ملف SQL
mysql -u username -p database_name < database/permissions_schema.sql
```

أو استخدم phpMyAdmin أو أي أداة أخرى لاستيراد الملف.

### 2. تكوين الاتصال / Database Configuration

عدّل ملف `permissions_api_example.php` وأضف بيانات الاتصال:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. إعداد الـ Routing / Routing Setup

يمكنك استخدام الملف `permissions_api_example.php` مباشرة أو دمجه مع نظام الـ routing الخاص بك.

**مثال على .htaccess:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^permissions/(.*)$ permissions_api_example.php/$1 [L,QSA]
```

### 4. اختبار الـ API / Testing

**مثال على استخدام cURL:**

```bash
# جلب الصلاحيات
curl -X GET "http://localhost/permissions/fetch?page=1&limit=10"

# إنشاء صلاحية جديدة
curl -X POST "http://localhost/permissions/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Permission",
    "description": "Test Description",
    "module": "Users",
    "actions": ["create", "read"]
  }'

# تعيين صلاحية لمستخدم
curl -X POST "http://localhost/permissions/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-001",
    "permission_id": "perm-001"
  }'
```

## ملاحظات مهمة / Important Notes

1. **الأمان / Security:**
   - أضف نظام مصادقة (Authentication)
   - استخدم HTTPS في الإنتاج
   - قم بتطهير جميع المدخلات

2. **الأداء / Performance:**
   - استخدم فهارس قاعدة البيانات
   - ضع في اعتبارك التخزين المؤقت (Caching)
   - استخدم Prepared Statements دائماً

3. **التوافق / Compatibility:**
   - يتطلب PHP 7.4 أو أحدث
   - يتطلب MySQL 5.7+ أو MariaDB 10.2+
   - دعم JSON في MySQL

## الدعم / Support

للمزيد من المعلومات، راجع ملف `PHP_API_Requirements.md`

