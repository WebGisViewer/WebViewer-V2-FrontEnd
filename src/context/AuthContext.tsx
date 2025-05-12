// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types/auth.types';
import {
    getCurrentUser,
    isAuthenticated,
    login as loginService,
    logout as logoutService,
    storeAuthTokens,
    removeAuthTokens,
    LoginCredentials
} from '../services/authService';

// Define available actions
type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
    isAuthenticated: isAuthenticated(),
    user: null,
    isLoading: false,
    error: null,
};

// Create reducer for state management
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Define context type
interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                try {
                    const user = await getCurrentUser();
                    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
                } catch (error) {
                    // Token might be invalid/expired
                    removeAuthTokens();
                    dispatch({ type: 'LOGOUT' });
                }
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const tokens = await loginService(credentials);
            storeAuthTokens(tokens);

            const user = await getCurrentUser();
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : 'Failed to login. Please try again.';
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMsg });
        }
    };

    // Logout function
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await logoutService(refreshToken);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            removeAuthTokens();
            dispatch({ type: 'LOGOUT' });
        }
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Context value
    const value = {
        ...state,
        login,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Higher-order component for protected routes
export const withAuth = (Component: React.ComponentType) => {
    return (props: any) => {
        const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) {
            return <div>Loading...</div>; // Could be replaced with a proper loading component
        }

        if (!isAuthenticated) {
            window.location.href = '/login';
            return null;
        }

        return <Component {...props} />;
    };
};