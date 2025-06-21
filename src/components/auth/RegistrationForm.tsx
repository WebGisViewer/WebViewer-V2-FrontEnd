import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { checkUsernameAvailability, registerUser } from '../../services/authService';

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleUsernameBlur = async () => {
    if (!username.trim()) return;
    try {
      const response = await checkUsernameAvailability(username);
      setIsUsernameAvailable(response.available);
    } catch (err) {
      setIsUsernameAvailable(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser({ username, email, password });
      setSnackbarMessage('Registration successful! Redirecting to login...');
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={3}>Register</Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleUsernameBlur}
          margin="normal"
          required
          helperText={
            isUsernameAvailable === false
              ? 'Username is already taken.'
              : isUsernameAvailable === true
              ? 'Username is available.'
              : ''
          }
          error={isUsernameAvailable === false}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrationForm;
