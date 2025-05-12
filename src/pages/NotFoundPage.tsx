// src/pages/NotFoundPage.tsx
import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <Container maxWidth="md">
            <Paper elevation={2} sx={{ py: 5, px: 4, mt: 4, borderRadius: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h1" color="text.secondary" sx={{ fontSize: '120px', mb: 2 }}>
                        404
                    </Typography>

                    <Typography variant="h4" gutterBottom>
                        Page Not Found
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                        The page you're looking for doesn't exist or has been moved.
                        Check the URL or go back to the dashboard.
                    </Typography>

                    <Button
                        component={Link}
                        to="/dashboard"
                        variant="contained"
                        color="primary"
                        startIcon={<HomeIcon />}
                        size="large"
                    >
                        Go to Dashboard
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default NotFoundPage;