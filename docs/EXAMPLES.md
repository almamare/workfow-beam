# أمثلة عملية: إنشاء صفحة جديدة خطوة بخطوة

## مثال: إنشاء صفحة "Products" (المنتجات)

### 1️⃣ إنشاء Types

```typescript
// stores/types/products.ts
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    category: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    created_at: string;
    updated_at: string;
}

export interface ProductsData {
    total: number;
    pages: number;
    items: Product[];
}

export interface ProductsResponse {
    header: {
        success: boolean;
        message?: string;
    };
    body?: {
        products: ProductsData;
    };
}

export interface SingleProductResponse {
    header: {
        success: boolean;
        message?: string;
    };
    body?: {
        product: Product;
    };
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    category: string;
    status: 'active' | 'inactive' | 'out_of_stock';
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
    id: string;
}
```

---

### 2️⃣ إنشاء Redux Slice

```typescript
// stores/slices/products.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Product,
    ProductsResponse,
    SingleProductResponse,
    CreateProductPayload,
    UpdateProductPayload
} from '@/stores/types/products';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface ProductsState {
    loading: boolean;
    error: string | null;
    products: Product[];
    selectedProduct: Product | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: ProductsState = {
    loading: false,
    error: null,
    products: [],
    selectedProduct: null,
    total: 0,
    pages: 0,
};

// ================== Async Thunks ==================
export interface FetchProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
}

export const fetchProducts = createAsyncThunk<
    ProductsResponse,
    FetchProductsParams | void,
    { rejectValue: string; state: RootState }
>(
    'products/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10, search, category, status } = params || {};
            const res = await api.get<ProductsResponse>('/products/fetch', {
                params: { page, limit, search, category, status },
            });

            const { header, body } = res.data;
            if (!header.success || !body?.products) {
                return rejectWithValue(header.message || 'Failed to fetch products');
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error while fetching products';
            return rejectWithValue(msg);
        }
    }
);

export const fetchProduct = createAsyncThunk<
    SingleProductResponse,
    string,
    { rejectValue: string }
>(
    'products/fetchProduct',
    async (productId, { rejectWithValue }) => {
        try {
            const res = await api.get<SingleProductResponse>(`/products/fetch/${productId}`);
            const { header, body } = res.data;
            if (!header.success || !body?.product) {
                return rejectWithValue(header.message || 'Failed to fetch product');
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error while fetching product';
            return rejectWithValue(msg);
        }
    }
);

export const createProduct = createAsyncThunk<
    SingleProductResponse,
    CreateProductPayload,
    { rejectValue: string }
>(
    'products/createProduct',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post<SingleProductResponse>('/products/create', { params: payload });
            const { header, body } = res.data;
            if (!header.success || !body?.product) {
                return rejectWithValue(header.message || 'Failed to create product');
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error while creating product';
            return rejectWithValue(msg);
        }
    }
);

export const updateProduct = createAsyncThunk<
    SingleProductResponse,
    UpdateProductPayload,
    { rejectValue: string }
>(
    'products/updateProduct',
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const res = await api.put<SingleProductResponse>(`/products/update/${id}`, { params: updates });
            const { header, body } = res.data;
            if (!header.success || !body?.product) {
                return rejectWithValue(header.message || 'Failed to update product');
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error while updating product';
            return rejectWithValue(msg);
        }
    }
);

export const deleteProduct = createAsyncThunk<
    { header: { success: boolean; message?: string } },
    string,
    { rejectValue: string }
>(
    'products/deleteProduct',
    async (productId, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/products/delete/${productId}`);
            const { header } = res.data;
            if (!header.success) {
                return rejectWithValue(header.message || 'Failed to delete product');
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error while deleting product';
            return rejectWithValue(msg);
        }
    }
);

// ================== Slice ==================
const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearSelectedProduct(state) {
            state.selectedProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products List
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductsResponse>) => {
                state.loading = false;
                const products = action.payload.body?.products;
                if (products) {
                    state.products = products.items || [];
                    state.total = products.total || 0;
                    state.pages = products.pages || 0;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch products';
                state.products = [];
                state.total = 0;
                state.pages = 0;
            })
            // Fetch Single Product
            .addCase(fetchProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedProduct = null;
            })
            .addCase(fetchProduct.fulfilled, (state, action: PayloadAction<SingleProductResponse>) => {
                state.loading = false;
                const product = action.payload.body?.product;
                if (product) {
                    state.selectedProduct = product;
                }
            })
            .addCase(fetchProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch product';
                state.selectedProduct = null;
            })
            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create product';
            })
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<SingleProductResponse>) => {
                state.loading = false;
                const product = action.payload.body?.product;
                if (product) {
                    state.selectedProduct = product;
                    // Update in list if exists
                    const index = state.products.findIndex(p => p.id === product.id);
                    if (index !== -1) {
                        state.products[index] = product;
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update product';
            })
            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p.id !== action.meta.arg);
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete product';
            });
    },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;

