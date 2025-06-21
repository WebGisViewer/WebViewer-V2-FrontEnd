import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import RegistrationForm from '../../components/auth/RegistrationForm';

const RegistrationPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box>
          <RegistrationForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default RegistrationPage;
