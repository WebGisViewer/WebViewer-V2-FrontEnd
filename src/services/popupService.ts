// src/services/popupService.ts
import { apiGet, apiPost, apiPut, apiDelete, createQueryParams } from './api';
import {
    PopupTemplate,
    PopupTemplateCreate,
    PopupTemplateUpdate,
    PopupTemplatePreview
} from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get popup templates with pagination and filtering
 */
export const getPopupTemplates = (
    params: Record<string, unknown> = {}
): Promise<PaginatedResponse<PopupTemplate>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<PopupTemplate>>(`/popup-templates/?${queryParams.toString()}`);
};

/**
 * Get a single popup template by ID
 */
export const getPopupTemplate = (id: number): Promise<PopupTemplate> => {
    return apiGet<PopupTemplate>(`/popup-templates/${id}/`);
};

/**
 * Create a new popup template
 */
export const createPopupTemplate = (template: PopupTemplateCreate): Promise<PopupTemplate> => {
    return apiPost<PopupTemplate>('/popup-templates/', template);
};

/**
 * Update a popup template
 */
export const updatePopupTemplate = (
    id: number,
    template: PopupTemplateUpdate
): Promise<PopupTemplate> => {
    return apiPut<PopupTemplate>(`/popup-templates/${id}/`, template);
};

/**
 * Delete a popup template
 */
export const deletePopupTemplate = (id: number): Promise<void> => {
    return apiDelete<void>(`/popup-templates/${id}/`);
};

/**
 * Preview popup template
 */
export const previewPopupTemplate = (id: number): Promise<PopupTemplatePreview> => {
    return apiGet<PopupTemplatePreview>(`/popup-templates/${id}/preview/`);
};

const popupService = {
    getPopupTemplates,
    getPopupTemplate,
    createPopupTemplate,
    updatePopupTemplate,
    deletePopupTemplate,
    previewPopupTemplate
};

export default popupService;