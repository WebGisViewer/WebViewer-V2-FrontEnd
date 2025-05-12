// src/pages/clients/ClientEditPage.tsx
import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
    Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ClientEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

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
                    Edit Client
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
                    The Client editing functionality is under development. This page will allow administrators
                    to edit client organization details (Client ID: {id}).
                </Alert>

                <Typography variant="body1" sx={{ mt: 2 }}>
                    The client edit form will include:
                </Typography>

                <Box component="ul" sx={{ mt: 1 }}>
                    <li>Organization details (name, contact information)</li>
                    <li>User account management</li>
                    <li>Project access configuration</li>
                    <li>Usage analytics and history</li>
                    <li>Access link management</li>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientEditPage;
