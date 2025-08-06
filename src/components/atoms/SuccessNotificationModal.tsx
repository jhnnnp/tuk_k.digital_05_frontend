import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../styles/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface SuccessNotificationModalProps {
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    onClose: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
    transparent?: boolean; // 투명 배경 옵션 추가
}

export default function SuccessNotificationModal({
    visible,
    title,
    message,
    icon = 'checkmark-circle',
    onClose,
    autoClose = true,
    autoCloseDelay = 3000,
    transparent = true, // 기본값을 투명으로 설정
}: SuccessNotificationModalProps) {
    const { theme } = useTheme();

    // 애니메이션 값들
    const modalOpacity = useSharedValue(0);
    const modalScale = useSharedValue(0.8);
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const checkmarkScale = useSharedValue(0);
    const contentTranslateY = useSharedValue(50);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // 모달 진입 애니메이션 - 더 부드럽게
            modalOpacity.value = withTiming(1, { duration: 200 });
            modalScale.value = withSpring(1, {
                damping: 25,
                stiffness: 120,
                mass: 0.9
            });
            contentTranslateY.value = withSpring(0, {
                damping: 20,
                stiffness: 120,
                delay: 50
            });

            // 아이콘 애니메이션 - 더 자연스럽게
            iconScale.value = withSpring(1, {
                damping: 15,
                stiffness: 150,
                delay: 150
            });
            iconRotation.value = withSequence(
                withTiming(360, { duration: 500 }),
                withTiming(0, { duration: 0 })
            );

            // 체크마크 애니메이션 - 더 부드럽게
            checkmarkScale.value = withSequence(
                withDelay(300, withSpring(1, { damping: 20, stiffness: 200 })),
                withDelay(150, withSpring(0.9, { damping: 20, stiffness: 200 })),
                withSpring(1, { damping: 20, stiffness: 200 })
            );

            // 프로그레스 바 애니메이션
            progressWidth.value = withTiming(1, {
                duration: autoCloseDelay,
                delay: 300
            });

            // 햅틱 피드백
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 200);

            // 자동 닫기
            if (autoClose) {
                setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);
            }
        } else {
            // 모달 종료 애니메이션 - 더 빠르게
            modalOpacity.value = withTiming(0, { duration: 150 });
            modalScale.value = withTiming(0.9, { duration: 150 });
        }
    }, [visible]);

    const handleClose = () => {
        modalOpacity.value = withTiming(0, { duration: 200 });
        modalScale.value = withTiming(0.8, { duration: 200 });
        setTimeout(() => {
            onClose();
        }, 200);
    };

    // 애니메이션 스타일
    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value,
        transform: [{ scale: modalScale.value }],
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScale.value },
            { rotate: `${iconRotation.value}deg` }
        ],
    }));

    const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: interpolate(
            progressWidth.value,
            [0, 1],
            [0, width - 80],
            Extrapolate.CLAMP
        ),
    }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View
                style={[
                    {
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                        // 투명 배경일 때는 배경색 없음
                        backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,0.3)',
                    },
                    modalAnimatedStyle
                ]}
            >
                <Animated.View
                    style={[
                        {
                            width: width - 40,
                            maxWidth: 400,
                            backgroundColor: theme.surface + 'F0',
                            borderRadius: 24,
                            padding: 30,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.3,
                            shadowRadius: 40,
                            elevation: 20,
                            borderWidth: 1,
                            borderColor: theme.outline + '30',
                        },
                        contentAnimatedStyle
                    ]}
                >
                    {/* Success Icon */}
                    <Animated.View style={iconAnimatedStyle}>
                        <LinearGradient
                            colors={[theme.success, theme.success + '80']}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20,
                                shadowColor: theme.success,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 8,
                            }}
                        >
                            <Animated.View style={checkmarkAnimatedStyle}>
                                <Ionicons
                                    name={icon as any}
                                    size={40}
                                    color="white"
                                />
                            </Animated.View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Title */}
                    <Text style={{
                        fontSize: 24,
                        fontWeight: '700',
                        color: theme.textPrimary,
                        marginBottom: 12,
                        textAlign: 'center',
                        letterSpacing: -0.5,
                    }}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text style={{
                        fontSize: 16,
                        color: theme.textSecondary,
                        textAlign: 'center',
                        lineHeight: 22,
                        marginBottom: 30,
                    }}>
                        {message}
                    </Text>

                    {/* Progress Bar */}
                    <View style={{
                        width: '100%',
                        height: 3,
                        backgroundColor: theme.outline + '30',
                        borderRadius: 2,
                        marginBottom: 20,
                        overflow: 'hidden',
                    }}>
                        <Animated.View
                            style={[
                                {
                                    height: '100%',
                                    backgroundColor: theme.success,
                                    borderRadius: 2,
                                },
                                progressAnimatedStyle
                            ]}
                        />
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: theme.primary,
                            paddingHorizontal: 32,
                            paddingVertical: 14,
                            borderRadius: 25,
                            shadowColor: theme.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: theme.onPrimary,
                            letterSpacing: 0.5,
                        }}>
                            확인
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
} 