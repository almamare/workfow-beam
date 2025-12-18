# دليل شامل: بنية الصفحات وأنماط التصميم في المشروع

## 📁 بنية المشروع (Project Structure)

```
project/
├── app/                          # Next.js App Router - جميع الصفحات هنا
│   ├── layout.tsx               # Layout الرئيسي للتطبيق
│   ├── page.tsx                 # الصفحة الرئيسية (Home)
│   ├── dashboard/               # لوحة التحكم
│   │   ├── layout.tsx           # Layout خاص بالـ Dashboard
│   │   └── page.tsx             # صفحة Dashboard
│   ├── clients/                 # قسم العملاء
│   │   ├── layout.tsx          # Layout خاص بالعملاء
│   │   ├── page.tsx            # صفحة قائمة العملاء
│   │   ├── create/             # صفحة إنشاء عميل جديد
│   │   │   └── page.tsx
│   │   ├── update/             # صفحة تعديل عميل
│   │   │   └── page.tsx
│   │   └── details/            # صفحة تفاصيل عميل (إن وجدت)
│   │       └── page.tsx
│   ├── client-contracts/        # قسم عقود العملاء (مثال حديث)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # قائمة العقود
│   │   ├── create/             # إنشاء عقد
│   │   │   └── page.tsx
│   │   └── [id]/               # Dynamic route للعقد
│   │       ├── page.tsx        # تفاصيل العقد
│   │       └── edit/           # تعديل العقد
│   │           └── page.tsx
│   └── ...
│
├── stores/                      # Redux Store
│   ├── store.ts                # إعداد Redux Store الرئيسي
│   ├── slices/                 # Redux Slices
│   │   ├── clients.ts
│   │   ├── client-contracts.ts
│   │   └── ...
│   └── types/                  # TypeScript Types
│       ├── clients.ts
│       ├── client-contracts.ts
│       └── ...
│
├── components/                  # المكونات القابلة لإعادة الاستخدام
│   ├── layout/                 # مكونات التخطيط
│   │   ├── main-layout.tsx    # Layout الرئيسي (Sidebar + Navbar)
│   │   ├── enhanced-layout.tsx # Layout محسّن
│   │   ├── sidebar.tsx         # القائمة الجانبية
│   │   ├── navbar.tsx          # شريط التنقل العلوي
│   │   └── breadcrumb.tsx      # مسار التنقل
│   ├── ui/                     # مكونات UI
│   │   ├── enhanced-card.tsx   # كرت محسّن
│   │   ├── enhanced-data-table.tsx # جدول بيانات محسّن
│   │   ├── filter-bar.tsx      # شريط الفلترة
│   │   ├── page-header.tsx     # رأس الصفحة
│   │   └── ...
│   └── providers.tsx           # Context Providers
│
└── utils/                       # Utilities
    └── axios.ts                # إعداد Axios للـ API calls
```

---

## 🎯 أنواع الصفحات في المشروع

### 1. **صفحة القائمة (List Page)**
**المسار:** `app/[resource]/page.tsx`

