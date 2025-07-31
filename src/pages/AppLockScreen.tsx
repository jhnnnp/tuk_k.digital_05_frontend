import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
    TextInput,
    Modal,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../styles/ThemeProvider';
import { userDataService } from '../services/UserDataService';
import { useUserData } from '../contexts/UserDataContext';

export default function AppLockScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const { currentUserId } = useUserData();
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [pinEnabled, setPinEnabled] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMode, setPinMode] = useState<'set' | 'confirm'>('set');

    useEffect(() => {
        checkBiometricAvailability();
        loadAppLockSettings();
    }, [currentUserId]);

    const checkBiometricAvailability = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            console.log('🔍 [BIOMETRIC] 하드웨어 지원:', hasHardware);
            console.log('🔍 [BIOMETRIC] 등록된 생체:', isEnrolled);
            console.log('🔍 [BIOMETRIC] 지원 타입:', supportedTypes);

            setIsBiometricAvailable(hasHardware && isEnrolled);
        } catch (error) {
            console.error('❌ [BIOMETRIC] 생체 인증 확인 실패:', error);
        }
    };

    const loadAppLockSettings = async () => {
        try {
            console.log('🔍 [APP LOCK] 설정 로드 시작');

            if (!currentUserId) {
                console.log('⚠️ [APP LOCK] 현재 사용자 ID 없음');
                return;
            }

            const settings = await userDataService.getAppLockSettings(currentUserId);
            if (settings) {
                console.log('📦 [APP LOCK] 로드된 설정:', settings);

                setAppLockEnabled(settings.appLockEnabled || false);
                setBiometricEnabled(settings.biometricEnabled || false);
                setPinEnabled(settings.pinEnabled || false);
                setCurrentPin(settings.currentPin || '');

                console.log('✅ [APP LOCK] 설정 로드 완료');
                console.log(`  🔒 앱 잠금: ${settings.appLockEnabled ? '활성화' : '비활성화'}`);
                console.log(`  👆 생체 인증: ${settings.biometricEnabled ? '활성화' : '비활성화'}`);
                console.log(`  🔢 PIN: ${settings.pinEnabled ? '활성화' : '비활성화'}`);
                console.log(`  🔑 PIN 값: ${settings.currentPin ? '설정됨' : '설정안됨'}`);
                if (settings.currentPin) {
                    console.log(`  🔑 PIN 길이: ${settings.currentPin.length}자`);
                }
            } else {
                console.log('📝 [APP LOCK] 저장된 설정 없음');
            }
        } catch (error) {
            console.error('❌ [APP LOCK] 설정 로드 실패:', error);
        }
    };

    const saveAppLockSettings = async () => {
        try {
            if (!currentUserId) {
                console.log('⚠️ [APP LOCK] 현재 사용자 ID 없음 - 설정 저장 불가');
                return;
            }

            const settings = {
                appLockEnabled,
                biometricEnabled,
                pinEnabled,
                currentPin: currentPin,
            };

            await userDataService.saveAppLockSettings(currentUserId, settings);
            console.log('💾 [APP LOCK] 설정 저장 완료');
            console.log('📦 [APP LOCK] 저장된 설정:', settings);
        } catch (error) {
            console.error('❌ [APP LOCK] 설정 저장 실패:', error);
        }
    };

    const handleAppLockToggle = async (value: boolean) => {
        setAppLockEnabled(value);
        await Haptics.selectionAsync();

        if (value) {
            Alert.alert('앱 잠금 활성화', '앱 잠금이 활성화되었습니다.');
        } else {
            // 앱 잠금 비활성화 시 하위 설정들도 비활성화
            setBiometricEnabled(false);
            setPinEnabled(false);
            Alert.alert('앱 잠금 비활성화', '앱 잠금이 비활성화되었습니다.');
        }

        saveAppLockSettings();
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: '생체 인증을 활성화하려면 인증해주세요',
                    fallbackLabel: 'PIN 사용',
                });

                if (result.success) {
                    setBiometricEnabled(true);
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('생체 인증 활성화', '생체 인증이 활성화되었습니다.');
                } else {
                    Alert.alert('인증 실패', '생체 인증에 실패했습니다.');
                    return;
                }
            } catch (error) {
                Alert.alert('생체 인증 오류', '생체 인증 설정에 실패했습니다.');
                return;
            }
        } else {
            setBiometricEnabled(false);
            await Haptics.selectionAsync();
            Alert.alert('생체 인증 비활성화', '생체 인증이 비활성화되었습니다.');
        }

        saveAppLockSettings();
    };

    const handlePinToggle = (value: boolean) => {
        if (value) {
            setPinMode('set');
            setShowPinModal(true);
        } else {
            setPinEnabled(false);
            setCurrentPin('');
            saveAppLockSettings();
            Alert.alert('PIN 비활성화', 'PIN 잠금이 비활성화되었습니다.');
        }
    };

    const handleSetPin = () => {
        if (newPin.length !== 4) {
            Alert.alert('PIN 오류', 'PIN은 4자리 숫자여야 합니다.');
            return;
        }
        setPinMode('confirm');
        setConfirmPin('');
    };

    const handleConfirmPin = () => {
        if (newPin !== confirmPin) {
            Alert.alert('PIN 오류', 'PIN이 일치하지 않습니다.');
            setConfirmPin('');
            return;
        }

        setPinEnabled(true);
        setCurrentPin(newPin);
        setShowPinModal(false);
        setNewPin('');
        setConfirmPin('');

        // PIN을 설정에 저장
        const updatedSettings = {
            appLockEnabled,
            biometricEnabled,
            pinEnabled: true,
            currentPin: newPin,
        };
        AsyncStorage.setItem('appLockSettings', JSON.stringify(updatedSettings));

        console.log('🔢 [APP LOCK] PIN 설정 완료');
        console.log(`  🔑 PIN 값: ${newPin}`);
        console.log(`  🔑 PIN 길이: ${newPin.length}자`);

        Alert.alert('PIN 설정 완료', 'PIN 잠금이 설정되었습니다.');
    };

    const SecurityItem = ({
        icon,
        title,
        description,
        value,
        onValueChange,
        disabled = false,
        iconColor = theme.success,
        iconBg = theme.success + '20',
    }: {
        icon: string;
        title: string;
        description: string;
        value: boolean;
        onValueChange?: (value: boolean) => void;
        disabled?: boolean;
        iconColor?: string;
        iconBg?: string;
    }) => (
        <View style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.outline + '20',
            opacity: disabled ? 0.6 : 1,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                }}>
                    <Ionicons name={icon as any} size={24} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 17,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 4,
                    }}>
                        {title}
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 20,
                    }}>
                        {description}
                    </Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    trackColor={{ false: theme.outline + '40', true: iconColor + '40' }}
                    thumbColor={value ? iconColor : theme.outline}
                />
            </View>
        </View>
    );

    const getStatusText = () => {
        if (!appLockEnabled) return '비활성화됨';
        if (biometricEnabled && pinEnabled) return '생체 인증 + PIN';
        if (biometricEnabled) return '생체 인증';
        if (pinEnabled) return 'PIN';
        return '활성화됨';
    };

    const getStatusColor = () => {
        if (!appLockEnabled) return theme.textSecondary;
        return theme.success;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline + '20',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 18,
                    fontFamily: 'GoogleSans-Medium',
                    color: theme.textPrimary,
                }}>
                    앱 잠금
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Card */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: theme.outline + '20',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: appLockEnabled ? theme.success + '20' : theme.outline + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}>
                            <Ionicons
                                name={appLockEnabled ? "shield-checkmark" : "shield-outline"}
                                size={20}
                                color={appLockEnabled ? theme.success : theme.textSecondary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'GoogleSans-Medium',
                                color: theme.textPrimary,
                            }}>
                                현재 상태
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Regular',
                                color: getStatusColor(),
                            }}>
                                {getStatusText()}
                            </Text>
                        </View>
                    </View>
                    <Text style={{
                        fontSize: 13,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 18,
                    }}>
                        앱 잠금을 활성화하면 앱을 실행할 때마다 인증이 필요합니다.
                    </Text>
                </View>

                {/* Main Settings */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 16,
                    }}>
                        잠금 설정
                    </Text>

                    <SecurityItem
                        icon="lock-closed"
                        title="앱 잠금"
                        description="앱 실행 시 잠금 해제를 요구합니다"
                        value={appLockEnabled}
                        onValueChange={handleAppLockToggle}
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                    />

                    <SecurityItem
                        icon="keypad"
                        title="PIN 잠금"
                        description="4자리 숫자 PIN으로 앱을 잠금 해제합니다"
                        value={pinEnabled}
                        onValueChange={handlePinToggle}
                        disabled={!appLockEnabled}
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                    />

                    <SecurityItem
                        icon="finger-print"
                        title="생체 인증"
                        description={
                            !isBiometricAvailable
                                ? "기기에 생체 인증이 설정되지 않았습니다"
                                : biometricEnabled
                                    ? "Face ID 또는 지문으로 앱을 잠금 해제합니다"
                                    : "Face ID 또는 지문으로 앱을 잠금 해제합니다"
                        }
                        value={biometricEnabled}
                        onValueChange={handleBiometricToggle}
                        disabled={!appLockEnabled || !isBiometricAvailable}
                        iconColor={isBiometricAvailable ? theme.success : theme.textSecondary}
                        iconBg={isBiometricAvailable ? theme.success + '20' : theme.outline + '20'}
                    />
                </View>

                {/* Security Tips */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: theme.outline + '20',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="information-circle" size={20} color={theme.info} />
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            marginLeft: 8,
                        }}>
                            보안 팁
                        </Text>
                    </View>
                    <View style={{ gap: 8 }}>
                        <Text style={{
                            fontSize: 13,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            lineHeight: 18,
                        }}>
                            • PIN과 생체 인증을 동시에 사용할 수 있습니다
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            lineHeight: 18,
                        }}>
                            • 보안을 위해 정기적으로 PIN을 변경하는 것을 권장합니다
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            lineHeight: 18,
                        }}>
                            • 생체 인증은 기기 설정에서 관리됩니다
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* PIN Modal */}
            <Modal
                visible={showPinModal}
                transparent={true}
                animationType="fade"
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <View style={{
                        backgroundColor: theme.surface,
                        borderRadius: 20,
                        padding: 24,
                        width: '100%',
                        maxWidth: 320,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10,
                    }}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                width: 60,
                                height: 60,
                                borderRadius: 15,
                                backgroundColor: theme.warning + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}>
                                <Ionicons name="keypad" size={28} color={theme.warning} />
                            </View>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'GoogleSans-Medium',
                                color: theme.textPrimary,
                                marginBottom: 8,
                                textAlign: 'center',
                            }}>
                                {pinMode === 'set' ? 'PIN 설정' : 'PIN 확인'}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                                textAlign: 'center',
                                lineHeight: 20,
                            }}>
                                {pinMode === 'set' ? '4자리 숫자 PIN을 입력하세요' : 'PIN을 다시 입력하세요'}
                            </Text>
                        </View>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: theme.outline,
                                borderRadius: 12,
                                padding: 16,
                                fontSize: 20,
                                fontFamily: 'GoogleSans-Medium',
                                color: theme.textPrimary,
                                marginBottom: 24,
                                textAlign: 'center',
                                letterSpacing: 8,
                                backgroundColor: theme.background,
                            }}
                            value={pinMode === 'set' ? newPin : confirmPin}
                            onChangeText={pinMode === 'set' ? setNewPin : setConfirmPin}
                            placeholder="0000"
                            placeholderTextColor={theme.textSecondary}
                            maxLength={4}
                            keyboardType="numeric"
                            secureTextEntry={true}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: theme.outline,
                                    backgroundColor: 'transparent',
                                }}
                                onPress={() => {
                                    setShowPinModal(false);
                                    setNewPin('');
                                    setConfirmPin('');
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary,
                                    textAlign: 'center',
                                }}>
                                    취소
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    backgroundColor: theme.warning,
                                }}
                                onPress={pinMode === 'set' ? handleSetPin : handleConfirmPin}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.onPrimary,
                                    textAlign: 'center',
                                }}>
                                    {pinMode === 'set' ? '다음' : '확인'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
} 