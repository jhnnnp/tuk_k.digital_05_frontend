import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../styles/ThemeProvider';
import { userDataService } from '../../services/UserDataService';

interface AppLockModalProps {
    visible: boolean;
    onUnlock: () => void;
}

export default function AppLockModal({ visible, onUnlock }: AppLockModalProps) {
    const { theme } = useTheme();
    const [pinEnabled, setPinEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);

    useEffect(() => {
        if (visible) {
            loadLockSettings();
            checkBiometricAvailability();
        }
    }, [visible]);

    useEffect(() => {
        if (visible && biometricEnabled && isBiometricAvailable) {
            // 자동으로 생체 인증 시도
            setTimeout(() => {
                handleBiometricAuth();
            }, 500);
        }
    }, [visible, biometricEnabled, isBiometricAvailable]);

    const loadLockSettings = async () => {
        try {
            const currentUserId = userDataService.getCurrentUserId();
            if (!currentUserId) {
                console.log('⚠️ [APP LOCK MODAL] 현재 사용자 ID 없음');
                return;
            }

            const settings = await userDataService.getAppLockSettings(currentUserId);
            if (settings) {
                setPinEnabled(settings.pinEnabled || false);
                setBiometricEnabled(settings.biometricEnabled || false);
                setCurrentPin(settings.currentPin || '');
                console.log('📦 [APP LOCK MODAL] 잠금 설정 로드 완료:', settings);
            } else {
                console.log('📝 [APP LOCK MODAL] 잠금 설정 없음');
            }
        } catch (error) {
            console.error('❌ [APP LOCK MODAL] 잠금 설정 로드 실패:', error);
        }
    };

    const checkBiometricAvailability = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            setIsBiometricAvailable(hasHardware && isEnrolled);
        } catch (error) {
            console.error('생체 인증 확인 실패:', error);
        }
    };

    const handleBiometricAuth = async () => {
        if (!biometricEnabled || !isBiometricAvailable) return;

        try {
            setIsLoading(true);
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: '앱 잠금을 해제하려면 인증해주세요',
                fallbackLabel: 'PIN 사용',
                cancelLabel: '취소',
            });

            if (result.success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onUnlock();
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('인증 실패', '생체 인증에 실패했습니다.');
            }
        } catch (error) {
            console.error('생체 인증 오류:', error);
            Alert.alert('인증 오류', '생체 인증 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinSubmit = async () => {
        if (pin.length !== 4) {
            Alert.alert('PIN 오류', '4자리 PIN을 입력해주세요.');
            return;
        }

        if (pin === currentPin) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPin('');
            setAttempts(0);
            onUnlock();
        } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setAttempts(attempts + 1);
            setPin('');

            if (attempts >= 4) {
                // 5번 실패 시 30초 잠금
                setLockoutTime(30);
                const interval = setInterval(() => {
                    setLockoutTime((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setAttempts(0);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                Alert.alert('PIN 오류', `잘못된 PIN입니다. (${attempts + 1}/5)`);
            }
        }
    };

    const handleKeyPress = (key: string) => {
        if (lockoutTime > 0) return;

        if (key === 'delete') {
            setPin(prev => prev.slice(0, -1));
        } else if (key === 'biometric' && biometricEnabled && isBiometricAvailable) {
            handleBiometricAuth();
        } else if (pin.length < 4 && /^\d$/.test(key)) {
            setPin(prev => prev + key);
        }
    };

    const renderPinDots = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
                {[0, 1, 2, 3].map((index) => (
                    <View
                        key={index}
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: index < pin.length ? theme.primary : theme.outline,
                            marginHorizontal: 8,
                        }}
                    />
                ))}
            </View>
        );
    };

    const renderKeypad = () => {
        const keys = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['biometric', '0', 'delete']
        ];

        return (
            <View style={{ alignItems: 'center' }}>
                {keys.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 20 }}>
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                style={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: 35,
                                    backgroundColor: key === 'biometric' || key === 'delete'
                                        ? theme.surface
                                        : theme.primary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginHorizontal: 10,
                                    borderWidth: 1,
                                    borderColor: theme.outline + '20',
                                }}
                                onPress={() => handleKeyPress(key)}
                                disabled={lockoutTime > 0}
                            >
                                {key === 'biometric' ? (
                                    <Ionicons
                                        name="finger-print"
                                        size={24}
                                        color={biometricEnabled && isBiometricAvailable ? theme.success : theme.textSecondary}
                                    />
                                ) : key === 'delete' ? (
                                    <Ionicons name="backspace" size={24} color={theme.textPrimary} />
                                ) : (
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: key === 'biometric' || key === 'delete' ? theme.textPrimary : theme.onPrimary,
                                    }}>
                                        {key}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={{
                flex: 1,
                backgroundColor: theme.background,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
            }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 60 }}>
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        backgroundColor: theme.primary + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <Ionicons name="lock-closed" size={40} color={theme.primary} />
                    </View>
                    <Text style={{
                        fontSize: 24,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 8,
                    }}>
                        앱 잠금
                    </Text>
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        textAlign: 'center',
                    }}>
                        앱을 사용하려면 인증해주세요
                    </Text>
                </View>

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={{ marginBottom: 40 }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            marginTop: 12,
                            textAlign: 'center',
                        }}>
                            생체 인증 중...
                        </Text>
                    </View>
                )}

                {/* Lockout Message */}
                {lockoutTime > 0 && (
                    <View style={{ marginBottom: 40, alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.error,
                            marginBottom: 8,
                        }}>
                            너무 많은 시도
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                        }}>
                            {lockoutTime}초 후 다시 시도해주세요
                        </Text>
                    </View>
                )}

                {/* PIN Input */}
                {pinEnabled && !isLoading && lockoutTime === 0 && (
                    <>
                        {renderPinDots()}
                        {renderKeypad()}
                    </>
                )}

                {/* Biometric Button */}
                {biometricEnabled && isBiometricAvailable && !isLoading && lockoutTime === 0 && !pinEnabled && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: theme.success,
                            paddingHorizontal: 40,
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginTop: 20,
                        }}
                        onPress={handleBiometricAuth}
                    >
                        <Ionicons name="finger-print" size={24} color={theme.onPrimary} />
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.onPrimary,
                            marginTop: 8,
                        }}>
                            생체 인증으로 잠금 해제
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modal>
    );
} 