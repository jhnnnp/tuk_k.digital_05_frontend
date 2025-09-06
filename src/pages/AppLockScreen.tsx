import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../styles/ThemeProvider';
import { userDataService } from '../services/UserDataService';
import { useUserData } from '../contexts/UserDataContext';
import { useFocusEffect } from '@react-navigation/native';
import SuccessNotificationModal from '../components/atoms/SuccessNotificationModal';
import AppLockModal from '../components/atoms/AppLockModal';

const { width, height } = Dimensions.get('window');

export default function AppLockScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const { currentUserId } = useUserData();

    /* ────────────────────────────────
     *              STATE
     * ──────────────────────────────── */
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [pinEnabled, setPinEnabled] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [pinSetupCompleted, setPinSetupCompleted] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPinRegistered, setIsPinRegistered] = useState(false);

    // Success modal states
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState({
        title: '',
        message: '',
        icon: 'checkmark-circle'
    });

    // AppLockModal states
    const [showAppLockModal, setShowAppLockModal] = useState(false);
    const [appLockModalMode, setAppLockModalMode] = useState<'auth' | 'setup' | 'setupConfirm'>('auth');
    const [setupPinFirst, setSetupPinFirst] = useState('');

    // Track if settings are loaded to avoid redundant auth triggers
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Track which toggle initiated a setup flow to allow rollback on cancel
    const [pendingToggle, setPendingToggle] = useState<null | 'applock' | 'pin' | 'biometric'>(null);

    // Ensure we only run initial auth once per screen load
    const [initialAuthRan, setInitialAuthRan] = useState(false);

    // Animation values
    const headerTranslateY = useSharedValue(-50);
    const statusCardScale = useSharedValue(0.9);
    const settingsOpacity = useSharedValue(0);

    /* ────────────────────────────────
     *       ANIMATED STYLES
     * ──────────────────────────────── */
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: headerTranslateY.value }],
    }));

    const statusCardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: statusCardScale.value }],
    }));

    const settingsOpacityAnimatedStyle = useAnimatedStyle(() => ({
        opacity: settingsOpacity.value,
    }));

    /* ────────────────────────────────
     *         INITIAL SETUP
     * ──────────────────────────────── */
    useEffect(() => {
        checkBiometricAvailability();
        loadAppLockSettings();

        // Page entrance animations
        headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        statusCardScale.value = withSpring(1, { damping: 20, stiffness: 100 });
        settingsOpacity.value = withTiming(1, { duration: 600 });
    }, []);

    /* ────────────────────────────────
     *       FOCUS EFFECT
     * ──────────────────────────────── */
    useFocusEffect(
        React.useCallback(() => {
            console.log('🎯 [APP LOCK] 화면 포커스됨 - 설정 로드 시작');
            setSettingsLoaded(false);
            setInitialAuthRan(false);
            setIsAuthenticated(false);
            loadAppLockSettings();
        }, [currentUserId])
    );

    /* ────────────────────────────────
     *    AUTHENTICATION CHECK FLOW
     * ──────────────────────────────── */
    useEffect(() => {
        if (!settingsLoaded || initialAuthRan) return;
        console.log('⚙️ [APP LOCK] 설정 로드 완료 - 인증 체크 시작');
        console.log(`  - PIN 등록 상태: ${isPinRegistered ? '등록됨' : '미등록'}`);
        console.log(`  - 앱 잠금 활성화: ${appLockEnabled}`);
        console.log(`  - 생체인증 활성화: ${biometricEnabled}`);
        console.log(`  - PIN 활성화: ${pinEnabled}`);
        console.log(`  - 현재 인증 상태: ${isAuthenticated ? '인증됨' : '미인증'}`);

        if (isPinRegistered) {
            console.log('🔒 [APP LOCK] PIN 등록 유저 - 인증 체크 시작');
            setIsAuthenticated(false);
            performSequentialAuthentication();
        } else {
            console.log('✅ [APP LOCK] PIN 미등록 유저 - 인증 불필요');
            setIsAuthenticated(true);
            setIsAuthenticating(false);
        }
        setInitialAuthRan(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsLoaded, isPinRegistered, initialAuthRan]);

    useEffect(() => {
        if (pinSetupCompleted) {
            console.log('🎉 [APP LOCK] PIN 설정 완료 감지 - 설정 저장');
            saveAppLockSettings();
        }
    }, [pinSetupCompleted]);

    /* ────────────────────────────────
     *       AUTHENTICATION LOGIC
     * ──────────────────────────────── */
    const checkAuthentication = async () => {
        console.log('🔍 [APP LOCK] 인증 체크 시작');
        console.log(`  - PIN 등록 여부: ${isPinRegistered ? '등록됨' : '등록안됨'}`);

        if (!isPinRegistered) {
            console.log('✅ [APP LOCK] PIN 미등록 유저 감지');
            console.log('   → 인증 절차 없이 앱락 설정 화면 바로 접근 허용');
            setIsAuthenticated(true);
            setIsAuthenticating(false);
            return;
        }

        console.log('🔒 [APP LOCK] PIN 등록 유저 - 새로운 인증 필요');
        setIsAuthenticated(false);
        await performSequentialAuthentication();
    };

    // ✨ 핵심 수정: 순차적 인증 로직
    const performSequentialAuthentication = async () => {
        console.log('🔐 [APP LOCK] 순차적 인증 수행 시작');
        console.log(`  - 생체인증 활성화: ${biometricEnabled}`);
        console.log(`  - 생체인증 사용가능: ${isBiometricAvailable}`);
        console.log(`  - PIN 활성화: ${pinEnabled}`);

        setIsAuthenticating(true);

        try {
            // 1단계: 생체인증 시도 (메인 화면에서)
            if (biometricEnabled && isBiometricAvailable) {
                console.log('👆 [APP LOCK] 1단계: 생체인증 시도 (메인 화면)');

                const biometricResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: '앱 잠금 설정에 접근하려면 인증해주세요',
                    fallbackLabel: 'PIN 사용',
                    cancelLabel: '취소',
                });

                console.log(`👆 [APP LOCK] 생체인증 결과: ${biometricResult.success ? '성공' : '실패'}`);

                if (biometricResult.success) {
                    console.log('✅ [APP LOCK] 생체인증 성공 - 바로 설정 화면 진입');
                    setIsAuthenticated(true);
                    setIsAuthenticating(false);
                    return;
                }

                console.log('❌ [APP LOCK] 생체인증 실패 - PIN 입력으로 전환');
            }

            // 2단계: PIN 입력 (모달에서)
            if (pinEnabled && currentPin) {
                console.log('🔢 [APP LOCK] 2단계: PIN 입력 모달 표시');
                setIsAuthenticating(false); // 로딩 화면 숨기기
                setAppLockModalMode('auth');
                setShowAppLockModal(true);
                return;
            }

            // 인증 방법이 없으면 바로 진입
            console.log('⚠️ [APP LOCK] 인증 방법 없음 - 바로 진입');
            setIsAuthenticated(true);
            setIsAuthenticating(false);

        } catch (error) {
            console.error('❌ [APP LOCK] 인증 오류:', error);
            setIsAuthenticating(false);
            setIsAuthenticated(false); // 화면 차단 유지

            // 인증 실패 시 사용자에게 선택권 제공
            Alert.alert(
                '인증 실패',
                '인증에 실패했습니다.',
                [
                    { text: '뒤로가기', onPress: () => navigation.goBack() },
                    {
                        text: 'PIN 입력',
                        onPress: () => {
                            if (pinEnabled && currentPin) {
                                setAppLockModalMode('auth');
                                setShowAppLockModal(true);
                            }
                        }
                    }
                ]
            );
        }
    };

    /* ────────────────────────────────
     *      BIOMETRIC AVAILABILITY
     * ──────────────────────────────── */
    const checkBiometricAvailability = async () => {
        try {
            console.log('🔍 [BIOMETRIC] 생체인증 사용 가능 여부 확인 시작');

            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const authenticationType = await LocalAuthentication.getEnrolledLevelAsync();

            console.log('🔍 [BIOMETRIC] 하드웨어 지원:', hasHardware);
            console.log('🔍 [BIOMETRIC] 등록된 생체:', isEnrolled);
            console.log('🔍 [BIOMETRIC] 지원 타입:', supportedTypes);
            console.log('🔍 [BIOMETRIC] 인증 레벨:', authenticationType);

            const isAvailable = hasHardware && isEnrolled;
            console.log('🔍 [BIOMETRIC] 최종 사용 가능 여부:', isAvailable);

            if (!hasHardware) {
                console.log('❌ [BIOMETRIC] 하드웨어가 지원되지 않음');
            }
            if (!isEnrolled) {
                console.log('❌ [BIOMETRIC] 생체인증이 등록되지 않음');
            }

            setIsBiometricAvailable(isAvailable);
        } catch (error) {
            console.error('❌ [BIOMETRIC] 생체 인증 확인 실패:', error);
            setIsBiometricAvailable(false);
        }
    };

    /* ────────────────────────────────
     *      SETTINGS LOAD/SAVE
     * ──────────────────────────────── */
    const loadAppLockSettings = async () => {
        try {
            console.log('🔍 [APP LOCK] 설정 로드 시작');

            let settings = null;

            if (currentUserId) {
                console.log(`👤 [APP LOCK] 사용자별 설정 로드 시도 - 사용자ID: ${currentUserId}`);
                settings = await userDataService.getAppLockSettings(currentUserId);
            } else {
                console.log('⚠️ [APP LOCK] 현재 사용자 ID 없음');
            }

            if (!settings) {
                console.log('📦 [APP LOCK] 사용자별 설정 없음 - 전역 설정 로드 시도');
                const globalSettings = await AsyncStorage.getItem('appLockSettings');
                if (globalSettings) {
                    settings = JSON.parse(globalSettings);
                    console.log('📦 [APP LOCK] 전역 설정 로드됨');
                } else {
                    console.log('📝 [APP LOCK] 전역 설정도 없음');
                }
            }

            const isResetMode = await AsyncStorage.getItem('appLockResetMode');
            if (isResetMode === 'true') {
                console.log('🔄 [APP LOCK] 초기화 모드 감지 - 기본값 사용');
                settings = null;
                await AsyncStorage.removeItem('appLockResetMode');
            }

            const merged = {
                appLockEnabled: false,
                biometricEnabled: false,
                pinEnabled: false,
                currentPin: '',
                pinSetupCompleted: false,
                ...(settings || {}),
            };

            console.log('📦 [APP LOCK] 최종 적용 설정:', merged);

            setAppLockEnabled(!!merged.appLockEnabled);
            setBiometricEnabled(!!merged.biometricEnabled);
            setPinEnabled(!!merged.pinEnabled);
            setCurrentPin(merged.currentPin || '');
            setPinSetupCompleted(!!merged.pinSetupCompleted);

            // 등록 여부는 설정 기반으로 단일 결정
            const registered = !!(merged.pinEnabled && merged.currentPin);
            setIsPinRegistered(registered);

            console.log('✅ [APP LOCK] 설정 로드 완료');
            console.log(`  🔒 앱 잠금: ${merged.appLockEnabled ? '활성화' : '비활성화'}`);
            console.log(`  👆 생체 인증: ${merged.biometricEnabled ? '활성화' : '비활성화'}`);
            console.log(`  🔢 PIN: ${merged.pinEnabled ? '활성화' : '비활성화'}`);
            console.log(`  🔑 PIN 등록됨: ${registered ? '등록됨' : '등록안됨'}`);
            setSettingsLoaded(true);
        } catch (error) {
            console.error('❌ [APP LOCK] 설정 로드 실패:', error);
            setIsPinRegistered(false);
            setSettingsLoaded(true);
        }
    };

    const saveAppLockSettings = async (customSettings?: any) => {
        try {
            const settings = customSettings || {
                appLockEnabled,
                biometricEnabled,
                pinEnabled,
                currentPin: currentPin,
                pinSetupCompleted: pinSetupCompleted,
                isPinRegistered: isPinRegistered,
            };

            if (currentUserId) {
                await userDataService.saveAppLockSettings(currentUserId, settings);
                console.log('💾 [APP LOCK] 설정 저장 완료 (사용자별)');
            } else {
                await AsyncStorage.setItem('appLockSettings', JSON.stringify(settings));
                console.log('💾 [APP LOCK] 설정 저장 완료 (전역)');
            }

            console.log('📦 [APP LOCK] 저장된 설정:', settings);
        } catch (error) {
            console.error('❌ [APP LOCK] 설정 저장 실패:', error);
        }
    };

    /* ────────────────────────────────
     *        MODAL HANDLERS
     * ──────────────────────────────── */
    const handleAppLockModalUnlock = () => {
        console.log('✅ [APP LOCK] AppLockModal 인증 성공');
        setShowAppLockModal(false);
        setIsAuthenticated(true);
        setIsAuthenticating(false);
        setPendingToggle(null);
    };

    const handlePinSetupComplete = async (pin: string) => {
        console.log('🔧 [APP LOCK] PIN 설정 완료 처리:', appLockModalMode, pin);

        if (appLockModalMode === 'setup') {
            console.log('📝 [APP LOCK] 첫 번째 PIN 입력 완료, 확인 모드로 전환');
            setSetupPinFirst(pin);
            setAppLockModalMode('setupConfirm');
        } else if (appLockModalMode === 'setupConfirm') {
            console.log('✅ [APP LOCK] PIN 확인 완료, 설정 저장');

            setPinEnabled(true);
            setCurrentPin(pin);
            setPinSetupCompleted(true);
            setIsPinRegistered(true);

            setShowAppLockModal(false);
            setSetupPinFirst('');
            setAppLockModalMode('auth');
            setPendingToggle(null);

            const updatedSettings = {
                appLockEnabled: true,
                biometricEnabled: biometricEnabled,
                pinEnabled: true,
                currentPin: pin,
                pinSetupCompleted: true,
                isPinRegistered: true,
            };
            await saveAppLockSettings(updatedSettings);

            showSuccessModal(
                '앱 잠금 활성화',
                '앱 잠금이 활성화되었습니다.\nPIN이 설정되었습니다.',
                'shield-checkmark'
            );
        }
    };

    const handleAppLockModalCancel = () => {
        console.log('❌ [APP LOCK] AppLockModal 취소');
        setShowAppLockModal(false);
        setIsAuthenticating(false);

        if (appLockModalMode === 'setupConfirm') {
            // PIN 확인 중 취소 시 setup 모드로 돌아가기
            setAppLockModalMode('setup');
            setSetupPinFirst('');
            return;
        }

        // 세팅 과정에서의 취소라면 상태 원복
        if (pendingToggle === 'applock') {
            setAppLockEnabled(false);
        }
        if (pendingToggle === 'pin') {
            setPinEnabled(false);
            setCurrentPin('');
            setPinSetupCompleted(false);
            setIsPinRegistered(false);
        }
        if (pendingToggle === 'biometric') {
            setBiometricEnabled(false);
        }
        setPendingToggle(null);

        // 인증 모드에서 취소 시 뒤로가기
        if (appLockModalMode === 'auth') {
            navigation.goBack();
        }
    };

    /* ────────────────────────────────
     *        TOGGLE HANDLERS
     * ──────────────────────────────── */
    const handleAppLockToggle = async (value: boolean) => {
        await Haptics.selectionAsync();
        if (value) {
            setPendingToggle('applock');
            setAppLockEnabled(true);
            setAppLockModalMode('setup');
            setShowAppLockModal(true);
        } else {
            setAppLockEnabled(false);
            setBiometricEnabled(false);
            setPinEnabled(false);
            setCurrentPin('');
            setPinSetupCompleted(false);
            setIsPinRegistered(false);
            await saveAppLockSettings({
                appLockEnabled: false,
                biometricEnabled: false,
                pinEnabled: false,
                currentPin: '',
                pinSetupCompleted: false,
                isPinRegistered: false,
            });
            showSuccessModal(
                '앱 잠금 비활성화',
                '앱 잠금이 비활성화되었습니다.',
                'shield-outline'
            );
        }
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            if (!pinEnabled || !currentPin) {
                Alert.alert(
                    'PIN 설정 필요',
                    '생체인증을 사용하려면 먼저 PIN을 설정해야 합니다.',
                    [
                        { text: '취소', style: 'cancel' },
                        {
                            text: 'PIN 설정',
                            onPress: () => {
                                setAppLockModalMode('setup');
                                setShowAppLockModal(true);
                            }
                        }
                    ]
                );
                return;
            }
            setPendingToggle('biometric');
            await setupBiometricAuth();
        } else {
            setBiometricEnabled(false);
            await Haptics.selectionAsync();
            showSuccessModal(
                '생체 인증 비활성화',
                '생체 인증이 비활성화되었습니다.',
                'finger-print-outline'
            );
            saveAppLockSettings();
        }
    };

    const setupBiometricAuth = async () => {
        try {
            console.log('👆 [APP LOCK] 생체인증 설정 시작');

            // 하드웨어와 등록 상태 확인
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            console.log('👆 [APP LOCK] 하드웨어 지원:', hasHardware);
            console.log('👆 [APP LOCK] 등록된 생체:', isEnrolled);
            console.log('👆 [APP LOCK] 지원 타입:', supportedTypes);

            if (!hasHardware || !isEnrolled) {
                Alert.alert('생체인증 불가', '하드웨어가 지원되지 않거나 생체인증이 등록되지 않았습니다.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'TIBO 앱 잠금 해제를 위해 생체인증을 설정해주세요',
                fallbackLabel: '패스코드 사용',
                cancelLabel: '취소',
                disableDeviceFallback: false, // 패스코드 폴백 허용
            });

            console.log(`👆 [APP LOCK] 생체인증 결과: ${result.success ? '성공' : '실패'}`);

            if (result.success) {
                console.log('✅ [APP LOCK] 생체인증 성공 - 상태 업데이트');
                setBiometricEnabled(true);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                if (pinEnabled && currentPin) {
                    console.log('🔑 [APP LOCK] PIN 설정됨 - PIN 등록 상태 활성화');
                    setIsPinRegistered(true);
                }

                setTimeout(async () => {
                    console.log('💾 [APP LOCK] 생체인증 설정 저장');
                    const updatedSettings = {
                        appLockEnabled,
                        biometricEnabled: true,
                        pinEnabled,
                        currentPin: currentPin,
                        pinSetupCompleted: pinSetupCompleted,
                        isPinRegistered: pinEnabled && currentPin ? true : isPinRegistered,
                    };
                    await saveAppLockSettings(updatedSettings);
                }, 100);

                showSuccessModal(
                    '생체 인증 활성화',
                    '생체 인증이 활성화되었습니다.\nFace ID 또는 패스코드로 앱을 잠금 해제할 수 있습니다.',
                    'finger-print'
                );
            } else {
                console.log('❌ [APP LOCK] 생체인증 실패');
                Alert.alert('인증 실패', '생체인증에 실패했습니다. Face ID가 실패하면 자동으로 패스코드 입력으로 전환됩니다.');
            }
        } catch (error) {
            console.error('❌ [APP LOCK] 생체인증 오류:', error);
            Alert.alert('생체 인증 오류', '생체 인증 설정에 실패했습니다.');
        }
    };

    const handlePinToggle = (value: boolean) => {
        if (value) {
            setPendingToggle('pin');
            setAppLockModalMode('setup');
            setShowAppLockModal(true);
        } else {
            setPinEnabled(false);
            setCurrentPin('');
            setPinSetupCompleted(false);
            setIsPinRegistered(false);
            setBiometricEnabled(false);
            saveAppLockSettings();
            showSuccessModal(
                'PIN 비활성화',
                'PIN 잠금이 비활성화되었습니다.\n생체인증도 함께 비활성화됩니다.',
                'keypad-outline'
            );
        }
    };

    /* ────────────────────────────────
     *         UTILITY FUNCTIONS
     * ──────────────────────────────── */
    const showSuccessModal = (title: string, message: string, icon: string = 'checkmark-circle') => {
        setSuccessModalConfig({ title, message, icon });
        setSuccessModalVisible(true);
    };

    const resetAppLockSettings = async () => {
        try {
            console.log('🔄 [APP LOCK] 앱락 설정 초기화 시작');

            const keysToRemove = [
                'appLockEnabled',
                'biometricEnabled',
                'pinEnabled',
                'currentPin',
                'pinSetupCompleted',
                'isPinRegistered',
                'appLockSettings',
                'userAppLockSettings',
                'globalAppLockSettings',
                'appLockSettings_global'
            ];

            if (currentUserId) {
                const userKeys = [
                    `user_${currentUserId}_appLockSettings`,
                    `user_${currentUserId}_settings`,
                    `user_${currentUserId}_app_state`
                ];
                keysToRemove.push(...userKeys);
            }

            console.log('🗑️ [APP LOCK] AsyncStorage 키 제거:', keysToRemove);
            await AsyncStorage.multiRemove(keysToRemove);

            const globalKeys = [
                'globalAppLockSettings',
                'appLockSettings_global',
                'appLockSettings',
                'appLockEnabled',
                'biometricEnabled',
                'pinEnabled',
                'currentPin',
                'pinSetupCompleted',
                'isPinRegistered'
            ];

            for (const key of globalKeys) {
                await AsyncStorage.removeItem(key);
                console.log(`🗑️ [APP LOCK] 키 제거: ${key}`);
            }

            setAppLockEnabled(false);
            setBiometricEnabled(false);
            setPinEnabled(false);
            setCurrentPin('');
            setPinSetupCompleted(false);
            setIsPinRegistered(false);
            setIsAuthenticated(false);
            setIsAuthenticating(false);

            setShowAppLockModal(false);
            setAppLockModalMode('auth');
            setSetupPinFirst('');

            await AsyncStorage.setItem('appLockResetMode', 'true');

            console.log('✅ [APP LOCK] 앱락 설정 초기화 완료');
            Alert.alert('초기화 완료', '앱락 설정이 완전히 초기화되었습니다.');

            setTimeout(() => {
                loadAppLockSettings();
            }, 100);

        } catch (error) {
            console.error('❌ [APP LOCK] 앱락 설정 초기화 실패:', error);
            Alert.alert('오류', '초기화에 실패했습니다.');
        }
    };

    const testBiometricAuth = async () => {
        try {
            console.log('🧪 [BIOMETRIC] 테스트 생체인증 시작');

            // 먼저 하드웨어와 등록 상태 확인
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            console.log('🧪 [BIOMETRIC] 하드웨어:', hasHardware);
            console.log('🧪 [BIOMETRIC] 등록됨:', isEnrolled);
            console.log('🧪 [BIOMETRIC] 지원 타입:', supportedTypes);

            if (!hasHardware || !isEnrolled) {
                Alert.alert('생체인증 불가', '하드웨어가 지원되지 않거나 생체인증이 등록되지 않았습니다.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'TIBO 앱 잠금 해제',
                fallbackLabel: '패스코드 사용',
                cancelLabel: '취소',
                disableDeviceFallback: false, // 패스코드 폴백 허용
            });

            console.log('🧪 [BIOMETRIC] 테스트 결과:', result);

            if (result.success) {
                Alert.alert('성공', '생체인증이 성공했습니다!');
            } else {
                Alert.alert('실패', `생체인증 실패: ${result.error}\n\n이는 정상적인 동작입니다. Face ID가 실패하면 자동으로 패스코드 입력으로 전환됩니다.`);
            }
        } catch (error) {
            console.error('🧪 [BIOMETRIC] 테스트 오류:', error);
            Alert.alert('오류', `생체인증 오류: ${error}`);
        }
    };

    /* ────────────────────────────────
     *         UI COMPONENTS
     * ──────────────────────────────── */
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
        <BlurView
            intensity={20}
            tint="light"
            style={{
                borderRadius: 16,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.outline + '30',
            }}
        >
            <View style={{
                backgroundColor: theme.surface + 'E6',
                padding: 20,
                opacity: disabled ? 0.6 : 1,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LinearGradient
                        colors={[iconBg, iconColor + '10']}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 16,
                        }}
                    >
                        <Ionicons name={icon as any} size={24} color={iconColor} />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: theme.textPrimary,
                            marginBottom: 4,
                        }}>
                            {title}
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '400',
                            color: theme.textSecondary,
                            lineHeight: 20,
                        }}>
                            {description}
                        </Text>
                    </View>
                    {onValueChange && (
                        <TouchableOpacity
                            style={{
                                width: 51,
                                height: 31,
                                borderRadius: 15.5,
                                backgroundColor: value ? theme.primary : theme.outline,
                                padding: 2,
                                justifyContent: 'center',
                                shadowColor: theme.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: value ? 0.3 : 0,
                                shadowRadius: 4,
                                elevation: value ? 4 : 0,
                            }}
                            onPress={() => onValueChange(!value)}
                            disabled={disabled}
                        >
                            <Animated.View style={{
                                width: 27,
                                height: 27,
                                borderRadius: 13.5,
                                backgroundColor: theme.surface,
                                transform: [{ translateX: value ? 20 : 0 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                            }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </BlurView>
    );

    const getStatusText = () => {
        if (appLockEnabled) {
            return '활성화됨';
        }
        return '비활성화됨';
    };

    const getStatusDescription = () => {
        if (appLockEnabled) {
            return '앱을 완전 종료한 후 재실행할 때만 인증이 필요합니다.';
        }
        return '가족과 함께 사용하는 홈캠 앱이므로 편의성을 위해 기본적으로 비활성화되어 있습니다.';
    };

    const getStatusColor = () => {
        return appLockEnabled ? theme.success : theme.textSecondary;
    };

    /* ────────────────────────────────
     *          MAIN RENDER
     * ──────────────────────────────── */
    // Early return: loading/auth overlays act as gate before showing content
    if (isAuthenticating) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
                <LinearGradient
                    colors={[theme.primary + '20', theme.primary + '10']}
                    style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}
                >
                    <Ionicons name="shield" size={40} color={theme.primary} />
                </LinearGradient>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 }}>인증 중...</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 30 }}>
                    {biometricEnabled && isBiometricAvailable
                        ? '생체 인증을 시도하고 있습니다...\n실패하면 PIN 입력으로 진행됩니다'
                        : 'PIN 입력을 준비하고 있습니다...'}
                </Text>
                <TouchableOpacity
                    style={{ backgroundColor: theme.error, borderRadius: 12, padding: 16, marginHorizontal: 40, alignItems: 'center' }}
                    onPress={resetAppLockSettings}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>🔄 개발용: 앱락 설정 초기화</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: theme.primary, borderRadius: 12, padding: 16, marginHorizontal: 40, marginTop: 12, alignItems: 'center' }}
                    onPress={testBiometricAuth}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>🧪 개발용: 생체인증 테스트</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
                <Ionicons name="lock-closed" size={40} color={theme.textSecondary} />
                <Text style={{ marginTop: 12, color: theme.textSecondary }}>인증이 필요합니다.</Text>
                <TouchableOpacity
                    onPress={checkAuthentication}
                    style={{ marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: theme.primary }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>다시 인증하기</Text>
                </TouchableOpacity>

                {/* Allow PIN modal to appear while content is gated */}
                <AppLockModal
                    visible={showAppLockModal}
                    mode={appLockModalMode}
                    expectedPin={currentPin}
                    setupPin={setupPinFirst}
                    onUnlock={handleAppLockModalUnlock}
                    onSetupComplete={handlePinSetupComplete}
                    onCancel={handleAppLockModalCancel}
                    pinEnabled={pinEnabled}
                    biometricEnabled={biometricEnabled}
                    isBiometricAvailable={isBiometricAvailable}
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
            {/* 인증이 완료된 경우에만 실제 화면 표시 */}
            {
                <>
                    {/* Header */}
                    <SafeAreaView>
                        <Animated.View
                            style={[
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: theme.outline + '20',
                                },
                                headerAnimatedStyle
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: theme.surfaceVariant,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16,
                                }}
                            >
                                <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '600',
                                color: theme.textPrimary,
                            }}>
                                앱 잠금
                            </Text>
                        </Animated.View>
                    </SafeAreaView>

                    <ScrollView style={{ flex: 1, padding: 20 }}>
                        {/* Current Status */}
                        <Animated.View style={[statusCardAnimatedStyle]}>
                            <BlurView
                                intensity={30}
                                tint="light"
                                style={{
                                    borderRadius: 16,
                                    marginBottom: 24,
                                    overflow: 'hidden',
                                    borderWidth: 1,
                                    borderColor: theme.outline + '30',
                                }}
                            >
                                <LinearGradient
                                    colors={[theme.surface + 'F0', theme.surfaceVariant + 'E0']}
                                    style={{ padding: 20 }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <LinearGradient
                                            colors={[getStatusColor() + '20', getStatusColor() + '10']}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12,
                                            }}
                                        >
                                            <Ionicons
                                                name={appLockEnabled ? "shield-checkmark" : "shield-outline"}
                                                size={20}
                                                color={getStatusColor()}
                                            />
                                        </LinearGradient>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '600',
                                            color: theme.textPrimary,
                                        }}>
                                            현재 상태
                                        </Text>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '600',
                                            color: getStatusColor(),
                                            marginLeft: 'auto',
                                        }}>
                                            {getStatusText()}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '400',
                                        color: theme.textSecondary,
                                        lineHeight: 20,
                                    }}>
                                        {getStatusDescription()}
                                    </Text>
                                </LinearGradient>
                            </BlurView>
                        </Animated.View>

                        {/* Lock Settings */}
                        <Animated.View
                            style={[
                                { marginBottom: 24 },
                                settingsOpacityAnimatedStyle
                            ]}
                        >
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: theme.textPrimary,
                                marginBottom: 16,
                            }}>
                                잠금 설정
                            </Text>

                            <SecurityItem
                                icon="lock-closed"
                                title="앱 잠금"
                                description="앱 완전 종료 후 재실행 시에만 인증 요구"
                                value={appLockEnabled}
                                onValueChange={handleAppLockToggle}
                                iconColor={theme.primary}
                                iconBg={theme.primary + '20'}
                            />

                            <SecurityItem
                                icon="finger-print"
                                title="생체 인증"
                                description={isBiometricAvailable
                                    ? "지문 또는 Face ID로 빠른 잠금 해제"
                                    : "기기에 생체 인증이 설정되지 않았습니다"}
                                value={biometricEnabled}
                                onValueChange={handleBiometricToggle}
                                disabled={!isBiometricAvailable || !appLockEnabled}
                                iconColor={theme.warning}
                                iconBg={theme.warning + '20'}
                            />

                            <SecurityItem
                                icon="keypad"
                                title="PIN 잠금"
                                description={pinEnabled && currentPin
                                    ? "4자리 숫자 PIN으로 잠금 해제 (선택사항)"
                                    : "PIN이 설정되지 않았습니다. PIN을 설정해주세요."}
                                value={pinEnabled}
                                onValueChange={handlePinToggle}
                                disabled={!appLockEnabled}
                                iconColor={pinEnabled && currentPin ? theme.info : theme.warning}
                                iconBg={pinEnabled && currentPin ? theme.info + '20' : theme.warning + '20'}
                            />
                        </Animated.View>

                        {/* Usage Tips */}
                        <Animated.View style={[settingsOpacityAnimatedStyle]}>
                            <BlurView
                                intensity={20}
                                tint="light"
                                style={{
                                    borderRadius: 16,
                                    marginTop: 20,
                                    overflow: 'hidden',
                                    borderWidth: 1,
                                    borderColor: theme.outline + '30',
                                }}
                            >
                                <View style={{
                                    backgroundColor: theme.surface + 'E6',
                                    padding: 20,
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}>
                                        <LinearGradient
                                            colors={[theme.info + '20', theme.info + '10']}
                                            style={{
                                                borderRadius: 20,
                                                width: 40,
                                                height: 40,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginRight: 12,
                                            }}
                                        >
                                            <Ionicons name="information-circle" size={24} color={theme.info} />
                                        </LinearGradient>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: '600',
                                            color: theme.textPrimary,
                                        }}>
                                            사용 팁
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 14,
                                        color: theme.textSecondary,
                                        lineHeight: 20,
                                    }}>
                                        {!isPinRegistered ? (
                                            <>
                                                📌 <Text style={{ fontWeight: '600', color: theme.primary }}>PIN 미등록 상태</Text>{'\n'}
                                                • 현재 PIN이 등록되지 않아 자유롭게 앱락 설정에 접근할 수 있습니다{'\n'}
                                                • 보안을 위해 PIN을 등록하시는 것을 권장합니다{'\n'}
                                                • PIN 등록 후에는 앱락 화면 진입 시 항상 인증이 필요합니다{'\n'}
                                                • 생체인증은 PIN 등록 후에 함께 사용할 수 있습니다
                                            </>
                                        ) : appLockEnabled ? (
                                            <>
                                                🔒 <Text style={{ fontWeight: '600', color: theme.success }}>PIN 등록 완료 - 보안 모드</Text>{'\n'}
                                                • PIN이 등록되어 앱락이 완전히 활성화되었습니다{'\n'}
                                                • 앱락 화면 진입 시마다 생체인증 → PIN 순서로 인증됩니다{'\n'}
                                                • 생체인증 성공 시 바로 설정 화면에 접근할 수 있습니다{'\n'}
                                                • 생체인증 실패 시 PIN 입력 모달이 표시됩니다
                                            </>
                                        ) : (
                                            <>
                                                • PIN과 생체 인증을 동시에 사용할 수 있습니다{'\n'}
                                                • 가족과 함께 사용할 때는 앱 잠금을 끄는 것을 권장합니다{'\n'}
                                                • 외출 시에만 앱 잠금을 켜서 보안을 강화하세요{'\n'}
                                                • 민감한 설정 변경 시에만 추가 인증을 요구합니다
                                            </>
                                        )}
                                    </Text>
                                </View>
                            </BlurView>
                        </Animated.View>
                    </ScrollView>

                    {/* Success Notification Modal */}
                    <SuccessNotificationModal
                        visible={successModalVisible}
                        onClose={() => setSuccessModalVisible(false)}
                        title={successModalConfig.title}
                        message={successModalConfig.message}
                        icon={successModalConfig.icon}
                        transparent={true}
                    />

                    {/* ✨ 핵심 수정: 생체인증 제거된 AppLockModal */}
                    <AppLockModal
                        visible={showAppLockModal}
                        mode={appLockModalMode}
                        expectedPin={currentPin}
                        setupPin={setupPinFirst}
                        onUnlock={handleAppLockModalUnlock}
                        onSetupComplete={handlePinSetupComplete}
                        onCancel={handleAppLockModalCancel}
                        pinEnabled={pinEnabled}
                        biometricEnabled={biometricEnabled} // 실제 생체인증 활성화 상태
                        isBiometricAvailable={isBiometricAvailable} // 실제 생체인증 사용 가능 상태
                    />
                </>
            }
        </View>
    );
}
