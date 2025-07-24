import React, { useState, useCallback } from 'react';
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

export default function QuietTimeSettingsScreen() {
    const { theme } = useTheme();

    const [quietTimeEnabled, setQuietTimeEnabled] = useState(true);
    const [quietTimeStart, setQuietTimeStart] = useState(new Date(2025, 0, 1, 22, 0)); // 오후 10시
    const [quietTimeEnd, setQuietTimeEnd] = useState(new Date(2025, 0, 1, 7, 0)); // 오전 7시

    // 시간 포맷팅
    const formatTime = useCallback((date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${period} ${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }, []);

    // 무음 시간 설정
    const handleQuietTime = () => {
        Alert.alert(
            '무음 시간 설정',
            `현재 설정: ${formatTime(quietTimeStart)} - ${formatTime(quietTimeEnd)}\n\n무엇을 설정하시겠습니까?`,
            [
                {
                    text: '시작 시간 설정',
                    onPress: () => handleTimePickerAlert('start')
                },
                {
                    text: '종료 시간 설정',
                    onPress: () => handleTimePickerAlert('end')
                },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    // Alert 기반 시간 선택기
    const handleTimePickerAlert = (mode: 'start' | 'end') => {
        const currentTime = mode === 'start' ? quietTimeStart : quietTimeEnd;
        const currentTimeStr = formatTime(currentTime);

        Alert.alert(
            `${mode === 'start' ? '시작' : '종료'} 시간 설정`,
            `현재 설정: ${currentTimeStr}\n\n시간을 선택하세요`,
            [
                { text: '오전 6:00', onPress: () => handleTimeSelect(mode, 6, 0) },
                { text: '오전 7:00', onPress: () => handleTimeSelect(mode, 7, 0) },
                { text: '오전 8:00', onPress: () => handleTimeSelect(mode, 8, 0) },
                { text: '오전 9:00', onPress: () => handleTimeSelect(mode, 9, 0) },
                { text: '오전 10:00', onPress: () => handleTimeSelect(mode, 10, 0) },
                { text: '오전 11:00', onPress: () => handleTimeSelect(mode, 11, 0) },
                { text: '오후 12:00', onPress: () => handleTimeSelect(mode, 12, 0) },
                { text: '오후 1:00', onPress: () => handleTimeSelect(mode, 13, 0) },
                { text: '오후 2:00', onPress: () => handleTimeSelect(mode, 14, 0) },
                { text: '오후 3:00', onPress: () => handleTimeSelect(mode, 15, 0) },
                { text: '오후 4:00', onPress: () => handleTimeSelect(mode, 16, 0) },
                { text: '오후 5:00', onPress: () => handleTimeSelect(mode, 17, 0) },
                { text: '오후 6:00', onPress: () => handleTimeSelect(mode, 18, 0) },
                { text: '오후 7:00', onPress: () => handleTimeSelect(mode, 19, 0) },
                { text: '오후 8:00', onPress: () => handleTimeSelect(mode, 20, 0) },
                { text: '오후 9:00', onPress: () => handleTimeSelect(mode, 21, 0) },
                { text: '오후 10:00', onPress: () => handleTimeSelect(mode, 22, 0) },
                { text: '오후 11:00', onPress: () => handleTimeSelect(mode, 23, 0) },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    // 시간 선택 처리
    const handleTimeSelect = (mode: 'start' | 'end', hour: number, minute: number) => {
        const newTime = new Date(2025, 0, 1, hour, minute);

        if (mode === 'start') {
            setQuietTimeStart(newTime);
            console.log('시작 시간 설정:', formatTime(newTime));
        } else {
            setQuietTimeEnd(newTime);
            console.log('종료 시간 설정:', formatTime(newTime));
        }

        // 설정 완료 알림
        Alert.alert(
            '설정 완료',
            `${mode === 'start' ? '시작' : '종료'} 시간이 ${formatTime(newTime)}로 설정되었습니다.`,
            [{ text: '확인' }]
        );
    };

    // 무음 시간 활성화/비활성화
    const toggleQuietTime = () => {
        setQuietTimeEnabled(!quietTimeEnabled);
    };

    // 기본 설정으로 복원
    const resetToDefault = () => {
        setQuietTimeStart(new Date(2025, 0, 1, 22, 0));
        setQuietTimeEnd(new Date(2025, 0, 1, 7, 0));
        setQuietTimeEnabled(true);
    };

    // 무음 시간 설명 텍스트
    const getQuietTimeDescription = () => {
        if (!quietTimeEnabled) return '무음 시간이 비활성화됨';
        return `${formatTime(quietTimeStart)} - ${formatTime(quietTimeEnd)}`;
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
                        무음 시간 설정
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
                    justifyContent: 'space-between'
                }}>
                    <View>
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
                            설정된 시간 동안 알림을 받지 않습니다
                        </Text>
                    </View>
                    <Switch
                        value={quietTimeEnabled}
                        onValueChange={toggleQuietTime}
                        trackColor={{ false: theme.outline, true: theme.primary }}
                        thumbColor={quietTimeEnabled ? theme.onPrimary : theme.surface}
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
                        opacity: quietTimeEnabled ? 1 : 0.5
                    }}
                    onPress={() => {
                        if (quietTimeEnabled) {
                            handleTimePickerAlert('start');
                        }
                    }}
                    disabled={!quietTimeEnabled}
                >
                    <View>
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
                            {formatTime(quietTimeStart)}
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
                        opacity: quietTimeEnabled ? 1 : 0.5
                    }}
                    onPress={() => {
                        if (quietTimeEnabled) {
                            handleTimePickerAlert('end');
                        }
                    }}
                    disabled={!quietTimeEnabled}
                >
                    <View>
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
                            {formatTime(quietTimeEnd)}
                        </Text>
                    </View>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* 기본값으로 복원 */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.outline + '20',
                        borderRadius: 16,
                        padding: 16,
                        alignItems: 'center'
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
            </ScrollView>
        </SafeAreaView>
    );
} 