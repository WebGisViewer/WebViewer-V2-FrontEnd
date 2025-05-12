// src/components/common/LoadingScreen.tsx
import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const LoadingScreen: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Loading...
            </Typography>
        </Box>
    );
};

export default LoadingScreen;