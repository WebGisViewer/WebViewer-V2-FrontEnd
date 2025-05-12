// src/types/marker.types.ts

/**
 * Marker definition
 */
export interface Marker {
    id: number;
    name: string;
    description: string;
    icon_url: string;
    icon_type: string;
    default_options: Record<string, unknown>;
    default_size: number;
    default_anchor: string;
    default_color: string;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
    tags: string;
    category: string;
    icon_data_base64?: string;
}

/**
 * Marker creation request
 */
export interface MarkerCreate {
    name: string;
    description: string;
    icon_type: string;
    default_options: Record<string, unknown>;
    default_size: number;
    default_anchor: string;
    default_color: string;
    tags?: string;
    category?: string;
}

/**
 * Marker update request
 */
export type MarkerUpdate = Partial<MarkerCreate>

/**
 * SVG Marker upload request
 */
export interface SvgMarkerUpload {
    name: string;
    description: string;
    svg_data: string;
}