// ================== Attachment Interface ==================
export interface Attachment {
    id: string;                    // attachment_id
    request_id: string;            // معرف الطلب المرتبط
    created_id: string;            // معرف المستخدم الذي رفع المرفق
    request_type: string;          // نوع الطلب (Clients, Tasks, etc.)
    sequence: string;              // الرقم التسلسلي للمرفق
    step_process: string;          // خطوة العملية
    status: string;                // حالة المرفق
    version: string;               // إصدار المرفق
    title: string;                 // عنوان المرفق
    path: string;                  // مسار الملف على الخادم
    file: string;                  // اسم الملف
    created_at: string;            // تاريخ الإنشاء
    uploader_name?: string;        // اسم المستخدم الذي رفع المرفق
    step_no?: string;              // رقم الخطوة (اختياري)
}

// ================== Create Attachment Payload ==================
export interface CreateAttachmentPayload {
    request_id: string;            // معرف الطلب (مطلوب)
    title: string;                 // عنوان المرفق (مطلوب)
    file: string;                   // الملف بصيغة Base64 (مطلوب)
    status: string;                // حالة المرفق (مطلوب)
    version: string;               // إصدار المرفق (مطلوب)
}

// ================== Update Attachment Payload ==================
export interface UpdateAttachmentPayload {
    attachment_id: string;        // معرف المرفق (مطلوب)
    title?: string;                // عنوان المرفق (اختياري)
    file?: string;                 // الملف بصيغة Base64 (اختياري)
}

// ================== API Response Structures ==================

// New API Response Structure
export interface AttachmentsResponse {
    success: boolean;
    message?: string;
    data?: {
        attachments: Attachment[];
    };
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
}

// Legacy API Response Structure (header/body format)
export interface AttachmentsResponseLegacy {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: {
            code: number;
            type: string;
            message: string;
        }[];
    };
    body?: {
        attachments: Attachment[];
    };
}

// Single Attachment Response
export interface AttachmentResponse {
    success: boolean;
    message?: string;
    data?: {
        attachment: Attachment;
    };
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
}

// Legacy Single Attachment Response
export interface AttachmentResponseLegacy {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: {
            code: number;
            type: string;
            message: string;
        }[];
    };
    body?: {
        attachment: Attachment;
    };
}