**البنية القياسية:**
```typescript
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetch[Resource], select[Resource], ... } from '@/stores/slices/[resource]';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function [Resource]Page() {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    
    // Redux State
    const items = useSelector(select[Resource]);
    const loading = useSelector(select[Resource]Loading);
    const totalItems = useSelector(select[Resource]Total);
    const totalPages = useSelector(select[Resource]Pages);
    
    // Local State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Fetch Data
    useEffect(() => {
        dispatch(fetch[Resource]({ page, limit, search }));
    }, [dispatch, page, limit, search]);
    
    // Columns Definition
    const columns: Column<[Resource]>[] = [
        {
            key: 'field' as keyof [Resource],
            header: 'Field Name',
            sortable: true,
            render: (value: any) => <span>{value}</span>
        },
        // ... more columns
    ];
    
    // Actions Definition
    const actions: Action<[Resource]>[] = [
        {
            label: 'View Details',
            onClick: (item) => router.push(`/[resource]/${item.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit',
            onClick: (item) => router.push(`/[resource]/${item.id}/edit`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Delete',
            onClick: (item) => handleDelete(item),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];
    
    // Helper Functions
    const refreshTable = async () => { /* ... */ };
    const exportToExcel = async () => { /* ... */ };
    
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        [Resource Name]
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        [Description]
                    </p>
                </div>
                <Button onClick={() => router.push('/[resource]/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New [Resource]
                </Button>
            </div>
            
            {/* Stats Cards (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total"
                    stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}
                >
                    <></>
                </EnhancedCard>
                {/* ... more stats */}
            </div>
            
            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search..."
                searchValue={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                filters={[/* filters */]}
                activeFilters={[/* active filters */]}
                onClearFilters={() => { setSearch(''); setPage(1); }}
                actions={
                    <>
                        <Button onClick={refreshTable}>Refresh</Button>
                        <Button onClick={exportToExcel}>Export</Button>
                    </>
                }
            />
            
            {/* Data Table */}
            <EnhancedCard
                title="[Resource] List"
                description={`${totalItems} items found`}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        {/* Items per page */}
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={items}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages,
                        pageSize: limit,
                        totalItems: totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No items found"
                />
            </EnhancedCard>
        </div>
    );
}
```

---

### 2. **صفحة الإنشاء (Create Page)**
**المسار:** `app/[resource]/create/page.tsx`

**البنية القياسية:**
```typescript
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { create[Resource] } from '@/stores/slices/[resource]';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, ArrowLeft } from 'lucide-react';

type [Resource]Payload = {
    field1: string;
    field2: number;
    // ... other fields
};

const initialValues: [Resource]Payload = {
    field1: '',
    field2: 0,
    // ...
};

export default function Create[Resource]Page() {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    
    const [form, setForm] = useState<[Resource]Payload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Update field helper
    const updateField = useCallback((name: keyof [Resource]Payload, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => {
            const clone = { ...prev };
            delete clone[name as string];
            return clone;
        });
    }, []);
    
    // Validation
    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        const required: (keyof [Resource]Payload)[] = ['field1', 'field2'];
        
        required.forEach(f => {
            if (!form[f] || String(form[f]).trim() === '') {
                errs[f] = 'Required';
            }
        });
        
        // Additional validations...
        
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);
    
    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }
        
        setLoading(true);
        try {
            await dispatch(create[Resource](form));
            toast.success('[Resource] created successfully!');
            router.push('/[resource]');
        } catch (err: any) {
            toast.error(err || 'Failed to create [resource].');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create New [Resource]
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in the details below
                    </p>
                </div>
            </div>
            
            <EnhancedCard title="[Resource] Information" variant="default" size="sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Form fields */}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Save />}
                            Create [Resource]
                        </Button>
                    </div>
                </form>
            </EnhancedCard>
        </div>
    );
}
```

---

### 3. **صفحة التفاصيل (Details Page)**
**المسار:** `app/[resource]/[id]/page.tsx`

**البنية القياسية:**
```typescript
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetch[Resource], selectSelected[Resource], select[Resource]Loading } from '@/stores/slices/[resource]';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function [Resource]DetailsPage() {
    const params = useParams();
    const router = useRouter();
    const itemId = params.id as string;
    
    const dispatch = useReduxDispatch<AppDispatch>();
    const item = useSelector(selectSelected[Resource]);
    const loading = useSelector(select[Resource]Loading);
    
    useEffect(() => {
        if (itemId) {
            dispatch(fetch[Resource](itemId));
        }
    }, [dispatch, itemId]);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!item) {
        return <div>Item not found</div>;
    }
    
    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold">[Resource] Details</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`/[resource]/${itemId}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>
            
            {/* Information Cards */}
            <EnhancedCard title="Basic Information">
                {/* Display item details */}
            </EnhancedCard>
        </div>
    );
}
```

---

### 4. **صفحة التعديل (Edit Page)**
**المسار:** `app/[resource]/[id]/edit/page.tsx`

**البنية القياسية:**
```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetch[Resource], update[Resource], selectSelected[Resource] } from '@/stores/slices/[resource]';
// ... similar to Create Page but with:
// 1. Load existing data in useEffect
// 2. Use update[Resource] instead of create[Resource]
// 3. Navigate to details page after update
```

---

## 🎨 أنماط التصميم (Design Patterns)

### 1. **Layout Pattern**

**كل قسم له Layout خاص:**

```typescript
// app/[resource]/layout.tsx
'use client';

