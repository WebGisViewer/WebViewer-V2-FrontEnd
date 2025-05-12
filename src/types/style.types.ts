// src/types/style.types.ts

/**
 * Style definition
 */
export interface Style {
    id: number;
    name: string;
    description: string;
    style_definition: {
        color?: string;
        radius?: number;
        weight?: number;
        opacity?: number;
        fillColor?: string;
        fillOpacity?: number;
        categorized?: {
            property: string;
            categories: Array<{
                value: string;
                color: string;
            }>;
        };
        [key: string]: unknown;
    };
    style_type: string;
    style_type_display?: string;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
    preview_image_base64?: string;
}

/**
 * Style creation request
 */
export interface StyleCreate {
    name: string;
    description: string;
    style_definition: Record<string, unknown>;
    style_type: string;
    is_system: boolean;
}

/**
 * Style update request
 */
export type StyleUpdate = Partial<StyleCreate>

/**
 * Response when applying style to layer
 */
export interface StyleApplyResponse {
    message: string;
    layer_id: number;
    layer_name: string;
}

/**
 * Request to generate categorized style
 */
export interface StyleCategorizedRequest {
    layer_id: number;
    property: string;
}

/**
 * Response when generating categorized style
 */
export interface StyleCategorizedResponse {
    message: string;
    style_definition: Record<string, unknown>;
}

/**
 * Color palette definition
 */
export interface ColorPalette {
    id: number;
    name: string;
    description: string;
    colors: string[];
    palette_type: string;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
}

/**
 * Color palette creation request
 */
export interface ColorPaletteCreate {
    name: string;
    description: string;
    colors: string[];
    palette_type: string;
    is_system: boolean;
}