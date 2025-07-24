// src/components/layout/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

interface CardProps {
    style?: ViewStyle;
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'elevated' | 'outlined';
    padding?: 'none' | 'small' | 'medium' | 'large';
    margin?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
    style,
    children,
    variant = 'default',
    padding = 'medium',
    margin = 'medium'
}) => {
    const { theme } = useTheme();

    const getPadding = () => {
        switch (padding) {
            case 'none': return 0;
            case 'small': return theme.spacing.sm;
            case 'large': return theme.spacing.xl;
            default: return theme.spacing.lg;
        }
    };

    const getMargin = () => {
        switch (margin) {
            case 'none': return 0;
            case 'small': return theme.spacing.sm;
            case 'large': return theme.spacing.xl;
            default: return theme.spacing.md;
        }
    };

    const getCardStyle = () => {
        const baseStyle = {
            borderRadius: theme.borderRadius.card, // 수정: theme.radii.lg -> theme.borderRadius.card
            padding: getPadding(),
            margin: getMargin(),
        };

        switch (variant) {
            case 'glass':
                return {
                    ...baseStyle,
                    backgroundColor: theme.glass,
                    borderWidth: 1,
                    borderColor: theme.borderLight,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 2,
                };
            case 'elevated':
                return {
                    ...baseStyle,
                    backgroundColor: theme.surface,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16,
                    elevation: 8,
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.border,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: theme.surface,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                };
        }
    };

    return (
        <View style={[styles.card, getCardStyle(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
    },
});
