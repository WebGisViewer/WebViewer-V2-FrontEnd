// src/components/map/popups/FeaturePopup.tsx
import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    styled,
} from '@mui/material';
import {
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
} from '@mui/icons-material';

const PopupCard = styled(Card)(({ theme }) => ({
    width: 300,
    maxWidth: '100%',
    maxHeight: 400,
    overflowY: 'auto',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
}));

const PopupHeader = styled(CardHeader)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiCardHeader-title': {
        fontSize: '1rem',
    },
    '& .MuiCardHeader-subheader': {
        color: alpha(theme.palette.primary.contrastText, 0.7),
    },
}));

interface FeaturePopupProps {
    feature: {
        id: string;
        properties: Record<string, any>;
        layerId: number;
        layerName: string;
    };
    onClose: () => void;
    onZoomToFeature: (featureId: string, layerId: number) => void;
}

const FeaturePopup: React.FC<FeaturePopupProps> = ({ feature, onClose, onZoomToFeature }) => {
    const { id, properties, layerId, layerName } = feature;

    // Filter out internal properties that start with underscore
    const displayProperties = Object.entries(properties).filter(
        ([key]) => !key.startsWith('_') && key !== 'id'
    );

    return (
        <PopupCard>
            <PopupHeader
                title={properties.name || properties.title || `Feature ${id}`}
                subheader={layerName}
                action={
                    <Box>
                        <IconButton
                            aria-label="zoom to feature"
                            size="small"
                            sx={{ color: 'white' }}
                            onClick={() => onZoomToFeature(id, layerId)}
                        >
                            <ZoomInIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            aria-label="close"
                            size="small"
                            sx={{ color: 'white' }}
                            onClick={onClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                }
            />
            <CardContent sx={{ p: 0 }}>
                <List dense disablePadding>
                    {displayProperties.map(([key, value]) => (
                        <React.Fragment key={key}>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" color="textSecondary">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        </PopupCard>
    );
};

export default FeaturePopup;