import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { unifiedTheme as theme } from '../../styles/theme';

interface GlassmorphismAlertProps {
    isVisible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    showIcon?: boolean;
    iconName?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const GlassmorphismAlert: React.FC<GlassmorphismAlertProps> = ({
    isVisible,
    title,
    message,
    type = 'info',
    showIcon = true,
    iconName,
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소',
    showCancel = false,
}) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 300 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            scale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: iconName || 'checkmark-circle',
                    color: theme.colors.success,
                    gradient: ['#10B981', '#059669'],
                };
            case 'warning':
                return {
                    icon: iconName || 'warning',
                    color: theme.colors.warning,
                    gradient: ['#F59E0B', '#D97706'],
                };
            case 'error':
                return {
                    icon: iconName || 'close-circle',
                    color: theme.colors.error,
                    gradient: ['#EF4444', '#DC2626'],
                };
            default:
                return {
                    icon: iconName || 'information-circle',
                    color: theme.colors.info,
                    gradient: ['#5B9BD5', '#3B82F6'],
                };
        }
    };

    const typeConfig = getTypeConfig();

    const handleConfirm = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onConfirm?.();
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onCancel?.();
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.6)" />

                <BlurView intensity={20} style={styles.blurContainer}>
                    <Animated.View style={[styles.modal, animatedStyle]}>
                        {/* 헤더 */}
                        <View style={styles.header}>
                            {showIcon && (
                                <View style={styles.iconContainer}>
                                    <LinearGradient
                                        colors={typeConfig.gradient}
                                        style={styles.iconGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons
                                            name={typeConfig.icon as any}
                                            size={28}
                                            color="#FFFFFF"
                                        />
                                    </LinearGradient>
                                </View>
                            )}

                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>

                        {/* 버튼 컨테이너 */}
                        <View style={styles.buttonContainer}>
                            {showCancel && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={typeConfig.gradient}
                                    style={styles.confirmGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </BlurView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modal: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 28,
        width: screenWidth - 40,
        maxWidth: 400,
        // Glassmorphism 효과
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
        // 유리 효과를 위한 테두리
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 20,
        // 유리 효과
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        // 유리 효과
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    confirmGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
});

export default GlassmorphismAlert; 