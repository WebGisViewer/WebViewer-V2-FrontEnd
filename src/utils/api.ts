// src/utils/api.ts
import { AxiosError } from 'axios';

// Define a proper interface for API error responses
interface ApiErrorResponse {
    detail?: string;
    message?: string;
    [key: string]: unknown;
}

/**
 * Parse error message from API response
 * @param error Error object from catch block
 * @returns Error message string
 */
export const parseApiError = (error: unknown): string => {
    // Check if it's an Axios error
    if (isAxiosError(error)) {
        // Check if the error has a response from the server
        if (error.response) {
            const { data, status } = error.response;

            // Type guard for the data response
            const errorData = data as ApiErrorResponse;

            // Handle different types of error responses
            if (errorData?.detail) {
                return errorData.detail;
            } else if (errorData?.message) {
                return errorData.message;
            } else if (typeof errorData === 'string') {
                return errorData;
            } else if (errorData && typeof errorData === 'object') {
                // Handle validation errors (field-specific errors)
                const fieldErrors = Object.entries(errorData)
                    .filter(([key]) => key !== 'detail' && key !== 'message')
                    .map(([key, val]) => {
                        const fieldName = key.replace(/_/g, ' ');
                        const errorMsg = Array.isArray(val) ? val[0] : String(val);
                        return `${fieldName}: ${errorMsg}`;
                    });

                if (fieldErrors.length > 0) {
                    return fieldErrors.join('; ');
                }
            }

            // If we can't extract a specific message, return a generic one with status
            return `Request failed with status code ${status}`;
        } else if (error.request) {
            // The request was made but no response was received
            return 'No response from server. Please check your internet connection.';
        } else {
            // Something happened in setting up the request
            return error.message || 'An unexpected error occurred';
        }
    }

    // For non-Axios errors, try to extract a message or return generic error
    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Type guard to check if an error is an Axios error
 */
function isAxiosError(error: unknown): error is AxiosError {
    return Boolean(
        error &&
        typeof error === 'object' &&
        'isAxiosError' in error &&
        // Using type assertion in a safe way with property check first
        error['isAxiosError'] === true
    );
}

/**
 * Create API query parameters from an object
 * @param params Object with parameter keys and values
 * @returns URLSearchParams object
 */
export const createQueryParams = <T extends Record<string, unknown>>(params: T): URLSearchParams => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(item => searchParams.append(key, String(item)));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams;
};