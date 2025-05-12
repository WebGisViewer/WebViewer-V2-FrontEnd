// src/pages/settings/SettingsPage.tsx
import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Divider,
    Alert,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings
            </Typography>

            <Paper sx={{ borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="settings tabs"
                >
                    <Tab icon={<SettingsIcon />} label="General" id="settings-tab-0" />
                    <Tab icon={<SecurityIcon />} label="Security" id="settings-tab-1" />
                    <Tab icon={<NotificationsIcon />} label="Notifications" id="settings-tab-2" />
                    <Tab icon={<PaletteIcon />} label="Appearance" id="settings-tab-3" />
                </Tabs>

                <Divider />

                <Box sx={{ p: 3 }}>
                    <Alert severity="info">
                        The Settings module is under development. This page will allow users to configure
                        application settings and preferences.
                    </Alert>

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        The Settings module will include:
                    </Typography>

                    <Box component="ul" sx={{ mt: 1 }}>
                        <li>User interface preferences</li>
                        <li>Map default settings</li>
                        <li>Security and access controls</li>
                        <li>Notification preferences</li>
                        <li>API keys and integrations</li>
                        <li>Theme and appearance options</li>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;