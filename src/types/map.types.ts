// src/types/map.types.ts

/**
 * Basemap definition
 */
export interface Basemap {
    id: number;
    name: string;
    description: string;
    provider: string;
    provider_display: string;
    url_template: string;
    options: Record<string, unknown>;
    attribution: string;
    min_zoom: number;
    max_zoom: number;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
    preview_image_base64?: string;
    is_default: boolean;
}

/**
 * Basemap creation request
 */
export interface BasemapCreate {
    name: string;
    description: string;
    provider: string;
    url_template: string;
    options: Record<string, unknown>;
    attribution: string;
    min_zoom: number;
    max_zoom: number;
    is_system: boolean;
}

/**
 * Basemap update request
 */
export type BasemapUpdate = Partial<BasemapCreate>

/**
 * Project basemap association
 */
export interface ProjectBasemap {
    id: number;
    project: number;
    project_name: string;
    basemap: number;
    basemap_name: string;
    basemap_provider: string;
    is_default: boolean;
    display_order: number;
    custom_options: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

/**
 * Project basemap creation request
 */
export interface ProjectBasemapCreate {
    project: number;
    basemap: number;
    is_default: boolean;
    display_order: number;
    custom_options: Record<string, unknown>;
}

/**
 * Project basemap batch update request
 */
export interface ProjectBasemapBatchUpdate {
    project_id: number;
    basemaps: Array<{
        basemap_id: number;
        is_default: boolean;
        display_order: number;
        custom_options: Record<string, unknown>;
    }>;
}

/**
 * Map tool definition
 */
export interface MapTool {
    id: number;
    name: string;
    description: string;
    tool_type: string;
    tool_type_display: string;
    icon: string;
    default_options: Record<string, unknown>;
    ui_position: string;
    ui_position_display: string;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
}

/**
 * Map tool creation request
 */
export interface MapToolCreate {
    name: string;
    description: string;
    tool_type: string;
    icon: string;
    default_options: Record<string, unknown>;
    ui_position: string;
    tool_code?: string;
    is_system: boolean;
}

/**
 * Map tool update request
 */
export type MapToolUpdate = Partial<MapToolCreate>

/**
 * Project tool association
 */
export interface ProjectTool {
    id: number;
    project: number;
    project_name: string;
    tool: number;
    tool_name: string;
    tool_type: string;
    is_enabled: boolean;
    display_order: number;
    tool_options: Record<string, unknown>;
    custom_position: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Project tool creation request
 */
export interface ProjectToolCreate {
    project: number;
    tool: number;
    is_enabled: boolean;
    display_order: number;
    tool_options: Record<string, unknown>;
    custom_position?: string | null;
}

/**
 * Project tool batch update request
 */
export interface ProjectToolBatchUpdate {
    project_id: number;
    tools: Array<{
        tool_id: number;
        is_enabled: boolean;
        display_order: number;
        tool_options: Record<string, unknown>;
        custom_position: string | null;
    }>;
}

/**
 * Basemap test connection response
 */
export interface BasemapConnectionTest {
    message: string;
    simulated: boolean;
    basemap_id?: number;
    url_tested: string;
}