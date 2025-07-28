import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { unifiedTheme as theme } from '../../styles/theme';

interface AnimatedProgressBarProps {
    value: number; // 0-100 사이의 값
    maxValue?: number;
    color?: string;
    backgroundColor?: string;
    height?: number;
    borderRadius?: number;
    showPercentage?: boolean;
    showLabel?: boolean;
    label?: string;
    animationDuration?: number;
    style?: ViewStyle;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
    value,
    maxValue = 100,
    color = theme.colors.success,
    backgroundColor = theme.colors.gray[200],
    height = 8,
    borderRadius = theme.borderRadius.full,
    showPercentage = true,
    showLabel = true,
    label,
    animationDuration = theme.animation.duration.slow,
    style,
}) => {
    const progressAnim = useSharedValue(0);
    const opacityAnim = useSharedValue(0);

    useEffect(() => {
        const normalizedValue = Math.min(Math.max(value, 0), maxValue);
        const percentage = (normalizedValue / maxValue) * 100;

        progressAnim.value = withTiming(percentage, {
            duration: animationDuration,
        });

        opacityAnim.value = withSpring(1, {
            damping: 15,
            stiffness: 100,
        });
    }, [value, maxValue, animationDuration]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressAnim.value}%`,
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacityAnim.value,
    }));

    // 색상 결정 로직
    const getProgressColor = (val: number) => {
        if (val >= 80) return theme.colors.success;
        if (val >= 50) return theme.colors.warning;
        return theme.colors.danger;
    };

    const progressColor = getProgressColor(value);

    return (
        <Animated.View style={[containerStyle, style]}>
            {showLabel && label && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                    <Text style={{
                        fontSize: theme.typography.small.fontSize,
                        color: theme.colors.text.secondary,
                        fontWeight: '500'
                    }}>
                        {label}
                    </Text>
                    {showPercentage && (
                        <Text style={{
                            fontSize: theme.typography.small.fontSize,
                            color: theme.colors.text.secondary,
                            fontWeight: '600'
                        }}>
                            {Math.round(value)}%
                        </Text>
                    )}
                </View>
            )}

            <View style={{
                height,
                backgroundColor,
                borderRadius,
                overflow: 'hidden',
            }}>
                <Animated.View style={[{
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius,
                }, progressStyle]} />
            </View>
        </Animated.View>
    );
};

export default AnimatedProgressBar; 