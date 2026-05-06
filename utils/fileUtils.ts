// ================== File Types ==================
export const ALLOWED_FILE_TYPES = {
    PDF: ['application/pdf'],
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ],
};

export const ALLOWED_FILE_EXTENSIONS = {
    PDF: ['.pdf'],
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENTS: ['.doc', '.docx', '.xls', '.xlsx'],
};

// Maximum file size: 10MB (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ================== File Validation ==================

/**
 * Check if file type is allowed
 */
export function isFileTypeAllowed(file: File): boolean {
    const allAllowedTypes = [
        ...ALLOWED_FILE_TYPES.PDF,
        ...ALLOWED_FILE_TYPES.IMAGES,
        ...ALLOWED_FILE_TYPES.DOCUMENTS,
    ];
    return allAllowedTypes.includes(file.type);
}

/**
 * Check if file extension is allowed
 */
export function isFileExtensionAllowed(fileName: string): boolean {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const allAllowedExtensions = [
        ...ALLOWED_FILE_EXTENSIONS.PDF,
        ...ALLOWED_FILE_EXTENSIONS.IMAGES,
        ...ALLOWED_FILE_EXTENSIONS.DOCUMENTS,
    ];
    return allAllowedExtensions.includes(extension);
}

/**
 * Check if file size is within limit
 */
export function isFileSizeValid(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
}

/**
 * Validate file (type, extension, size)
 */
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export function validateFile(file: File): FileValidationResult {
    // Check file size
    if (!isFileSizeValid(file)) {
        return {
            valid: false,
            error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
    }

    // Check file type
    if (!isFileTypeAllowed(file)) {
        return {
            valid: false,
            error: 'File type is not allowed. Please upload PDF, Image, or Document files.',
        };
    }

    // Check file extension
    if (!isFileExtensionAllowed(file.name)) {
        return {
            valid: false,
            error: 'File extension is not allowed. Please upload PDF, Image, or Document files.',
        };
    }

    return { valid: true };
}

// ================== File to Base64 Conversion ==================

/**
 * Convert file to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1] || result;
            resolve(base64);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Convert file to Base64 with progress tracking
 */
export function fileToBase64WithProgress(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        };

        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || result;
            if (onProgress) {
                onProgress(100);
            }
            resolve(base64);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

// ================== File Size Formatting ==================

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ================== File Type Detection ==================

/**
 * Get file type category
 */
export function getFileTypeCategory(file: File): 'pdf' | 'image' | 'document' | 'unknown' {
    if (ALLOWED_FILE_TYPES.PDF.includes(file.type)) {
        return 'pdf';
    }
    if (ALLOWED_FILE_TYPES.IMAGES.includes(file.type)) {
        return 'image';
    }
    if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(file.type)) {
        return 'document';
    }
    return 'unknown';
}

/**
 * Check if file can be previewed (images and PDFs)
 */
export function canPreviewFile(file: File): boolean {
    const category = getFileTypeCategory(file);
    return category === 'image' || category === 'pdf';
}

// ================== File Download ==================

/**
 * Download file from URL or Base64
 */
export function downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download file from Base64
 */
export function downloadFileFromBase64(base64: string, fileName: string, mimeType: string): void {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    downloadFile(url, fileName);
    URL.revokeObjectURL(url);
}

// ================== File Preview ==================

/**
 * Get preview URL for file (for images and PDFs)
 */
export function getFilePreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!canPreviewFile(file)) {
            reject(new Error('File type does not support preview'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Get preview URL from Base64
 */
export function getPreviewUrlFromBase64(base64: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64}`;
}

