// src/theme/index.ts
import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { getComponents } from './components';

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

export const createAppTheme = (mode: PaletteMode): Theme => {
    const selectedPalette = mode === 'light' ? lightPalette : darkPalette;

    let theme = createTheme({
        palette: {
            mode,
            ...selectedPalette,
        },
        typography: typography,
        shape: {
            borderRadius: 8,
        },
        components: getComponents(mode),
    });

    theme = responsiveFontSizes(theme);

    return theme;
};

export default createAppTheme('light');