import MainLayout from '@/components/layout/main-layout';

export default function [Resource]Layout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>;
}
```

**MainLayout يحتوي على:**
- Sidebar (القائمة الجانبية)
- Navbar (شريط التنقل العلوي)
- Main content area

---

### 2. **Redux Pattern**

**كل resource له:**
1. **Types** في `stores/types/[resource].ts`
2. **Slice** في `stores/slices/[resource].ts`
3. **ربط في Store** في `stores/store.ts`

**بنية Redux Slice:**
```typescript
// stores/slices/[resource].ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { [Resource], [Resource]Response } from '@/stores/types/[resource]';

// State Interface
interface [Resource]State {
    loading: boolean;
    error: string | null;
    items: [Resource][];
    selectedItem: [Resource] | null;
    total: number;
    pages: number;
}

// Initial State
const initialState: [Resource]State = {
    loading: false,
    error: null,
    items: [],
    selectedItem: null,
    total: 0,
    pages: 0,
};

// Async Thunks
export const fetch[Resource]s = createAsyncThunk(
    '[resource]/fetch[Resource]s',
    async (params, { rejectWithValue }) => {
        // API call
    }
);

export const create[Resource] = createAsyncThunk(
    '[resource]/create[Resource]',
    async (data, { rejectWithValue }) => {
        // API call
    }
);

// Slice
const [resource]Slice = createSlice({
    name: '[resource]',
    initialState,
    reducers: {
        clearSelected[Resource](state) {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        // Handle async thunks
    },
});

// Selectors
export const select[Resource]s = (state: RootState) => state.[resource].items;
export const select[Resource]Loading = (state: RootState) => state.[resource].loading;
// ... more selectors
```

---

### 3. **Component Patterns**

#### **EnhancedCard**
```typescript
<EnhancedCard
    title="Card Title"
    description="Card description"
    variant="default" // 'default' | 'gradient' | 'bordered'
    size="sm" // 'sm' | 'md' | 'lg'
    stats={{
        total: 100,
        badge: 'Total',
        badgeColor: 'default' // 'default' | 'success' | 'warning' | 'error'
    }}
    headerActions={<Select>...</Select>}
>
    {/* Content */}
</EnhancedCard>
```

#### **EnhancedDataTable**
```typescript
<EnhancedDataTable
    data={items}
    columns={columns}
    actions={actions}
    loading={loading}
    pagination={{
        currentPage: page,
        totalPages: totalPages,
        pageSize: limit,
        totalItems: totalItems,
        onPageChange: setPage
    }}
    noDataMessage="No items found"
/>
```

#### **FilterBar**
```typescript
<FilterBar
    searchPlaceholder="Search..."
    searchValue={search}
    onSearchChange={setSearch}
    filters={[
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All', value: 'All' },
                // ... more options
            ],
            onValueChange: setStatusFilter
        }
    ]}
    activeFilters={['Search: test', 'Status: Active']}
    onClearFilters={() => { setSearch(''); setStatusFilter('All'); }}
    actions={<Button>Refresh</Button>}
/>
```

---

## 📋 خطوات إنشاء صفحة جديدة

### الخطوة 1: إنشاء Types
```typescript
// stores/types/my-resource.ts
export interface MyResource {
    id: string;
    name: string;
    // ... other fields
}

export interface MyResourcesResponse {
    header: { success: boolean; ... };
    body?: { resources: { total: number; pages: number; items: MyResource[] } };
}
```

### الخطوة 2: إنشاء Redux Slice
```typescript
// stores/slices/my-resource.ts
// (استخدم نفس النمط من الملفات الموجودة)
```

### الخطوة 3: ربط Slice في Store
```typescript
// stores/store.ts
import MyResource from '@/stores/slices/my-resource';
// ...
reducer: {
    // ...
    myResource: MyResource
}
```

### الخطوة 4: إنشاء Layout
```typescript
// app/my-resource/layout.tsx
'use client';
import MainLayout from '@/components/layout/main-layout';

