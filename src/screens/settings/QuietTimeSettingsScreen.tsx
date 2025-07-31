import React, { useState, useCallback, useEffect } from 'react';
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
import { QuietTimeService, QuietTimeSettings } from '../../services/QuietTimeService';

export default function QuietTimeSettingsScreen({ navigation }: { navigation: any }) {
    const { theme } = useTheme();

    const [settings, setSettings] = useState<QuietTimeSettings>({
        enabled: true,
        startTime: '22:00', // 오후 10시
        endTime: '07:00'    // 오전 7시
    });

    // 설정 로드
    useEffect(() => {
        loadSettings();
    }, []);

    // 설정 로드
    const loadSettings = async () => {
        try {
            const savedSettings = await QuietTimeService.loadSettings();
            setSettings(savedSettings);
            console.log('🔇 [QUIET TIME] 설정 로드됨:', savedSettings);
        } catch (error) {
            console.error('🔇 [QUIET TIME] 설정 로드 실패:', error);
        }
    };

    // 시간 포맷팅 (HH:mm -> 표시용)
    const formatTimeForDisplay = useCallback((timeString: string) => {
        return QuietTimeService.formatTimeForDisplay(timeString);
    }, []);

    // 표시용 시간을 HH:mm 형식으로 변환
    const formatTimeForStorage = (period: string, hours: number, minutes: number) => {
        return QuietTimeService.formatTimeForStorage(period, hours, minutes);
    };

    // 무음 시간 활성화/비활성화
    const toggleQuietTime = async () => {
        const newSettings = { ...settings, enabled: !settings.enabled };
        setSettings(newSettings);
        await QuietTimeService.saveSettings(newSettings);
        console.log('🔇 [QUIET TIME] 활성화 상태 변경:', newSettings.enabled);
    };

    // 시간 선택 처리
    const handleTimeSelect = async (mode: 'start' | 'end', period: string, hour: number, minute: number) => {
        const timeString = formatTimeForStorage(period, hour, minute);
        const newSettings = {
            ...settings,
            [mode === 'start' ? 'startTime' : 'endTime']: timeString
        };

        // 설정 유효성 검사
        const validation = QuietTimeService.validateSettings(newSettings);
        if (!validation.isValid) {
            Alert.alert('설정 오류', validation.error || '잘못된 설정입니다.');
            return;
        }

        setSettings(newSettings);
        await QuietTimeService.saveSettings(newSettings);

        console.log(`🔇 [QUIET TIME] ${mode === 'start' ? '시작' : '종료'} 시간 설정:`, timeString);

        Alert.alert(
            '설정 완료',
            `${mode === 'start' ? '시작' : '종료'} 시간이 ${formatTimeForDisplay(timeString)}로 설정되었습니다.`,
            [{ text: '확인' }]
        );
    };

    // 시간 선택기 표시
    const showTimePicker = (mode: 'start' | 'end') => {
        const currentTime = mode === 'start' ? settings.startTime : settings.endTime;
        const currentDisplay = formatTimeForDisplay(currentTime);

        Alert.alert(
            `${mode === 'start' ? '시작' : '종료'} 시간 설정`,
            `현재 설정: ${currentDisplay}\n\n시간을 선택하세요`,
            [
                { text: '오전 6:00', onPress: () => handleTimeSelect(mode, '오전', 6, 0) },
                { text: '오전 7:00', onPress: () => handleTimeSelect(mode, '오전', 7, 0) },
                { text: '오전 8:00', onPress: () => handleTimeSelect(mode, '오전', 8, 0) },
                { text: '오전 9:00', onPress: () => handleTimeSelect(mode, '오전', 9, 0) },
                { text: '오전 10:00', onPress: () => handleTimeSelect(mode, '오전', 10, 0) },
                { text: '오전 11:00', onPress: () => handleTimeSelect(mode, '오전', 11, 0) },
                { text: '오후 12:00', onPress: () => handleTimeSelect(mode, '오후', 12, 0) },
                { text: '오후 1:00', onPress: () => handleTimeSelect(mode, '오후', 1, 0) },
                { text: '오후 2:00', onPress: () => handleTimeSelect(mode, '오후', 2, 0) },
                { text: '오후 3:00', onPress: () => handleTimeSelect(mode, '오후', 3, 0) },
                { text: '오후 4:00', onPress: () => handleTimeSelect(mode, '오후', 4, 0) },
                { text: '오후 5:00', onPress: () => handleTimeSelect(mode, '오후', 5, 0) },
                { text: '오후 6:00', onPress: () => handleTimeSelect(mode, '오후', 6, 0) },
                { text: '오후 7:00', onPress: () => handleTimeSelect(mode, '오후', 7, 0) },
                { text: '오후 8:00', onPress: () => handleTimeSelect(mode, '오후', 8, 0) },
                { text: '오후 9:00', onPress: () => handleTimeSelect(mode, '오후', 9, 0) },
                { text: '오후 10:00', onPress: () => handleTimeSelect(mode, '오후', 10, 0) },
                { text: '오후 11:00', onPress: () => handleTimeSelect(mode, '오후', 11, 0) },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    // 기본 설정으로 복원
    const resetToDefault = async () => {
        try {
            const defaultSettings = await QuietTimeService.resetToDefault();
            setSettings(defaultSettings);

            Alert.alert(
                '기본값으로 복원',
                '무음 시간 설정이 기본값으로 복원되었습니다.',
                [{ text: '확인' }]
            );

            console.log('🔇 [QUIET TIME] 기본값으로 복원됨');
        } catch (error) {
            console.error('🔇 [QUIET TIME] 기본값 복원 실패:', error);
            Alert.alert('오류', '기본값으로 복원하는 중 오류가 발생했습니다.');
        }
    };

    // 무음 시간 설명 텍스트
    const getQuietTimeDescription = () => {
        return QuietTimeService.getDescription(settings);
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
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontFamily: 'GoogleSans-Bold',
                        color: theme.textPrimary
                    }}>
                        무음 시간 설정
                    </Text>
                </View>

                {/* 설명 카드 */}
                <View style={{
                    backgroundColor: theme.primary + '10',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.primary
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 8
                    }}>
                        무음 시간이란?
                    </Text>
                    <Text style={{
                        fontSize: 13,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 18
                    }}>
                        설정된 시간 동안 푸시 알림과 움직임 감지 알림을 받지 않습니다.
                        중요한 알림은 계속 받을 수 있습니다.
                    </Text>
                </View>

                {/* 무음 시간 활성화 */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            marginBottom: 4
                        }}>
                            무음 시간 활성화
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary
                        }}>
                            {settings.enabled ? '무음 시간이 활성화됨' : '무음 시간이 비활성화됨'}
                        </Text>
                    </View>
                    <Switch
                        value={settings.enabled}
                        onValueChange={toggleQuietTime}
                        trackColor={{ false: theme.outline, true: theme.primary }}
                        thumbColor={settings.enabled ? theme.onPrimary : theme.surface}
                    />
                </View>

                {/* 시작 시간 설정 */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.surface,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: settings.enabled ? 1 : 0.5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2
                    }}
                    onPress={() => {
                        if (settings.enabled) {
                            showTimePicker('start');
                        }
                    }}
                    disabled={!settings.enabled}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            marginBottom: 4
                        }}>
                            시작 시간
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary
                        }}>
                            {formatTimeForDisplay(settings.startTime)}
                        </Text>
                    </View>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* 종료 시간 설정 */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.surface,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: settings.enabled ? 1 : 0.5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2
                    }}
                    onPress={() => {
                        if (settings.enabled) {
                            showTimePicker('end');
                        }
                    }}
                    disabled={!settings.enabled}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                            marginBottom: 4
                        }}>
                            종료 시간
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary
                        }}>
                            {formatTimeForDisplay(settings.endTime)}
                        </Text>
                    </View>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* 현재 설정 요약 */}
                {settings.enabled && (
                    <View style={{
                        backgroundColor: theme.success + '10',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 24,
                        borderLeftWidth: 4,
                        borderLeftColor: theme.success
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.success,
                            marginBottom: 4
                        }}>
                            현재 설정
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Bold',
                            color: theme.textPrimary
                        }}>
                            {formatTimeForDisplay(settings.startTime)} - {formatTimeForDisplay(settings.endTime)}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                            marginTop: 4
                        }}>
                            이 시간 동안 알림을 받지 않습니다
                        </Text>
                    </View>
                )}

                {/* 기본값으로 복원 */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.outline + '20',
                        borderRadius: 16,
                        padding: 16,
                        alignItems: 'center',
                        marginBottom: 16
                    }}
                    onPress={resetToDefault}
                >
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary
                    }}>
                        기본값으로 복원
                    </Text>
                </TouchableOpacity>

                {/* 정보 카드 */}
                <View style={{
                    backgroundColor: theme.info + '10',
                    borderRadius: 16,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.info
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.info,
                        marginBottom: 8
                    }}>
                        💡 팁
                    </Text>
                    <Text style={{
                        fontSize: 13,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 18
                    }}>
                        • 무음 시간에도 긴급 알림은 계속 받을 수 있습니다{'\n'}
                        • 설정은 자동으로 저장되며 앱을 다시 시작해도 유지됩니다{'\n'}
                        • 시작 시간이 종료 시간보다 늦으면 다음 날까지 적용됩니다
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 