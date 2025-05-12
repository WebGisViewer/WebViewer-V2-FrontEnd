// src/theme/typography.ts
import { TypographyVariantsOptions } from '@mui/material/styles';

// Define typography configuration
export const typography: TypographyVariantsOptions = {
    fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(','),
    h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
    },
    h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
    },
    h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.4,
    },
    h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
    },
    h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
    },
    h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
    },
    body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
    },
    body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
    },
    subtitle1: {
        fontSize: '1rem',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    subtitle2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    button: {
        textTransform: 'none' as const, // Explicitly type as const
        fontWeight: 500,
    },
    caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
    },
    overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const, // Explicitly type as const
        letterSpacing: '0.5px',
    },
};