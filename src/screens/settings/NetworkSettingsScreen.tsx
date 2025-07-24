import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';
import { connectionService, ConnectionStatus } from '../../services/ConnectionService';

export default function NetworkSettingsScreen() {
    const { theme } = useTheme();
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(connectionService.getStatus());
    const [autoConnect, setAutoConnect] = useState(true);
    const [networkScanning, setNetworkScanning] = useState(false);

    // 연결 상태 구독
    useEffect(() => {
        const unsubscribe = connectionService.subscribe((status) => {
            setConnectionStatus(status);
        });

        return unsubscribe;
    }, []);

    // 네트워크 스캔 시작
    const handleNetworkScan = async () => {
        setNetworkScanning(true);
        try {
            // 실제 구현에서는 네트워크 스캔 수행
            await new Promise(resolve => setTimeout(resolve, 3000));
            Alert.alert('스캔 완료', '네트워크에서 TIBO 카메라를 찾았습니다.');
        } catch (error) {
            Alert.alert('스캔 실패', '네트워크 스캔 중 오류가 발생했습니다.');
        } finally {
            setNetworkScanning(false);
        }
    };

    // 연결 테스트
    const handleConnectionTest = async () => {
        try {
            const result = await connectionService.testConnection();
            Alert.alert('연결 테스트 결과',
                `Ping: ${result.ping}ms\n다운로드: ${result.downloadSpeed}\n업로드: ${result.uploadSpeed}`);
        } catch (error) {
            Alert.alert('테스트 실패', '연결 테스트 중 오류가 발생했습니다.');
        }
    };

    // 연결 해제
    const handleDisconnect = async () => {
        Alert.alert(
            '연결 해제',
            '카메라와의 연결을 해제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '해제',
                    style: 'destructive',
                    onPress: async () => {
                        await connectionService.disconnect();
                        Alert.alert('연결 해제됨', '카메라와의 연결이 해제되었습니다.');
                    }
                }
            ]
        );
    };

    const SettingsGroup = ({
        title,
        children,
        style = {}
    }: {
        title?: string;
        children: React.ReactNode;
        style?: any;
    }) => (
        <View style={[{ marginBottom: theme.spacing.lg }, style]}>
            {title && (
                <Text style={{
                    fontFamily: 'GoogleSans-Medium',
                    fontSize: 12,
                    color: theme.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: theme.spacing.md,
                    paddingHorizontal: theme.spacing.xs
                }}>
                    {title}
                </Text>
            )}
            <View style={{
                backgroundColor: theme.surface,
                borderRadius: theme.borderRadius.card,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: theme.elevation.card },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: theme.elevation.card
            }}>
                {children}
            </View>
        </View>
    );

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
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                    backgroundColor: onPress ? 'transparent' : 'transparent'
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
                        justifyContent: 'center'
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

    const getConnectionQualityColor = () => {
        const quality = connectionService.getConnectionQuality();
        switch (quality) {
            case 'excellent': return theme.success;
            case 'good': return theme.primary;
            case 'fair': return theme.warning;
            case 'poor': return theme.error;
            default: return theme.textSecondary;
        }
    };

    const getConnectionQualityText = () => {
        const quality = connectionService.getConnectionQuality();
        switch (quality) {
            case 'excellent': return '탁월';
            case 'good': return '좋음';
            case 'fair': return '보통';
            case 'poor': return '약함';
            default: return '연결 없음';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.lg
                }}>
                    <TouchableOpacity style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: theme.spacing.md
                    }}>
                        <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 20,
                        color: theme.textPrimary
                    }}>
                        네트워크 설정
                    </Text>
                </View>

                {/* 연결 상태 */}
                <SettingsGroup title="연결 상태">
                    <SettingsItem
                        icon="wifi"
                        iconColor={connectionStatus.isConnected ? theme.success : theme.error}
                        iconBg={connectionStatus.isConnected ? theme.success + '20' : theme.error + '20'}
                        label="카메라 연결"
                        description={connectionStatus.isConnected ? '연결됨' : '연결되지 않음'}
                        rightElement={
                            <View style={{
                                backgroundColor: connectionStatus.isConnected ? theme.success + '20' : theme.error + '20',
                                borderRadius: 12,
                                paddingHorizontal: theme.spacing.sm,
                                paddingVertical: 2
                            }}>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 10,
                                    color: connectionStatus.isConnected ? theme.success : theme.error
                                }}>
                                    {connectionStatus.isConnected ? '연결됨' : '연결 안됨'}
                                </Text>
                            </View>
                        }
                    />
                    <SettingsItem
                        icon="speedometer"
                        iconColor={getConnectionQualityColor()}
                        iconBg={getConnectionQualityColor() + '20'}
                        label="연결 품질"
                        description={`${connectionStatus.signalStrength} dBm • ${connectionStatus.latency}ms`}
                        rightElement={
                            <View style={{
                                backgroundColor: getConnectionQualityColor() + '20',
                                borderRadius: 12,
                                paddingHorizontal: theme.spacing.sm,
                                paddingVertical: 2
                            }}>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 10,
                                    color: getConnectionQualityColor()
                                }}>
                                    {getConnectionQualityText()}
                                </Text>
                            </View>
                        }
                    />
                    <SettingsItem
                        icon="settings"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="자동 연결"
                        description="앱 실행 시 자동으로 카메라에 연결"
                        rightElement={
                            <Switch
                                value={autoConnect}
                                onValueChange={setAutoConnect}
                                trackColor={{ false: theme.outline, true: theme.primary }}
                                thumbColor={autoConnect ? theme.onPrimary : theme.surface}
                            />
                        }
                        isLast
                    />
                </SettingsGroup>

                {/* 연결 관리 */}
                <SettingsGroup title="연결 관리">
                    <SettingsItem
                        icon="search"
                        iconColor={theme.primary}
                        iconBg={theme.primary + '20'}
                        label="네트워크 스캔"
                        description="같은 Wi-Fi 네트워크의 카메라 검색"
                        rightElement={
                            networkScanning ? (
                                <View style={{ width: 20, height: 20 }}>
                                    <Ionicons name="reload" size={16} color={theme.primary} />
                                </View>
                            ) : (
                                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                            )
                        }
                        onPress={handleNetworkScan}
                    />
                    <SettingsItem
                        icon="checkmark-circle"
                        iconColor={theme.success}
                        iconBg={theme.success + '20'}
                        label="연결 테스트"
                        description="현재 연결 상태 및 속도 테스트"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleConnectionTest}
                    />
                    <SettingsItem
                        icon="close-circle"
                        iconColor={theme.error}
                        iconBg={theme.error + '20'}
                        label="연결 해제"
                        description="카메라와의 연결을 해제합니다"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        onPress={handleDisconnect}
                        isLast
                    />
                </SettingsGroup>

                {/* Wi-Fi 정보 */}
                <SettingsGroup title="Wi-Fi 정보">
                    <SettingsItem
                        icon="wifi"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="현재 네트워크"
                        description="Home_WiFi_5G"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                    />
                    <SettingsItem
                        icon="speedometer"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="네트워크 속도"
                        description={`${connectionStatus.bandwidth} • ${connectionStatus.latency}ms 지연`}
                        isLast
                    />
                </SettingsGroup>

                {/* 고급 설정 */}
                <SettingsGroup title="고급 설정">
                    <SettingsItem
                        icon="shield"
                        iconColor={theme.warning}
                        iconBg={theme.warning + '20'}
                        label="연결 보안"
                        description="WPA2-PSK 암호화 사용 중"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                    />
                    <SettingsItem
                        icon="refresh"
                        iconColor={theme.info}
                        iconBg={theme.info + '20'}
                        label="연결 재설정"
                        description="모든 연결 설정을 초기화합니다"
                        rightElement={<Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
                        isLast
                    />
                </SettingsGroup>
            </ScrollView>
        </SafeAreaView>
    );
} 