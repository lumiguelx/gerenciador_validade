/**
 * Theme Configuration - Purple Modern
 */

import { designTokens } from './design-tokens';

export const theme = {
  light: {
    background: '#FAFAFA',
    foreground: '#18181B',

    card: {
      background: '#FFFFFF',
      border: '#E4E4E7',
      hover: '#FAFAFA',
    },

    input: {
      background: '#FFFFFF',
      border: '#E4E4E7',
      focus: designTokens.colors.primary[500],
      placeholder: '#A1A1AA',
    },

    text: {
      primary: '#18181B',
      secondary: '#52525B',
      tertiary: '#A1A1AA',
      inverse: '#FFFFFF',
    },

    button: {
      primary: {
        background: designTokens.colors.primary[600],
        hover: designTokens.colors.primary[700],
        text: '#FFFFFF',
      },
      secondary: {
        background: '#F4F4F5',
        hover: '#E4E4E7',
        text: '#18181B',
      },
      destructive: {
        background: designTokens.colors.danger[500],
        hover: designTokens.colors.danger[600],
        text: '#FFFFFF',
      },
    },
  },

  dark: {
    background: '#0C0A14',
    foreground: '#FAFAFA',

    card: {
      background: '#1A1625',
      border: '#2D2640',
      hover: '#221D30',
    },

    input: {
      background: '#1A1625',
      border: '#2D2640',
      focus: designTokens.colors.primary[500],
      placeholder: '#71717A',
    },

    text: {
      primary: '#FAFAFA',
      secondary: '#D4D4D8',
      tertiary: '#A1A1AA',
      inverse: '#18181B',
    },

    button: {
      primary: {
        background: designTokens.colors.primary[600],
        hover: designTokens.colors.primary[500],
        text: '#FFFFFF',
      },
      secondary: {
        background: '#2D2640',
        hover: '#3D3455',
        text: '#FAFAFA',
      },
      destructive: {
        background: designTokens.colors.danger[500],
        hover: designTokens.colors.danger[600],
        text: '#FFFFFF',
      },
    },
  },
} as const;

export { designTokens };

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
