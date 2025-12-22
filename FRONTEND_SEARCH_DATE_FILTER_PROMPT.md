# Frontend Developer Prompt: Smart Search & Date Range Filter

## المهمة / Task

قم بتنفيذ عملية بحث ذكية وفلتر التاريخ (Date Range) في صفحة العملاء (`app/clients/page.tsx`).

## المتطلبات / Requirements

### 1. البحث الذكي / Smart Search

البحث يجب أن يبحث في الحقول التالية:
- `client_no` (Client Number)
- `name` (Client Name)
- `state` (State)
- `city` (City)
- `budget` (Budget)
- `sequence` (Sequence/ID)

**التنفيذ:**
- البحث يتم إرساله كـ `search` parameter واحد إلى السيرفر
- السيرفر يقوم بالبحث في جميع الحقول المذكورة (OR search)
- لا حاجة لتعديل الـ backend، فقط تأكد من أن `search` parameter يُرسل بشكل صحيح

### 2. فلتر التاريخ / Date Range Filter

إضافة فلتر للبحث بين تاريخين:
- **From Date**: تاريخ البداية
- **To Date**: تاريخ النهاية
- البحث في حقل `created_at` للعميل

**التنفيذ:**
- إضافة DatePicker component للحقلين (From Date & To Date)
- إرسال التواريخ كـ `date_from` و `date_to` parameters إلى السيرفر
- التواريخ بصيغة `YYYY-MM-DD`
- الحقول اختيارية (optional) - إذا لم يتم تحديدها، لا يتم إرسالها

## الملفات المطلوب تعديلها / Files to Modify

1. **`app/clients/page.tsx`**
   - إضافة state للـ date range (`dateFrom`, `dateTo`)
   - إضافة DatePicker components في FilterBar
   - إرسال `date_from` و `date_to` في fetchClients call

## الكود المطلوب / Required Code

### 1. إضافة State للتاريخ

```typescript
const [dateFrom, setDateFrom] = useState<string>('');
const [dateTo, setDateTo] = useState<string>('');
```

### 2. تحديث fetchClients Call

```typescript
dispatch(fetchClients({ 
    page, 
    limit, 
    search: debouncedSearch,
    client_type: clientTypeFilter !== 'All' ? clientTypeFilter : undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
}));
```

### 3. إضافة DatePicker في FilterBar

```typescript
<FilterBar
    searchPlaceholder="Search by client number, name, state, city, budget, or sequence..."
    searchValue={search}
    onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
    }}
    filters={[
        // Existing filters...
        {
            key: 'date_range',
            label: 'Date Range',
            value: '',
            customComponent: (
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>From Date</Label>
                        <DatePicker
                            value={dateFrom}
                            onChange={(value) => {
                                setDateFrom(value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <Label>To Date</Label>
                        <DatePicker
                            value={dateTo}
                            onChange={(value) => {
                                setDateTo(value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            )
        }
    ]}
    // ... rest of props
/>
```

### 4. تحديث FetchClientsParams Type

في `stores/slices/clients.ts`:

```typescript
export interface FetchClientsParams {
    page?: number;
    limit?: number;
    search?: string;
    client_type?: string;
    status?: string;
    date_from?: string;  // Add this
    date_to?: string;    // Add this
}
```

### 5. تحديث API Call

في `stores/slices/clients.ts`:

```typescript
const { page = 1, limit = 10, search = '', client_type, status, date_from, date_to } = params || {};
const res = await api.get<ClientsResponse>('/clients/fetch', {
    params: { 
        page, 
        limit, 
        search, 
        client_type, 
        status,
        date_from,
        date_to
    },
    signal,
});
```

### 6. تحديث onClearFilters

```typescript
onClearFilters={() => {
    setSearch('');
    setClientTypeFilter('All');
    setStatusFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
}}
```

### 7. تحديث activeFilters

```typescript
const activeFilters = [];
if (search) activeFilters.push(`Search: ${search}`);
if (clientTypeFilter !== 'All') activeFilters.push(`Type: ${clientTypeFilter}`);
if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
if (dateFrom) activeFilters.push(`From: ${dateFrom}`);
if (dateTo) activeFilters.push(`To: ${dateTo}`);
```

## المكونات المطلوبة / Required Components

- `DatePicker` من `@/components/DatePicker`
- `Label` من `@/components/ui/label`

## ملاحظات مهمة / Important Notes

1. **البحث الذكي**: السيرفر يجب أن يدعم البحث في جميع الحقول المذكورة. إذا لم يكن كذلك، يجب تحديث الـ backend.

2. **التواريخ**: 
   - صيغة التاريخ: `YYYY-MM-DD`
   - إذا تم تحديد `date_from` فقط: البحث من هذا التاريخ فصاعداً
   - إذا تم تحديد `date_to` فقط: البحث حتى هذا التاريخ
   - إذا تم تحديد الاثنين: البحث بين التاريخين

3. **Performance**: 
   - استخدام debounce للبحث (موجود بالفعل)
   - إعادة تعيين الصفحة إلى 1 عند تغيير أي filter

4. **UX**:
   - إضافة clear button للتواريخ
   - عرض التواريخ المحددة في activeFilters
   - التأكد من أن `date_from` <= `date_to` (validation)

## مثال على الاستخدام / Usage Example

```typescript
// البحث في اسم العميل
search = "Ahmed" → يبحث في: client_no, name, state, city, budget, sequence

// البحث مع فلتر التاريخ
search = "Ahmed"
dateFrom = "2025-01-01"
dateTo = "2025-12-31"
→ يبحث في "Ahmed" بين 1 يناير و 31 ديسمبر 2025
```

## التحقق من التنفيذ / Verification

بعد التنفيذ، تأكد من:
- [ ] البحث يعمل في جميع الحقول المذكورة
- [ ] فلتر التاريخ يعمل بشكل صحيح
- [ ] التواريخ تُرسل بالصيغة الصحيحة
- [ ] Clear filters يعمل مع التواريخ
- [ ] activeFilters يعرض التواريخ المحددة
- [ ] لا توجد أخطاء في console
- [ ] Performance جيد (debounce يعمل)

