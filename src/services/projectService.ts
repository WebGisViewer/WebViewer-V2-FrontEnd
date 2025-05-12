// src/services/projectService.ts
import { apiGet, apiPost, apiPatch, apiDelete, createQueryParams } from './api';
import {
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectStats,
    ProjectConstructor,
    ProjectCloneRequest
} from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get all projects with pagination and filtering
 */
export const getProjects = (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Project>> => {
    const queryParams = createQueryParams(params);
    return apiGet<PaginatedResponse<Project>>(`/projects/?${queryParams.toString()}`);
};

/**
 * Get a single project by ID
 */
export const getProject = (id: number): Promise<Project> => {
    return apiGet<Project>(`/projects/${id}/`);
};

/**
 * Create a new project
 */
export const createProject = (project: ProjectCreate): Promise<Project> => {
    return apiPost<Project>('/projects/', project);
};

/**
 * Update a project
 */
export const updateProject = (id: number, project: ProjectUpdate): Promise<Project> => {
    return apiPatch<Project>(`/projects/${id}/`, project);
};

/**
 * Delete a project
 */
export const deleteProject = (id: number): Promise<void> => {
    return apiDelete<void>(`/projects/${id}/`);
};

/**
 * Clone a project
 */
export const cloneProject = (id: number, options?: ProjectCloneRequest): Promise<Project> => {
    return apiPost<Project>(`/projects/${id}/clone/`, options || {});
};

/**
 * Get project statistics
 */
export const getProjectStats = (id: number): Promise<ProjectStats> => {
    return apiGet<ProjectStats>(`/projects/${id}/stats/`);
};

/**
 * Get project constructor (complete project structure)
 */
export const getProjectConstructor = (id: number): Promise<ProjectConstructor> => {
    return apiGet<ProjectConstructor>(`/constructor/${id}/`);
};

/**
 * Get standalone project view (by hash)
 */
export const getStandaloneProject = (hash: string): Promise<ProjectConstructor> => {
    return apiGet<ProjectConstructor>(`/standalone/${hash}/`);
};

// Export default as object with all methods
const projectService = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    cloneProject,
    getProjectStats,
    getProjectConstructor,
    getStandaloneProject
};

export default projectService;