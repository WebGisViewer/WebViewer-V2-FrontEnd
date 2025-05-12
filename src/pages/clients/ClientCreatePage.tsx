// src/pages/clients/ClientCreatePage.tsx
import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
    Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ClientCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1">
                    Create Client
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/clients')}
                >
                    Back to Clients
                </Button>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Alert severity="info">
                    The Client creation functionality is under development. This page will allow administrators
                    to add new client organizations to the system.
                </Alert>

                <Typography variant="body1" sx={{ mt: 2 }}>
                    The client creation form will include:
                </Typography>

                <Box component="ul" sx={{ mt: 1 }}>
                    <li>Organization details (name, contact information)</li>
                    <li>User account creation for client administrators</li>
                    <li>Project access configuration</li>
                    <li>Usage limits and permissions</li>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientCreatePage;