// src/utils/format.ts
/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string => {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString; // Return original string if parsing fails
    }
};

/**
 * Format a number with thousands separators
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (
    value: number | string,
    decimals = 0
): string => {
    if (value === null || value === undefined || value === '') return 'N/A';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return 'N/A';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Format a file size into human-readable format
 * @param bytes Number of bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength) + '...';
};

/**
 * Convert camelCase or snake_case to Title Case with spaces
 * @param text Text to convert
 * @returns Formatted text
 */
export const formatTitle = (text: string): string => {
    if (!text) return '';

    // Handle camelCase
    const spacedText = text
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' '); // Handle snake_case

    // Capitalize first letter of each word
    return spacedText
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
};

// src/utils/validation.ts
/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validate an email address
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

/**
 * Validate a URL
 * @param url URL to validate
 * @returns Whether the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
    return URL_REGEX.test(url);
};

/**
 * Validate a required field
 * @param value Value to check
 * @returns Whether the value is not empty
 */
export const isRequired = (value: string | number | boolean | null | undefined): boolean => {
    if (typeof value === 'boolean') return true; // Boolean values are always valid for required fields
    if (typeof value === 'number') return true; // Number values (even 0) are valid for required fields

    return !!value;
};

/**
 * Validate minimum length
 * @param value Value to check
 * @param minLength Minimum length
 * @returns Whether the value meets the minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
    if (!value) return false;
    return value.length >= minLength;
};

/**
 * Validate maximum length
 * @param value Value to check
 * @param maxLength Maximum length
 * @returns Whether the value meets the maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
    if (!value) return true; // Empty values are valid for max length
    return value.length <= maxLength;
};

/**
 * Validate a password meets minimum requirements
 * @param password Password to validate
 * @returns Whether the password is valid
 */
export const isValidPassword = (password: string): boolean => {
    // At least 8 characters, at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Validate a latitude value
 * @param lat Latitude to validate
 * @returns Whether the latitude is valid
 */
export const isValidLatitude = (lat: number): boolean => {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
};

/**
 * Validate a longitude value
 * @param lng Longitude to validate
 * @returns Whether the longitude is valid
 */
export const isValidLongitude = (lng: number): boolean => {
    return !isNaN(lng) && lng >= -180 && lng <= 180;
};

// src/utils/geospatial.ts
/**
 * Calculate great-circle distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    // Earth radius in kilometers
    const R = 6371;

    // Convert coordinates to radians
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    // Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Calculate the center point of multiple coordinates
 * @param coordinates Array of [longitude, latitude] coordinates
 * @returns Center [longitude, latitude]
 */
export const calculateCenter = (coordinates: [number, number][]): [number, number] => {
    if (coordinates.length === 0) {
        return [0, 0];
    }

    // Sum all coordinates
    const sumCoords = coordinates.reduce(
        (sum, coord) => [sum[0] + coord[0], sum[1] + coord[1]],
        [0, 0]
    );

    // Calculate average
    return [
        sumCoords[0] / coordinates.length,
        sumCoords[1] / coordinates.length
    ];
};

/**
 * Calculate bounds from an array of coordinates
 * @param coordinates Array of [longitude, latitude] coordinates
 * @returns Bounds as [minLng, minLat, maxLng, maxLat]
 */
export const calculateBounds = (
    coordinates: [number, number][]
): [number, number, number, number] => {
    if (coordinates.length === 0) {
        return [0, 0, 0, 0];
    }

    let minLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLng = coordinates[0][0];
    let maxLat = coordinates[0][1];

    coordinates.forEach(coord => {
        const [lng, lat] = coord;
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
    });

    return [minLng, minLat, maxLng, maxLat];
};

/**
 * Convert degrees to radians
 * @param degrees Degrees
 * @returns Radians
 */
export const degreesToRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
};

/**
 * Convert radians to degrees
 * @param radians Radians
 * @returns Degrees
 */
export const radiansToDegrees = (radians: number): number => {
    return radians * 180 / Math.PI;
};

/**
 * Calculate bearing between two points
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Bearing in degrees (0-360)
 */
export const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const startLat = degreesToRadians(lat1);
    const startLng = degreesToRadians(lon1);
    const destLat = degreesToRadians(lat2);
    const destLng = degreesToRadians(lon2);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let bearing = Math.atan2(y, x);
    bearing = radiansToDegrees(bearing);
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
};

// src/utils/color.ts
/**
 * Generates a random hex color code
 * @returns Random color hex code
 */
export const getRandomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Generates a contrasting color (black or white) for a given background color
 * @param hexColor Background color hex code
 * @returns Black or white hex code
 */
export const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate perceived brightness (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Return black or white based on brightness
    return yiq >= 128 ? '#000000' : '#FFFFFF';
};

/**
 * Generates a color scale for data visualization
 * @param numColors Number of colors in the scale
 * @param startColor Starting color (hex)
 * @param endColor Ending color (hex)
 * @returns Array of hex color codes
 */
export const generateColorScale = (
    numColors: number,
    startColor: string = '#e5f5e0',
    endColor: string = '#006d2c'
): string[] => {
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);

    if (!start || !end) {
        return new Array(numColors).fill('#cccccc');
    }

    const scale = [];

    for (let i = 0; i < numColors; i++) {
        const r = Math.round(start.r + (end.r - start.r) * (i / (numColors - 1)));
        const g = Math.round(start.g + (end.g - start.g) * (i / (numColors - 1)));
        const b = Math.round(start.b + (end.b - start.b) * (i / (numColors - 1)));

        scale.push(rgbToHex(r, g, b));
    }

    return scale;
};

/**
 * Helper function to convert hex to RGB
 * @param hex Hex color code
 * @returns RGB object or null if invalid
 */
const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Helper function to convert RGB to hex
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns Hex color code
 */
const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Get predefined color schemes for mapping
 * @param name Name of color scheme
 * @returns Array of hex color codes
 */
export const getColorScheme = (name: string): string[] => {
    const schemes: Record<string, string[]> = {
        // Sequential schemes (light to dark)
        blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],

        // Diverging schemes (for data that has negative/positive values)
        redBlue: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#f7f7f7', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        brownTeal: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'],

        // Qualitative schemes (for categorical data)
        category10: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
        pastel: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    return schemes[name] || schemes.category10;
};