// ================== Selectors ==================
export const selectProducts = (state: RootState) => state.products.products;
export const selectSelectedProduct = (state: RootState) => state.products.selectedProduct;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectProductsTotal = (state: RootState) => state.products.total;
export const selectProductsPages = (state: RootState) => state.products.pages;
```

---

### 3️⃣ ربط في Store

```typescript
// stores/store.ts
import products from '@/stores/slices/products';

// في reducer object:
reducer: {
    // ... existing reducers
    products: products
}
```

---

### 4️⃣ إنشاء Layout

```typescript
// app/products/layout.tsx
'use client';

import MainLayout from '@/components/layout/main-layout';

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
```

---

### 5️⃣ صفحة القائمة (مثال مبسط)

```typescript
// app/products/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchProducts,
    selectProducts,
    selectProductsLoading,
    selectProductsTotal,
    selectProductsPages,
} from '@/stores/slices/products';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Product } from '@/stores/types/products';
import { deleteProduct } from '@/stores/slices/products';

export default function ProductsPage() {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    
    const products = useSelector(selectProducts);
    const loading = useSelector(selectProductsLoading);
    const totalItems = useSelector(selectProductsTotal);
    const totalPages = useSelector(selectProductsPages);
    
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    useEffect(() => {
        dispatch(fetchProducts({
            page,
            limit,
            search: search || undefined,
            category: categoryFilter !== 'All' ? categoryFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
        }));
    }, [dispatch, page, limit, search, categoryFilter, statusFilter]);
    
    const columns: Column<Product>[] = [
        {
            key: 'name' as keyof Product,
            header: 'Product Name',
            sortable: true,
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
        },
        {
            key: 'category' as keyof Product,
            header: 'Category',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>
        },
        {
            key: 'price' as keyof Product,
            header: 'Price',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                    ${value.toFixed(2)}
                </span>
            )
        },
        {
            key: 'quantity' as keyof Product,
            header: 'Quantity',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>
        },
        {
            key: 'status' as keyof Product,
            header: 'Status',
            sortable: true,
            render: (value: any) => {
                const colors = {
                    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
                    out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                };
                return (
                    <Badge variant="outline" className={`${colors[value as keyof typeof colors]} w-fit`}>
                        {value}
                    </Badge>
                );
            }
        },
    ];
    
    const actions: Action<Product>[] = [
        {
            label: 'View Details',
            onClick: (product) => router.push(`/products/${product.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit',
            onClick: (product) => router.push(`/products/${product.id}/edit`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Delete',
            onClick: (product) => {
                setSelectedProduct(product);
                setIsDeleteDialogOpen(true);
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];
    
    const handleDelete = async () => {
        if (!selectedProduct) return;
        try {
            await dispatch(deleteProduct(selectedProduct.id));
            toast.success('Product deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedProduct(null);
        } catch (error: any) {
            toast.error(error || 'Failed to delete product');
        }
    };
    
    return (
        <div className="space-y-4">
            <Breadcrumb />
            
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Products
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage and track products
                    </p>
                </div>
                <Button onClick={() => router.push('/products/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                </Button>
            </div>
            
            <FilterBar
                searchPlaceholder="Search products..."
                searchValue={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                filters={[
                    {
                        key: 'category',
                        label: 'Category',
                        value: categoryFilter,
                        options: [
                            { key: 'all', label: 'All Categories', value: 'All' },
                            { key: 'electronics', label: 'Electronics', value: 'electronics' },
                            { key: 'clothing', label: 'Clothing', value: 'clothing' },
                        ],
                        onValueChange: (value) => { setCategoryFilter(value); setPage(1); }
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        value: statusFilter,
                        options: [
                            { key: 'all', label: 'All Status', value: 'All' },
                            { key: 'active', label: 'Active', value: 'active' },
                            { key: 'inactive', label: 'Inactive', value: 'inactive' },
                            { key: 'out_of_stock', label: 'Out of Stock', value: 'out_of_stock' },
                        ],
                        onValueChange: (value) => { setStatusFilter(value); setPage(1); }
                    }
                ]}
                activeFilters={[
                    search && `Search: ${search}`,
                    categoryFilter !== 'All' && `Category: ${categoryFilter}`,
                    statusFilter !== 'All' && `Status: ${statusFilter}`,
                ].filter(Boolean) as string[]}
                onClearFilters={() => {
                    setSearch('');
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button variant="outline" onClick={() => dispatch(fetchProducts({ page, limit, search }))}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => {}}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </>
                }
            />
            
            <EnhancedCard
                title="Products List"
                description={`${totalItems} products found`}
            >
                <EnhancedDataTable
                    data={products}
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
                    noDataMessage="No products found"
                />
            </EnhancedCard>
            
            {/* Delete Dialog - يمكن استخدام DeleteDialog component */}
        </div>
    );
}
```

---

## 📌 نصائح مهمة

1. **استخدم نفس الأسماء**: `fetchProducts`, `createProduct`, `updateProduct`, `deleteProduct`
2. **اتبع نفس البنية**: State → Thunks → Slice → Selectors
3. **استخدم نفس الأنماط**: في الصفحات والـ Components
4. **اختبر كل شيء**: CRUD operations قبل الإطلاق

---

**تم إعداد الأمثلة** ✅

