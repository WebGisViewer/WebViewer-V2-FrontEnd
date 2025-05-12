// src/types/common.types.ts

/**
 * Generic paginated response from the API
 */
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/**
 * Standard API error format
 */
export interface ApiError {
    detail?: string;
    message?: string;
    [key: string]: unknown;
}

/**
 * Common geometry types based on GeoJSON
 */
export interface Geometry {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: unknown; // The structure depends on the geometry type
}

/**
 * Common GeoJSON feature interface
 */
export interface GeoJSONFeature {
    type: 'Feature';
    geometry: Geometry;
    properties: Record<string, unknown>;
    id?: string;
}

/**
 * Common GeoJSON feature collection
 */
export interface FeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
    chunk_info?: {
        chunk_id: number;
        features_count: number;
        total_count: number;
        next_chunk: number | null;
    };
}

/**
 * Common response for batch operations
 */
export interface BatchOperationResponse {
    message: string;
    success: boolean;
    count?: number;
    [key: string]: unknown;
}

/**
 * Common map controls
 */
export interface MapControls {
    showZoomControl?: boolean;
    showScaleControl?: boolean;
    showLayerControl?: boolean;
    showMeasureTools?: boolean;
    showDrawingTools?: boolean;
    showExportTools?: boolean;
    showSearchControl?: boolean;
    showAttributionControl?: boolean;
    showCoordinateControl?: boolean;
}

/**
 * Common map options
 */
export interface MapOptions {
    enableClustering?: boolean;
    clusterRadius?: number;
    enableGeolocate?: boolean;
    enableFullscreen?: boolean;
    enablePopups?: boolean;
    popupOffset?: number;
    maxBounds?: [number, number, number, number] | null;
    minZoom?: number;
    maxZoom?: number;
    fitPadding?: [number, number, number, number];
}