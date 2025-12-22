// Represents a single Client Request
export interface ClientRequest {
    priority: string;
    id: string;                // Unique request ID
    created_id: string;        // ID of the user who created it
    created_by_name: string;   // Name of the user who created it
    client_id: string;         // Related Client ID
    request_code: string;      // Unique request code
    request_type: string;      // Type of request (e.g., Information, Service, Support)
    status: string;            // Current status (Pending, Approved, Rejected)
    notes: string;             // Optional notes or description
    created_at: string;        // Creation timestamp
    updated_at: string;        // Last update timestamp
    client_name: string;       // Related client name
    client_no: string;         // Related client number
}

// Represents the full API response for Client Requests
export interface ClientRequestsResponse {
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
        clients_requests: {
            total: number;        // Total number of matching records
            pages: number;        // Number of pages based on pagination
            items: ClientRequest[]; // The list of enriched requests
        };
    };
}

export interface ClientRequestResponse {
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
        clients_request: ClientRequest;  // Single client request
    };
}

