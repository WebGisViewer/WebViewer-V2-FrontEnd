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