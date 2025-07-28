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
// import { CommonActions, useNavigation } from '@react-navigation/native';

export default function SettingsScreen({ onLogout }: { onLogout: () => void }) {
    const { theme } = useTheme();
    // navigation, useNavigation 제거

    // 사용자 프로필 상태
    const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');

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
                console.log(`  🔗 API URL: http://localhost:3000/api/auth/account`);
                console.log(`  🔐 Authorization Header: Bearer ${token.substring(0, 20)}...`);

                const res = await fetch('http://localhost:3000/api/auth/account', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`  📊 응답 상태: ${res.status}`);

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ [PROFILE] 프로필 정보 로딩 성공');
                    console.log(`  👤 이름: ${data.name || 'N/A'}`);
                    console.log(`  📧 이메일: ${data.email || 'N/A'}`);
                    console.log(`  🆔 사용자 ID: ${data.userId || 'N/A'}`);

                    setProfile({
                        name: data.name || '알 수 없음',
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
                console.log(`  🔗 API URL: http://localhost:3000/api/auth/account`);
                console.log(`  🔐 Authorization Header: Bearer ${token.substring(0, 20)}...`);

                const res = await fetch('http://localhost:3000/api/auth/account', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`  📊 응답 상태: ${res.status}`);

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ [PROFILE] 프로필 정보 로딩 성공');
                    console.log(`  👤 이름: ${data.name || 'N/A'}`);
                    console.log(`  📧 이메일: ${data.email || 'N/A'}`);
                    console.log(`  🆔 사용자 ID: ${data.userId || 'N/A'}`);

                    setProfile({
                        name: data.name || '알 수 없음',
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

    // 설정 업데이트 함수
    const updateSetting = (key: string, value: any) => {
        try {
            console.log(`🔧 [SETTINGS] 설정 업데이트 시작: ${key} = ${value}`);
            console.log(`🔧 [SETTINGS] 현재 설정 상태:`, settings);

            setSettings(prev => {
                console.log(`🔧 [SETTINGS] 이전 설정:`, prev);
                const newSettings = { ...prev, [key]: value };
                console.log(`🔧 [SETTINGS] 새로운 설정:`, newSettings);
                return newSettings;
            });

            console.log(`✅ [SETTINGS] 설정 업데이트 완료: ${key} = ${value}`);
        } catch (error) {
            console.error(`❌ [SETTINGS] 설정 업데이트 오류: ${key}`, error);
            console.error(`❌ [SETTINGS] 오류 스택:`, error.stack);
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
    const handleProfileEdit = () => {
        console.log('👆 [PROFILE] 프로필 카드 탭됨');
        refreshProfile(); // 프로필 새로고침
        Alert.alert('프로필 편집', '프로필 정보를 수정하시겠습니까?');
    };

    const handleSubscription = () => {
        Alert.alert('구독 관리', '구독 옵션을 선택하세요');
    };

    const handleQuietTime = () => {
        console.log('무음 시간 설정 화면으로 이동');
    };

    const handleQualitySettings = () => {
        console.log('화질 설정 화면으로 이동');
    };

    const handleDataRetention = () => {
        console.log('데이터 보관 설정 화면으로 이동');
    };

    const handleNetworkSettings = () => {
        console.log('네트워크 설정 화면으로 이동');
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 프로필 카드 */}
                <TouchableOpacity
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
                    onPress={handleProfileEdit}
                >
                    <View style={{
                        width: 56, height: 56, borderRadius: 28,
                        backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
                        marginRight: 16,
                    }}>
                        <Text style={{ color: theme.onPrimary, fontSize: 22, fontFamily: 'GoogleSans-Medium' }}>
                            {profile?.name ? profile.name.slice(0, 2) : '??'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        {profileLoading ? (
                            <Text style={{ fontSize: 16, color: theme.textSecondary }}>불러오는 중...</Text>
                        ) : profileError ? (
                            <Text style={{ fontSize: 16, color: theme.error }}>{profileError}</Text>
                        ) : (
                            <>
                                <Text style={{ fontSize: 18, fontFamily: 'GoogleSans-Medium', color: theme.textPrimary }}>{profile?.name}</Text>
                                <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{profile?.email}</Text>
                            </>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* 내 정보 */}
                <SettingsGroup title="내 정보">
                    <SettingsItem
                        icon="shield-checkmark"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="구독"
                        description="HomeCam Pro • 2025년 12월까지"
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{
                                    backgroundColor: theme.success + '20',
                                    borderRadius: 12,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2
                                }}>
                                    <Text style={{
                                        fontFamily: 'GoogleSans-Medium',
                                        fontSize: 10,
                                        color: theme.success
                                    }}>
                                        활성
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                            </View>
                        }
                        onPress={handleSubscription}
                    />
                    <SettingsItem
                        icon="shield-checkmark"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="2단계 인증"
                        description="계정 보안을 강화하세요"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => Alert.alert('2단계 인증', '2단계 인증을 설정하시겠습니까?')}
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
                                    try {
                                        console.log(`🔔 [NOTIFICATIONS] 토글 변경: ${value}`);
                                        updateSetting('notifications', value);
                                    } catch (error) {
                                        console.error('❌ [NOTIFICATIONS] 토글 오류:', error);
                                    }
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
                                    try {
                                        console.log(`🎥 [MOTION ALERTS] 토글 변경: ${value}`);
                                        updateSetting('motionAlerts', value);
                                    } catch (error) {
                                        console.error('❌ [MOTION ALERTS] 토글 오류:', error);
                                    }
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
                                    try {
                                        console.log(`👤 [FACE RECOGNITION] 토글 변경: ${value}`);
                                        updateSetting('faceRecognition', value);
                                    } catch (error) {
                                        console.error('❌ [FACE RECOGNITION] 토글 오류:', error);
                                    }
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
                        description="오후 10:00 - 오전 7:00"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleQuietTime}
                        isLast
                    />
                </SettingsGroup>

                {/* 녹화 및 저장 */}
                <SettingsGroup title="녹화 및 저장">
                    <SettingsItem
                        icon="videocam"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="자동 녹화"
                        description="움직임 감지 시 자동으로 녹화"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.autoRecord}
                                onValueChange={(value) => {
                                    try {
                                        console.log(`🎬 [AUTO RECORD] 토글 변경 시작: ${value}`);
                                        console.log(`🎬 [AUTO RECORD] 현재 autoRecord 값:`, settings.autoRecord);
                                        updateSetting('autoRecord', value);
                                        console.log(`🎬 [AUTO RECORD] 토글 변경 완료: ${value}`);
                                    } catch (error) {
                                        console.error('❌ [AUTO RECORD] 토글 오류:', error);
                                        console.error('❌ [AUTO RECORD] 오류 스택:', error.stack);
                                    }
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
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="화질 설정"
                        description="고화질 (1080p)"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleQualitySettings}
                    />
                    <SettingsItem
                        icon="time"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="데이터 보관"
                        description="30일 동안 녹화본 보관"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleDataRetention}
                    />
                    <SettingsItem
                        icon="cloud-upload"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="클라우드 동기화"
                        description="클라우드에 녹화본 백업"
                        rightElement={
                            <AnimatedToggleSwitch
                                value={settings.cloudSync}
                                onValueChange={(value) => {
                                    try {
                                        console.log(`☁️ [CLOUD SYNC] 토글 변경 시작: ${value}`);
                                        console.log(`☁️ [CLOUD SYNC] 현재 cloudSync 값:`, settings.cloudSync);
                                        updateSetting('cloudSync', value);
                                        console.log(`☁️ [CLOUD SYNC] 토글 변경 완료: ${value}`);
                                    } catch (error) {
                                        console.error('❌ [CLOUD SYNC] 토글 오류:', error);
                                        console.error('❌ [CLOUD SYNC] 오류 스택:', error.stack);
                                    }
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
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
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
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="고객 지원"
                        description="도움말 및 지원받기"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleCustomerSupport}
                    />
                    <SettingsItem
                        icon="information-circle"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="앱 정보"
                        description="버전 1.2.3 (빌드 456)"
                        rightElement={
                            <View style={{
                                backgroundColor: theme.info + '20',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 2
                            }}>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 10,
                                    color: theme.info
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
        </SafeAreaView>
    );
}
