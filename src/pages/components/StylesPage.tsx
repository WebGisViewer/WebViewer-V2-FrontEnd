// src/pages/components/StylesPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import StylesList from '../../components/styles/StylesList';

const StylesPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Style Library
            </Typography>
            <StylesList />
        </Box>
    );
};

export default StylesPage;