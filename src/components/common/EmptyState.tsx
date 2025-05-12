/* src/components/common/EmptyState.tsx */
import React from 'react';
import { Box, Typography, Paper, Button, SvgIconProps, SvgIcon } from '@mui/material';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<SvgIconProps>;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    height?: string | number;
    elevation?: number;
    children?: React.ReactNode;
}

/**
 * EmptyState component for displaying when there's no data
 */
const EmptyState: React.FC<EmptyStateProps> = ({
                                                   title,
                                                   description,
                                                   icon: Icon,
                                                   action,
                                                   secondaryAction,
                                                   height = 400,
                                                   elevation = 0,
                                                   children,
                                               }) => {
    return (
        <Paper
            elevation={elevation}
            sx={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                borderRadius: 2,
            }}
        >
            <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
                {Icon && (
                    <Icon
                        sx={{
                            fontSize: 64,
                            mb: 2,
                            color: 'action.active',
                            opacity: 0.6,
                        }}
                    />
                )}

                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>

                {description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {description}
                    </Typography>
                )}

                {children}

                {(action || secondaryAction) && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {secondaryAction && (
                            <Button variant="outlined" onClick={secondaryAction.onClick}>
                                {secondaryAction.label}
                            </Button>
                        )}

                        {action && (
                            <Button variant="contained" color="primary" onClick={action.onClick}>
                                {action.label}
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default EmptyState;