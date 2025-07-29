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

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 20, stiffness: 300 });

            // 아이콘 바운스 애니메이션
            iconScale.value = withDelay(200, withSequence(
                withSpring(1.2, { damping: 8, stiffness: 400 }),
                withSpring(1, { damping: 15, stiffness: 300 })
            ));

            // 체크마크 애니메이션
            checkmarkScale.value = withDelay(400, withSequence(
                withSpring(1.3, { damping: 8, stiffness: 400 }),
                withSpring(1, { damping: 15, stiffness: 300 })
            ));

            // 텍스트 페이드인
            textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
            iconScale.value = withSpring(0);
            checkmarkScale.value = withSpring(0);
            textOpacity.value = withTiming(0);
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
                            <Ionicons name="cloud-download" size={28} color="#FFFFFF" />
                        </LinearGradient>

                        {/* 체크마크 오버레이 */}
                        <Animated.View style={[styles.checkmarkOverlay, animatedCheckmarkStyle]}>
                            <View style={styles.checkmarkContainer}>
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                        </Animated.View>
                    </Animated.View>

                    {/* 텍스트 컨테이너 */}
                    <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </Animated.View>

                    {/* 확인 버튼 */}
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.confirmText}>{confirmText}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        width: 68,
        height: 68,
        borderRadius: 34,
        marginRight: 24,
        position: 'relative',
        shadowColor: '#93C5FD',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
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
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
        letterSpacing: -0.4,
    },
    message: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 22,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
}); 