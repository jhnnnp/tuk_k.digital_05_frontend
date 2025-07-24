import React, { useState } from 'react';
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
import { useTheme } from '../../styles/ThemeProvider';

export default function DataRetentionSettingsScreen() {
    const { theme } = useTheme();

    const [selectedRetention, setSelectedRetention] = useState('30');

    const retentionOptions = [
        {
            id: '7',
            name: '7일',
            description: '1주일 동안 보관',
            icon: 'time'
        },
        {
            id: '30',
            name: '30일',
            description: '1개월 동안 보관 (권장)',
            icon: 'time'
        },
        {
            id: '90',
            name: '90일',
            description: '3개월 동안 보관',
            icon: 'time'
        },
        {
            id: '180',
            name: '180일',
            description: '6개월 동안 보관',
            icon: 'time'
        },
        {
            id: '365',
            name: '365일',
            description: '1년 동안 보관',
            icon: 'time'
        },
        {
            id: 'unlimited',
            name: '무제한',
            description: '저장공간이 허용하는 한 계속 보관',
            icon: 'infinite'
        }
    ];

    const handleRetentionSelect = (retention: string) => {
        setSelectedRetention(retention);
        Alert.alert(
            '보관 기간 설정 완료',
            `${retentionOptions.find(r => r.id === retention)?.name}로 설정되었습니다.`,
            [{ text: '확인' }]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 헤더 */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.surfaceVariant,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 16
                        }}
                        onPress={() => {/* 네비게이션 뒤로가기 */ }}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontFamily: 'GoogleSans-Bold',
                        color: theme.textPrimary
                    }}>
                        데이터 보관 기간
                    </Text>
                </View>

                {/* 설명 */}
                <View style={{
                    backgroundColor: theme.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 20
                    }}>
                        녹화본을 보관할 기간을 설정하세요. 설정된 기간이 지나면 자동으로 삭제됩니다.
                    </Text>
                </View>

                {/* 보관 기간 옵션들 */}
                {retentionOptions.map((option, index) => (
                    <TouchableOpacity
                        key={option.id}
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 12,
                            borderWidth: selectedRetention === option.id ? 2 : 1,
                            borderColor: selectedRetention === option.id ? theme.primary : theme.outline
                        }}
                        onPress={() => handleRetentionSelect(option.id)}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{ flex: 1 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <Ionicons
                                        name={option.icon as any}
                                        size={20}
                                        color={selectedRetention === option.id ? theme.primary : theme.textSecondary}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: selectedRetention === option.id ? theme.primary : theme.textPrimary
                                    }}>
                                        {option.name}
                                    </Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary
                                }}>
                                    {option.description}
                                </Text>
                            </View>
                            {selectedRetention === option.id && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={theme.primary}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* 주의사항 */}
                <View style={{
                    backgroundColor: theme.warning + '20',
                    borderRadius: 16,
                    padding: 16,
                    marginTop: 16
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <Ionicons
                            name="warning"
                            size={20}
                            color={theme.warning}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.warning
                        }}>
                            주의사항
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: 12,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 16
                    }}>
                        • 설정된 기간이 지나면 녹화본이 자동으로 삭제됩니다{'\n'}
                        • 삭제된 녹화본은 복구할 수 없습니다{'\n'}
                        • 저장공간이 부족하면 오래된 녹화본부터 자동 삭제됩니다
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 