import React from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Paper
} from '@mui/material';

interface MapLoadingOverlayProps {
    message?: string;
}

const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
                                                                 message = 'Loading map data...'
                                                             }) => {
    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 255, 255, 0.7)"
            zIndex={1200}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: '80%'
                }}
            >
                <CircularProgress size={40} />
                <Typography variant="body1" textAlign="center">
                    {message}
                </Typography>
            </Paper>
        </Box>
    );
};

export default MapLoadingOverlay;