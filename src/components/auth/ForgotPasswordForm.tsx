// src/components/auth/ForgotPasswordForm.tsx
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
    styled,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 400,
    width: '100%',
    borderRadius: 16,
    boxShadow: theme.shadows[3],
}));

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError('Failed to send password reset email. Please try again.');
            console.error('Password reset failed:', err);
        } finally {
            setIsLoading(false);
        }
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
    }}>
    <Box sx={{ textAlign: 'center', mb: 2 }}>
    <Typography variant="h4" component="h1" gutterBottom>
    Forgot Password
    </Typography>
    <Typography variant="body2" color="text.secondary">
        Enter your email to receive password reset instructions
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
            If an account exists with the email {email}, you will receive password reset
        instructions.
        </Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link
            component={RouterLink}
        to="/login"
        variant="body2"
        underline="hover"
            >
            Return to login
    </Link>
    </Box>
    </Box>
    ) : (
        <>
            <TextField
                label="Email Address"
        variant="outlined"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
        InputProps={{
        autoComplete: 'email',
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
    {isLoading ? 'Sending...' : 'Send Reset Link'}
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

    export default ForgotPasswordForm;