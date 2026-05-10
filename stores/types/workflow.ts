export type RequestType =
    | 'Tasks'
    | 'Financial'
    | 'Employment'
    | 'Clients'
    | 'Projects'
    | 'ProjectContracts';

export const REQUEST_TYPES: RequestType[] = [
    'Clients',
    'Projects',
    'ProjectContracts',
    'Financial',
    'Employment',
    'Tasks',
];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
    Clients: 'Clients',
    Projects: 'Projects',
    ProjectContracts: 'Project Contracts',
    Financial: 'Financial',
    Employment: 'Employment',
    Tasks: 'Tasks',
};

export interface WorkflowStep {
    id: number;
    workflow_id: string;
    request_type: RequestType;
    step_level: number;
    step_name: string;
    required_role: string;
    is_required: 0 | 1;
    created_at?: string;
}

export interface WorkflowListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        workflow_steps: WorkflowStep[];
    };
}

export interface WorkflowStepSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        success?: { workflow_step: WorkflowStep; message: string };
        workflow_step?: WorkflowStep;
    };
}

export interface CreateWorkflowStepParams {
    request_type: RequestType;
    step_level: number;
    step_name: string;
    required_role: string;
    is_required?: 0 | 1;
}

export interface UpdateWorkflowStepParams {
    request_type?: RequestType;
    step_level?: number;
    step_name?: string;
    required_role?: string;
    is_required?: 0 | 1;
}
