import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';
import AnimatedProgressBar from './AnimatedProgressBar';

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
            <View style={{ flex: 1, marginHorizontal: theme.spacing.xs }}>
                <AnimatedProgressBar
                    value={level * 25} // 1-4 레벨을 25-100%로 변환
                    maxValue={100}
                    height={6}
                    borderRadius={3}
                    showPercentage={false}
                    showLabel={false}
                    animationDuration={500}
                />
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