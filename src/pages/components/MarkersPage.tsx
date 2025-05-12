// src/pages/components/MarkersPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import MarkersList from '../../components/markers/MarkersList';

const MarkersPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Marker Library
            </Typography>
            <MarkersList />
        </Box>
    );
};

export default MarkersPage;

