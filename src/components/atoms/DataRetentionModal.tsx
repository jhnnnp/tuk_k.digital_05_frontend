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

interface RetentionOption {
    id: string;
    days: number;
    title: string;
    description: string;
    recommended?: boolean;
}

interface DataRetentionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (retention: string) => void;
    currentRetention?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const RETENTION_OPTIONS: RetentionOption[] = [
    {
        id: '7',
        days: 7,
        title: '7일',
        description: '1주일 동안 보관',
    },
    {
        id: '30',
        days: 30,
        title: '30일',
        description: '1개월 동안 보관 (권장)',
        recommended: true,
    },
    {
        id: '90',
        days: 90,
        title: '90일',
        description: '3개월 동안 보관',
    },
];

export default function DataRetentionModal({
    visible,
    onClose,
    onConfirm,
    currentRetention = '30'
}: DataRetentionModalProps) {
    const { theme } = useTheme();
    const [selectedRetention, setSelectedRetention] = useState(currentRetention);
    const [isLoading, setIsLoading] = useState(false);

    // 애니메이션 값들
    const modalScale = useSharedValue(0);
    const modalOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(30);
    const buttonScale = useSharedValue(1);
    const cancelButtonScale = useSharedValue(1);
    const confirmButtonScale = useSharedValue(1);

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
                    withTiming(5, { duration: 200 }),
                    withTiming(-5, { duration: 200 }),
                    withTiming(0, { duration: 200 })
                );
            }, 200);

            // 콘텐츠 애니메이션
            setTimeout(() => {
                contentOpacity.value = withTiming(1, { duration: 400 });
                contentTranslateY.value = withSpring(0, {
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
            contentOpacity.value = withTiming(0, { duration: 200 });
            contentTranslateY.value = withTiming(30, { duration: 200 });
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

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
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
        setTimeout(() => {
            setSelectedRetention(currentRetention);
            onClose();
        }, 100);
    };

    const handleConfirmPress = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        confirmButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );

        setIsLoading(true);

        // 실제 데이터 보관 설정 로직은 여기에 구현
        setTimeout(() => {
            setIsLoading(false);
            onConfirm(selectedRetention);
            onClose();
        }, 1000);
    };

    const handleRetentionSelect = (retentionId: string) => {
        Haptics.selectionAsync();
        setSelectedRetention(retentionId);
    };

    const RetentionOption = ({ option }: { option: RetentionOption }) => {
        const isSelected = selectedRetention === option.id;
        const optionScale = useSharedValue(1);

        const handlePress = () => {
            optionScale.value = withSequence(
                withSpring(0.98, { damping: 15, stiffness: 400 }),
                withSpring(1, { damping: 15, stiffness: 400 })
            );
            handleRetentionSelect(option.id);
        };

        const optionAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: optionScale.value }],
        }));

        return (
            <Animated.View style={optionAnimatedStyle}>
                <TouchableOpacity
                    style={{
                        backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16,
                        borderWidth: 2,
                        borderColor: isSelected ? theme.primary : theme.outline + '20',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isSelected ? 0.1 : 0.05,
                        shadowRadius: 8,
                        elevation: isSelected ? 4 : 2,
                    }}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: isSelected ? theme.primary + '20' : theme.outline + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                            }}>
                                <Ionicons
                                    name="time"
                                    size={24}
                                    color={isSelected ? theme.primary : theme.textSecondary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={{
                                        fontSize: 18,
                                        fontFamily: 'GoogleSans-Bold',
                                        color: isSelected ? theme.primary : theme.textPrimary,
                                        marginRight: 8,
                                    }}>
                                        {option.title}
                                    </Text>
                                    {option.recommended && (
                                        <View style={{
                                            backgroundColor: theme.success + '20',
                                            borderRadius: 8,
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                        }}>
                                            <Text style={{
                                                fontSize: 10,
                                                fontFamily: 'GoogleSans-Medium',
                                                color: theme.success,
                                            }}>
                                                권장
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary,
                                }}>
                                    {option.description}
                                </Text>
                            </View>
                        </View>
                        {isSelected && (
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: theme.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Ionicons name="checkmark" size={16} color={theme.onPrimary} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
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
                            width: screenWidth * 0.9,
                            maxWidth: 400,
                            backgroundColor: theme.surface,
                            borderRadius: 24,
                            padding: 32,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.3,
                            shadowRadius: 40,
                            elevation: 20,
                        },
                        modalAnimatedStyle,
                    ]}
                >
                    {/* 헤더 */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        {/* 아이콘 */}
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
                                colors={[theme.warning + '20', theme.warning + '10']}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Ionicons
                                    name="time"
                                    size={36}
                                    color={theme.warning}
                                />
                            </LinearGradient>
                        </Animated.View>

                        {/* 제목 */}
                        <Text style={{
                            fontSize: 24,
                            fontFamily: 'GoogleSans-Bold',
                            color: theme.textPrimary,
                            marginBottom: 8,
                            textAlign: 'center',
                        }}>
                            데이터 보관 기간
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            textAlign: 'center',
                            lineHeight: 24,
                        }}>
                            녹화본을 보관할 기간을 설정하세요. 설정된 기간이 지나면 자동으로 삭제됩니다.
                        </Text>
                    </View>

                    {/* 콘텐츠 */}
                    <Animated.View style={contentAnimatedStyle}>
                        {RETENTION_OPTIONS.map((option) => (
                            <RetentionOption key={option.id} option={option} />
                        ))}
                    </Animated.View>

                    {/* 버튼 */}
                    <Animated.View
                        style={[
                            {
                                flexDirection: 'row',
                                gap: 12,
                                width: '100%',
                                marginTop: 24,
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
                                disabled={isLoading}
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

                        {/* 확인 버튼 */}
                        <Animated.View style={[{ flex: 1 }, confirmButtonAnimatedStyle]}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 16,
                                    paddingHorizontal: 24,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isLoading ? 0.6 : 1,
                                }}
                                onPress={handleConfirmPress}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={[theme.warning, theme.warning + 'DD']}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        borderRadius: 16,
                                    }}
                                />
                                {isLoading ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="refresh" size={16} color={theme.onPrimary} />
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: 'GoogleSans-Medium',
                                                color: theme.onPrimary,
                                                marginLeft: 8,
                                            }}
                                        >
                                            설정 중...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'GoogleSans-Medium',
                                            color: theme.onPrimary,
                                        }}
                                    >
                                        설정하기
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
} 