// src/pages/components/FunctionCodePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import FunctionCodeView from '../../components/functions/FunctionCodeView';

const FunctionCodePage: React.FC = () => {
    return (
        <Box>
            <FunctionCodeView />
        </Box>
    );
};

export default FunctionCodePage;