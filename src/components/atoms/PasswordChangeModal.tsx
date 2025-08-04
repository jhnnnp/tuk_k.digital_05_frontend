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

interface PasswordChangeModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PasswordChangeModal({ visible, onClose, onSuccess }: PasswordChangeModalProps) {
    const { theme } = useTheme();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        }, 100);
    };

    const handleConfirmPress = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('비밀번호 오류', '새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('비밀번호 오류', '비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        confirmButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );

        setIsLoading(true);

        // 실제 비밀번호 변경 로직은 여기에 구현
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
            onSuccess?.();
        }, 2000);
    };

    const PasswordInput = ({
        value,
        onChangeText,
        placeholder,
        showPassword,
        onToggleShow,
        label,
    }: {
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        showPassword: boolean;
        onToggleShow: () => void;
        label: string;
    }) => (
        <View style={{ marginBottom: 20 }}>
            <Text style={{
                fontSize: 14,
                fontFamily: 'GoogleSans-Medium',
                color: theme.textPrimary,
                marginBottom: 8,
            }}>
                {label}
            </Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: theme.outline + '40',
                borderRadius: 12,
                backgroundColor: theme.background,
                paddingHorizontal: 16,
                paddingVertical: 12,
            }}>
                <TextInput
                    style={{
                        flex: 1,
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textPrimary,
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={onToggleShow}>
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                                colors={[theme.primary + '20', theme.primary + '10']}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Ionicons
                                    name="lock-closed"
                                    size={36}
                                    color={theme.primary}
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
                            비밀번호 변경
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            textAlign: 'center',
                            lineHeight: 24,
                        }}>
                            안전한 비밀번호로 계정을 보호하세요
                        </Text>
                    </View>

                    {/* 폼 */}
                    <Animated.View style={formAnimatedStyle}>
                        <PasswordInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="현재 비밀번호"
                            showPassword={showCurrentPassword}
                            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                            label="현재 비밀번호"
                        />

                        <PasswordInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="새 비밀번호 (8자 이상)"
                            showPassword={showNewPassword}
                            onToggleShow={() => setShowNewPassword(!showNewPassword)}
                            label="새 비밀번호"
                        />

                        <PasswordInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="새 비밀번호 확인"
                            showPassword={showConfirmPassword}
                            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                            label="새 비밀번호 확인"
                        />

                        {/* 보안 팁 */}
                        <View style={{
                            backgroundColor: theme.primary + '10',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.primary,
                                    marginLeft: 8,
                                }}>
                                    보안 팁
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 13,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                                lineHeight: 18,
                            }}>
                                • 8자 이상의 영문, 숫자, 특수문자 조합을 권장합니다{'\n'}
                                • 생년월일이나 전화번호는 사용하지 마세요{'\n'}
                                • 정기적으로 비밀번호를 변경하세요
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
                                    colors={[theme.primary, theme.primary + 'DD']}
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