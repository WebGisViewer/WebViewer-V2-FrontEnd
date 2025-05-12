// src/theme/palette.ts
import { PaletteOptions } from '@mui/material';

// Define the light palette
export const lightPalette: PaletteOptions = {
    mode: 'light',
    primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
    },
    secondary: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
        contrastText: '#fff',
    },
    success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
        contrastText: '#fff',
    },
    error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
        contrastText: '#fff',
    },
    warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
        contrastText: '#fff',
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
        contrastText: '#fff',
    },
    grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
    },
    background: {
        default: '#f5f5f5',
        paper: '#ffffff',
    },
    text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)',
    },
};

// Define the dark palette
export const darkPalette: PaletteOptions = {
    mode: 'dark',
    primary: {
        main: '#90caf9',
        light: '#e3f2fd',
        dark: '#42a5f5',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
        main: '#66bb6a',
        light: '#e8f5e9',
        dark: '#43a047',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    success: {
        main: '#66bb6a',
        light: '#e8f5e9',
        dark: '#43a047',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#fff',
    },
    warning: {
        main: '#ffa726',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
        main: '#29b6f6',
        light: '#4fc3f7',
        dark: '#0288d1',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
    },
    background: {
        default: '#121212',
        paper: '#1e1e1e',
    },
    text: {
        primary: '#fff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
    },
};