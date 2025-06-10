// src/components/viewer/StandaloneHeader.tsx
import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StandaloneHeaderProps {
    projectName?: string;
}

const HeaderContainer = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '48px',
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 2000, // Increased to ensure it's always on top
});

const Title = styled(Typography)({
    color: 'white',
    fontSize: '18px',
    fontWeight: 500,
});

const ContactLink = styled(Link)({
    color: 'white',
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
        textDecoration: 'underline',
    }
});

const StandaloneHeader: React.FC<StandaloneHeaderProps> = ({ projectName }) => {
    return (
        <HeaderContainer>
            <Title>
                Wireless2020 WebGisViewer
                {projectName && (
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 400,
                            ml: 2,
                            opacity: 0.9
                        }}
                    >
                        - {projectName}
                    </Typography>
                )}
            </Title>
            <ContactLink href="https://www.wireless2020.com/contact">
                Contact support
            </ContactLink>
        </HeaderContainer>
    );
};

export default StandaloneHeader;