# تقرير فحص النظام — System Audit Report

**تاريخ آخر تحديث:** مارس 2026  
**الهدف:** وصف البنية الكاملة بدقة، وقائمة الملفات والمسارات، ونقاط التناسق والمخاطر والتوصيات.

---

## 1. التقنيات والإطار (Stack)

| الطبقة | التقنية |
|--------|---------|
| إطار الواجهة | Next.js 14 (App Router) — `app/` |
| اللغة | TypeScript 5.x |
| الحالة العامة | Redux Toolkit (`@reduxjs/toolkit`) + `react-redux` |
| HTTP | Axios (`utils/axios.ts`) — Base URL من `NEXT_PUBLIC_API_BASE_URL` (افتراضي: `http://localhost/beam/api/v1`) |
| التوكن | `js-cookie` — مفتاح `token`، يُرفق كـ `Authorization: Bearer` |
| الواجهة | Tailwind CSS + مكونات Radix/shadcn-style (`components/ui/`) |
| الإشعارات | `sonner` (Toaster في `components/providers.tsx`) |

---

## 2. هيكل المجلدات الرئيسي (High-level tree)

```
project/
├── app/                    # مسارات Next.js (App Router) — ~115 صفحة page.tsx
├── components/             # مكونات مشتركة (layout, ui, pages, attachments, …)
├── contexts/               # ThemeContext، AuthContext (غير مستخدم في providers)
├── hooks/                  # useAuth وغيرها
├── lib/                    # utils (cn، fonts)
├── stores/
│   ├── slices/             # 29 slice لـ Redux
│   ├── types/              # أنواع الـ API لكل وحدة
│   └── store.ts
├── utils/                  # axios، apiResponse، fileUtils
├── middleware.ts           # حماية مسارات على مستوى السيرفر (Cookie)
└── public/                 # أصول ثابتة
```

---

## 3. تدفق التطبيق من الجذر

```
app/layout.tsx
  └── Providers (Theme + Redux + Toaster)
        └── [صفحات فرعية]
```

- **`app/layout.tsx`:** `dynamic = 'force-dynamic'`، Metadata، بدون حماية مدمجة.
- **`app/**/layout.tsx`:** معظم المسارات المحمية تستخدم `MainLayout` → `ProtectedLayout` → Sidebar + Navbar.

### المصادقة (طبقتان)

1. **Middleware (سيرفر):** `middleware.ts`  
   - يتحقق من وجود `cookie` باسم `token` للمسارات المدرجة في `protectedRoutes`.  
   - يُعاد توجيه غير المسجّلين إلى `/login?redirect=...`.  
   - مسجّل الدخول يفتح `/login` → يُحوّل إلى `/dashboard`.  
   - **تم إصلاح:** إضافة `/sarrafat` و `/sarraf-balances` إلى القائمة (كانت مفقودة ويُفتحان بدون توكن على مستوى الـ middleware).

2. **ProtectedLayout (عميل):** `components/layout/ProtectedLayout.tsx`  
   - يستخدم `useAuth()` (Redux + Cookie).  
   - يمنع وميض المحتوى قبل التحقق.  
   - إذا `must_change_password` → يوجّه إلى `/change-password` (ما عدا إذا كان المستخدم بالفعل هناك).

### Axios

- **`utils/axios.ts`:** يضيف `Bearer` من Cookie على العميل فقط؛ معالجة 403 بـ toast عام.
- لا يوجد تسجيل خروج تلقائي عند 401 في الملف الحالي (قد يُعتمد على الصفحات).

---

## 4. Redux — المخزن (`stores/store.ts`)

**عدد الـ reducers المسجّلة: 29**

| المفتاح في الـ state | الملف (slice) | الدور |
|----------------------|---------------|--------|
| login | `login.ts` | جلسة المستخدم، تسجيل الدخول |
| projects | `projects.ts` | المشاريع |
| tenders | `tenders.ts` | المناقصات |
| budgets | `budgets.ts` | الميزانيات |
| taskOrders | `task-orders.ts` | أوامر المهام |
| clients | `clients.ts` | العملاء |
| contractors | `contractors.ts` | المقاولون |
| users | `users.ts` | المستخدمون + صلاحيات المستخدم |
| employees | `employees.ts` | الموظفون |
| taskRequests | `tasks_requests.ts` | طلبات المهام |
| tasksRequestsForApproval | `tasks_requests_for_approval.ts` | طلبات المهام قيد الاعتماد |
| clientsRequestsForApproval | `clients_requests_for_approval.ts` | طلبات العملاء قيد الاعتماد |
| clientRequests | `clients_requests.ts` | طلبات العملاء |
| notifications | `notifications.ts` | الإشعارات |
| forms | `forms.ts` | النماذج |
| documents | `documents.ts` | المستندات |
| banks | `banks.ts` | البنوك |
| invoices | `invoices.ts` | الفواتير |
| bankBalances | `bank-balances.ts` | أرصدة البنوك |
| approvals | `approvals.ts` | الاعتمادات |
| clientContracts | `client-contracts.ts` | عقود العملاء |
| attachments | `attachments.ts` | المرفقات |
| contractorPayments | `contractor-payments.ts` | مدفوعات المقاولين |
| departments | `departments.ts` | الأقسام |
| roles | `roles.ts` | الأدوار + صلاحيات الأدوار |
| jobTitles | `job-titles.ts` | المسميات الوظيفية |
| permissions | `permissions.ts` | الصلاحيات (مرجعية) |
| sarrafat | `sarrafat.ts` | الصرّافون |
| sarrafBalances | `sarraf-balances.ts` | أرصدة الصرّافين |

**Types:** مجلد `stores/types/` يوازي الوحدات مع واجهات الاستجابة (`header`, `body`).

