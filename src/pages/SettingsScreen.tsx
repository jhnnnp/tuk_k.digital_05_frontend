// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';

export default function SettingsScreen() {
    const { theme } = useTheme();

    // 설정 상태
    const [settings, setSettings] = useState({
        notifications: true,
        motionAlerts: true,
        autoRecord: true,
        cloudSync: false,
        faceRecognition: true,
        quietTimeEnabled: true,
    });

    // 설정 업데이트 함수
    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
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
                    onPress: () => Alert.alert('로그아웃됨', '안전하게 로그아웃되었습니다.')
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
                        <Text style={{ color: theme.onPrimary, fontSize: 22, fontFamily: 'GoogleSans-Medium' }}>김철</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontFamily: 'GoogleSans-Medium', color: theme.textPrimary }}>김철수</Text>
                        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>kim@example.com</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* 내 정보 */}
                <SettingsGroup title="내 정보">
                    <SettingsItem
                        icon="shield-checkmark"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="구독"
                        description="HomeCam Pro • 2025년 12월까지"
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
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
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="푸시 알림"
                        description="기기에서 알림을 받습니다"
                        rightElement={
                            <Switch
                                value={settings.notifications}
                                onValueChange={(value) => updateSetting('notifications', value)}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={settings.notifications ? theme.onPrimary : theme.surface}
                            />
                        }
                    />
                    <SettingsItem
                        icon="camera"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="움직임 감지"
                        description="움직임이 감지될 때 알림"
                        rightElement={
                            <Switch
                                value={settings.motionAlerts}
                                onValueChange={(value) => updateSetting('motionAlerts', value)}
                                disabled={!settings.notifications}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={settings.motionAlerts ? theme.onPrimary : theme.surface}
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
                            <Switch
                                value={settings.faceRecognition}
                                onValueChange={(value) => updateSetting('faceRecognition', value)}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={settings.faceRecognition ? theme.onPrimary : theme.surface}
                            />
                        }
                    />
                    <SettingsItem
                        icon="moon"
                        iconColor={settings.quietTimeEnabled ? theme.warning : theme.textSecondary}
                        iconBg={settings.quietTimeEnabled ? theme.warning + '20' : theme.surfaceVariant}
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
                            <Switch
                                value={settings.autoRecord}
                                onValueChange={(value) => updateSetting('autoRecord', value)}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={settings.autoRecord ? theme.onPrimary : theme.surface}
                            />
                        }
                    />
                    <SettingsItem
                        icon="hardware-chip"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="화질 설정"
                        description="고화질 (1080p)"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleQualitySettings}
                    />
                    <SettingsItem
                        icon="time"
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                        label="데이터 보관"
                        description="30일 동안 녹화본 보관"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleDataRetention}
                    />
                    <SettingsItem
                        icon="cloud-upload"
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                        label="클라우드 동기화"
                        description="클라우드에 녹화본 백업"
                        rightElement={
                            <Switch
                                value={settings.cloudSync}
                                onValueChange={(value) => updateSetting('cloudSync', value)}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={settings.cloudSync ? theme.onPrimary : theme.surface}
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
                        iconColor={theme.textSecondary}
                        iconBg={theme.surfaceVariant}
                        label="앱 정보"
                        description="버전 1.2.3 (빌드 456)"
                        rightElement={
                            <View style={{
                                backgroundColor: theme.surfaceVariant,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 2
                            }}>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 10,
                                    color: theme.textSecondary
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
