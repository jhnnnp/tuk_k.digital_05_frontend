import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StatusBar,
    TextInput,
    Alert,
    ActivityIndicator,
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
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NicknameChangeModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    currentNickname?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function NicknameChangeModal({
    visible,
    onClose,
    onSuccess,
    currentNickname = ''
}: NicknameChangeModalProps) {
    const { theme } = useTheme();
    const [nickname, setNickname] = useState(currentNickname);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // 애니메이션 값들
    const modalScale = useSharedValue(0);
    const modalOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(30);
    const buttonScale = useSharedValue(1);
    const cancelButtonScale = useSharedValue(1);
    const confirmButtonScale = useSharedValue(1);
    const inputScale = useSharedValue(1);

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

            // 폼 애니메이션
            setTimeout(() => {
                formOpacity.value = withTiming(1, { duration: 400 });
                formTranslateY.value = withSpring(0, {
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
            formOpacity.value = withTiming(0, { duration: 200 });
            formTranslateY.value = withTiming(30, { duration: 200 });
        }
    }, [visible]);

    // 현재 닉네임이 변경되면 입력값 업데이트
    useEffect(() => {
        setNickname(currentNickname);
    }, [currentNickname]);

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

    const formAnimatedStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
        transform: [{ translateY: formTranslateY.value }],
    }));

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: inputScale.value }],
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
            setNickname(currentNickname);
            onClose();
        }, 100);
    };

    const handleConfirmPress = async () => {
        if (!nickname.trim()) {
            Alert.alert('입력 오류', '닉네임을 입력해주세요.');
            return;
        }

        if (nickname.trim().length < 2) {
            Alert.alert('입력 오류', '닉네임은 2자 이상이어야 합니다.');
            return;
        }

        if (nickname.trim().length > 20) {
            Alert.alert('입력 오류', '닉네임은 20자 이하여야 합니다.');
            return;
        }

        if (nickname.trim() === currentNickname) {
            Alert.alert('변경 없음', '동일한 닉네임입니다.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        confirmButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );

        setIsLoading(true);

        try {
            // 액세스 토큰 가져오기
            const accessToken = await AsyncStorage.getItem('token');
            if (!accessToken) {
                throw new Error('로그인이 필요합니다.');
            }

            console.log('🔗 [NICKNAME CHANGE] API 호출 시작');
            console.log(`  🌐 URL: ${API_BASE_URL}/profile`);
            console.log(`  📝 새 닉네임: ${nickname.trim()}`);

            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    nickname: nickname.trim()
                }),
            });

            console.log(`  📊 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                console.log(`  ❌ 에러 응답:`, errorData);
                throw new Error(errorData.error || '닉네임 변경에 실패했습니다.');
            }

            const result = await response.json();
            console.log(`  ✅ 성공 응답:`, result);

            // 성공 처리
            Alert.alert('성공', '닉네임이 성공적으로 변경되었습니다.');
            onClose();
            onSuccess?.();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '닉네임 변경 중 오류가 발생했습니다.';
            console.log(`  ❌ 에러 발생: ${errorMessage}`);
            Alert.alert('오류', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputFocus = () => {
        inputScale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
    };

    const handleInputBlur = () => {
        inputScale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
                                colors={[theme.success + '20', theme.success + '10']}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Ionicons
                                    name="person"
                                    size={36}
                                    color={theme.success}
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
                            닉네임 변경
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            textAlign: 'center',
                            lineHeight: 24,
                        }}>
                            새로운 닉네임으로 프로필을 업데이트하세요
                        </Text>
                    </View>

                    {/* 폼 */}
                    <Animated.View style={formAnimatedStyle}>
                        {/* 현재 닉네임 표시 */}
                        {currentNickname && (
                            <View style={{
                                backgroundColor: theme.background,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: theme.outline + '20',
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textSecondary,
                                    marginBottom: 4,
                                }}>
                                    현재 닉네임
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary,
                                }}>
                                    {currentNickname}
                                </Text>
                            </View>
                        )}

                        {/* 새 닉네임 입력 */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Medium',
                                color: theme.textPrimary,
                                marginBottom: 8,
                            }}>
                                새 닉네임
                            </Text>
                            <Animated.View style={inputAnimatedStyle}>
                                <TextInput
                                    style={{
                                        borderWidth: 2,
                                        borderColor: theme.outline + '40',
                                        borderRadius: 12,
                                        backgroundColor: theme.background,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Regular',
                                        color: theme.textPrimary,
                                    }}
                                    value={nickname}
                                    onChangeText={setNickname}
                                    placeholder="새 닉네임을 입력하세요"
                                    placeholderTextColor={theme.textSecondary}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    maxLength={20}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </Animated.View>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                                marginTop: 4,
                            }}>
                                {nickname.length}/20자
                            </Text>
                        </View>

                        {/* 가이드라인 */}
                        <View style={{
                            backgroundColor: theme.success + '10',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="information-circle" size={16} color={theme.success} />
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.success,
                                    marginLeft: 8,
                                }}>
                                    닉네임 가이드라인
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 13,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                                lineHeight: 18,
                            }}>
                                • 2-20자 사이로 입력해주세요{'\n'}
                                • 특수문자 사용 가능합니다{'\n'}
                                • 다른 사용자와 중복될 수 있습니다
                            </Text>
                        </View>
                    </Animated.View>

                    {/* 버튼 */}
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

                        {/* 변경 버튼 */}
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
                                    colors={[theme.success, theme.success + 'DD']}
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
                                        <ActivityIndicator size="small" color={theme.onPrimary} />
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: 'GoogleSans-Medium',
                                                color: theme.onPrimary,
                                                marginLeft: 8,
                                            }}
                                        >
                                            변경 중...
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
                                        변경하기
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