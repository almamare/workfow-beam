# تقرير فحص النظام بالكامل
**System Inspection Report**  
تاريخ: 18 فبراير 2025

---

## 1. نظرة عامة على الهيكل

| المجلد | الوظيفة |
|--------|---------|
| `app/` | Next.js App Router (صفحات، تخطيطات، مسارات) |
| `components/` | مكونات الواجهة (ui, layout, pages, attachments, reviews) |
| `stores/` | Redux (slices + types) |
| `utils/` | axios، apiResponse، permissions، fileUtils |
| `lib/` | utils، fonts |
| `hooks/` | useAuth، usePendingApprovals، use-toast |
| `contexts/` | ThemeContext، AuthContext (غير مستخدم حاليًا) |

**نقاط الدخول:** `package.json`, `next.config.js`, `tsconfig.json`, `middleware.ts`

---

## 2. التقنيات المستخدمة

- **الإطار:** Next.js 14.2, React 18.2, TypeScript 5.2
- **الحالة:** Redux Toolkit (createAsyncThunk فقط، بدون RTK Query)
- **HTTP:** Axios مع interceptor للمصادقة (Cookie) ومعالجة 403
- **الواجهة:** Tailwind، Radix، Shadcn-style، lucide-react، sonner
- **النماذج:** react-hook-form (بدون استخدام zod resolvers حاليًا)

---

## 3. التوجيه (Routing) والصفحات

- المسارات تحت `app/`: dashboard, login, clients, projects, tasks, requests (clients/tasks/projects/financial/employees), approvals, financial, inventory, users, employees, contractors, settings, profile, reports, إلخ.
- التخطيطات: التخطيط الرئيسي يستخدم `MainLayout` (شريط جانبي + شريط علوي) و`ProtectedLayout` لحماية المسارات.
- معظم الصفحات والتخطيطات من نوع "use client".

---

## 4. إدارة الحالة وطبقة API

- **Redux:** مخزن واحد مع 22 slice (login, clients, projects, tasks, approvals, attachments, إلخ).
- **جلب البيانات:** عبر createAsyncThunk و Axios فقط.
- **المصادقة:** تسجيل الدخول عبر Redux + حفظ التوكن في Cookie؛ الـ middleware و ProtectedLayout يتحققان من التوكن.
- **Axios:** baseURL من `NEXT_PUBLIC_API_BASE_URL` أو القيمة الافتراضية `https://test.yallajayak.com/api/v1`.
- **معالجة الأخطاء:** بعض الـ slices تستخدم `utils/apiResponse.ts` (extractErrorMessage, normalizeApiResponse) والبعض يعتمد على parsing يدوي لـ response.

---

## 5. ما تم إصلاحه أثناء الفحص

### أخطاء حرجة (تم حلها)

1. **Sidebar – قواعد Hooks**
   - **المشكلة:** استدعاء `useMemo` و `useEffect` بعد `return null` عند `pathname === '/dashboard'`، مما يخالف قاعدة استدعاء الـ Hooks بنفس الترتيب في كل render.
   - **الحل:** نقل شرط `if (pathname === '/dashboard') return null` إلى ما بعد كل استدعاءات الـ Hooks (قبل الـ return الرئيسي).

2. **AttachmentsList – إمكانية الوصول (a11y)**
   - **المشكلة:** تحذير `jsx-a11y/alt-text` بسبب استخدام مكون باسم `Image` (أيقونة من lucide-react).
   - **الحل:** استيراد الأيقونة باسم `ImageIcon` وإضافة `aria-hidden` للأيقونة التزيينية.

### تحذير متبقي (غير حرج)

- **`app/requests/tasks/pending/page.tsx` (سطر 320):** تحذير `react-hooks/exhaustive-deps` بخصوص تبعيات `useCallback` (handleApprove, handleReject, handleViewDetails). يُفضّل إضافتها أو توثيق سبب استبعادها.

---

## 6. نقاط القوة

