import { Platform } from 'react-native';

// Material3 Design Tokens for TIBO App
export const colors = {
    // Primary Brand Colors
    primary: '#4A90E2', // 파스텔 블루
    onPrimary: '#FFFFFF',

    // Surface Colors
    surface: '#FFFFFF',
    onSurface: '#29588A',
    surfaceVariant: '#E3F2FD', // 연한 하늘색

    // Outline & Borders
    outline: '#B3E5FC', // 연하늘색

    // Status Colors
    error: '#F44336',
    success: '#1CC38C',
    warning: '#FFC107',
    info: '#4A90E2',

    // Text Colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',

    // Background Colors
    background: '#FFFFFF',
    backgroundSecondary: '#F7F9F9',

    // Status Indicators
    online: '#1CC38C',
    offline: '#F44336',
    battery: {
        high: '#1CC38C',
        medium: '#FFC107',
        low: '#F44336'
    },
    wifi: {
        excellent: '#1CC38C',
        good: '#4A90E2',
        fair: '#FFC107',
        poor: '#F44336'
    }
};

export const darkColors = {
    // Primary Brand Colors
    primary: '#1CC38C',
    onPrimary: '#FFFFFF',

    // Surface Colors
    surface: '#121212',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1E1E1E',

    // Outline & Borders
    outline: '#424242',

    // Status Colors
    error: '#F44336',
    success: '#1CC38C',
    warning: '#FFC107',
    info: '#4A90E2',

    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#666666',

    // Background Colors
    background: '#121212',
    backgroundSecondary: '#1E1E1E',

    // Status Indicators
    online: '#1CC38C',
    offline: '#F44336',
    battery: {
        high: '#1CC38C',
        medium: '#FFC107',
        low: '#F44336'
    },
    wifi: {
        excellent: '#1CC38C',
        good: '#4A90E2',
        fair: '#FFC107',
        poor: '#F44336'
    }
};

export const commonConfig = {
    // Elevation (Material3)
    elevation: {
        card: 2,
        modal: 4,
        floating: 6
    },

    // Border Radius
    borderRadius: {
        card: 16,
        button: 12,
        small: 8,
        large: 24
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
    },

    // Typography
    typography: {
        title: {
            fontFamily: 'GoogleSans-Medium',
            fontSize: 16,
            lineHeight: 24
        },
        body: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 14,
            lineHeight: 20
        },
        caption: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 12,
            lineHeight: 16
        },
        button: {
            fontFamily: 'GoogleSans-Medium',
            fontSize: 14,
            lineHeight: 20
        }
    },

    // Animation
    animation: {
        duration: {
            fast: 150,
            normal: 300,
            slow: 500
        },
        easing: {
            easeInOut: 'ease-in-out',
            easeOut: 'ease-out',
            easeIn: 'ease-in'
        }
    }
};

export const lightTheme = {
    ...colors,
    ...commonConfig
};

export const darkTheme = {
    ...darkColors,
    ...commonConfig
};

export const theme = lightTheme;

export default theme; 