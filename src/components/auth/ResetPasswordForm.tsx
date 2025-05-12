// src/components/auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Link,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    styled,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 400,
    width: '100%',
    borderRadius: 16,
    boxShadow: theme.shadows[3],
}));

const ResetPasswordForm: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { token, uidb64 } = useParams<{ token: string; uidb64: string }>();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!token || !uidb64) {
            setError('Invalid reset link');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(token, uidb64, password);
            setIsSubmitted(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError('Failed to reset password. The link may be invalid or expired.');
            console.error('Password reset failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <FormContainer elevation={3}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Reset Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter your new password
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {isSubmitted ? (
                    <Box>
                        <Alert severity="success">
                            Your password has been successfully reset. You will be redirected to the login page.
                        </Alert>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Link
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                underline="hover"
                            >
                                Go to login now
                            </Link>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <TextField
                            label="New Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                autoComplete: 'new-password',
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

                        <TextField
                            label="Confirm Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            InputProps={{
                                autoComplete: 'new-password',
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            disabled={isLoading}
                            startIcon={isLoading && <CircularProgress size={20} />}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                underline="hover"
                                sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                                <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Back to Sign In
                            </Link>
                        </Box>
                    </>
                )}
            </Box>
        </FormContainer>
    );
};

export default ResetPasswordForm;