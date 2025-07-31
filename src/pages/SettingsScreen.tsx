// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedToggleSwitch from '../components/atoms/AnimatedToggleSwitch';
import { QuietTimeService, QuietTimeSettings } from '../services/QuietTimeService';
import QuietTimeModal from '../components/atoms/QuietTimeModal';
import NicknameChangeModal from '../components/atoms/NicknameChangeModal';
import { linkGoogleAccount } from '../services/GoogleAuthService';
// import { CommonActions, useNavigation } from '@react-navigation/native';

export default function SettingsScreen({ onLogout, navigation }: { onLogout: () => void; navigation: any }) {
    const { theme } = useTheme();
    // navigation, useNavigation 제거

    // 사용자 프로필 상태
    const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');

    // 모달 상태
    const [nicknameModalVisible, setNicknameModalVisible] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            console.log('==============================');
            console.log('[PROFILE] 프로필 정보 로딩 시작');

            setProfileLoading(true);
            setProfileError('');

            try {
                const token = await AsyncStorage.getItem('token');
                console.log(`  🔐 토큰 존재: ${token ? '있음' : '없음'}`);
                if (token) {
                    console.log(`  🔐 토큰 길이: ${token.length}자`);
                    console.log(`  🔐 토큰 시작: ${token.substring(0, 20)}...`);
                }

                if (!token) {
                    console.log('❌ [PROFILE] 토큰이 없음 - 로그인 필요');
                    setProfileError('로그인이 필요합니다.');
                    setProfileLoading(false);
                    return;
                }

                console.log('🌐 [PROFILE] 서버 요청 시작');
                console.log(`  🔗 API URL: http://192.168.175.160:3000/api/auth/account`);
                console.log(`  🔐 Authorization Header: Bearer ${token.substring(0, 20)}...`);

                const res = await fetch('http://192.168.175.160:3000/api/auth/account', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`  📊 응답 상태: ${res.status}`);

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ [PROFILE] 프로필 정보 로딩 성공');
                    console.log(`  👤 이름: ${data.name || 'N/A'}`);
                    console.log(`  🏷️ 닉네임: ${data.nickname || 'N/A'}`);
                    console.log(`  📧 이메일: ${data.email || 'N/A'}`);
                    console.log(`  🆔 사용자 ID: ${data.userId || 'N/A'}`);

                    setProfile({
                        name: data.nickname || data.name || '알 수 없음',
                        email: data.email || '알 수 없음'
                    });
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    console.log('❌ [PROFILE] 프로필 정보 로딩 실패');
                    console.log(`  📝 오류 메시지: ${errorData.error || '알 수 없는 오류'}`);
                    setProfileError('프로필 정보를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.log('❌ [PROFILE] 네트워크 오류');
                console.log('  📝 오류 내용:', err);
                setProfileError('서버 오류가 발생했습니다.');
            }

            setProfileLoading(false);
            console.log('🏁 [PROFILE] 프로필 정보 로딩 완료');
            console.log('==============================');
        };

        fetchProfile();

        // 3초 후 다시 한 번 프로필 새로고침 (토큰이 늦게 저장될 수 있음)
        const timer = setTimeout(() => {
            console.log('⏰ [PROFILE] 3초 후 자동 새로고침');
            fetchProfile();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // 프로필 새로고침 함수
    const refreshProfile = async () => {
        console.log('🔄 [PROFILE] 수동 프로필 새로고침');
        const fetchProfile = async () => {
            console.log('==============================');
            console.log('[PROFILE] 프로필 정보 로딩 시작');

            setProfileLoading(true);
            setProfileError('');

            try {
                const token = await AsyncStorage.getItem('token');
                console.log(`  🔐 토큰 존재: ${token ? '있음' : '없음'}`);
                if (token) {
                    console.log(`  🔐 토큰 길이: ${token.length}자`);
                    console.log(`  🔐 토큰 시작: ${token.substring(0, 20)}...`);
                }

                if (!token) {
                    console.log('❌ [PROFILE] 토큰이 없음 - 로그인 필요');
                    setProfileError('로그인이 필요합니다.');
                    setProfileLoading(false);
                    return;
                }

                console.log('🌐 [PROFILE] 서버 요청 시작');
                console.log(`  🔗 API URL: http://192.168.175.160:3000/api/auth/account`);
                console.log(`  🔐 Authorization Header: Bearer ${token.substring(0, 20)}...`);

                const res = await fetch('http://192.168.175.160:3000/api/auth/account', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`  📊 응답 상태: ${res.status}`);

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ [PROFILE] 프로필 정보 로딩 성공');
                    console.log(`  👤 이름: ${data.name || 'N/A'}`);
                    console.log(`  🏷️ 닉네임: ${data.nickname || 'N/A'}`);
                    console.log(`  📧 이메일: ${data.email || 'N/A'}`);
                    console.log(`  🆔 사용자 ID: ${data.userId || 'N/A'}`);

                    setProfile({
                        name: data.nickname || data.name || '알 수 없음',
                        email: data.email || '알 수 없음'
                    });
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    console.log('❌ [PROFILE] 프로필 정보 로딩 실패');
                    console.log(`  📝 오류 메시지: ${errorData.error || '알 수 없는 오류'}`);
                    setProfileError('프로필 정보를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.log('❌ [PROFILE] 네트워크 오류');
                console.log('  📝 오류 내용:', err);
                setProfileError('서버 오류가 발생했습니다.');
            }

            setProfileLoading(false);
            console.log('🏁 [PROFILE] 프로필 정보 로딩 완료');
            console.log('==============================');
        };

        await fetchProfile();
    };

    // 설정 상태
    const [settings, setSettings] = useState(() => {
        console.log('🔧 [SETTINGS] 초기 설정 로드');
        return {
            notifications: true,
            motionAlerts: true,
            autoRecord: true,
            cloudSync: false,
            faceRecognition: true,
            quietTimeEnabled: true,
        };
    });

    // 무음시간 설정 상태
    const [quietTimeSettings, setQuietTimeSettings] = useState<QuietTimeSettings | null>(null);
    const [showQuietTimeModal, setShowQuietTimeModal] = useState(false);

    // 무음시간 설정 로드
    useEffect(() => {
        const loadQuietTimeSettings = async () => {
            try {
                const savedSettings = await QuietTimeService.loadSettings();
                setQuietTimeSettings(savedSettings);
                console.log('🔇 [SETTINGS] 무음시간 설정 로드됨:', savedSettings);
            } catch (error) {
                console.error('🔇 [SETTINGS] 무음시간 설정 로드 실패:', error);
            }
        };

        loadQuietTimeSettings();

        // 화면이 포커스될 때마다 설정 새로고침
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('🔇 [SETTINGS] 화면 포커스 - 무음시간 설정 새로고침');
            loadQuietTimeSettings();
        });

        return unsubscribe;
    }, [navigation]);

    // 설정 업데이트 함수
    const updateSetting = (key: string, value: any) => {
        console.log(`🔧 [SETTINGS] 설정 업데이트: ${key} = ${value}`);
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // 무음시간 설명 텍스트
    const getQuietTimeDescription = () => {
        if (!quietTimeSettings) return '오후 10:00 - 오전 7:00';
        return QuietTimeService.getDescription(quietTimeSettings);
    };

    // 무음시간 토글 핸들러
    const handleQuietTimeToggle = async (value: boolean) => {
        console.log(`🔇 [QUIET TIME] 토글 변경: ${value}`);

        try {
            const newSettings = {
                ...quietTimeSettings,
                enabled: value
            };

            await QuietTimeService.saveSettings(newSettings);
            setQuietTimeSettings(newSettings);
            console.log('🔇 [QUIET TIME] 설정 저장됨:', newSettings);
        } catch (error) {
            console.error('🔇 [QUIET TIME] 설정 저장 실패:', error);
        }
    };

    // 무음시간 설정 모달 열기
    const handleQuietTimePress = () => {
        if (quietTimeSettings?.enabled) {
            setShowQuietTimeModal(true);
        }
    };

    // 설정 그룹 컴포넌트
    const SettingsGroup = ({ title, children }: { title?: string; children: React.ReactNode }) => (
        <View style={{ marginBottom: 24 }}>
            {title && (
                <Text style={{
                    fontFamily: 'GoogleSans-Medium',
                    fontSize: 12,
                    color: theme.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 12,
                    paddingHorizontal: 4
                }}>
                    {title}
                </Text>
            )}
            <View style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
            }}>
                {children}
            </View>
        </View>
    );

    // 설정 아이템 컴포넌트
    const SettingsItem = ({
        icon,
        iconColor = theme.textSecondary,
        iconBg = theme.surfaceVariant,
        label,
        description,
        rightElement,
        onPress,
        isLast = false
    }: {
        icon?: string;
        iconColor?: string;
        iconBg?: string;
        label: string;
        description?: string;
        rightElement?: React.ReactNode;
        onPress?: () => void;
        isLast?: boolean;
    }) => (
        <View>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'transparent'
                }}
                onPress={onPress}
                disabled={!onPress}
            >
                {icon && (
                    <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                    }}>
                        <Ionicons name={icon as any} size={16} color={iconColor} />
                    </View>
                )}

                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 14,
                        color: theme.textPrimary
                    }}>
                        {label}
                    </Text>
                    {description && (
                        <Text style={{
                            fontFamily: 'GoogleSans-Regular',
                            fontSize: 12,
                            color: theme.textSecondary,
                            marginTop: 2,
                            lineHeight: 16
                        }}>
                            {description}
                        </Text>
                    )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    {rightElement}
                </View>
            </TouchableOpacity>

            {!isLast && (
                <View style={{
                    height: 1,
                    backgroundColor: theme.outline,
                    marginLeft: 56
                }} />
            )}
        </View>
    );

    // 핸들러 함수들

    const handleSubscription = () => {
        Alert.alert('구독 관리', '구독 옵션을 선택하세요');
    };

    const handleQualitySettings = () => {
        console.log('화질 설정 화면으로 이동');
        navigation.navigate('QualitySettings');
    };

    const handleDataRetention = () => {
        console.log('데이터 보관 설정 화면으로 이동');
        navigation.navigate('DataRetentionSettings');
    };

    const handleNetworkSettings = () => {
        console.log('네트워크 설정 화면으로 이동');
        navigation.navigate('NetworkSettings');
    };

    const handleCustomerSupport = () => {
        Alert.alert('고객 지원', '지원 옵션을 선택하세요');
    };

    const handleAppInfo = () => {
        Alert.alert('앱 정보', '버전: 1.2.3\n빌드: 456\n\n© 2025 TIBO HomeCam');
    };

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: onLogout
                }
            ]
        );
    };

    const handleGoogleAccountLink = async () => {
        console.log('==============================');
        console.log('[GOOGLE LINK] 구글 계정 연결 시작');
        console.log('==============================');

        try {
            const result = await linkGoogleAccount();

            if (result.success) {
                console.log('✅ [GOOGLE LINK] 구글 계정 연결 성공');
                console.log(`  📝 메시지: ${result.message}`);
                Alert.alert('연결 완료', 'Google 계정이 성공적으로 연결되었습니다.');
            } else {
                console.log('❌ [GOOGLE LINK] 구글 계정 연결 실패');
                console.log(`  📝 오류: ${result.error}`);
                Alert.alert('연결 실패', result.error || '구글 계정 연결에 실패했습니다.');
            }
        } catch (error) {
            console.log('❌ [GOOGLE LINK] 네트워크 오류');
            console.log('  📝 오류 내용:', error);
            Alert.alert('연결 실패', '구글 계정 연결 중 오류가 발생했습니다.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 프로필 카드 */}
                <View
                    style={{
                        backgroundColor: theme.surface,
                        borderRadius: 16,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 24,
                        shadowColor: '#000',
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View style={{
                        width: 48, height: 48, borderRadius: 24,
                        backgroundColor: theme.primary + '20', alignItems: 'center', justifyContent: 'center',
                        marginRight: 16,
                    }}>
                        <Ionicons name="person" size={24} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        {profileLoading ? (
                            <Text style={{ fontSize: 16, color: theme.textSecondary }}>불러오는 중...</Text>
                        ) : profileError ? (
                            <Text style={{ fontSize: 16, color: theme.error }}>{profileError}</Text>
                        ) : (
                            <>
                                <Text style={{ fontSize: 18, fontFamily: 'GoogleSans-Bold', color: theme.textPrimary, marginBottom: 4 }}>{profile?.name}</Text>
                                <Text style={{ fontSize: 14, fontFamily: 'GoogleSans-Regular', color: theme.textSecondary }}>{profile?.email}</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* 내 정보 */}
                <SettingsGroup title="내 정보">
                    <SettingsItem
                        icon="person"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="닉네임 변경"
                        description="사용자 닉네임을 변경합니다"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => setNicknameModalVisible(true)}
                    />
                    <SettingsItem
                        icon="lock-closed"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="비밀번호 변경"
                        description="계정 비밀번호를 변경합니다"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => Alert.alert('준비 중', '비밀번호 변경 기능이 준비 중입니다.')}
                    />
                    <SettingsItem
                        icon="shield-checkmark"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="앱 잠금"
                        description="앱 실행 시 PIN 또는 생체 인증을 요구합니다"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => navigation.navigate('AppLock')}
                    />
                    <SettingsItem
                        icon="logo-google"
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                        label="구글 계정 연결"
                        description="Google 계정과 연결하여 빠른 로그인"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => handleGoogleAccountLink()}
                        isLast
                    />
                </SettingsGroup>

                {/* 알림 및 감지 */}
                <SettingsGroup title="알림 및 감지">
                    <SettingsItem
                        icon="notifications"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="푸시 알림"
                        description="기기에서 알림을 받습니다"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.notifications}
                                onValueChange={(value) => {
                                    console.log(`🔔 [NOTIFICATIONS] 토글 변경: ${value}`);
                                    setSettings(prev => {
                                        console.log(`🔔 [NOTIFICATIONS] 이전 설정:`, prev);
                                        const newSettings = { ...prev, notifications: value };
                                        console.log(`🔔 [NOTIFICATIONS] 새로운 설정:`, newSettings);
                                        return newSettings;
                                    });
                                }}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                accessibilityLabel="푸시 알림"
                                accessibilityHint="푸시 알림을 켜거나 끕니다"
                            />
                        }
                    />
                    <SettingsItem
                        icon="camera"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="움직임 감지"
                        description="움직임이 감지될 때 알림"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.motionAlerts}
                                onValueChange={(value) => {
                                    console.log(`🎥 [MOTION ALERTS] 토글 변경: ${value}`);
                                    setSettings(prev => {
                                        console.log(`🎥 [MOTION ALERTS] 이전 설정:`, prev);
                                        const newSettings = { ...prev, motionAlerts: value };
                                        console.log(`🎥 [MOTION ALERTS] 새로운 설정:`, newSettings);
                                        return newSettings;
                                    });
                                }}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                disabled={!settings.notifications}
                                accessibilityLabel="움직임 감지"
                                accessibilityHint="움직임이 감지될 때 알림을 받습니다"
                            />
                        }
                    />
                    <SettingsItem
                        icon="person"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="얼굴 인식"
                        description="알려진 사람을 식별합니다"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.faceRecognition}
                                onValueChange={(value) => {
                                    console.log(`👤 [FACE RECOGNITION] 토글 변경: ${value}`);
                                    setSettings(prev => {
                                        console.log(`👤 [FACE RECOGNITION] 이전 설정:`, prev);
                                        const newSettings = { ...prev, faceRecognition: value };
                                        console.log(`👤 [FACE RECOGNITION] 새로운 설정:`, newSettings);
                                        return newSettings;
                                    });
                                }}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                accessibilityLabel="얼굴 인식"
                                accessibilityHint="알려진 사람을 식별합니다"
                            />
                        }
                    />
                    <SettingsItem
                        icon="moon"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="무음 시간"
                        description={getQuietTimeDescription()}
                        rightElement={
                            <AnimatedToggleSwitch
                                value={quietTimeSettings?.enabled || false}
                                onValueChange={handleQuietTimeToggle}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                accessibilityLabel="무음 시간"
                                accessibilityHint="무음 시간을 켜거나 끕니다"
                            />
                        }
                        onPress={handleQuietTimePress}
                        isLast
                    />
                </SettingsGroup>

                {/* 녹화 및 저장 */}
                <SettingsGroup title="녹화 및 저장">
                    <SettingsItem
                        icon="videocam"
                        iconColor="#8B5CF6"
                        iconBg="#8B5CF620"
                        label="자동 녹화"
                        description="움직임 감지 시 자동으로 녹화"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.autoRecord}
                                onValueChange={(value) => {
                                    console.log(`🎬 [AUTO RECORD] 토글 변경: ${value}`);
                                    setSettings(prev => {
                                        console.log(`🎬 [AUTO RECORD] 이전 설정:`, prev);
                                        const newSettings = { ...prev, autoRecord: value };
                                        console.log(`🎬 [AUTO RECORD] 새로운 설정:`, newSettings);
                                        return newSettings;
                                    });
                                }}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                accessibilityLabel="자동 녹화"
                                accessibilityHint="움직임 감지 시 자동으로 녹화합니다"
                            />
                        }
                    />
                    <SettingsItem
                        icon="hardware-chip"
                        iconColor="#8B5CF6"
                        iconBg="#8B5CF620"
                        label="화질 설정"
                        description="고화질 (1080p)"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleQualitySettings}
                    />
                    <SettingsItem
                        icon="time"
                        iconColor="#8B5CF6"
                        iconBg="#8B5CF620"
                        label="데이터 보관"
                        description="30일 동안 녹화본 보관"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleDataRetention}
                    />
                    <SettingsItem
                        icon="cloud-upload"
                        iconColor="#8B5CF6"
                        iconBg="#8B5CF620"
                        label="클라우드 동기화"
                        description="클라우드에 녹화본 백업"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.cloudSync}
                                onValueChange={(value) => {
                                    console.log(`☁️ [CLOUD SYNC] 토글 변경: ${value}`);
                                    setSettings(prev => {
                                        console.log(`☁️ [CLOUD SYNC] 이전 설정:`, prev);
                                        const newSettings = { ...prev, cloudSync: value };
                                        console.log(`☁️ [CLOUD SYNC] 새로운 설정:`, newSettings);
                                        return newSettings;
                                    });
                                }}
                                activeColor={theme.primary}
                                inactiveColor={theme.outline}
                                thumbColor={theme.surface}
                                accessibilityLabel="클라우드 동기화"
                                accessibilityHint="클라우드에 녹화본을 백업합니다"
                            />
                        }
                        isLast
                    />
                </SettingsGroup>

                {/* 환경설정 */}
                <SettingsGroup title="환경설정">
                    <SettingsItem
                        icon="wifi"
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                        label="네트워크 설정"
                        description="Wi-Fi 및 연결 환경설정"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleNetworkSettings}
                        isLast
                    />
                </SettingsGroup>

                {/* 지원 */}
                <SettingsGroup title="지원">
                    <SettingsItem
                        icon="headset"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="고객 지원"
                        description="도움말 및 지원받기"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleCustomerSupport}
                    />
                    <SettingsItem
                        icon="information-circle"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="앱 정보"
                        description="버전 1.2.3 (빌드 456)"
                        rightElement={
                            <View style={{
                                backgroundColor: theme.warning + '20',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 2
                            }}>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 10,
                                    color: theme.warning
                                }}>
                                    최신
                                </Text>
                            </View>
                        }
                        onPress={handleAppInfo}
                        isLast
                    />
                </SettingsGroup>

                {/* 로그아웃 */}
                <SettingsGroup>
                    <SettingsItem
                        icon="log-out"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="로그아웃"
                        description="계정에서 안전하게 로그아웃"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleLogout}
                        isLast
                    />
                </SettingsGroup>
            </ScrollView>

            {/* 무음시간 설정 모달 */}
            <QuietTimeModal
                visible={showQuietTimeModal}
                onClose={() => setShowQuietTimeModal(false)}
                onSettingsChange={(newSettings) => {
                    setQuietTimeSettings(newSettings);
                    console.log('🔇 [SETTINGS] 무음시간 설정 변경됨:', newSettings);
                }}
            />

            {/* 닉네임 변경 모달 */}
            <NicknameChangeModal
                visible={nicknameModalVisible}
                onClose={() => setNicknameModalVisible(false)}
                onSuccess={() => {
                    // 프로필 새로고침
                    refreshProfile();
                }}
            />


        </SafeAreaView>
    );
}
