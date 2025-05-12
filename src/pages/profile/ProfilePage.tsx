// src/pages/profile/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Lock as LockIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../services/authService';

const ProfilePage: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Load user data when component mounts
    useEffect(() => {
        if (user) {
            setProfileData({
                ...profileData,
                full_name: user.full_name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setProfileSuccess(null);
        setProfileError(null);

        // Simulating API call for profile update
        setTimeout(() => {
            setProfileSuccess('Profile updated successfully!');
            setLoading(false);
        }, 1000);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setPasswordSuccess(null);
        setPasswordError(null);

        // Validate passwords
        if (profileData.newPassword !== profileData.confirmPassword) {
            setPasswordError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (profileData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        // Simulating API call for password update
        setTimeout(() => {
            setPasswordSuccess('Password changed successfully!');
            setProfileData({
                ...profileData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setLoading(false);
        }, 1000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardHeader title="Personal Information" />
                        <Divider />
                        <CardContent>
                            <Box component="form" onSubmit={handleProfileSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                                        <Avatar
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                fontSize: 40,
                                                bgcolor: 'primary.main',
                                            }}
                                        >
                                            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                        </Avatar>
                                    </Grid>

                                    {profileSuccess && (
                                        <Grid item xs={12}>
                                            <Alert severity="success" onClose={() => setProfileSuccess(null)}>
                                                {profileSuccess}
                                            </Alert>
                                        </Grid>
                                    )}

                                    {profileError && (
                                        <Grid item xs={12}>
                                            <Alert severity="error" onClose={() => setProfileError(null)}>
                                                {profileError}
                                            </Alert>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Username"
                                            value={user?.username || ''}
                                            fullWidth
                                            disabled
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="full_name"
                                            label="Full Name"
                                            value={profileData.full_name}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="email"
                                            label="Email Address"
                                            type="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>

                                    {user?.client_name && (
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Organization"
                                                value={user.client_name}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                        <CardHeader title="Change Password" />
                        <Divider />
                        <CardContent>
                            <Box component="form" onSubmit={handlePasswordSubmit}>
                                <Grid container spacing={2}>
                                    {passwordSuccess && (
                                        <Grid item xs={12}>
                                            <Alert severity="success" onClose={() => setPasswordSuccess(null)}>
                                                {passwordSuccess}
                                            </Alert>
                                        </Grid>
                                    )}

                                    {passwordError && (
                                        <Grid item xs={12}>
                                            <Alert severity="error" onClose={() => setPasswordError(null)}>
                                                {passwordError}
                                            </Alert>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <TextField
                                            name="currentPassword"
                                            label="Current Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={profileData.currentPassword}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            aria-label="toggle password visibility"
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="newPassword"
                                            label="New Password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={profileData.newPassword}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            edge="end"
                                                            aria-label="toggle password visibility"
                                                        >
                                                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="confirmPassword"
                                            label="Confirm New Password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={profileData.confirmPassword}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                            disabled={loading}
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardHeader title="Account Summary" />
                        <Divider />
                        <CardContent>
                            <List disablePadding>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Role"
                                        secondary={user?.is_admin ? 'Administrator' : 'Regular User'}
                                    />
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Account Status"
                                        secondary="Active"
                                    />
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Last Login"
                                        secondary={user?.last_login || 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Member Since"
                                        secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>

                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                        <CardHeader title="Help & Support" />
                        <Divider />
                        <CardContent>
                            <Typography variant="body2" paragraph>
                                Need help with your account or have questions about WebGIS Viewer?
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                Documentation
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                            >
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;