// src/services/authService.ts
import { apiPost, apiGet } from './api';
import {
    LoginCredentials,
    AuthTokens,
    User,
    PasswordResetRequest,
    PasswordResetConfirm
} from '../types';

/**
 * Authenticate user and retrieve tokens
 */
export const login = (credentials: LoginCredentials): Promise<AuthTokens> => {
    return apiPost<AuthTokens>('/auth/login/', credentials);
};

/**
 * Log out user and invalidate refresh token
 */
export const logout = (refreshToken: string): Promise<{ detail: string }> => {
    return apiPost<{ detail: string }>('/auth/logout/', { refresh_token: refreshToken });
};

/**
 * Use refresh token to get new access token
 */
export const refreshToken = (refreshToken: string): Promise<{ access: string }> => {
    return apiPost<{ access: string }>('/auth/refresh/', { refresh: refreshToken });
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = (): Promise<User> => {
    return apiGet<User>('/users/me/');
};

/**
 * Request password reset for email
 */
export const forgotPassword = (email: string): Promise<{ detail: string }> => {
    const request: PasswordResetRequest = { email };
    return apiPost<{ detail: string }>('/auth/password/reset/', request);
};

/**
 * Reset password with token
 */
export const resetPassword = (
    resetData: PasswordResetConfirm
): Promise<{ detail: string }> => {
    return apiPost<{ detail: string }>('/auth/password/reset/confirm/', resetData);
};

/**
 * Store auth tokens in localStorage
 */
export const storeAuthTokens = (tokens: AuthTokens): void => {
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
};

/**
 * Remove auth tokens from localStorage
 */
export const removeAuthTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('accessToken');
};

/**
 * Check if a username is available
 */
export const checkUsernameAvailability = (username: string): Promise<{ available: boolean }> => {
    return apiGet<{ available: boolean }>(`/api/users/check-username/?username=${encodeURIComponent(username)}`);
};

/**
 * Register a new user
 */
export const registerUser = (userData: {
    username: string;
    email: string;
    password: string;
}): Promise<{ detail: string }> => {
    return apiPost<{ detail: string }>('/auth/register/', userData);
};

const authService = {
    login,
    logout,
    refreshToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    storeAuthTokens,
    removeAuthTokens,
    isAuthenticated,
    checkUsernameAvailability,
    registerUser
};

export default authService;
