// src/pages/layers/LayerCreatePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import LayerForm from '../../components/layers/LayerForm';

const LayerCreatePage: React.FC = () => {
    return (
        <Box>
            <LayerForm />
        </Box>
    );
};

export default LayerCreatePage;