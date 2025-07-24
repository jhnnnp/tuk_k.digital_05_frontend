import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    style?: any;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, style }) => {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: theme.fonts.size.lg }]}>{title}</Text>
            {subtitle && (
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular, fontSize: theme.fonts.size.sm }]}>{subtitle}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        marginTop: 8,
    },
    title: {
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        fontWeight: '400',
    },
}); 