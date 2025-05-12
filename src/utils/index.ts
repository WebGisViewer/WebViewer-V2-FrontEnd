// src/utils/index.ts

// API utilities
export { parseApiError, createQueryParams } from './api';

// Color utilities
export {
    getRandomColor,
    getContrastColor,
    generateColorScale,
    getColorScheme
} from './color';

// Download utilities
export {
    downloadFile,
    exportCSV,
    exportJSON,
    fileToDataURL
} from './download';

// Format utilities
export {
    formatDate,
    formatNumber,
    formatFileSize,
    truncateText,
    formatTitle
} from './format';

// Geospatial utilities
export {
    haversineDistance,
    calculateCenter,
    calculateBounds,
    degreesToRadians,
    radiansToDegrees,
    calculateBearing
} from './geospatial';

// Validation utilities
export {
    isValidEmail,
    isValidUrl,
    isRequired,
    hasMinLength,
    hasMaxLength,
    isValidPassword,
    isValidLatitude,
    isValidLongitude
} from './validation';