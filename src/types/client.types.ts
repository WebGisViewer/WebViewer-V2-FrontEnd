// src/types/client.types.ts
/**
 * Client definition
 */
export interface Client {
    id: number;
    name: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user_count: string;
}

/**
 * Client creation request
 */
export interface ClientCreate {
    name: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
}

/**
 * Client update request
 */
export type ClientUpdate = Partial<ClientCreate>

/**
 * Client project association
 */
export interface ClientProject {
    id: number;
    client: number;
    project: number;
    project_name: string;
    unique_link: string;
    is_active: boolean;
    created_at: string;
    expires_at: string | null;
    last_accessed: string | null;
}

/**
 * Client project creation request
 */
export interface ClientProjectCreate {
    client: number;
    project: number;
    unique_link?: string;
    is_active: boolean;
    expires_at?: string;
}

/**
 * Client project update request
 */
export type ClientProjectUpdate = Partial<ClientProjectCreate>

/**
 * Response for recording client access
 */
export interface ClientAccessResponse {
    status: string;
}

/**
 * Batch project assignment request
 */
export interface BatchAssignRequest {
    client_id: number;
    assignments: number[];  // Project IDs
}

/**
 * Batch project assignment response
 */
export interface BatchAssignResponse {
    results: Array<{
        project_id: number;
        status: string;
        unique_link?: string;
    }>;
}

/**
 * Client analytics data
 */
export interface ClientAnalytics {
    project_count: number;
    active_projects: number;
    user_count: number;
    active_users: number;
    most_accessed_projects: Array<{
        id: number;
        name: string;
        last_accessed: string;
    }>;
    recent_activity: Array<{
        id: number;
        username: string;
        action: string;
        action_details: Record<string, unknown>;
        occurred_at: string;
        ip_address: string;
    }>;
}