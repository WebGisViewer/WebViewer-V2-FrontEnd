// src/pages/auth/ForgotPasswordPage.tsx
import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const theme = useTheme();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
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
                        Account Recovery
                    </Typography>
                </Box>

                <ForgotPasswordForm />
            </Container>
        </Box>
    );
};

export default ForgotPasswordPage;