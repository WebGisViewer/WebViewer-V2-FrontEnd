// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Link,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
    styled,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 400,
    width: '100%',
    borderRadius: 16,
    boxShadow: theme.shadows[3],
}));

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, isLoading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        clearError();
        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <FormContainer elevation={3}>
            <Box
                component="form"
                onSubmit={handleLogin}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to access WebGIS Viewer V2
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={clearError}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    InputProps={{
                        autoComplete: 'username',
                    }}
                />

                <TextField
                    label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                        autoComplete: 'current-password',
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Link
                        component={RouterLink}
                        to="/forgot-password"
                        variant="body2"
                        underline="hover"
                    >
                        Forgot password?
                    </Link>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </Box>
        </FormContainer>
    );
};

export default LoginForm;