---

## 5. مسارات `app/` — خريطة الوظائف

> **ملاحظة:** العدد التقريبي لملفات `page.tsx` **115** (تشمل كل المسارات الفرعية).

### عامة ومصادقة
- `/` — إعادة توجيه حسب `useAuth` (dashboard أو login).
- `/login`, `/change-password` — مصادقة وتغيير كلمة المرور (الصفحة الثانية غالباً بدون MainLayout).

### لوحة وإعدادات
- `/dashboard` — بطاقات روابط للوحدات (بدون Sidebar في التخطيط الحالي للـ Sidebar).
- `/settings`, `/profile`, `/notifications`, `/history`, `/timeline`, `/reports`, `/statistics`, `/analysis` — إعدادات وتقارير وإحصائيات.

### إدارة المستخدمين والأدوار والأقسام (BEAM)
- `/users` (قائمة، إنشاء، تعديل، تفاصيل، صلاحيات المستخدم).
- `/employees` (قائمة، إنشاء، تعديل، تفاصيل).
- `/roles` (قائمة، إنشاء، تعديل، تفاصيل، صلاحيات الدور).
- `/departments` (قائمة، إنشاء، تعديل، تفاصيل).
- `/permissions` (قائمة، تفاصيل — قراءة فقط).

### عملاء ومشاريع ومقاولون ومهام
- `/clients`, `/contractors`, `/projects`, `/tasks` — CRUD وتفاصيل حسب المجلدات.
- `/requests/*` — طلبات (مشاريع، عملاء، مهام، مالية، موظفين) مع حالات pending/approved/rejected و timelines.

### مالية ومستندات ونماذج
- `/financial/*` — ميزانيات، سجلات، قروض، مدفوعات مقاولين، إلخ.
- `/forms`, `/documents` — نماذج ومستندات.
- `/banks`, `/bank-balances`, `/invoices` — بنوك و أرصدة بنكية وفواتير.
- **`/sarrafat`**, **`/sarraf-balances`** — صرّافون وأرصدة صرّاف (CRUD كامل، فلاتر، روابط متبادلة).

### أخرى
- `/approvals`, `/approvals/pending` — اعتمادات.
- `/client-contracts` — عقود العملاء.
- `/inventory/*` — مخزون (عناصر، حركات).
- `/budgets` — ميزانيات (مسار منفصل عن financial/budgets).

---

## 6. المكونات (`components/`)

| المجلد | الوظيفة |
|--------|---------|
| `layout/` | `sidebar.tsx` (routeMapping + routeConfig)، `main-layout.tsx`, `navbar.tsx`, `breadcrumb.tsx`, `ProtectedLayout.tsx`, `footer.tsx` |
| `ui/` | أزرار، جداول، نماذج، حوارات، FilterBar، EnhancedDataTable، … |
| `pages/` | مكونات كبيرة لصفحات (مثل `ProjectDetails`, `DetailsContractor`, `UpadteProject`) |
| `attachments/` | مرفقات |
| `ReduxProvider.tsx` | `Provider` للـ store |
| `providers.tsx` | Theme + Redux + Toaster |

---

## 7. القائمة الجانبية (`sidebar.tsx`)

- **المنطق:** `routeMapping[pathname]` يحدد **قسم القائمة** (مثلاً `/users/update` → `/users`).
- **`routeConfig`:** لكل قسم `title`, `icon`, `menuItems` (روابط فرعية).
- **المستخدمون (ترتيب حالي):** Users → Employees → Roles → Permissions → Create User → Create Employee → Departments.

---

## 8. مشكلات وتوصيات (محدّثة)

### 8.1 توحيد مستخدمي Redux في `/users`
- **الوضع:** صفحات قائمة/إنشاء/تعديل المستخدم قد تستخدم `axios` مباشرة بينما التفاصيل والصلاحيات تستخدم Redux.
- **التوصية:** توحيد `fetchUsers` / `createUser` / `updateUser` عبر thunks.

### 8.2 `AuthContext` غير مستخدم
- **الوضع:** `contexts/AuthContext.tsx` لا يُلفّ في `providers.tsx`؛ المصادقة من Redux + Cookie.
- **التوصية:** إزالة أو توثيق كـ legacy.

### 8.3 `DetailsContractor` واستدعاء `fetch` لـ API وهمي
- **الوضع:** `fetch('/api/contractors/delete?...')` قد لا يطابق باكند BEAM.
- **التوصية:** استخدام `axios` ونقطة الـ DELETE الصحيحة في الـ API.

### 8.4 خطأ إملائي في اسم الملف
- `components/pages/UpadteProject.tsx` — مستورد من `app/projects/update/page.tsx`.
- **التوصية:** إعادة تسمية إلى `UpdateProject.tsx` وتحديث الاستيراد.

### 8.5 حماية الـ middleware (تم المعالجة)
- كانت مسارات `/sarrafat` و `/sarraf-balances` **غير** مدرجة في `protectedRoutes` → **تمت إضافتها** لتجنب الوصول بدون تسجيل دخول على مستوى السيرفر.

---

## 9. ملخص الجودة

| الجانب | التقييم |
|--------|---------|
| هيكل المشروع | واضح: App Router + Redux + Axios |
| حماية المسارات | Middleware + ProtectedLayout + Hook |
| توسعة الوحدات | جيدة: slices جديدة (sarrafat, sarrafBalances) مدمجة في الـ store |
| التناسق | بعض الصفحات تخلط axios مباشرة مع Redux |

---

*تم إعداد التقرير من فحص المستودع والملفات الرئيسية. يُنصح بمراجعة التوصيات حسب أولوية المشروع.*
