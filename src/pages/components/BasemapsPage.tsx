// src/pages/components/BasemapsPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import BasemapsList from '../../components/basemaps/BasemapsList';

const BasemapsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Basemap Library
            </Typography>
            <BasemapsList />
        </Box>
    );
};

export default BasemapsPage;