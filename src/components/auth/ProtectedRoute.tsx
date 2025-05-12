// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           component: Component,
                                                           adminOnly = false,
                                                           ...rest
                                                       }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !user?.is_admin) {
        // Redirect to dashboard if the route requires admin but user isn't an admin
        return <Navigate to="/dashboard" replace />;
    }

    // If authenticated (and admin if required), render the protected component
    return <Component {...rest} />;
};

export default ProtectedRoute;