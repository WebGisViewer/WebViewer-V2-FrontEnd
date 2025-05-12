// src/components/map/MapLoadingOverlay.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const MapLoadingOverlay: React.FC = () => {
    console.log('[MapLoadingOverlay] Rendering loading overlay');

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgcolor="rgba(255, 255, 255, 0.7)"
            zIndex={1000}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
                Loading map data...
            </Typography>
        </Box>
    );
};

export default MapLoadingOverlay;