// src/components/projects/StandaloneViewerButton.tsx
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

interface StandaloneViewerButtonProps {
    projectId: number;
}

const StandaloneViewerButton: React.FC<StandaloneViewerButtonProps> = ({ projectId }) => {
    const navigate = useNavigate();

    const openStandaloneViewer = () => {
        window.open(`/viewer/${projectId}`, '_blank');
    };

    return (
        <Tooltip title="Open in standalone viewer (no authentication required)">
            <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
                onClick={openStandaloneViewer}
                sx={{ position: 'absolute', top: 10, right: 270, zIndex: 1001 }}
            >
                Standalone View
            </Button>
        </Tooltip>
    );
};

export default StandaloneViewerButton;