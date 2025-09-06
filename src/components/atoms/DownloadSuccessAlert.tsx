import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface DownloadSuccessAlertProps {
    isVisible: boolean;
    title: string;
    message: string;
    fileName?: string;
    fileSize?: string;
    onConfirm?: () => void;
    confirmText?: string;
}

export default function DownloadSuccessAlert({
    isVisible,
    title,
    message,
    fileName,
    fileSize,
    onConfirm,
    confirmText = '확인',
}: DownloadSuccessAlertProps) {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const checkmarkScale = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(0.9);

    useEffect(() => {
        if (isVisible) {
            // 모달 등장 애니메이션 - 더 부드럽게
            opacity.value = withTiming(1, { duration: 400 });
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
                mass: 0.8
            });

            // 아이콘 바운스 애니메이션 - 더 자연스럽게
            iconScale.value = withDelay(150, withSequence(
                withSpring(1.3, { damping: 6, stiffness: 300 }),
                withSpring(0.95, { damping: 12, stiffness: 250 }),
                withSpring(1, { damping: 15, stiffness: 200 })
            ));

            // 체크마크 애니메이션 - 더 귀여운 바운스
            checkmarkScale.value = withDelay(350, withSequence(
                withSpring(1.4, { damping: 5, stiffness: 350 }),
                withSpring(0.9, { damping: 10, stiffness: 300 }),
                withSpring(1.1, { damping: 12, stiffness: 250 }),
                withSpring(1, { damping: 15, stiffness: 200 })
            ));

            // 텍스트 페이드인 - 더 부드럽게
            textOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));

            // 버튼 애니메이션
            buttonScale.value = withDelay(400, withSpring(1, {
                damping: 15,
                stiffness: 200
            }));

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            // 모달 사라짐 애니메이션 - 더 빠르게
            opacity.value = withTiming(0, { duration: 250 });
            scale.value = withSpring(0.9, {
                damping: 20,
                stiffness: 400
            });
            iconScale.value = withSpring(0.8);
            checkmarkScale.value = withSpring(0.8);
            textOpacity.value = withTiming(0, { duration: 200 });
            buttonScale.value = withSpring(0.9);
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    const animatedCheckmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [10, 0]) }],
    }));

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleConfirm = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onConfirm?.();
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.modal, animatedStyle]}>
                    {/* 성공 아이콘 */}
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                        <LinearGradient
                            colors={['#93C5FD', '#7DD3FC']}
                            style={styles.iconGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="cloud-download" size={24} color="#FFFFFF" />
                        </LinearGradient>

                        {/* 체크마크 오버레이 */}
                        <Animated.View style={[styles.checkmarkOverlay, animatedCheckmarkStyle]}>
                            <View style={styles.checkmarkContainer}>
                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            </View>
                        </Animated.View>
                    </Animated.View>

                    {/* 텍스트 컨테이너 */}
                    <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </Animated.View>

                    {/* 확인 버튼 */}
                    <Animated.View style={animatedButtonStyle}>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingVertical: 20,
        paddingHorizontal: 32,
        width: screenWidth - 40,
        maxWidth: 400,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.15,
        shadowRadius: 28,
        elevation: 14,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 20,
        position: 'relative',
        shadowColor: '#93C5FD',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkOverlay: {
        position: 'absolute',
        top: -6,
        right: -6,
    },
    checkmarkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 18,
        fontWeight: '400',
    },
    confirmButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        backgroundColor: '#7DD3FC',
        borderRadius: 14,
        shadowColor: '#7DD3FC',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    confirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.1,
    },
}); 