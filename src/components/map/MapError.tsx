import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface MapErrorProps {
    message?: string;
    onRetry?: () => void;
}

const MapError: React.FC<MapErrorProps> = ({
                                               message = 'An error occurred while loading the map',
                                               onRetry
                                           }) => {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            width="100%"
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: 400
                }}
            >
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />

                <Typography variant="h6" textAlign="center" color="error">
                    Map Error
                </Typography>

                <Typography variant="body1" textAlign="center" color="text.secondary">
                    {message}
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                    sx={{ mt: 2 }}
                >
                    Try Again
                </Button>
            </Paper>
        </Box>
    );
};

export default MapError;