import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';
import { BatteryCard } from '../atoms/BatteryCard';
import { WiFiCard } from '../atoms/WiFiCard';

interface CameraCardProps {
    camera: {
        name: string;
        location: string;
        thumbnail: string;
        temperature: number;
        battery: number;
        wifi: number;
        isOnline: boolean;
    };
    onPress?: () => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onPress }) => {
    const { theme } = useTheme();

    return (
        <View style={{
            backgroundColor: theme.surface,
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: theme.elevation.card },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: theme.elevation.card
        }}>
            {/* 카메라 헤더 */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.sm
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                    <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: camera.isOnline ? theme.online : theme.offline
                    }} />
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 16,
                        color: theme.textPrimary
                    }}>
                        {camera.name}
                    </Text>
                </View>
                <TouchableOpacity onPress={onPress}>
                    <Ionicons name="camera-outline" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* 위치 정보 */}
            <Text style={{
                fontFamily: 'GoogleSans-Regular',
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: theme.spacing.md
            }}>
                <Ionicons name="location-outline" size={14} color={theme.textSecondary} /> {camera.location}
            </Text>

            {/* 미리보기 이미지 */}
            <View style={{
                borderRadius: theme.borderRadius.card,
                overflow: 'hidden',
                marginBottom: theme.spacing.md,
                position: 'relative'
            }}>
                <Image
                    source={{ uri: camera.thumbnail }}
                    style={{
                        width: '100%',
                        aspectRatio: 16 / 9,
                        backgroundColor: theme.surfaceVariant
                    }}
                />

                {/* LIVE 배지 */}
                <View style={{
                    position: 'absolute',
                    top: theme.spacing.sm,
                    left: theme.spacing.sm,
                    backgroundColor: theme.primary,
                    borderRadius: theme.borderRadius.small,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs
                }}>
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 12,
                        color: theme.onPrimary
                    }}>
                        LIVE
                    </Text>
                </View>

                {/* 온도 배지 */}
                <View style={{
                    position: 'absolute',
                    top: theme.spacing.sm,
                    right: theme.spacing.sm,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: theme.borderRadius.small,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xs
                }}>
                    <Ionicons name="thermometer-outline" size={14} color="#fff" />
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 12,
                        color: '#fff'
                    }}>
                        {camera.temperature}°C
                    </Text>
                </View>
            </View>

            {/* 상태 정보 */}
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <BatteryCard percent={camera.battery} />
                <WiFiCard dBm={camera.wifi} />
            </View>
        </View>
    );
}; 