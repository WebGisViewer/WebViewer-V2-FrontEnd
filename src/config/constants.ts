// src/config/constants.ts
/**
 * Application-wide constants
 */

// API version
export const API_VERSION = 'v1';

// Default map configuration
export const DEFAULT_MAP_CENTER: [number, number] = [0, 0];
export const DEFAULT_MAP_ZOOM = 2;
export const DEFAULT_MAX_ZOOM = 22;
export const DEFAULT_MIN_ZOOM = 0;

// Pagination limits
export const ITEMS_PER_PAGE = 10;
export const MAX_ITEMS_PER_PAGE = 100;

// File upload limits (in bytes)
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
    '.geojson',
    '.json',
    '.zip',
    '.kml',
    '.kmz',
    '.csv',
    '.xlsx',
    '.xls',
    '.gpx',
];

// Default layer styles
export const POINT_LAYER_STYLE = {
    color: '#FF5500',
    radius: 6,
    opacity: 0.8,
    fillOpacity: 0.4,
};

export const LINE_LAYER_STYLE = {
    color: '#3388FF',
    weight: 3,
    opacity: 0.8,
};

export const POLYGON_LAYER_STYLE = {
    color: '#3388FF',
    fillColor: '#3388FF',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.4,
};

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
};

// Map tools
export const MAP_TOOLS = [
    {
        id: 'measure_distance',
        name: 'Measure Distance',
        icon: 'straighten',
    },
    {
        id: 'measure_area',
        name: 'Measure Area',
        icon: 'square_foot',
    },
    {
        id: 'draw',
        name: 'Draw',
        icon: 'edit',
    },
    {
        id: 'export',
        name: 'Export',
        icon: 'download',
    },
    {
        id: 'fullscreen',
        name: 'Fullscreen',
        icon: 'fullscreen',
    },
    {
        id: 'search',
        name: 'Search',
        icon: 'search',
    },
    {
        id: 'print',
        name: 'Print',
        icon: 'print',
    },
];

// Layer types
export const LAYER_TYPES = [
    {
        id: 1,
        name: 'Line Layer',
        description: 'For linear features like roads, rivers, or paths',
    },
    {
        id: 2,
        name: 'Point Layer',
        description: 'For point locations like addresses or landmarks',
    },
    {
        id: 3,
        name: 'Polygon Layer',
        description: 'For area features like boundaries or zones',
    },
    {
        id: 4,
        name: 'Raster Layer',
        description: 'For image-based data like satellite imagery',
    },
];

// Default map controls
export const DEFAULT_MAP_CONTROLS = {
    showZoomControl: true,
    showScaleControl: true,
    showLayerControl: true,
    showMeasureTools: true,
    showDrawingTools: true,
    showExportTools: true,
    showSearchControl: true,
    showAttributionControl: true,
    showCoordinateControl: true,
};

// Default map options
export const DEFAULT_MAP_OPTIONS = {
    enableClustering: true,
    clusterRadius: 80,
    enableGeolocate: true,
    enableFullscreen: true,
    enablePopups: true,
    popupOffset: 10,
    maxBounds: null,
};

// Analytics chart colors
export const CHART_COLORS = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
];

// Available basemaps
export const AVAILABLE_BASEMAPS = [
    {
        id: 'streets',
        name: 'Streets',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/streets-v11',
        preview_url: '/basemaps/streets.jpg',
    },
    {
        id: 'light',
        name: 'Light',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/light-v10',
        preview_url: '/basemaps/light.jpg',
    },
    {
        id: 'dark',
        name: 'Dark',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/dark-v10',
        preview_url: '/basemaps/dark.jpg',
    },
    {
        id: 'satellite',
        name: 'Satellite',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/satellite-v9',
        preview_url: '/basemaps/satellite.jpg',
    },
    {
        id: 'satellite-streets',
        name: 'Satellite Streets',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        preview_url: '/basemaps/satellite-streets.jpg',
    },
    {
        id: 'outdoors',
        name: 'Outdoors',
        provider: 'mapbox',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        preview_url: '/basemaps/outdoors.jpg',
    },
    {
        id: 'osm',
        name: 'OpenStreetMap',
        provider: 'openstreetmap',
        url_template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        preview_url: '/basemaps/osm.jpg',
    },
];