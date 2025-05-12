// src/components/map/MapError.tsx
import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

interface MapErrorProps {
    message: string;
    onRetry?: () => void;
}

const MapError: React.FC<MapErrorProps> = ({ message, onRetry }) => {
    console.log('[MapError] Rendering error:', message);

    return (
        <Box p={3} textAlign="center">
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    maxWidth: 500,
                    mx: 'auto',
                    border: '1px solid #f44336'
                }}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Map Error
                </Typography>

                <Typography variant="body1" paragraph>
                    {message || 'An error occurred while loading the map'}
                </Typography>

                {onRetry && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onRetry}
                    >
                        Retry
                    </Button>
                )}

                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                    <Typography variant="caption" component="pre" sx={{ textAlign: 'left' }}>
                        {`Error details: ${message}`}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default MapError;