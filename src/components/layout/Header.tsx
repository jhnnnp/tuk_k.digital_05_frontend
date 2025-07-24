import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface HeaderProps {
    title: string;
    subtitle?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    onLeftPress?: () => void;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightPress?: () => void;
    style?: any;
    variant?: 'default' | 'glass' | 'transparent';
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    leftIcon,
    onLeftPress,
    rightIcon,
    onRightPress,
    style,
    variant = 'default',
}) => {
    const { theme } = useTheme();

    const getContainerStyle = () => {
        switch (variant) {
            case 'glass':
                return {
                    backgroundColor: theme.colors.glass,
                    borderBottomColor: theme.colors.borderLight,
                };
            case 'transparent':
                return {
                    backgroundColor: 'transparent',
                    borderBottomColor: 'transparent',
                };
            default:
                return {
                    backgroundColor: theme.colors.background,
                    borderBottomColor: theme.colors.borderLight,
                };
        }
    };

    return (
        <View style={[styles.container, getContainerStyle(), style]}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            <View style={styles.content}>
                {leftIcon ? (
                    <TouchableOpacity
                        onPress={onLeftPress}
                        style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name={leftIcon} size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                ) : <View style={styles.iconButton} />}

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {rightIcon ? (
                    <TouchableOpacity
                        onPress={onRightPress}
                        style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name={rightIcon} size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                ) : <View style={styles.iconButton} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 44, // Safe area
        paddingBottom: 12,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 44,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: 'SF Pro Display-Semibold',
        textAlign: 'center',
        lineHeight: 22,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'SF Pro Text',
        textAlign: 'center',
        marginTop: 2,
        lineHeight: 16,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
}); 