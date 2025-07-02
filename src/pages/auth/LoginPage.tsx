// src/pages/auth/LoginPage.tsx
import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import LoginForm from '../../components/auth/LoginForm.tsx';
import { Navigate, useLocation, type Location } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

const LoginPage: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const from =
        (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    const theme = useTheme();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.default,
                p: 2,
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                        WebGIS Viewer V2
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Advanced geospatial visualization platform
                    </Typography>
                </Box>

                <LoginForm redirectTo={from} />
            </Container>
        </Box>
    );
};

export default LoginPage;