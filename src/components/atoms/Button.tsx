// src/components/atoms/Button.tsx
import React from 'react';
import { ActivityIndicator, Pressable, View, StyleSheet, Text, GestureResponderEvent, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../styles/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

type ButtonProps = {
    label: string;
    onPress: (event: GestureResponderEvent) => void;
    variant?: 'primary' | 'outline' | 'ghost' | 'gradient' | 'error' | 'glass';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    style?: any;
};

export const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    style,
}) => {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isGradient = variant === 'gradient';
    const isError = variant === 'error';
    const isGlass = variant === 'glass';

    const getBackground = () => {
        if (isPrimary) return theme.colors.primary;
        if (isOutline) return 'transparent';
        if (isGhost) return 'transparent';
        if (isError) return theme.colors.error;
        if (isGlass) return theme.colors.glass;
        return theme.colors.primary;
    };

    const getBorder = () => {
        if (isOutline) return theme.colors.primary;
        if (isGhost) return 'transparent';
        if (isGlass) return theme.colors.borderLight;
        return 'transparent';
    };

    const getTextColor = () => {
        if (isPrimary || isGradient) return theme.colors.textInverse;
        if (isOutline) return theme.colors.primary;
        if (isGhost) return theme.colors.textSecondary;
        if (isGlass) return theme.colors.text;
        return theme.colors.textInverse;
    };

    const getSize = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
            case 'large':
                return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 };
            default:
                return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
        }
    };

    const getOpacity = () => (disabled ? 0.5 : 1);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };



    if (isGradient) {
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled || loading}
                    style={({ pressed }) => [
                        styles.wrapper,
                        {
                            borderRadius: theme.radii.lg,
                            opacity: getOpacity(),
                            shadowColor: theme.colors.shadow,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            elevation: 8,
                        },
                        style,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: disabled || loading }}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={[
                        styles.gradientContent,
                        {
                            borderRadius: theme.radii.lg,
                            paddingVertical: getSize().paddingVertical,
                            paddingHorizontal: getSize().paddingHorizontal,
                        }
                    ]}>
                        <View style={styles.contentRow}>
                            {icon && iconPosition === 'left' && (
                                <Ionicons
                                    name={icon}
                                    size={getSize().fontSize - 2}
                                    color={getTextColor()}
                                    style={{ marginRight: 8 }}
                                />
                            )}
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={getTextColor()}
                                    style={{ marginRight: 8 }}
                                />
                            ) : null}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        color: getTextColor(),
                                        fontFamily: theme.fonts.semibold,
                                        fontSize: getSize().fontSize,
                                        letterSpacing: 0.3,
                                    },
                                ]}
                            >
                                {label}
                            </Text>
                            {icon && iconPosition === 'right' && (
                                <Ionicons
                                    name={icon}
                                    size={getSize().fontSize - 2}
                                    color={getTextColor()}
                                    style={{ marginLeft: 8 }}
                                />
                            )}
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.wrapper,
                    {
                        backgroundColor: getBackground(),
                        borderColor: getBorder(),
                        borderWidth: isOutline || isGlass ? 1 : 0,
                        opacity: getOpacity(),
                        borderRadius: theme.radii.lg,
                        paddingVertical: getSize().paddingVertical,
                        paddingHorizontal: getSize().paddingHorizontal,
                        shadowColor: theme.colors.shadow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isGlass ? 0.05 : 0.1,
                        shadowRadius: 8,
                        elevation: isGlass ? 2 : 4,
                    },
                    style,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || loading }}
            >
                <View style={styles.contentRow}>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={getSize().fontSize - 2}
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    ) : null}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontFamily: theme.fonts.semibold,
                                fontSize: getSize().fontSize,
                                letterSpacing: 0.3,
                            },
                        ]}
                    >
                        {label}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={getSize().fontSize - 2}
                            color={getTextColor()}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        minHeight: 44,
        overflow: 'hidden',
    },
    gradientContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
    },
});
