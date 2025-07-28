import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Material3 Design Tokens for TIBO App
export const colors = {
    // Primary Brand Colors
    primary: '#5B9BD5', // 진한 파란색
    onPrimary: '#FFFFFF',

    // Surface Colors
    surface: '#FFFFFF',
    onSurface: '#3b82f6',
    surfaceVariant: '#eff6ff', // 유리글라스 배경

    // Outline & Borders
    outline: '#bfdbfe', // 유리글라스 테두리

    // Status Colors
    error: '#F44336',
    success: '#1CC38C',
    warning: '#FFC107',
    info: '#60a5fa',

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
        good: '#5B9BD5',
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
    info: '#60a5fa',

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
        good: '#60a5fa',
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
    ...commonConfig,
    // 추가 속성들
    background: colors.background,
    surface: colors.surface,
    primary: colors.primary,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    outline: colors.outline,
};

export const darkTheme = {
    ...darkColors,
    ...commonConfig,
    // 추가 속성들
    background: darkColors.background,
    surface: darkColors.surface,
    primary: darkColors.primary,
    textPrimary: darkColors.textPrimary,
    textSecondary: darkColors.textSecondary,
    outline: darkColors.outline,
};

export const theme = lightTheme;

// 통합된 테마 시스템 (새로운 컴포넌트용)
export const unifiedTheme = {
    colors: {
        primary: '#29588A',      // 메인 파란색
        primaryLight: '#3B82F6', // 밝은 파란색
        success: '#10B981',      // 성공/온라인 초록색
        warning: '#F59E0B',      // 경고 주황색
        danger: '#EF4444',       // 위험 빨간색
        info: '#60a5fa',         // 정보 파란색
        background: '#FFFFFF',    // 배경색
        surface: '#F8FAFC',      // 카드 배경색
        text: {
            primary: '#1F2937',    // 주요 텍스트
            secondary: '#6B7280',  // 보조 텍스트
            disabled: '#9CA3AF',   // 비활성 텍스트
            inverse: '#FFFFFF',    // 반전 텍스트
        },
        gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },
        switch: {
            active: '#29588A',
            inactive: '#E5E7EB',
            thumb: '#FFFFFF',
        },
        status: {
            online: '#10B981',
            offline: '#6B7280',
            warning: '#F59E0B',
            danger: '#EF4444',
        },
        pastel: {
            red: '#FFB3B3',      // 파스텔 빨간색
            blue: '#B3D9FF',     // 파스텔 하늘색
            green: '#B3E5B3',    // 파스텔 초록색
            yellow: '#FFE5B3',   // 파스텔 노란색
            purple: '#E5B3FF',   // 파스텔 보라색
            pink: '#FFB3E5',     // 파스텔 분홍색
        }
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    typography: {
        h1: {
            fontSize: 32,
            fontWeight: 'bold',
            lineHeight: 40,
        },
        h2: {
            fontSize: 28,
            fontWeight: 'bold',
            lineHeight: 36,
        },
        h3: {
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 32,
        },
        h4: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            fontWeight: 'normal',
            lineHeight: 24,
        },
        caption: {
            fontSize: 14,
            fontWeight: 'normal',
            lineHeight: 20,
        },
        small: {
            fontSize: 12,
            fontWeight: 'normal',
            lineHeight: 16,
        },
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
    },

    animation: {
        duration: {
            fast: 150,
            normal: 200,
            slow: 300,
        },
        easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
        },
    },

    layout: {
        screenWidth: width,
        screenHeight: height,
        maxWidth: 400,
    },
};

export default theme; 