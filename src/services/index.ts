// src/services/index.ts
import apiClient, {
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    createQueryParams
} from './api';
import authService from './authService';
import projectService from './projectService';
import layerService from './layerService';
import basemapService from './basemapService';
import clientService from './clientService';
import functionService from './functionService';
import mapService from './mapService';
import markerService from './markerService';
import popupService from './popupService';
import styleService from './styleService';

/**
 * Core API utilities
 */
export const apiUtils = {
    apiClient,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    createQueryParams
};

/**
 * All service exports
 */
export {
    authService,
    projectService,
    layerService,
    basemapService,
    clientService,
    functionService,
    mapService,
    markerService,
    popupService,
    styleService
};

/**
 * Default export of all services
 */
export default {
    api: apiUtils,
    auth: authService,
    projects: projectService,
    layers: layerService,
    basemaps: basemapService,
    clients: clientService,
    functions: functionService,
    maps: mapService,
    markers: markerService,
    popups: popupService,
    styles: styleService
};