// src/services/basemapService.ts
import { apiGet, apiPost, apiPatch, apiDelete, createQueryParams } from './api';
import {
    Basemap,
    BasemapCreate,
    BasemapUpdate,
    ProjectBasemap,
    ProjectBasemapCreate,
    ProjectBasemapBatchUpdate,
    BasemapConnectionTest
} from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get all basemaps with pagination and filtering
 */
export const getBasemaps = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<Basemap>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<Basemap>>(`/basemaps/?${queryParams.toString()}`);
};

/**
 * Get a single basemap by ID
 */
export const getBasemap = (id: number): Promise<Basemap> => {
    return apiGet<Basemap>(`/basemaps/${id}/`);
};

/**
 * Create a new basemap
 */
export const createBasemap = (basemap: BasemapCreate): Promise<Basemap> => {
    return apiPost<Basemap>('/basemaps/', basemap);
};

/**
 * Update a basemap
 */
export const updateBasemap = (id: number, basemap: BasemapUpdate): Promise<Basemap> => {
    return apiPatch<Basemap>(`/basemaps/${id}/`, basemap);
};

/**
 * Delete a basemap
 */
export const deleteBasemap = (id: number): Promise<void> => {
    return apiDelete<void>(`/basemaps/${id}/`);
};

/**
 * Upload preview image for a basemap
 */
export const uploadBasemapPreview = (
    id: number,
    previewImage: string
): Promise<Basemap> => {
    return apiPost<Basemap>(`/basemaps/${id}/upload_preview/`, {
        preview_image: previewImage
    });
};

/**
 * Test a basemap connection by ID
 */
export const testBasemapConnection = (id: number): Promise<BasemapConnectionTest> => {
    return apiGet<BasemapConnectionTest>(`/basemaps/${id}/test_connection/`);
};

/**
 * Test a basemap connection by configuration (without saving first)
 */
export const testBasemapConnectionByConfig = (
    config: BasemapCreate
): Promise<BasemapConnectionTest> => {
    return apiPost<BasemapConnectionTest>(`/basemaps/test_connection/`, config);
};

/**
 * Get basemaps for a specific project
 */
export const getProjectBasemaps = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<ProjectBasemap>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<ProjectBasemap>>(`/project-basemaps/?${queryParams.toString()}`);
};

/**
 * Add a basemap to a project
 */
export const addBasemapToProject = (
    projectBasemap: ProjectBasemapCreate
): Promise<ProjectBasemap> => {
    return apiPost<ProjectBasemap>(`/project-basemaps/`, projectBasemap);
};

/**
 * Update project basemaps in batch
 */
export const updateProjectBasemaps = (
    batchUpdate: ProjectBasemapBatchUpdate
): Promise<ProjectBasemap[]> => {
    return apiPost<ProjectBasemap[]>(`/project-basemaps/batch_update/`, batchUpdate);
};

const basemapService = {
    getBasemaps,
    getBasemap,
    createBasemap,
    updateBasemap,
    deleteBasemap,
    uploadBasemapPreview,
    testBasemapConnection,
    testBasemapConnectionByConfig,
    getProjectBasemaps,
    addBasemapToProject,
    updateProjectBasemaps
};

export default basemapService;