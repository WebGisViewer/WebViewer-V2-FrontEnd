// src/pages/components/FunctionsPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import FunctionsList from '../../components/functions/FunctionsList';

const FunctionsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Function Library
            </Typography>
            <FunctionsList />
        </Box>
    );
};

export default FunctionsPage;

