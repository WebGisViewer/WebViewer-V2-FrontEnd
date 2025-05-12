// src/theme/components.ts
import { Components, Theme, PaletteMode } from '@mui/material';

/**
 * Custom theme components using proper MUI typing
 */
export const getComponents = (mode: PaletteMode): Components<Omit<Theme, "components">> => {
    return {
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                },
                body: {
                    margin: 0,
                    padding: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.3)',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#0d5fa9' : '#64b5f6',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: mode === 'light'
                        ? '0px 2px 4px rgba(0,0,0,0.05), 0px 4px 8px rgba(0,0,0,0.05)'
                        : '0px 4px 8px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12,
                },
                elevation1: {
                    boxShadow: mode === 'light'
                        ? '0px 2px 4px rgba(0,0,0,0.05), 0px 4px 8px rgba(0,0,0,0.05)'
                        : '0px 4px 8px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    background: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
                    borderBottom: `1px solid ${mode === 'light' ? '#e0e0e0' : '#424242'}`,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    paddingLeft: 16,
                    paddingRight: 16,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    minWidth: 100,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: mode === 'light' ? '#f5f5f5' : '#424242',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    };
};