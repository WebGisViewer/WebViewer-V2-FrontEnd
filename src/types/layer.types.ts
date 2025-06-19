// src/types/layer.types.ts
import { Geometry } from './common.types';

/**
 * Layer style definition
 */
export interface LayerStyle {
    color?: string;
    weight?: number;
    opacity?: number;
    fillColor?: string;
    fillOpacity?: number;
    radius?: number;
    dashArray?: string;
    lineCap?: string;
    lineJoin?: string;
    className?: string;
    [key: string]: unknown;
}

/**
 * Layer group definition
 */
export interface LayerGroup {
    id: number;
    name: string;
    display_order: number;
    is_visible_by_default: boolean;
    is_expanded_by_default: boolean;
    created_at: string;
    updated_at: string;
    project: number;
    layers: Layer[];
}

/**
 * Layer group creation request
 */
export interface LayerGroupCreate {
    name: string;
    display_order: number;
    is_visible_by_default: boolean;
    is_expanded_by_default: boolean;
    project: number;
}

/**
 * Layer group update request
 */
export type LayerGroupUpdate = Partial<LayerGroupCreate>

/**
 * Layer definition
 */
export interface Layer {
    id: number;
    project_layer_group: number;
    project_name?: string;
    layer_type: number;
    layer_type_name?: string;
    name: string;
    description: string;
    style: LayerStyle;
    z_index: number;
    is_visible_by_default: boolean;
    min_zoom_visibility: number;
    max_zoom_visibility: number;
    marker_type: string | null;
    marker_image_url: string | null;
    marker_options: Record<string, unknown>;
    enable_clustering: boolean;
    clustering_options: Record<string, unknown>;
    enable_labels: boolean;
    label_options: Record<string, unknown>;
    feature_count: number;
    data_source: string;
    attribution: string;
    created_at: string;
    updated_at: string;
    last_data_update: string | null;
    functions?: Array<{
        type: string;
        arguments?: Record<string, any>;
    }>;
}

/**
 * Layer creation request
 */
export interface LayerCreate {
    project_layer_group: number;
    layer_type: number;
    name: string;
    description: string;
    style: LayerStyle;
    z_index: number;
    is_visible_by_default: boolean;
    min_zoom_visibility: number;
    max_zoom_visibility: number;
    marker_type?: string;
    marker_image_url?: string;
    marker_options?: Record<string, unknown>;
    enable_clustering?: boolean;
    clustering_options?: Record<string, unknown>;
    enable_labels?: boolean;
    label_options?: Record<string, unknown>;
    data_source: string;
    attribution: string;
}

/**
 * Layer update request
 */
export type LayerUpdate = Partial<LayerCreate>

/**
 * Feature definition
 */
export interface Feature {
    id: number;
    project_layer: number;
    feature_id: string;
    geometry: Geometry;
    properties: Record<string, unknown>;
    created_at: string;
}

/**
 * Feature creation request
 */
export interface FeatureCreate {
    project_layer: number;
    feature_id?: string;
    geometry: Geometry;
    properties: Record<string, unknown>;
}

/**
 * Feature update request
 */
export type FeatureUpdate = Partial<FeatureCreate>

/**
 * Layer data request parameters
 */
export interface LayerDataParams {
    bounds?: string;
    zoom?: number;
    chunk_id?: number;
    [key: string]: unknown;
}

/**
 * Layer buffer operation request
 */
export interface LayerBufferRequest {
    distance: number;
}

/**
 * Response for import/clear operations
 */
export interface LayerDataOperationResponse {
    success: boolean;
    features_imported?: number;
    features_removed?: number;
    total_features?: number;
    feature_count?: number;
    message?: string;
}

