import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { unifiedTheme } from '../../styles/theme';

interface DownloadProgressModalProps {
    isVisible: boolean;
    progress: number; // 0-100
    fileName: string;
    fileSize?: string;
    onCancel?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
    isVisible,
    progress,
    fileName,
    fileSize,
    onCancel,
}) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const modalScale = useSharedValue(0.8);
    const modalOpacity = useSharedValue(0);

    // 모달 등장 애니메이션
    useEffect(() => {
        if (isVisible) {
            modalScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            modalOpacity.value = withTiming(1, { duration: 300 });
        } else {
            modalScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
            modalOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [isVisible]);

    // 회전 애니메이션
    useEffect(() => {
        if (isVisible) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 2000 }),
                -1,
                false
            );
        }
    }, [isVisible]);

    // 펄스 애니메이션
    useEffect(() => {
        if (isVisible) {
            scale.value = withRepeat(
                withSpring(1.1, { damping: 10, stiffness: 100 }),
                -1,
                true
            );
        }
    }, [isVisible]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
    }));

    const animatedModalStyle = useAnimatedStyle(() => ({
        transform: [{ scale: modalScale.value }],
        opacity: modalOpacity.value,
    }));

    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${progress}%`,
    }));

    const getProgressText = () => {
        if (progress === 0) return '다운로드 준비 중...';
        if (progress < 100) return '다운로드 중...';
        return '저장 중...';
    };

    const getProgressColor = () => {
        if (progress === 100) return unifiedTheme.colors.success;
        if (progress > 50) return unifiedTheme.colors.info;
        return unifiedTheme.colors.primary;
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />

                <View style={styles.overlay}>
                    <Animated.View style={[styles.modal, animatedModalStyle]}>
                        {/* 헤더 */}
                        <View style={styles.header}>
                            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                                <Ionicons
                                    name="download"
                                    size={32}
                                    color={getProgressColor()}
                                />
                            </Animated.View>

                            <Text style={styles.title}>다운로드 중...</Text>
                            <Text style={styles.subtitle}>{getProgressText()}</Text>
                        </View>

                        {/* 파일 정보 */}
                        <View style={styles.fileInfo}>
                            <View style={styles.fileNameContainer}>
                                <Ionicons name="videocam" size={16} color={unifiedTheme.colors.gray[500]} />
                                <Text style={styles.fileName} numberOfLines={2}>
                                    {fileName}
                                </Text>
                            </View>

                            {fileSize && (
                                <Text style={styles.fileSize}>{fileSize}</Text>
                            )}
                        </View>

                        {/* 진행률 바 */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        { backgroundColor: getProgressColor() },
                                        progressBarStyle
                                    ]}
                                />
                            </View>

                            <View style={styles.progressTextContainer}>
                                <Text style={styles.progressText}>
                                    {Math.round(progress)}%
                                </Text>
                                <Text style={styles.progressLabel}>
                                    {progress === 100 ? '완료' : '진행 중'}
                                </Text>
                            </View>
                        </View>

                        {/* 상태 메시지 */}
                        <View style={styles.statusContainer}>
                            {progress === 0 && (
                                <Text style={styles.statusText}>
                                    파일 다운로드를 준비하고 있습니다...
                                </Text>
                            )}
                            {progress > 0 && progress < 100 && (
                                <Text style={styles.statusText}>
                                    네트워크 상태에 따라 시간이 걸릴 수 있습니다
                                </Text>
                            )}
                            {progress === 100 && (
                                <Text style={styles.statusText}>
                                    갤러리에 저장하고 있습니다...
                                </Text>
                            )}
                        </View>

                        {/* 취소 버튼 */}
                        {progress < 100 && onCancel && (
                            <View style={styles.cancelContainer}>
                                <Text style={styles.cancelText} onPress={onCancel}>
                                    취소
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlay: {
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
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(91, 155, 213, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(91, 155, 213, 0.3)',
        shadowColor: '#5B9BD5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: unifiedTheme.colors.text.primary,
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: unifiedTheme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.8,
    },
    fileInfo: {
        marginBottom: 24,
        padding: 20,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 16,
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    fileNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: unifiedTheme.colors.text.primary,
    },
    fileSize: {
        fontSize: 12,
        color: unifiedTheme.colors.text.secondary,
        marginLeft: 24,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 12,
        backgroundColor: 'rgba(226, 232, 240, 0.6)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
        // 그라데이션 효과를 위한 추가 스타일
        shadowColor: '#5B9BD5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 18,
        fontWeight: '700',
        color: unifiedTheme.colors.text.primary,
        letterSpacing: -0.3,
    },
    progressLabel: {
        fontSize: 13,
        color: unifiedTheme.colors.text.secondary,
        fontWeight: '500',
        opacity: 0.8,
    },
    statusContainer: {
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    statusText: {
        fontSize: 13,
        color: unifiedTheme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 18,
        opacity: 0.7,
        fontWeight: '400',
    },
    cancelContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    cancelText: {
        fontSize: 15,
        color: unifiedTheme.colors.danger,
        fontWeight: '600',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        overflow: 'hidden',
        // 유리 효과
        borderWidth: 1,
        borderColor: 'rgba(244, 67, 54, 0.2)',
    },
});

export default DownloadProgressModal; 