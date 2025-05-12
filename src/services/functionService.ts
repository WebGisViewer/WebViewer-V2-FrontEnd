// src/services/functionService.ts
import { apiGet, apiPost, apiPut, apiDelete, createQueryParams } from './api';
import {
    LayerFunction,
    LayerFunctionCreate,
    LayerFunctionUpdate,
    ProjectLayerFunction,
    ProjectLayerFunctionCreate,
    ProjectLayerFunctionUpdate,
    FunctionExecuteRequest,
    FunctionExecuteResponse
} from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get functions with pagination and filtering
 */
export const getFunctions = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<LayerFunction>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<LayerFunction>>(`/layer-functions/?${queryParams.toString()}`);
};

/**
 * Get a single function by ID
 */
export const getFunction = (id: number): Promise<LayerFunction> => {
    return apiGet<LayerFunction>(`/layer-functions/${id}/`);
};

/**
 * Get function code
 */
export const getFunctionCode = (id: number): Promise<LayerFunction> => {
    return apiGet<LayerFunction>(`/layer-functions/${id}/code/`);
};

/**
 * Create a new function
 */
export const createFunction = (func: LayerFunctionCreate): Promise<LayerFunction> => {
    return apiPost<LayerFunction>('/layer-functions/', func);
};

/**
 * Update a function
 */
export const updateFunction = (id: number, func: LayerFunctionUpdate): Promise<LayerFunction> => {
    return apiPut<LayerFunction>(`/layer-functions/${id}/`, func);
};

/**
 * Delete a function
 */
export const deleteFunction = (id: number): Promise<void> => {
    return apiDelete<void>(`/layer-functions/${id}/`);
};

/**
 * Execute function
 */
export const executeFunction = (
    id: number,
    params: FunctionExecuteRequest
): Promise<FunctionExecuteResponse> => {
    return apiPost<FunctionExecuteResponse>(`/layer-functions/${id}/execute/`, params);
};

/**
 * Get project layer functions
 */
export const getProjectLayerFunctions = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<ProjectLayerFunction>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<ProjectLayerFunction>>(
        `/project-layer-functions/?${queryParams.toString()}`
    );
};

/**
 * Create project layer function
 */
export const createProjectLayerFunction = (
    projectLayerFunction: ProjectLayerFunctionCreate
): Promise<ProjectLayerFunction> => {
    return apiPost<ProjectLayerFunction>('/project-layer-functions/', projectLayerFunction);
};

/**
 * Update project layer function
 */
export const updateProjectLayerFunction = (
    id: number,
    projectLayerFunction: ProjectLayerFunctionUpdate
): Promise<ProjectLayerFunction> => {
    return apiPut<ProjectLayerFunction>(`/project-layer-functions/${id}/`, projectLayerFunction);
};

/**
 * Delete project layer function
 */
export const deleteProjectLayerFunction = (id: number): Promise<void> => {
    return apiDelete<void>(`/project-layer-functions/${id}/`);
};

const functionService = {
    getFunctions,
    getFunction,
    getFunctionCode,
    createFunction,
    updateFunction,
    deleteFunction,
    executeFunction,
    getProjectLayerFunctions,
    createProjectLayerFunction,
    updateProjectLayerFunction,
    deleteProjectLayerFunction
};

export default functionService;