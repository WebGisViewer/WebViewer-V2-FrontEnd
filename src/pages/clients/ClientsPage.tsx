// src/pages/clients/ClientsPage.tsx
import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ClientsPage: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateClient = () => {
        navigate('/clients/create');
    };

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
                    Clients
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClient}
                >
                    Create Client
                </Button>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Alert severity="info">
                    The Clients module is under development. This page will allow administrators to manage external organizations
                    who have access to specific projects in the system.
                </Alert>

                <Typography variant="body1" sx={{ mt: 2 }}>
                    The Clients module will include:
                </Typography>

                <Box component="ul" sx={{ mt: 1 }}>
                    <li>Client organization management</li>
                    <li>User accounts associated with each client</li>
                    <li>Project sharing and access control</li>
                    <li>Unique access links for secure sharing</li>
                    <li>Usage analytics and tracking</li>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientsPage;