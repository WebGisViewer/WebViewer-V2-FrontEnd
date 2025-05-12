// src/pages/layers/LayersPage.tsx
import React from 'react';
import { Box } from '@mui/material';
import LayerList from '../../components/layers/LayerList';

const LayersPage: React.FC = () => {
    return (
        <Box>
            <LayerList />
        </Box>
    );
};

export default LayersPage;