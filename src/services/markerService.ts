// src/services/markerService.ts
import { apiGet, apiPost, apiPut, apiDelete, createQueryParams } from './api';
import {
    Marker,
    MarkerCreate,
    MarkerUpdate,
    SvgMarkerUpload
} from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get markers with pagination and filtering
 */
export const getMarkers = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<Marker>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<Marker>>(`/markers/?${queryParams.toString()}`);
};

/**
 * Get a single marker by ID
 */
export const getMarker = (id: number): Promise<Marker> => {
    return apiGet<Marker>(`/markers/${id}/`);
};

/**
 * Create a new marker
 */
export const createMarker = (marker: MarkerCreate): Promise<Marker> => {
    return apiPost<Marker>('/markers/', marker);
};

/**
 * Update a marker
 */
export const updateMarker = (id: number, marker: MarkerUpdate): Promise<Marker> => {
    return apiPut<Marker>(`/markers/${id}/`, marker);
};

/**
 * Delete a marker
 */
export const deleteMarker = (id: number): Promise<void> => {
    return apiDelete<void>(`/markers/${id}/`);
};

/**
 * Upload SVG marker
 */
export const uploadSvgMarker = (data: SvgMarkerUpload): Promise<Marker> => {
    return apiPost<Marker>('/markers/upload_svg/', data);
};

const markerService = {
    getMarkers,
    getMarker,
    createMarker,
    updateMarker,
    deleteMarker,
    uploadSvgMarker
};

export default markerService;