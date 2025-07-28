import React, { useEffect } from 'react';
import { Switch, SwitchProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { unifiedTheme as theme } from '../../styles/theme';

interface AnimatedToggleSwitchProps extends SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
    animationDuration?: number;
    hapticFeedback?: boolean;
    scaleAnimation?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

const AnimatedToggleSwitch: React.FC<AnimatedToggleSwitchProps> = ({
    value,
    onValueChange,
    activeColor = '#5B9BD5',
    inactiveColor = '#f1f5f9',
    thumbColor = '#ffffff',
    animationDuration = theme.animation.duration.normal,
    hapticFeedback = true,
    scaleAnimation = true,
    accessibilityLabel,
    accessibilityHint,
    ...props
}) => {
    const scaleAnim = useSharedValue(scaleAnimation ? (value ? 1 : 0.8) : 1);
    const opacityAnim = useSharedValue(1);

    useEffect(() => {
        if (scaleAnimation) {
            scaleAnim.value = withSpring(value ? 1 : 0.8, {
                damping: 15,
                stiffness: 100,
            });
        }
    }, [value, scaleAnimation]);

    const handleValueChange = (newValue: boolean) => {
        try {
            console.log(`🔄 [TOGGLE] 값 변경 시작: ${newValue}`);

            if (hapticFeedback) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            // 부드러운 투명도 애니메이션
            opacityAnim.value = withTiming(0.7, { duration: 100 }, () => {
                console.log(`🔄 [TOGGLE] onValueChange 호출: ${newValue}`);
                onValueChange(newValue);
                opacityAnim.value = withTiming(1, { duration: 100 });
                console.log(`✅ [TOGGLE] 값 변경 완료: ${newValue}`);
            });
        } catch (error) {
            console.error('❌ [TOGGLE] 값 변경 오류:', error);
            console.error('❌ [TOGGLE] 오류 스택:', error.stack);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
        opacity: opacityAnim.value,
    }));

    return (
        <Animated.View style={animatedStyle}>
            <Switch
                value={value}
                onValueChange={handleValueChange}
                trackColor={{ false: inactiveColor, true: activeColor }}
                thumbColor={thumbColor}
                ios_backgroundColor={inactiveColor}
                accessible={true}
                accessibilityLabel={accessibilityLabel || '토글 스위치'}
                accessibilityHint={accessibilityHint || '상태를 변경합니다'}
                accessibilityRole="switch"
                accessibilityState={{ checked: value }}
                {...props}
            />
        </Animated.View>
    );
};

export default AnimatedToggleSwitch; 