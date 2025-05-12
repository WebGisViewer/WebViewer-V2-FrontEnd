// src/pages/components/PopupTemplateCreatePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import PopupTemplateForm from '../../components/popups/PopupTemplateForm';

const PopupTemplateCreatePage: React.FC = () => {
    return (
        <Box>
            <PopupTemplateForm />
        </Box>
    );
};

export default PopupTemplateCreatePage;