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