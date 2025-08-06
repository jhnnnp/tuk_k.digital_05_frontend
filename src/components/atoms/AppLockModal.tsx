import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../styles/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface AppLockModalProps {
    visible: boolean;
    onUnlock?: () => void;
    onSetupComplete?: (pin: string) => void;
    onCancel?: () => void;
    mode: 'auth' | 'setup' | 'setupConfirm';
    expectedPin?: string;
    setupPin?: string;
    navigation?: any;
    pinEnabled?: boolean;
    biometricEnabled?: boolean;
    isBiometricAvailable?: boolean;
}

type AuthState = 'initial' | 'biometric' | 'pin' | 'success';

export default function AppLockModal({
    visible,
    onUnlock,
    onSetupComplete,
    onCancel,
    mode,
    expectedPin,
    setupPin,
    pinEnabled: propPinEnabled,
    biometricEnabled: propBiometricEnabled,
    isBiometricAvailable: propIsBiometricAvailable,
}: AppLockModalProps) {
    const { theme } = useTheme();

    /* ────────────────────────────────
     *              STATE
     * ──────────────────────────────── */
    const [enteredPin, setEnteredPin] = useState('');
    const [setupPinState, setSetupPinState] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authState, setAuthState] = useState<AuthState>('initial');

    /* ────────────────────────────────
     *          ANIMATION VALUES
     * ──────────────────────────────── */
    const modalOpacity = useSharedValue(0);
    const modalScale = useSharedValue(0.9);
    const errorShake = useSharedValue(0);
    const pinDots = Array(4)
        .fill(0)
        .map(() => useSharedValue(0));

    /* ────────────────────────────────
     *       ANIMATED STYLES
     * ──────────────────────────────── */
    const modalOpacityStyle = useAnimatedStyle(() => ({ opacity: modalOpacity.value }));
    const modalScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: modalScale.value }] }));
    const errorShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: errorShake.value }],
    }));
    const pinDotStyles = pinDots.map(anim =>
        useAnimatedStyle(() => ({ transform: [{ scale: anim.value }] })),
    );

    /* ────────────────────────────────
     *         EFFECT - MODAL OPEN
     * ──────────────────────────────── */
    useEffect(() => {
        if (!visible) return;

        // Entrance animation
        modalOpacity.value = withTiming(1, { duration: 300 });
        modalScale.value = withSpring(1, { damping: 20, stiffness: 100 });

        // Reset state
        setEnteredPin('');
        setSetupPinState('');
        setIsLoading(false);

        // Decide initial auth state
        if (
            mode === 'auth' &&
            propBiometricEnabled &&
            propIsBiometricAvailable &&
            propPinEnabled
        ) {
            setAuthState('biometric');
        } else {
            setAuthState('pin');
        }
    }, [visible]);

    /* ────────────────────────────────
     *  EFFECT - TRIGGER BIOMETRIC FLOW
     * ──────────────────────────────── */
    useEffect(() => {
        if (authState !== 'biometric') return;

        const timeout = setTimeout(() => {
            handleBiometricAuth();
        }, 600); // small delay for better UX

        return () => clearTimeout(timeout);
    }, [authState]);

    /* ────────────────────────────────
     *      PIN DOT ANIMATION
     * ──────────────────────────────── */
    useEffect(() => {
        pinDots.forEach((anim, index) => {
            anim.value =
                index < enteredPin.length
                    ? withSpring(1, { damping: 12, stiffness: 300 })
                    : withSpring(0, { damping: 12, stiffness: 300 });
        });
    }, [enteredPin]);

    /* ────────────────────────────────
     *          HANDLE KEYPAD
     * ──────────────────────────────── */
    const handleKeyPress = async (key: string) => {
        if (isLoading || authState !== 'pin') return;

        await Haptics.selectionAsync();

        if (key === 'delete') {
            setEnteredPin(prev => prev.slice(0, -1));
            return;
        }

        if (enteredPin.length >= 4) return;

        const newPin = enteredPin + key;
        setEnteredPin(newPin);

        if (newPin.length === 4) {
            setTimeout(() => handlePinComplete(newPin), 300);
        }
    };

    /* ────────────────────────────────
     *        HANDLE PIN COMPLETE
     * ──────────────────────────────── */
    const handlePinComplete = async (pin: string) => {
        setIsLoading(true);

        try {
            if (mode === 'auth') {
                if (pin === expectedPin) {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setAuthState('success');
                    onUnlock?.();
                } else {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    errorShake.value = withSequence(
                        withTiming(10, { duration: 100 }),
                        withTiming(-10, { duration: 100 }),
                        withTiming(10, { duration: 100 }),
                        withTiming(0, { duration: 100 }),
                    );
                    setEnteredPin('');
                    Alert.alert('PIN 오류', '잘못된 PIN입니다.');
                }
            } else if (mode === 'setup') {
                setSetupPinState(pin);
                setEnteredPin('');
                onSetupComplete?.(pin); // 부모에서 mode를 'setupConfirm'으로 전환
            } else if (mode === 'setupConfirm') {
                if (pin === setupPin) {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setEnteredPin('');
                    setSetupPinState('');
                    onSetupComplete?.(pin);
                } else {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('PIN 오류', 'PIN이 일치하지 않습니다.');
                    setEnteredPin('');
                    onCancel?.();
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ────────────────────────────────
     *      HANDLE BIOMETRIC AUTH
     * ──────────────────────────────── */
    const handleBiometricAuth = async () => {
        if (!propBiometricEnabled || !propIsBiometricAvailable) {
            // 생체인증이 비활성화되어 있으면 PIN 입력으로 전환
            setAuthState('pin');
            return;
        }

        setIsLoading(true);
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: '앱 잠금을 해제하려면 인증해주세요',
                fallbackLabel: 'PIN 사용',
                cancelLabel: '취소',
            });

            if (result.success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setAuthState('success');
                onUnlock?.();
            } else {
                // 생체인증 실패 시 PIN 입력 상태로 유지
                setAuthState('pin');
                Alert.alert('생체인증 실패', 'PIN을 입력하여 계속 진행하세요.');
            }
        } catch (error) {
            console.error('생체인증 오류:', error);
            setAuthState('pin');
            Alert.alert('인증 오류', 'PIN을 입력하여 계속 진행하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    /* ────────────────────────────────
     *           RENDERERS
     * ──────────────────────────────── */
    const renderPinDots = () => (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
            {Array(4)
                .fill(0)
                .map((_, i) => (
                    <Animated.View
                        key={`dot-${i}`}
                        style={[
                            {
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                marginHorizontal: 12,
                                backgroundColor:
                                    i < enteredPin.length ? theme.primary : `${theme.outline}40`,
                                borderWidth: 2,
                                borderColor:
                                    i < enteredPin.length ? theme.primary : `${theme.outline}60`,
                            },
                            pinDotStyles[i],
                        ]}
                    />
                ))}
        </View>
    );

    const renderKeypad = () => {
        const layout = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['biometric', '0', 'delete'], // 7 아래에 생체인증 버튼 추가
        ];

        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {layout.map((row, r) => (
                    <View key={`row-${r}`} style={{ flexDirection: 'row', marginBottom: 12 }}>
                        {row.map(key => {
                            if (key === '') return <View key="empty" style={{ width: 80 }} />;

                            if (key === 'biometric') {
                                // 생체인증이 활성화되어 있고 사용 가능한 경우에만 표시
                                if (!propBiometricEnabled || !propIsBiometricAvailable) {
                                    return <View key="empty" style={{ width: 80 }} />;
                                }

                                return (
                                    <TouchableOpacity
                                        key="biometric"
                                        onPress={handleBiometricAuth}
                                        disabled={isLoading}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 40,
                                            backgroundColor: `${theme.primary}20`,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginHorizontal: 8,
                                            borderWidth: 1,
                                            borderColor: `${theme.primary}40`,
                                        }}
                                    >
                                        <Ionicons
                                            name="finger-print"
                                            size={32}
                                            color={theme.primary}
                                        />
                                    </TouchableOpacity>
                                );
                            }

                            if (key === 'delete')
                                return (
                                    <TouchableOpacity
                                        key="delete"
                                        onPress={() => handleKeyPress('delete')}
                                        disabled={isLoading}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 40,
                                            backgroundColor: `${theme.error}20`,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginHorizontal: 8,
                                            borderWidth: 1,
                                            borderColor: `${theme.error}40`,
                                        }}
                                    >
                                        <Ionicons
                                            name="backspace-outline"
                                            size={32}
                                            color={theme.error}
                                        />
                                    </TouchableOpacity>
                                );

                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => handleKeyPress(key)}
                                    disabled={isLoading}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        backgroundColor: theme.surface,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginHorizontal: 8,
                                        borderWidth: 1,
                                        borderColor: `${theme.outline}30`,
                                    }}
                                >
                                    <Text style={{ fontSize: 24, fontWeight: '600', color: theme.textPrimary }}>
                                        {key}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    const renderAuthContent = () => {
        if (mode === 'auth' && !propPinEnabled && !propBiometricEnabled) {
            // 미등록 사용자는 즉시 앱 잠금 해제
            setTimeout(() => {
                onUnlock?.();
            }, 100);

            return (
                <View style={{ alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                    <Text
                        style={{
                            marginTop: 12,
                            fontSize: 18,
                            color: theme.textPrimary,
                            textAlign: 'center',
                        }}
                    >
                        인증 완료
                    </Text>
                </View>
            );
        }

        switch (authState) {
            case 'biometric':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text
                            style={{
                                marginTop: 12,
                                fontSize: 16,
                                color: theme.textSecondary,
                                textAlign: 'center',
                            }}
                        >
                            생체인증을 시도하고 있습니다…
                        </Text>
                        <TouchableOpacity
                            style={{ marginTop: 20 }}
                            onPress={() => setAuthState('pin')}
                            disabled={isLoading}
                        >
                            <Text style={{ color: theme.textSecondary }}>PIN으로 진행하기</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'pin':
                return (
                    <Animated.View style={[errorShakeStyle, { alignItems: 'center' }]}>
                        {renderPinDots()}
                        {renderKeypad()}
                    </Animated.View>
                );

            case 'success':
                // 인증 성공 시 즉시 앱 잠금 해제
                setTimeout(() => {
                    onUnlock?.();
                }, 500);

                return (
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                        <Text
                            style={{
                                marginTop: 12,
                                fontSize: 18,
                                color: theme.textPrimary,
                                textAlign: 'center',
                            }}
                        >
                            인증 성공
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'auth':
                return '앱 잠금 해제';
            case 'setup':
                return 'PIN 설정';
            case 'setupConfirm':
                return 'PIN 확인';
            default:
                return '앱 잠금';
        }
    };

    const getDescription = () => {
        switch (authState) {
            case 'biometric':
                return '생체인증을 시도 중입니다…';
            case 'pin':
                return 'PIN을 입력하여 앱 잠금을 해제하세요';
            default:
                return '';
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />
            <Animated.View
                style={[
                    {
                        flex: 1,
                        backgroundColor: theme.background,
                        justifyContent: 'flex-end', // 중앙에서 아래쪽으로 변경
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingBottom: 60, // 하단 패딩 추가
                    },
                    modalOpacityStyle,
                ]}
            >
                <Animated.View style={[{ width: '100%', maxWidth: 400 }, modalScaleStyle]}>
                    {/* HEADER */}
                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: `${theme.primary}20`,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20,
                            }}
                        >
                            <Ionicons name="lock-closed" size={40} color={theme.primary} />
                        </View>
                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: theme.textPrimary,
                                marginBottom: 8,
                                textAlign: 'center',
                            }}
                        >
                            {getTitle()}
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                color: theme.textSecondary,
                                textAlign: 'center',
                            }}
                        >
                            {getDescription()}
                        </Text>
                    </View>

                    {/* AUTH CONTENT */}
                    {renderAuthContent()}

                    {/* CANCEL */}
                    <TouchableOpacity
                        style={{
                            marginTop: 30,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={onCancel}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={18}
                            color={theme.textSecondary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={{
                            fontSize: 16,
                            color: theme.textSecondary,
                            fontWeight: '500'
                        }}>
                            뒤로가기
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}
