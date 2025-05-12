/* src/components/common/StatusBadge.tsx */
import React from 'react';
import { Badge, Box, Tooltip, styled } from '@mui/material';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'info';
    text?: string;
    size?: 'small' | 'medium' | 'large';
    withDot?: boolean;
    withPulse?: boolean;
}

// Define colors for each status
const statusColors = {
    active: '#4caf50',    // Green
    inactive: '#9e9e9e',  // Grey
    pending: '#ff9800',   // Orange
    success: '#4caf50',   // Green
    warning: '#ff9800',   // Orange
    error: '#f44336',     // Red
    info: '#2196f3',      // Blue
};

// Define tooltips for each status
const statusTooltips = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    info: 'Information',
};

// Define dot sizes
const dotSizes = {
    small: 8,
    medium: 10,
    large: 12,
};

const PulseDot = styled(Box)<{ color: string }>(({ theme, color }) => ({
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'pulse 1.5s ease-in-out infinite',
        zIndex: -1,
    },
    '@keyframes pulse': {
        '0%': {
            transform: 'scale(1)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.5)',
            opacity: 0,
        },
    },
}));

/**
 * StatusBadge component for displaying status indicators
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
                                                     status,
                                                     text,
                                                     size = 'medium',
                                                     withDot = true,
                                                     withPulse = false,
                                                 }) => {
    const color = statusColors[status];
    const tooltipText = text || statusTooltips[status];
    const dotSize = dotSizes[size];

    const renderDot = () => {
        const dot = (
            <Box
                sx={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                }}
            />
        );

        if (withPulse) {
            return (
                <PulseDot color={color}>
                    {dot}
                </PulseDot>
            );
        }

        return dot;
    };

    if (withDot) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={tooltipText}>
                    {renderDot()}
                </Tooltip>
                {text && (
                    <Box
                        component="span"
                        sx={{
                            fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
                            color: 'text.secondary',
                        }}
                    >
                        {text}
                    </Box>
                )}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'inline-block',
                backgroundColor: `${color}20`, // 20% opacity
                color,
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
                fontWeight: 'medium',
            }}
        >
            {tooltipText}
        </Box>
    );
};

export default StatusBadge;