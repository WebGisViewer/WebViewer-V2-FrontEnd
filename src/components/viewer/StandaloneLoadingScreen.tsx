// src/components/viewer/StandaloneLoadingScreen.tsx
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StandaloneLoadingScreenProps {
    progress: number;
    projectName?: string;
}

const LoadingContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 48px)',
    marginTop: '48px',
    backgroundColor: '#f5f5f5',
});

const LoadingContent = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
});

const Spinner = styled(Box)({
    width: '60px',
    height: '60px',
    position: 'relative',
    '& svg': {
        animation: 'rotate 2s linear infinite',
        width: '100%',
        height: '100%',
    },
    '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    }
});

const ProgressBarContainer = styled(Box)({
    width: '600px',
    maxWidth: '90vw',
    marginTop: '20px',
});

const CustomLinearProgress = styled(LinearProgress)({
    height: '20px',
    borderRadius: '10px',
    backgroundColor: '#e0e0e0',
    '& .MuiLinearProgress-bar': {
        backgroundColor: '#4CAF50',
        borderRadius: '10px',
    }
});

const LoadingText = styled(Typography)({
    fontSize: '16px',
    color: '#333',
    marginTop: '10px',
});

const StandaloneLoadingScreen: React.FC<StandaloneLoadingScreenProps> = ({ progress, projectName }) => {
    return (
        <LoadingContainer>
            <LoadingContent>
                <Spinner>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#ddd" strokeWidth="2"/>
                        <path d="M12 2C6.48 2 2 6.48 2 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="2" r="1" fill="#4CAF50"/>
                        <circle cx="12" cy="2" r="1" fill="#4CAF50">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 12 12"
                                to="360 12 12"
                                dur="1s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </svg>
                </Spinner>

                <LoadingText>Loading your map...</LoadingText>

                <ProgressBarContainer>
                    <CustomLinearProgress variant="determinate" value={progress} />
                    <Box display="flex" justifyContent="center" mt={1}>
                        <Typography variant="body2" color="textSecondary">
                            Loading map... {Math.round(progress)}%
                        </Typography>
                    </Box>
                </ProgressBarContainer>

                {projectName && (
                    <Typography variant="h6" color="textSecondary" mt={2}>
                        {projectName}
                    </Typography>
                )}
            </LoadingContent>
        </LoadingContainer>
    );
};

export default StandaloneLoadingScreen;