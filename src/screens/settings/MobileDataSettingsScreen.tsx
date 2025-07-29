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
import { useTheme } from '../../styles/ThemeProvider';

export default function MobileDataSettingsScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const [mobileDataEnabled, setMobileDataEnabled] = useState(false);
    const [dataSaverEnabled, setDataSaverEnabled] = useState(true);

    const handleMobileDataToggle = (value: boolean) => {
        setMobileDataEnabled(value);
        Alert.alert(
            value ? '모바일 데이터 활성화' : '모바일 데이터 비활성화',
            value
                ? '모바일 데이터가 활성화되었습니다. 데이터 사용량에 주의하세요.'
                : '모바일 데이터가 비활성화되었습니다. Wi-Fi 연결을 권장합니다.'
        );
    };

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
                    모바일 데이터
                </Text>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {/* 주의사항 카드 */}
                <View style={{
                    backgroundColor: theme.warning + '10',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.warning
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="warning" size={20} color={theme.warning} style={{ marginRight: 8 }} />
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.warning
                        }}>
                            주의사항
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        lineHeight: 20
                    }}>
                        로봇 카메라 제어는 Wi-Fi 연결을 권장합니다. 모바일 데이터 사용 시 데이터 사용량이 증가할 수 있습니다.
                    </Text>
                </View>

                {/* 모바일 데이터 설정 */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    marginBottom: 20
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.outline
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: theme.primary + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}>
                                <Ionicons name="cellular" size={20} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary
                                }}>
                                    모바일 데이터
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    color: theme.textSecondary,
                                    marginTop: 2
                                }}>
                                    {mobileDataEnabled ? '활성화됨' : '비활성화됨'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={mobileDataEnabled}
                            onValueChange={handleMobileDataToggle}
                            trackColor={{ false: theme.outline, true: theme.primary }}
                            thumbColor={theme.surface}
                        />
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: theme.success + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}>
                                <Ionicons name="save" size={20} color={theme.success} />
                            </View>
                            <View>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary
                                }}>
                                    데이터 절약 모드
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    color: theme.textSecondary,
                                    marginTop: 2
                                }}>
                                    데이터 사용량 최적화
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={dataSaverEnabled}
                            onValueChange={setDataSaverEnabled}
                            trackColor={{ false: theme.outline, true: theme.success }}
                            thumbColor={theme.surface}
                        />
                    </View>
                </View>

                {/* 사용량 정보 */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 12
                    }}>
                        데이터 사용량
                    </Text>

                    <View style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 14, color: theme.textSecondary }}>이번 달</Text>
                            <Text style={{ fontSize: 14, color: theme.textPrimary }}>2.3 GB / 5 GB</Text>
                        </View>
                        <View style={{
                            height: 8,
                            backgroundColor: theme.outline,
                            borderRadius: 4,
                            overflow: 'hidden'
                        }}>
                            <View style={{
                                width: '46%',
                                height: '100%',
                                backgroundColor: theme.primary,
                                borderRadius: 4
                            }} />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: theme.primary + '10',
                            borderRadius: 8,
                            padding: 12,
                            alignItems: 'center'
                        }}
                        onPress={() => Alert.alert('사용량 초기화', '데이터 사용량을 초기화하시겠습니까?')}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.primary
                        }}>
                            사용량 초기화
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 권장사항 */}
                <View style={{
                    backgroundColor: theme.info + '10',
                    borderRadius: 12,
                    padding: 16
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="information-circle" size={20} color={theme.info} style={{ marginRight: 8 }} />
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.info
                        }}>
                            권장사항
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        lineHeight: 20
                    }}>
                        • 로봇 카메라 제어는 Wi-Fi 연결을 사용하세요{'\n'}
                        • 실시간 스트리밍 시 데이터 사용량이 많습니다{'\n'}
                        • 데이터 절약 모드를 활성화하여 사용량을 줄이세요
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 