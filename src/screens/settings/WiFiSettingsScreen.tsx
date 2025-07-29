import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface WiFiNetwork {
    id: string;
    ssid: string;
    strength: number;
    security: 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3';
    isConnected: boolean;
    isSaved: boolean;
}

export default function WiFiSettingsScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
    const [scanning, setScanning] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [connecting, setConnecting] = useState(false);

    // 모의 Wi-Fi 네트워크 데이터
    const mockNetworks: WiFiNetwork[] = [
        { id: '1', ssid: 'Home_WiFi_5G', strength: 95, security: 'wpa2', isConnected: true, isSaved: true },
        { id: '2', ssid: 'Office_Network', strength: 87, security: 'wpa2', isConnected: false, isSaved: true },
        { id: '3', ssid: 'Guest_WiFi', strength: 72, security: 'open', isConnected: false, isSaved: false },
        { id: '4', ssid: 'Neighbor_5G', strength: 65, security: 'wpa3', isConnected: false, isSaved: false },
        { id: '5', ssid: 'Cafe_Free_WiFi', strength: 58, security: 'open', isConnected: false, isSaved: false },
        { id: '6', ssid: 'Library_Public', strength: 45, security: 'wpa2', isConnected: false, isSaved: false },
    ];

    useEffect(() => {
        // 초기 네트워크 목록 로드
        setNetworks(mockNetworks);
    }, []);

    const handleScanNetworks = () => {
        setScanning(true);
        // 모의 스캔 과정
        setTimeout(() => {
            setNetworks(mockNetworks);
            setScanning(false);
            Alert.alert('스캔 완료', `${mockNetworks.length}개의 Wi-Fi 네트워크를 찾았습니다.`);
        }, 2000);
    };

    const handleNetworkPress = (network: WiFiNetwork) => {
        if (network.isConnected) {
            Alert.alert('연결 해제', `${network.ssid}에서 연결을 해제하시겠습니까?`, [
                { text: '취소', style: 'cancel' },
                {
                    text: '해제',
                    style: 'destructive',
                    onPress: () => {
                        setNetworks(prev => prev.map(n =>
                            n.id === network.id ? { ...n, isConnected: false } : n
                        ));
                        Alert.alert('연결 해제됨', `${network.ssid}에서 연결이 해제되었습니다.`);
                    }
                }
            ]);
        } else if (network.security === 'open') {
            // 보안이 없는 네트워크는 바로 연결
            handleConnect(network, '');
        } else {
            // 보안이 있는 네트워크는 비밀번호 입력
            setSelectedNetwork(network);
            setShowPasswordModal(true);
        }
    };

    const handleConnect = (network: WiFiNetwork, password: string) => {
        setConnecting(true);

        // 모의 연결 과정
        setTimeout(() => {
            setConnecting(false);
            setNetworks(prev => prev.map(n => ({
                ...n,
                isConnected: n.id === network.id,
                isSaved: n.id === network.id ? true : n.isSaved
            })));

            if (password) {
                setShowPasswordModal(false);
                setPassword('');
            }

            Alert.alert('연결 성공', `${network.ssid}에 연결되었습니다.`);
        }, 1500);
    };

    const getSecurityIcon = (security: string) => {
        switch (security) {
            case 'open': return 'unlock';
            case 'wep': return 'lock';
            case 'wpa': return 'shield';
            case 'wpa2': return 'shield-checkmark';
            case 'wpa3': return 'shield-checkmark';
            default: return 'lock';
        }
    };

    const getStrengthBars = (strength: number) => {
        const bars = [];
        const barCount = 4;
        const filledBars = Math.ceil((strength / 100) * barCount);

        for (let i = 0; i < barCount; i++) {
            bars.push(
                <View
                    key={i}
                    style={{
                        width: 3,
                        height: (i + 1) * 4,
                        backgroundColor: i < filledBars ? theme.primary : theme.outline,
                        marginRight: 2,
                        borderRadius: 1,
                    }}
                />
            );
        }
        return bars;
    };

    const NetworkItem = ({ network }: { network: WiFiNetwork }) => (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: 'transparent',
                borderBottomWidth: 1,
                borderBottomColor: theme.outline,
            }}
            onPress={() => handleNetworkPress(network)}
        >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 12 }}>
                    <Ionicons
                        name={getSecurityIcon(network.security) as any}
                        size={20}
                        color={network.security === 'open' ? theme.success : theme.warning}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            flex: 1
                        }}>
                            {network.ssid}
                        </Text>
                        {network.isConnected && (
                            <View style={{
                                backgroundColor: theme.success + '20',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                marginLeft: 8
                            }}>
                                <Text style={{
                                    fontSize: 10,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.success
                                }}>
                                    연결됨
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 8 }}>
                            {getStrengthBars(network.strength)}
                        </View>
                        <Text style={{
                            fontSize: 12,
                            color: theme.textSecondary
                        }}>
                            {network.security === 'open' ? '보안 없음' : `${network.security.toUpperCase()} 보안`}
                        </Text>
                    </View>
                </View>
            </View>

            <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textSecondary}
            />
        </TouchableOpacity>
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
                    Wi-Fi 설정
                </Text>
                <TouchableOpacity
                    onPress={handleScanNetworks}
                    disabled={scanning}
                    style={{
                        marginLeft: 'auto',
                        padding: 8
                    }}
                >
                    {scanning ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <Ionicons name="refresh" size={20} color={theme.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* 현재 연결 상태 */}
                <View style={{
                    backgroundColor: theme.surface,
                    margin: 16,
                    borderRadius: 12,
                    padding: 16
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textSecondary,
                        marginBottom: 8
                    }}>
                        현재 연결
                    </Text>
                    {networks.find(n => n.isConnected) ? (
                        <NetworkItem network={networks.find(n => n.isConnected)!} />
                    ) : (
                        <Text style={{
                            fontSize: 14,
                            color: theme.textSecondary,
                            fontStyle: 'italic'
                        }}>
                            연결된 Wi-Fi가 없습니다
                        </Text>
                    )}
                </View>

                {/* 사용 가능한 네트워크 */}
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textSecondary,
                        marginBottom: 8
                    }}>
                        사용 가능한 네트워크
                    </Text>
                    <View style={{
                        backgroundColor: theme.surface,
                        borderRadius: 12,
                        overflow: 'hidden'
                    }}>
                        {networks.filter(n => !n.isConnected).map((network, index) => (
                            <NetworkItem key={network.id} network={network} />
                        ))}
                    </View>
                </View>

                {/* 저장된 네트워크 */}
                {networks.filter(n => n.isSaved && !n.isConnected).length > 0 && (
                    <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textSecondary,
                            marginBottom: 8
                        }}>
                            저장된 네트워크
                        </Text>
                        <View style={{
                            backgroundColor: theme.surface,
                            borderRadius: 12,
                            overflow: 'hidden'
                        }}>
                            {networks.filter(n => n.isSaved && !n.isConnected).map((network) => (
                                <NetworkItem key={network.id} network={network} />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* 비밀번호 입력 모달 */}
            {showPasswordModal && selectedNetwork && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <View style={{
                        backgroundColor: theme.surface,
                        borderRadius: 16,
                        padding: 20,
                        width: '100%',
                        maxWidth: 300
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            marginBottom: 8
                        }}>
                            {selectedNetwork.ssid}에 연결
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            color: theme.textSecondary,
                            marginBottom: 16
                        }}>
                            네트워크 비밀번호를 입력하세요
                        </Text>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: theme.outline,
                                borderRadius: 8,
                                padding: 12,
                                fontSize: 16,
                                color: theme.textPrimary,
                                marginBottom: 16,
                                backgroundColor: theme.background
                            }}
                            placeholder="비밀번호"
                            placeholderTextColor={theme.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoFocus
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: theme.outline
                                }}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setPassword('');
                                    setSelectedNetwork(null);
                                }}
                            >
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary
                                }}>
                                    취소
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: theme.primary
                                }}
                                onPress={() => {
                                    if (password.trim()) {
                                        handleConnect(selectedNetwork, password);
                                    } else {
                                        Alert.alert('오류', '비밀번호를 입력해주세요.');
                                    }
                                }}
                                disabled={connecting}
                            >
                                {connecting ? (
                                    <ActivityIndicator size="small" color={theme.onPrimary} />
                                ) : (
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.onPrimary
                                    }}>
                                        연결
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
} 