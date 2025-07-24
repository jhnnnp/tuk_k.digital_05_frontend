import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface BatteryCardProps {
    percent: number;
    isCharging?: boolean;
}

export const BatteryCard: React.FC<BatteryCardProps> = ({ percent, isCharging = false }) => {
    const { theme } = useTheme();

    const getBatteryColor = (percent: number) => {
        if (percent >= 80) return theme.battery.high;
        if (percent >= 20) return theme.battery.medium;
        return theme.battery.low;
    };

    const getBatteryIcon = (percent: number, isCharging: boolean) => {
        if (isCharging) return 'battery-charging';
        if (percent >= 80) return 'battery-full';
        if (percent >= 60) return 'battery-three-quarters';
        if (percent >= 40) return 'battery-half';
        if (percent >= 20) return 'battery-quarter';
        return 'battery-dead';
    };

    const getStatusText = (percent: number) => {
        if (percent >= 80) return '높음';
        if (percent >= 50) return '보통';
        if (percent >= 20) return '낮음';
        return '위험';
    };

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
                name={getBatteryIcon(percent, isCharging) as any}
                size={18}
                color={getBatteryColor(percent)}
            />
            <View style={{ flex: 1, marginHorizontal: theme.spacing.xs }}>
                <View style={{
                    height: 6,
                    backgroundColor: theme.outline,
                    borderRadius: 3,
                    overflow: 'hidden'
                }}>
                    <View style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: getBatteryColor(percent)
                    }} />
                </View>
            </View>
            <Text style={{
                fontFamily: 'GoogleSans-Medium',
                fontSize: 14,
                color: getBatteryColor(percent)
            }}>
                {percent}%
            </Text>
        </View>
    );
}; 