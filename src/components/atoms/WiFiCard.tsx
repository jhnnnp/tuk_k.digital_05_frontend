import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface WiFiCardProps {
    dBm: number;
    ssid?: string;
}

export const WiFiCard: React.FC<WiFiCardProps> = ({ dBm, ssid }) => {
    const { theme } = useTheme();

    const getWiFiLevel = (dBm: number) => {
        if (dBm >= -50) return 4;
        if (dBm >= -60) return 3;
        if (dBm >= -70) return 2;
        return 1;
    };

    const getWiFiColor = (dBm: number) => {
        if (dBm >= -50) return theme.wifi.excellent;
        if (dBm >= -60) return theme.wifi.good;
        if (dBm >= -70) return theme.wifi.fair;
        return theme.wifi.poor;
    };

    const getStatusText = (dBm: number) => {
        if (dBm >= -50) return '우수';
        if (dBm >= -60) return '좋음';
        if (dBm >= -70) return '보통';
        return '약함';
    };

    const level = getWiFiLevel(dBm);
    const color = getWiFiColor(dBm);

    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.surfaceVariant,
            borderRadius: theme.borderRadius.card,
            padding: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm
        }}>
            <Ionicons
                name="wifi"
                size={18}
                color={color}
            />
            <View style={{ flexDirection: 'row', gap: 2 }}>
                {[1, 2, 3, 4].map((barLevel) => (
                    <View
                        key={barLevel}
                        style={{
                            width: 16,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: barLevel <= level ? color : theme.outline,
                            opacity: barLevel <= level ? 1 : 0.2
                        }}
                    />
                ))}
            </View>
            <Text style={{
                fontFamily: 'GoogleSans-Medium',
                fontSize: 14,
                color: color
            }}>
                {dBm} dBm
            </Text>
        </View>
    );
}; 