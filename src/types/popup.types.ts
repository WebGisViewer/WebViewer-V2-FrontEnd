// src/types/popup.types.ts

/**
 * Popup template definition
 */
export interface PopupTemplate {
    id: number;
    name: string;
    description: string;
    html_template: string;
    field_mappings: Record<string, string>;
    css_styles: string;
    max_width: number;
    max_height: number;
    include_zoom_to_feature: boolean;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
}

/**
 * Popup template creation request
 */
export interface PopupTemplateCreate {
    name: string;
    description: string;
    html_template: string;
    field_mappings: Record<string, string>;
    css_styles: string;
    max_width: number;
    max_height: number;
    include_zoom_to_feature: boolean;
    is_system: boolean;
}

/**
 * Popup template update request
 */
export type PopupTemplateUpdate = Partial<PopupTemplateCreate>

/**
 * Popup template preview response
 */
export interface PopupTemplatePreview {
    html: string;
    sample_data: Record<string, unknown>;
}