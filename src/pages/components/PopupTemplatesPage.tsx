// src/pages/components/PopupTemplatesPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import PopupTemplatesList from '../../components/popups/PopupTemplatesList';

const PopupTemplatesPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Popup Template Library
            </Typography>
            <PopupTemplatesList />
        </Box>
    );
};

export default PopupTemplatesPage;