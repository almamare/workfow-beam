// Represents a single Task Request
export interface TaskRequest {
    id: string;                // Unique request ID
    created_id: string;        // ID of the user who created it
    created_by_name: string;   // Name of the user who created it
    task_order_id: string;     // Related Task Order ID
    request_code: string;      // Unique request code
    request_type: string;      // Type of request (e.g., Extension, Material Change)
    status: string;            // Current status (Pending, Approved, Rejected)
    notes: string;             // Optional notes or description
    created_at: string;        // Creation timestamp
    updated_at: string;        // Last update timestamp
    contractor_name: string;   // Related contractor name
    project_name: string;      // Related project name
}

// Represents the full API response for Task Requests
export interface TaskRequestsResponse {
    header: {
        requestId: string;  // Unique request ID for tracking the API call
        status?: number;    // HTTP status code (optional)
        success: boolean;   // True if request succeeded, false otherwise
        responseTime: string; // Server processing time in ISO or ms
        message?: string;   // General message about the response
        messages?: {
            code: number;   // Error or info code
            type: string;   // Type of message (INFO, WARNING, ERROR)
            message: string;// Detailed message
        }[];
    };
    body?: {
        tasks_requests: {
            total: number;        // Total number of matching records
            pages: number;        // Number of pages based on pagination
            items: TaskRequest[]; // The list of enriched requests
        };
    };
}

export interface TaskRequestResponse {
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
        tasks_request: TaskRequest;  // Changed from tasks_requests to tasks_request
    };
} 