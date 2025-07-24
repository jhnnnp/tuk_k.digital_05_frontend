import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface Feature {
    id: string;
    title: string;
    status: string;
    icon: string;
    color: string;
}

interface FeatureGridProps {
    features: Feature[];
    onFeaturePress?: (featureId: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features, onFeaturePress }) => {
    const { theme } = useTheme();

    return (
        <View style={{ marginVertical: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                {features.map((feature) => (
                    <TouchableOpacity
                        key={feature.id}
                        style={{
                            flex: 1,
                            backgroundColor: theme.surface,
                            borderRadius: theme.borderRadius.card,
                            padding: theme.spacing.md,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: theme.elevation.card },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: theme.elevation.card
                        }}
                        onPress={() => onFeaturePress?.(feature.id)}
                    >
                        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: feature.color + '20',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                            </View>
                            <Text style={{
                                fontFamily: 'GoogleSans-Medium',
                                fontSize: 12,
                                color: theme.textPrimary,
                                textAlign: 'center'
                            }}>
                                {feature.title}
                            </Text>
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 10,
                                color: theme.textSecondary,
                                textAlign: 'center'
                            }}>
                                {feature.status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}; 