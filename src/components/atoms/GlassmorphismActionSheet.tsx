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

interface ActionItem {
    id: string;
    title: string;
    icon?: string;
    type?: 'default' | 'destructive' | 'success';
    onPress: () => void;
}

interface GlassmorphismActionSheetProps {
    isVisible: boolean;
    title?: string;
    description?: string;
    actions: ActionItem[];
    onCancel?: () => void;
    cancelText?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GlassmorphismActionSheet: React.FC<GlassmorphismActionSheetProps> = ({
    isVisible,
    title,
    description,
    actions,
    onCancel,
    cancelText = '취소',
}) => {
    const translateY = useSharedValue(screenHeight);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withSpring(screenHeight, { damping: 20, stiffness: 300 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const getActionStyle = (type: string) => {
        switch (type) {
            case 'destructive':
                return {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    textColor: theme.colors.error,
                    iconColor: theme.colors.error,
                };
            case 'success':
                return {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    textColor: theme.colors.success,
                    iconColor: theme.colors.success,
                };
            default:
                return {
                    backgroundColor: 'rgba(91, 155, 213, 0.1)',
                    borderColor: 'rgba(91, 155, 213, 0.2)',
                    textColor: theme.colors.info,
                    iconColor: theme.colors.info,
                };
        }
    };

    const handleActionPress = (action: ActionItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action.onPress();
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

                {/* 오버레이 */}
                <Animated.View style={[styles.overlay, overlayStyle]}>
                    <TouchableOpacity
                        style={styles.overlayTouchable}
                        onPress={handleCancel}
                        activeOpacity={1}
                    />
                </Animated.View>

                {/* 액션 시트 */}
                <Animated.View style={[styles.actionSheet, animatedStyle]}>
                    <BlurView intensity={20} style={styles.blurContainer}>
                        {/* 헤더 */}
                        {(title || description) && (
                            <View style={styles.header}>
                                {title && (
                                    <Text style={styles.title}>{title}</Text>
                                )}
                                {description && (
                                    <Text style={styles.description}>{description}</Text>
                                )}
                            </View>
                        )}

                        {/* 액션 버튼들 */}
                        <View style={styles.actionsContainer}>
                            {actions.map((action, index) => {
                                const actionStyle = getActionStyle(action.type || 'default');

                                return (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={[
                                            styles.actionButton,
                                            {
                                                backgroundColor: actionStyle.backgroundColor,
                                                borderColor: actionStyle.borderColor,
                                            },
                                            index === actions.length - 1 && styles.lastActionButton
                                        ]}
                                        onPress={() => handleActionPress(action)}
                                        activeOpacity={0.7}
                                    >
                                        {action.icon && (
                                            <Ionicons
                                                name={action.icon as any}
                                                size={20}
                                                color={actionStyle.iconColor}
                                                style={styles.actionIcon}
                                            />
                                        )}
                                        <Text style={[
                                            styles.actionText,
                                            { color: actionStyle.textColor }
                                        ]}>
                                            {action.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* 취소 버튼 */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayTouchable: {
        flex: 1,
    },
    actionSheet: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Glassmorphism 효과
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
        // 유리 효과를 위한 테두리
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    blurContainer: {
        padding: 24,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.8,
    },
    actionsContainer: {
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 8,
        // 유리 효과
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    lastActionButton: {
        marginBottom: 0,
    },
    actionIcon: {
        marginRight: 12,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    cancelButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        alignItems: 'center',
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
});

export default GlassmorphismActionSheet; 