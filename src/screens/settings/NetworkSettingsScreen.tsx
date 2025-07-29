import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo를 조건부로 임포트
let NetInfo: any;
try {
    NetInfo = require('react-native-netinfo').default;
} catch (e) {
    console.warn('react-native-netinfo를 로드할 수 없습니다. Expo Go 환경에서는 모의 데이터를 사용합니다.');
}

interface NetworkInfo {
    isConnected: boolean;
    type: string;
    isWifi: boolean;
    isCellular: boolean;
    ssid?: string;
    strength?: number;
}

export default function NetworkSettingsScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
        isConnected: false,
        type: 'unknown',
        isWifi: false,
        isCellular: false,
    });
    const [settings, setSettings] = useState({
        autoConnect: true,
        dataSaver: false,
        vpnEnabled: false,
    });

    useEffect(() => {
        if (NetInfo) {
            // NetInfo가 사용 가능한 경우 실제 네트워크 정보 사용
            const getNetworkInfo = async () => {
                try {
                    const state = await NetInfo.fetch();
                    setNetworkInfo({
                        isConnected: state.isConnected || false,
                        type: state.type || 'unknown',
                        isWifi: state.type === 'wifi',
                        isCellular: state.type === 'cellular',
                        ssid: state.details?.ssid,
                        strength: state.details?.strength,
                    });
                } catch (error) {
                    console.log('❌ [NETWORK] 네트워크 정보 가져오기 실패:', error);
                    // 실패 시 기본값 사용
                    setNetworkInfo({
                        isConnected: true,
                        type: 'wifi',
                        isWifi: true,
                        isCellular: false,
                        ssid: 'Home_WiFi_5G',
                        strength: 85,
                    });
                }
            };

            getNetworkInfo();

            // 네트워크 상태 변화 감지
            const unsubscribe = NetInfo.addEventListener(state => {
                setNetworkInfo({
                    isConnected: state.isConnected || false,
                    type: state.type || 'unknown',
                    isWifi: state.type === 'wifi',
                    isCellular: state.type === 'cellular',
                    ssid: state.details?.ssid,
                    strength: state.details?.strength,
                });
            });

            return () => unsubscribe();
        } else {
            // NetInfo가 사용 불가능한 경우 (Expo Go) 모의 데이터 사용
            console.log('NetInfo를 사용할 수 없어 모의 네트워크 데이터를 사용합니다.');
            setNetworkInfo({
                isConnected: true,
                type: 'wifi',
                isWifi: true,
                isCellular: false,
                ssid: 'Home_WiFi_5G',
                strength: 85,
            });

            // 3초마다 네트워크 상태 업데이트 (모의)
            const interval = setInterval(() => {
                setNetworkInfo(prev => ({
                    ...prev,
                    strength: Math.floor(Math.random() * 30) + 70, // 70-100% 사이 랜덤
                }));
            }, 3000);

            return () => clearInterval(interval);
        }
    }, []);

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

    // 네트워크 상태 표시 컴포넌트
    const NetworkStatusCard = () => (
        <View style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: networkInfo.isConnected ? theme.success + '20' : theme.error + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                }}>
                    <Ionicons
                        name={networkInfo.isWifi ? 'wifi' : networkInfo.isCellular ? 'cellular' : 'cloud-offline'}
                        size={20}
                        color={networkInfo.isConnected ? theme.success : theme.error}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 18,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary
                    }}>
                        {networkInfo.isConnected ? '연결됨' : '연결 안됨'}
                    </Text>
                    <Text style={{
                        fontSize: 13,
                        color: theme.textSecondary,
                        marginTop: 2
                    }}>
                        {networkInfo.isWifi ? 'Wi-Fi' : networkInfo.isCellular ? '모바일 데이터' : '오프라인'}
                    </Text>
                </View>
                <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: networkInfo.isConnected ? theme.success : theme.error
                }} />
            </View>

            {networkInfo.isWifi && networkInfo.ssid && (
                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary
                    }}>
                        네트워크: {networkInfo.ssid}
                    </Text>
                    {networkInfo.strength && (
                        <Text style={{
                            fontSize: 12,
                            color: theme.textSecondary,
                            marginTop: 2
                        }}>
                            신호 강도: {networkInfo.strength}%
                        </Text>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={{
                    backgroundColor: theme.primary + '10',
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center'
                }}
                onPress={() => {
                    if (NetInfo) {
                        // NetInfo가 사용 가능한 경우 실제 새로고침
                        NetInfo.fetch().then(state => {
                            setNetworkInfo({
                                isConnected: state.isConnected || false,
                                type: state.type || 'unknown',
                                isWifi: state.type === 'wifi',
                                isCellular: state.type === 'cellular',
                                ssid: state.details?.ssid,
                                strength: state.details?.strength,
                            });
                            Alert.alert('네트워크 새로고침', '네트워크 정보가 업데이트되었습니다.');
                        }).catch(error => {
                            console.error('네트워크 새로고침 실패:', error);
                            Alert.alert('오류', '네트워크 정보를 새로고침하는 데 실패했습니다.');
                        });
                    } else {
                        // NetInfo가 사용 불가능한 경우 모의 새로고침
                        setNetworkInfo(prev => ({
                            ...prev,
                            strength: Math.floor(Math.random() * 30) + 70,
                        }));
                        Alert.alert('네트워크 새로고침', '모의 네트워크 정보가 업데이트되었습니다.');
                    }
                }}
            >
                <Text style={{
                    fontSize: 14,
                    fontFamily: 'GoogleSans-Medium',
                    color: theme.primary
                }}>
                    새로고침
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            {/* 헤더 */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.outline
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 20,
                    fontFamily: 'GoogleSans-Medium',
                    color: theme.textPrimary
                }}>
                    네트워크 설정
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 네트워크 상태 카드 */}
                <NetworkStatusCard />

                {/* 연결 설정 */}
                <SettingsGroup title="연결 설정">
                    <SettingsItem
                        icon="wifi"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="Wi-Fi"
                        description="무선 네트워크 연결"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => navigation.navigate('WiFiSettings')}
                    />
                    <SettingsItem
                        icon="cellular"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="모바일 데이터"
                        description="셀룰러 네트워크 사용"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => navigation.navigate('MobileDataSettings')}
                        isLast
                    />
                </SettingsGroup>

                {/* 자동 연결 */}
                <SettingsGroup title="자동 연결">
                    <SettingsItem
                        icon="refresh"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="자동 연결"
                        description="사용 가능한 네트워크에 자동 연결"
                        rightElement={
                            <Switch
                                value={settings.autoConnect}
                                onValueChange={(value) => {
                                    console.log(`🔗 [AUTO CONNECT] 토글 변경: ${value}`);
                                    setSettings(prev => ({ ...prev, autoConnect: value }));
                                }}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={theme.surface}
                            />
                        }
                    />
                    <SettingsItem
                        icon="save"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="데이터 절약"
                        description="모바일 데이터 사용량 최적화"
                        rightElement={
                            <Switch
                                value={settings.dataSaver}
                                onValueChange={(value) => {
                                    console.log(`💾 [DATA SAVER] 토글 변경: ${value}`);
                                    setSettings(prev => ({ ...prev, dataSaver: value }));
                                }}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={theme.surface}
                            />
                        }
                        isLast
                    />
                </SettingsGroup>

                {/* 보안 */}
                <SettingsGroup title="보안">
                    <SettingsItem
                        icon="shield"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="VPN"
                        description="가상 사설 네트워크 연결"
                        rightElement={
                            <Switch
                                value={settings.vpnEnabled}
                                onValueChange={(value) => {
                                    console.log(`🔒 [VPN] 토글 변경: ${value}`);
                                    setSettings(prev => ({ ...prev, vpnEnabled: value }));
                                }}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={theme.surface}
                            />
                        }
                        isLast
                    />
                </SettingsGroup>

                {/* 고급 설정 */}
                <SettingsGroup title="고급 설정">
                    <SettingsItem
                        icon="settings"
                        iconColor={theme.textSecondary}
                        iconBg={theme.surfaceVariant}
                        label="네트워크 재설정"
                        description="모든 네트워크 설정을 초기화"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={() => {
                            Alert.alert(
                                '네트워크 재설정',
                                '모든 네트워크 설정을 초기화하시겠습니까?',
                                [
                                    { text: '취소', style: 'cancel' },
                                    { text: '재설정', style: 'destructive' }
                                ]
                            );
                        }}
                        isLast
                    />
                </SettingsGroup>
            </ScrollView>
        </SafeAreaView>
    );
} 