- فصل واضح بين stores/types و utils و components و hooks.
- Axios مركزي مع مصادقة بالـ Cookie ومعالجة 403.
- حماية المسارات عبر middleware و ProtectedLayout.
- أنواع TypeScript (strict) وواجهات للـ API في العديد من الـ slices.
- مكونات مشتركة (جداول، بطاقات، فلاتر) وتخطيط موحد.

---

## 7. مشاكل محتملة وتوصيات

### أ) أمن وكود غير مستخدم

| البند | الوصف | التوصية |
|-------|--------|----------|
| **AuthContext** | ملف `contexts/AuthContext.tsx` يحتوي على مصادقة وهمية (بريد وكلمة مرور ثابتة + mock token). غير مستخدم في `providers.tsx` (المصادقة عبر Redux فقط). | إزالة الملف أو استبداله بمصادقة حقيقية إذا لزم؛ عدم استخدامه في الإنتاج أبدًا. |
| **Base URL** | وجود base URL افتراضي ثابت في `utils/axios.ts` للتطوير. | التأكد من استخدام `NEXT_PUBLIC_API_BASE_URL` في الإنتاج وعدم الاعتماد على القيمة الثابتة. |

### ب) جودة الكود

| البند | الوصف | التوصية |
|-------|--------|----------|
| **تصحيح اسم مكون** | مكون `UpadteProject` (خطأ إملائي) في `components/pages/UpadteProject.tsx` ومستورد في `app/projects/update/page.tsx`. | إعادة تسمية الملف والمكون إلى `UpdateProject` وتحديث الاستيراد. |
| **apiResponse** | `utils/apiResponse.ts` مستخدم في slices (approvals, clients_requests_for_approval, tasks_requests_for_approval) لكن ليس في كل الـ slices. | توحيد معالجة الأخطاء باستخدام نفس الـ utils في باقي الـ slices أو توثيق السبب. |
| **Zod و resolvers** | الحزمة مثبتة لكن لا يوجد استخدام فعلي لـ zod أو @hookform/resolvers في المشروع. | إما استخدامها للتحقق من النماذج الحساسة (تسجيل الدخول، إنشاء مستخدم، كلمة المرور) أو إزالتها من التبعيات. |

### ج) الإعدادات والبناء

| البند | الوصف | التوصية |
|-------|--------|----------|
| **ESLint أثناء البناء** | `next.config.js`: `eslint: { ignoreDuringBuilds: true }`. | إعادة تفعيل ESLint أثناء البناء بعد حل التحذيرات المتبقية. |
| **إصدارات ESLint/Next** | إصدارات مثل eslint-config-next و @next/swc-wasm-nodejs قد لا تتوافق بالكامل مع Next 14. | محاذاة إصدارات ESLint و Next وتحديث التبعيات عند الترقية. |
| **Tailwind content** | يتضمن `./pages/**` بينما المشروع يستخدم App Router فقط (لا مجلد pages). | اختياري: إزالة `./pages/**` من محتوى Tailwind لتفادي التباس. |

---

## 8. حالة Lint بعد الإصلاحات

- **النتيجة:** `npm run lint` ينجح (exit code 0).
- **تحذير واحد متبقي:** تبعيات `useCallback` في `app/requests/tasks/pending/page.tsx` (يمكن معالجته لاحقًا).

---

## 9. ملخص تنفيذي

النظام مبني بشكل منظم مع Next 14 و Redux و Axios، مع فصل واضح للمسؤوليات. تم في هذا الفحص إصلاح أخطاء Hooks في الـ Sidebar وتحذير إمكانية الوصول في قائمة المرفقات. يُنصح بمعالجة نقطة AuthContext (إزالة أو استبدال)، تصحيح اسم مكون `UpdateProject`، واختياريًا توحيد التحقق من النماذج ومعالجة الأخطاء عبر apiResponse و Zod لتحسين الجودة والأمان على المدى الطويل.
