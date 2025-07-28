import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { unifiedTheme as theme } from '../../styles/theme';

interface FeedbackCircleButtonProps {
    icon: string;
    label?: string;
    onPress: () => void;
    activeColor?: string;
    inactiveColor?: string;
    size?: number;
    hapticFeedback?: boolean;
    scaleAnimation?: boolean;
    rippleEffect?: boolean;
    disabled?: boolean;
    isActive?: boolean;
    style?: ViewStyle;
}

const FeedbackCircleButton: React.FC<FeedbackCircleButtonProps> = ({
    icon,
    label,
    onPress,
    activeColor = '#5B9BD5',
    inactiveColor = '#94a3b8',
    size = 60,
    hapticFeedback = true,
    scaleAnimation = true,
    rippleEffect = true,
    disabled = false,
    isActive = false,
    style,
}) => {
    const scaleAnim = useSharedValue(1);
    const opacityAnim = useSharedValue(1);
    const rippleAnim = useSharedValue(0);

    const handlePress = () => {
        if (disabled) return;

        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        if (scaleAnimation) {
            scaleAnim.value = withSequence(
                withTiming(0.92, { duration: 80 }),
                withTiming(1, { duration: 120 })
            );
        }

        if (rippleEffect) {
            rippleAnim.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0, { duration: 150 })
            );
        }

        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
        opacity: opacityAnim.value,
    }));

    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rippleAnim.value }],
        opacity: 1 - rippleAnim.value,
    }));

    // 아이콘 매핑 - 더 직관적이고 귀여운 유니코드 아이콘
    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: string } = {
            record: 'REC',     // 녹화 텍스트 (녹화)
            capture: '📹',     // 세련된 비디오 카메라 아이콘 (캡처)
            zoomIn: '⊕',      // 플러스 원형 (줌인)
            zoomOut: '⊖',     // 마이너스 원형 (줌아웃)
            voice: 'MIC',     // 마이크 텍스트 (음성/마이크)
            home: '○',        // 빈 원형 (홈)
            live: '●',        // 작은 원형 (라이브)
            settings: '⚙',    // 톱니바퀴 (설정)
            play: '▶',        // 재생 삼각형
            pause: '⏸',       // 일시정지
            stop: '■',        // 정지 사각형
        };

        return iconMap[iconName] || '○';
    };

    // Vector Icons 매핑 - 귀엽고 예쁜 아이콘들
    const getVectorIcon = (iconName: string) => {
        const iconMap: { [key: string]: { name: string; type: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'AntDesign' } } = {
            record: { name: 'radio-button-on', type: 'Ionicons' },
            capture: { name: 'camera-retro', type: 'FontAwesome' },
            zoomIn: { name: 'plus-circle', type: 'FontAwesome' },
            zoomOut: { name: 'minus-circle', type: 'FontAwesome' },
            voice: { name: 'microphone-alt', type: 'FontAwesome' },
            home: { name: 'home', type: 'AntDesign' },
            live: { name: 'playcircleo', type: 'AntDesign' },
            settings: { name: 'setting', type: 'AntDesign' },
            play: { name: 'playcircleo', type: 'AntDesign' },
            pause: { name: 'pausecircleo', type: 'AntDesign' },
            stop: { name: 'stop', type: 'AntDesign' },
        };

        return iconMap[iconName] || { name: 'questioncircleo', type: 'AntDesign' };
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: disabled ? theme.colors.gray[300] :
                        isActive ? activeColor : theme.colors.surface,
                    borderWidth: 1.5,
                    borderColor: disabled ? theme.colors.gray[300] :
                        isActive ? activeColor : theme.colors.gray[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                },
                style,
            ]}
            accessible={true}
            accessibilityLabel={`${label || icon} 버튼`}
            accessibilityHint={`${label || icon} 기능을 실행합니다`}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: isActive }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Animated.View style={animatedStyle}>
                {/* Vector Icons 사용 */}
                {icon === 'record' || icon === 'voice' ? (
                    <Text style={{
                        fontSize: size * 0.22,
                        color: disabled ? theme.colors.gray[400] :
                            isActive ? theme.colors.text.inverse : theme.colors.gray[600],
                        fontWeight: '800',
                        letterSpacing: 1.2,
                    }}>
                        {getIconComponent(icon)}
                    </Text>
                ) : (
                    <>
                        {getVectorIcon(icon).type === 'Ionicons' && (
                            <Ionicons
                                name={getVectorIcon(icon).name as any}
                                size={size * 0.45}
                                color={disabled ? theme.colors.gray[400] :
                                    isActive ? theme.colors.text.inverse : theme.colors.gray[600]}
                            />
                        )}
                        {getVectorIcon(icon).type === 'FontAwesome' && (
                            <FontAwesome
                                name={getVectorIcon(icon).name as any}
                                size={size * 0.45}
                                color={disabled ? theme.colors.gray[400] :
                                    isActive ? theme.colors.text.inverse : theme.colors.gray[600]}
                            />
                        )}
                        {getVectorIcon(icon).type === 'AntDesign' && (
                            <AntDesign
                                name={getVectorIcon(icon).name as any}
                                size={size * 0.45}
                                color={disabled ? theme.colors.gray[400] :
                                    isActive ? theme.colors.text.inverse : theme.colors.gray[600]}
                            />
                        )}
                        {getVectorIcon(icon).type === 'MaterialIcons' && (
                            <MaterialIcons
                                name={getVectorIcon(icon).name as any}
                                size={size * 0.45}
                                color={disabled ? theme.colors.gray[400] :
                                    isActive ? theme.colors.text.inverse : theme.colors.gray[600]}
                            />
                        )}
                    </>
                )}

                {label && (
                    <Text style={{
                        fontSize: 10,
                        color: disabled ? theme.colors.gray[400] :
                            isActive ? theme.colors.text.inverse : theme.colors.gray[600],
                        marginTop: theme.spacing.xs,
                        textAlign: 'center',
                        fontWeight: '600',
                        letterSpacing: 0.4,
                    }}>
                        {label}
                    </Text>
                )}
            </Animated.View>

            {rippleEffect && (
                <Animated.View style={[{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: size / 2,
                    backgroundColor: theme.colors.text.inverse,
                    opacity: 0.3,
                }, rippleStyle]} />
            )}

            {/* 활성 상태 표시 */}
            {isActive && (
                <Animated.View style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.success,
                    borderWidth: 2,
                    borderColor: theme.colors.surface,
                }} />
            )}
        </TouchableOpacity>
    );
};

export default FeedbackCircleButton; 