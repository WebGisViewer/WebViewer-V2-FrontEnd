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