export default function MyResourceLayout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>;
}
```

### الخطوة 5: إنشاء صفحة القائمة
```typescript
// app/my-resource/page.tsx
// (استخدم النمط من clients/page.tsx أو client-contracts/page.tsx)
```

### الخطوة 6: إنشاء صفحة الإنشاء
```typescript
// app/my-resource/create/page.tsx
// (استخدم النمط من clients/create/page.tsx)
```

### الخطوة 7: إنشاء صفحة التفاصيل
```typescript
// app/my-resource/[id]/page.tsx
// (استخدم النمط من client-contracts/[id]/page.tsx)
```

### الخطوة 8: إنشاء صفحة التعديل
```typescript
// app/my-resource/[id]/edit/page.tsx
// (استخدم النمط من client-contracts/[id]/edit/page.tsx)
```

### الخطوة 9: إضافة في Dashboard
```typescript
// app/dashboard/page.tsx
{
    number: X,
    title: 'My Resource',
    icon: IconName,
    href: '/my-resource',
    color: 'from-color-500 to-color-600'
}
```

### الخطوة 10: إضافة في Sidebar
```typescript
// components/layout/sidebar.tsx
'/my-resource': {
    title: 'My Resource',
    icon: 'IconName',
    color: 'text-color-400',
    menuItems: [
        { href: '/my-resource', title: 'My Resource', icon: 'IconName', color: 'text-color-400' },
        { href: '/my-resource/create', title: 'Add Resource', icon: 'Plus', color: 'text-green-400' }
    ]
}
```

---

## 🎨 الألوان والثيمات

### الألوان الأساسية:
- **Primary/Orange**: `from-orange-500 to-orange-600` (للأزرار الرئيسية)
- **Success/Green**: `bg-green-100 text-green-700` (للحالات الناجحة)
- **Warning/Yellow**: `bg-yellow-100 text-yellow-700` (للتحذيرات)
- **Error/Red**: `bg-red-100 text-red-700` (للأخطاء)
- **Info/Blue**: `bg-blue-100 text-blue-700` (للمعلومات)

### Dark Mode:
- جميع المكونات تدعم Dark Mode تلقائياً
- استخدام `dark:` prefix في Tailwind

---

## 🔄 دورة حياة الصفحة (Page Lifecycle)

1. **Mount**: `useEffect` يجلب البيانات من Redux
2. **User Interaction**: تحديث State → إعادة جلب البيانات
3. **Navigation**: استخدام `router.push()` للانتقال بين الصفحات
4. **Cleanup**: Redux يتعامل مع State تلقائياً

---

## 📝 ملاحظات مهمة

1. **جميع الصفحات يجب أن تكون `'use client'`** لأنها تستخدم Hooks
2. **استخدم Redux للـ State Management** - لا تستخدم `useState` للبيانات من API
3. **استخدم `toast` من `sonner`** للإشعارات
4. **استخدم `EnhancedCard` و `EnhancedDataTable`** للاتساق
5. **استخدم `Breadcrumb`** في كل صفحة
6. **استخدم `MainLayout`** في Layout files
7. **استخدم `router.push()`** للتنقل بدلاً من `<Link>` في بعض الحالات

---

## ✅ Checklist لصفحة جديدة

- [ ] إنشاء Types في `stores/types/`
- [ ] إنشاء Slice في `stores/slices/`
- [ ] ربط Slice في `stores/store.ts`
- [ ] إنشاء Layout في `app/[resource]/layout.tsx`
- [ ] إنشاء صفحة القائمة `app/[resource]/page.tsx`
- [ ] إنشاء صفحة الإنشاء `app/[resource]/create/page.tsx`
- [ ] إنشاء صفحة التفاصيل `app/[resource]/[id]/page.tsx`
- [ ] إنشاء صفحة التعديل `app/[resource]/[id]/edit/page.tsx`
- [ ] إضافة في Dashboard
- [ ] إضافة في Sidebar
- [ ] اختبار جميع العمليات (CRUD)

---

**تم إعداد الدليل** ✅

