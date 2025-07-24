import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface SystemInfo {
    firmwareVersion: string;
    deviceId: string;
    lastUpdate: string;
}

interface SystemInfoCardProps {
    info: SystemInfo;
}

export const SystemInfoCard: React.FC<SystemInfoCardProps> = ({ info }) => {
    const { theme } = useTheme();

    const infoItems = [
        { label: '펌웨어 버전', value: info.firmwareVersion, icon: 'hardware-chip-outline' },
        { label: '디바이스 ID', value: info.deviceId, icon: 'phone-portrait-outline' },
        { label: '마지막 업데이트', value: info.lastUpdate, icon: 'time-outline' }
    ];

    return (
        <View style={{
            backgroundColor: theme.surface,
            borderRadius: theme.borderRadius.card,
            padding: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: theme.elevation.card },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: theme.elevation.card
        }}>
            <Text style={{
                fontFamily: 'GoogleSans-Medium',
                fontSize: 16,
                color: theme.textPrimary,
                marginBottom: theme.spacing.md
            }}>
                시스템 정보
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
                {infoItems.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: theme.spacing.xs
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                            <Ionicons name={item.icon as any} size={16} color={theme.textSecondary} />
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 14,
                                color: theme.textSecondary
                            }}>
                                {item.label}
                            </Text>
                        </View>
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 14,
                            color: theme.textPrimary
                        }}>
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}; 