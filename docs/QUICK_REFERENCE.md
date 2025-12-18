# مرجع سريع: إنشاء صفحة جديدة

## 🚀 خطوات سريعة (5 دقائق)

### 1. Types
```typescript
// stores/types/[resource].ts
export interface [Resource] { id: string; /* fields */ }
export interface [Resource]sResponse { header: {...}; body?: {...}; }
```

### 2. Redux Slice
```typescript
// stores/slices/[resource].ts
- State Interface
- Initial State
- Async Thunks (fetch, create, update, delete)
- Slice with extraReducers
- Selectors
```

### 3. Store
```typescript
// stores/store.ts
import [resource] from '@/stores/slices/[resource]';
reducer: { [resource]: [resource] }
```

### 4. Layout
```typescript
// app/[resource]/layout.tsx
'use client';
import MainLayout from '@/components/layout/main-layout';
export default function [Resource]Layout({ children }) {
    return <MainLayout>{children}</MainLayout>;
}
```

### 5. Pages
- `app/[resource]/page.tsx` - List
- `app/[resource]/create/page.tsx` - Create
- `app/[resource]/[id]/page.tsx` - Details
- `app/[resource]/[id]/edit/page.tsx` - Edit

### 6. Dashboard & Sidebar
- أضف في `app/dashboard/page.tsx`
- أضف في `components/layout/sidebar.tsx`

---

## 📋 Template سريع للصفحة

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetch[Resource]s, select[Resource]s } from '@/stores/slices/[resource]';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { useRouter } from 'next/navigation';

export default function [Resource]Page() {
    const router = useRouter();
    const dispatch = useDispatch();
    const items = useSelector(select[Resource]s);
    
    useEffect(() => {
        dispatch(fetch[Resource]s({ page: 1, limit: 10 }));
    }, [dispatch]);
    
    return (
        <div className="space-y-4">
            <Breadcrumb />
            <h1>[Resource]</h1>
            <EnhancedCard title="List">
                <EnhancedDataTable data={items} columns={[]} />
            </EnhancedCard>
        </div>
    );
}
```

---

## 🎨 Components شائعة

| Component | الاستخدام |
|-----------|----------|
| `Breadcrumb` | في كل صفحة |
| `EnhancedCard` | لحاوية المحتوى |
| `EnhancedDataTable` | للجداول |
| `FilterBar` | للبحث والفلترة |
| `PageHeader` | (اختياري) لرأس الصفحة |

---

## 🔄 Redux Pattern

```typescript
// 1. State
interface State { loading, error, items, selectedItem, total, pages }

// 2. Thunks
fetch[Resource]s = createAsyncThunk(...)
create[Resource] = createAsyncThunk(...)
update[Resource] = createAsyncThunk(...)
delete[Resource] = createAsyncThunk(...)

// 3. Slice
createSlice({ name, initialState, reducers, extraReducers })

// 4. Selectors
select[Resource]s, select[Resource]Loading, select[Resource]Total
```

---

## 📁 بنية الملفات

```
app/
  [resource]/
    layout.tsx          ← MainLayout wrapper
    page.tsx            ← List page
    create/
      page.tsx          ← Create form
    [id]/
      page.tsx          ← Details view
      edit/
        page.tsx        ← Edit form

stores/
  types/
    [resource].ts       ← TypeScript interfaces
  slices/
    [resource].ts       ← Redux slice
```

---

## ✅ Checklist

- [ ] Types
- [ ] Redux Slice
- [ ] Store connection
- [ ] Layout
- [ ] List page
- [ ] Create page
- [ ] Details page
- [ ] Edit page
- [ ] Dashboard entry
- [ ] Sidebar entry

---

**مرجع سريع** ⚡

