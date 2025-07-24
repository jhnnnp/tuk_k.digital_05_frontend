import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface QuickAction {
    id: string;
    title: string;
    icon: string;
    variant: 'filled' | 'outlined';
    onPress: () => void;
}

interface QuickActionBarProps {
    actions: QuickAction[];
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({ actions }) => {
    const { theme } = useTheme();

    return (
        <View style={{ marginVertical: theme.spacing.lg }}>
            <Text style={{
                fontFamily: 'GoogleSans-Medium',
                fontSize: 16,
                color: theme.textPrimary,
                marginBottom: theme.spacing.md
            }}>
                빠른 제어
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
                {/* 첫 번째 행 */}
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                    {actions.slice(0, 2).map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={{
                                flex: 1,
                                backgroundColor: action.variant === 'filled' ? theme.primary : 'transparent',
                                borderWidth: action.variant === 'outlined' ? 1 : 0,
                                borderColor: theme.primary,
                                borderRadius: theme.borderRadius.button,
                                paddingVertical: theme.spacing.md,
                                paddingHorizontal: theme.spacing.lg,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: theme.spacing.sm
                            }}
                            onPress={action.onPress}
                        >
                            <Ionicons
                                name={action.icon as any}
                                size={18}
                                color={action.variant === 'filled' ? theme.onPrimary : theme.primary}
                            />
                            <Text style={{
                                fontFamily: 'GoogleSans-Medium',
                                fontSize: 14,
                                color: action.variant === 'filled' ? theme.onPrimary : theme.primary
                            }}>
                                {action.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 두 번째 행 (있는 경우) */}
                {actions.length > 2 && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: theme.outline,
                            borderRadius: theme.borderRadius.button,
                            paddingVertical: theme.spacing.md,
                            paddingHorizontal: theme.spacing.lg,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: theme.spacing.sm
                        }}
                        onPress={actions[2].onPress}
                    >
                        <Ionicons
                            name={actions[2].icon as any}
                            size={18}
                            color={theme.textPrimary}
                        />
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 14,
                            color: theme.textPrimary
                        }}>
                            {actions[2].title}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}; 