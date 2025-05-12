// src/pages/debug/ApiInspectorPage.tsx
import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import ApiResponseInspector from '../../components/debug/ApiResponseInspector';
import { Link as RouterLink } from 'react-router-dom';

const ApiInspectorPage: React.FC = () => {
    return (
        <Box p={3}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/dashboard">
                    Dashboard
                </Link>
                <Typography color="text.primary">API Inspector</Typography>
            </Breadcrumbs>

            <Typography variant="h4" gutterBottom>
                API Response Inspector
            </Typography>

            <Typography variant="body1" paragraph>
                This tool helps you inspect the API responses for debugging purposes.
            </Typography>

            <ApiResponseInspector />
        </Box>
    );
};

export default ApiInspectorPage;