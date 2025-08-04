import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../styles/ThemeProvider';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LogoutModal({ visible, onClose, onConfirm, userName }: LogoutModalProps) {
    const { theme } = useTheme();

    // 애니메이션 값들
    const modalScale = useSharedValue(0);
    const modalOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const buttonScale = useSharedValue(1);
    const cancelButtonScale = useSharedValue(1);
    const confirmButtonScale = useSharedValue(1);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    // 모달 표시 애니메이션
    useEffect(() => {
        if (visible) {
            // 배경 페이드인
            backgroundOpacity.value = withTiming(1, { duration: 200 });

            // 모달 스케일 애니메이션
            modalScale.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.8,
            });

            // 모달 투명도
            modalOpacity.value = withTiming(1, { duration: 300 });

            // 아이콘 애니메이션
            setTimeout(() => {
                iconScale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 400,
                });
                iconRotation.value = withSequence(
                    withTiming(10, { duration: 200 }),
                    withTiming(-10, { duration: 200 }),
                    withTiming(0, { duration: 200 })
                );
            }, 200);

            // 텍스트 애니메이션
            setTimeout(() => {
                textOpacity.value = withTiming(1, { duration: 400 });
                textTranslateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 200,
                });
            }, 400);
        } else {
            // 모달 숨김 애니메이션
            backgroundOpacity.value = withTiming(0, { duration: 200 });
            modalScale.value = withSpring(0, {
                damping: 20,
                stiffness: 300,
            });
            modalOpacity.value = withTiming(0, { duration: 200 });
            iconScale.value = withTiming(0, { duration: 200 });
            textOpacity.value = withTiming(0, { duration: 200 });
            textTranslateY.value = withTiming(20, { duration: 200 });
        }
    }, [visible]);

    // 애니메이션 스타일들
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value,
        transform: [
            { scale: modalScale.value },
            {
                translateY: interpolate(
                    modalScale.value,
                    [0, 1],
                    [50, 0],
                    Extrapolate.CLAMP
                ),
            },
        ],
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScale.value },
            { rotate: `${iconRotation.value}deg` },
        ],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const cancelButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cancelButtonScale.value }],
    }));

    const confirmButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: confirmButtonScale.value }],
    }));

    // 버튼 터치 핸들러
    const handleCancelPress = () => {
        Haptics.selectionAsync();
        cancelButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );
        setTimeout(onClose, 100);
    };

    const handleConfirmPress = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        confirmButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );
        setTimeout(onConfirm, 100);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            {/* 배경 오버레이 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    backgroundAnimatedStyle,
                ]}
            >
                {/* 모달 컨테이너 */}
                <Animated.View
                    style={[
                        {
                            width: screenWidth * 0.85,
                            maxWidth: 400,
                            backgroundColor: theme.surface,
                            borderRadius: 24,
                            padding: 32,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.3,
                            shadowRadius: 40,
                            elevation: 20,
                        },
                        modalAnimatedStyle,
                    ]}
                >
                    {/* 아이콘 컨테이너 */}
                    <Animated.View
                        style={[
                            {
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                marginBottom: 24,
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                            iconAnimatedStyle,
                        ]}
                    >
                        <LinearGradient
                            colors={[theme.error + '20', theme.error + '10']}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons
                                name="log-out"
                                size={36}
                                color={theme.error}
                            />
                        </LinearGradient>
                    </Animated.View>

                    {/* 텍스트 컨테이너 */}
                    <Animated.View
                        style={[
                            {
                                alignItems: 'center',
                                marginBottom: 32,
                            },
                            textAnimatedStyle,
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: 24,
                                fontFamily: 'GoogleSans-Bold',
                                color: theme.textPrimary,
                                marginBottom: 12,
                                textAlign: 'center',
                            }}
                        >
                            로그아웃
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                                textAlign: 'center',
                                lineHeight: 24,
                            }}
                        >
                            {userName ? `${userName}님, ` : ''}정말 로그아웃하시겠습니까?
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textTertiary,
                                textAlign: 'center',
                                marginTop: 8,
                                lineHeight: 20,
                            }}
                        >
                            로그아웃하면 모든 데이터가 로컬에서 삭제됩니다
                        </Text>
                    </Animated.View>

                    {/* 버튼 컨테이너 */}
                    <Animated.View
                        style={[
                            {
                                flexDirection: 'row',
                                gap: 12,
                                width: '100%',
                            },
                            buttonAnimatedStyle,
                        ]}
                    >
                        {/* 취소 버튼 */}
                        <Animated.View style={[{ flex: 1 }, cancelButtonAnimatedStyle]}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 16,
                                    paddingHorizontal: 24,
                                    borderRadius: 16,
                                    borderWidth: 2,
                                    borderColor: theme.outline + '40',
                                    backgroundColor: 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={handleCancelPress}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.textPrimary,
                                    }}
                                >
                                    취소
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* 로그아웃 버튼 */}
                        <Animated.View style={[{ flex: 1 }, confirmButtonAnimatedStyle]}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 16,
                                    paddingHorizontal: 24,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={handleConfirmPress}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[theme.error, theme.error + 'DD']}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        borderRadius: 16,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.onError,
                                    }}
                                >
                                    로그아웃
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
} 