import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { unifiedTheme as theme } from '../../styles/theme';

interface AnimatedTabButtonProps {
    title: string;
    count?: number;
    isActive: boolean;
    onPress: () => void;
    activeColor?: string;
    inactiveColor?: string;
    icon?: string;
    hapticFeedback?: boolean;
    style?: ViewStyle;
}

const AnimatedTabButton: React.FC<AnimatedTabButtonProps> = ({
    title,
    count,
    isActive,
    onPress,
    activeColor = theme.colors.primary,
    inactiveColor = theme.colors.gray[400],
    icon,
    hapticFeedback = true,
    style,
}) => {
    const scaleAnim = useSharedValue(isActive ? 1.02 : 1);
    const opacityAnim = useSharedValue(isActive ? 1 : 0.8);

    useEffect(() => {
        scaleAnim.value = withSpring(isActive ? 1.02 : 1, {
            damping: 20,
            stiffness: 200,
        });

        opacityAnim.value = withTiming(isActive ? 1 : 0.8, {
            duration: 200,
        });
    }, [isActive]);

    const handlePress = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
        opacity: opacityAnim.value,
    }));

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[
                {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: isActive ? activeColor : 'transparent',
                    borderWidth: 1.5,
                    borderColor: isActive ? activeColor : theme.colors.gray[300],
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 80,
                    shadowColor: isActive ? activeColor : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.2 : 0,
                    shadowRadius: 4,
                    elevation: isActive ? 3 : 0,
                },
                style,
            ]}
            accessible={true}
            accessibilityLabel={`${title} 탭`}
            accessibilityHint={`${title} 탭을 선택합니다`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
        >
            <Animated.View style={[animatedStyle, {
                alignItems: 'center',
                gap: 4
            }]}>
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={16}
                        color={isActive ? '#FFFFFF' : theme.colors.gray[500]}
                    />
                )}
                <Text style={{
                    fontSize: 12,
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#FFFFFF' : theme.colors.gray[600],
                    textAlign: 'center',
                    letterSpacing: -0.2,
                }}>
                    {title}
                    {count !== undefined && (
                        <Text style={{
                            fontSize: 10,
                            fontWeight: isActive ? '500' : '400',
                            color: isActive ? 'rgba(255,255,255,0.9)' : theme.colors.gray[500],
                        }}>
                            {` (${count})`}
                        </Text>
                    )}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default AnimatedTabButton; 