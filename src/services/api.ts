// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Base axios instance configured for API requests
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response) {
            // Handle 401 Unauthorized error (token expired)
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }

                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.data.access) {
                        localStorage.setItem('accessToken', response.data.access);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        } else if (originalRequest.headers === undefined) {
                            originalRequest.headers = { Authorization: `Bearer ${response.data.access}` };
                        }

                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            // Log error details based on status code
            switch (error.response.status) {
                case 403:
                    console.error('Permission denied:', error.response.data);
                    break;
                case 404:
                    console.error('Resource not found:', error.response.data);
                    break;
                case 500:
                    console.error('Server error:', error.response.data);
                    break;
                default:
                    console.error(`Error ${error.response.status}:`, error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
    }
);

/**
 * Generic API request function with proper typing
 */
export const apiRequest = async <T = unknown>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response: AxiosResponse<T> = await apiClient({
            method,
            url,
            data,
            ...config,
        });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * Convenience methods for different HTTP methods
 */
export const apiGet = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>('get', url, undefined, config);

export const apiPost = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>('post', url, data, config);

export const apiPut = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>('put', url, data, config);

export const apiPatch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>('patch', url, data, config);

export const apiDelete = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>('delete', url, undefined, config);

/**
 * Creates a URLSearchParams object from a parameters object
 */
export const createQueryParams = (params: Record<string, unknown>): URLSearchParams => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (typeof value === 'boolean') {
                queryParams.append(key, value ? 'true' : 'false');
            } else {
                queryParams.append(key, String(value));
            }
        }
    });

    return queryParams;
};

export default apiClient;