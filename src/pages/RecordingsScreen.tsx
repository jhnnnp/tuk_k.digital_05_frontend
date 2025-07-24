// src/pages/RecordingsScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Recording {
    id: string;
    camera: string;
    timestamp: string;
    duration: string;
    type: 'danger' | 'movement' | 'boundary' | 'sleep' | 'activity' | 'manual';
    severity: 'high' | 'medium' | 'low';
    thumbnail: string;
    size: string;
    description: string;
}

export default function RecordingsScreen() {
    const { theme } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);
    const [playingRecording, setPlayingRecording] = useState<string | null>(null);

    const recordings: Recording[] = [
        {
            id: '1',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T09:15:00',
            duration: '2:12',
            type: 'danger',
            severity: 'high',
            size: '112MB',
            thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&auto=format',
            description: '유아가 위험 구역에 접근'
        },
        {
            id: '2',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T13:40:00',
            duration: '1:05',
            type: 'boundary',
            severity: 'medium',
            size: '56MB',
            thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format',
            description: '설정된 경계를 벗어남'
        },
        {
            id: '3',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T18:22:00',
            duration: '3:33',
            type: 'movement',
            severity: 'low',
            size: '178MB',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
            description: '비정상적인 움직임 감지'
        },
        {
            id: '4',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T21:05:00',
            duration: '0:48',
            type: 'sleep',
            severity: 'low',
            size: '39MB',
            thumbnail: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=400&h=300&fit=crop&auto=format',
            description: '수면 상태 변화 감지'
        },
        {
            id: '5',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T22:30:00',
            duration: '1:25',
            type: 'activity',
            severity: 'medium',
            size: '67MB',
            thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&auto=format',
            description: '높은 활동량 감지'
        },
        {
            id: '6',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T23:15:00',
            duration: '0:32',
            type: 'manual',
            severity: 'low',
            size: '28MB',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
            description: '수동 녹화'
        }
    ];

    const filters = [
        { id: 'all', label: '전체', count: recordings.length },
        { id: 'danger', label: '위험', count: recordings.filter(r => r.type === 'danger').length },
        { id: 'boundary', label: '경계', count: recordings.filter(r => r.type === 'boundary').length },
        { id: 'movement', label: '움직임', count: recordings.filter(r => r.type === 'movement').length },
        { id: 'sleep', label: '수면', count: recordings.filter(r => r.type === 'sleep').length },
        { id: 'activity', label: '활동', count: recordings.filter(r => r.type === 'activity').length },
        { id: 'manual', label: '수동', count: recordings.filter(r => r.type === 'manual').length },
    ];

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return '오늘';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '어제';
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const getTypeInfo = (type: string, severity: string) => {
        const severityColor = severity === 'high' ? theme.error :
            severity === 'medium' ? theme.warning : theme.info;

        switch (type) {
            case 'danger':
                return {
                    label: '위험',
                    color: theme.error,
                    icon: '⚠️',
                    severityColor
                };
            case 'boundary':
                return {
                    label: '경계',
                    color: theme.warning,
                    icon: '🚫',
                    severityColor
                };
            case 'movement':
                return {
                    label: '움직임',
                    color: theme.info,
                    icon: '👶',
                    severityColor
                };
            case 'sleep':
                return {
                    label: '수면',
                    color: theme.primary,
                    icon: '😴',
                    severityColor
                };
            case 'activity':
                return {
                    label: '활동',
                    color: theme.success,
                    icon: '🏃',
                    severityColor
                };
            case 'manual':
                return {
                    label: '수동',
                    color: theme.textSecondary,
                    icon: '👤',
                    severityColor
                };
            default:
                return {
                    label: '기타',
                    color: theme.textSecondary,
                    icon: '📹',
                    severityColor
                };
        }
    };

    const filteredRecordings = selectedFilter === 'all'
        ? recordings
        : recordings.filter(r => r.type === selectedFilter);

    // 날짜 필터링
    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    const dateFilteredRecordings = filteredRecordings.filter(r => isSameDay(new Date(r.timestamp), selectedDate));
    const searchedRecordings = dateFilteredRecordings;

    // 필터 메뉴 토글
    const handleFilterMenuToggle = () => {
        setFilterMenuVisible(!filterMenuVisible);
    };

    // 고급 필터 적용
    const handleAdvancedFilter = () => {
        Alert.alert(
            '고급 필터',
            '추가 필터 옵션을 선택하세요',
            [
                { text: '위험도별', onPress: () => console.log('위험도별 필터') },
                { text: '시간대별', onPress: () => console.log('시간대별 필터') },
                { text: '크기별', onPress: () => console.log('크기별 필터') },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    // 녹화 재생
    const handlePlayRecording = (recordingId: string) => {
        if (playingRecording === recordingId) {
            setPlayingRecording(null);
            Alert.alert('재생 중지', '녹화 재생을 중지했습니다.');
        } else {
            setPlayingRecording(recordingId);
            Alert.alert('재생 시작', '녹화를 재생합니다.');
        }
    };

    // 녹화 다운로드
    const handleDownloadRecording = (recording: Recording) => {
        Alert.alert(
            '다운로드',
            `${recording.description}\n\n다운로드하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '다운로드',
                    onPress: () => {
                        // 실제로는 다운로드 API 호출
                        setTimeout(() => {
                            Alert.alert('다운로드 완료', '녹화 파일이 다운로드되었습니다.');
                        }, 2000);
                    }
                }
            ]
        );
    };

    // 녹화 메뉴
    const handleRecordingMenu = (recording: Recording) => {
        Alert.alert(
            '녹화 옵션',
            recording.description,
            [
                { text: '재생', onPress: () => handlePlayRecording(recording.id) },
                { text: '다운로드', onPress: () => handleDownloadRecording(recording) },
                { text: '공유', onPress: () => console.log('공유') },
                { text: '삭제', style: 'destructive', onPress: () => console.log('삭제') },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    // 헤더 메뉴
    const handleHeaderMenu = () => {
        Alert.alert(
            '녹화 관리',
            '추가 옵션을 선택하세요',
            [
                { text: '전체 다운로드', onPress: () => console.log('전체 다운로드') },
                { text: '일괄 삭제', onPress: () => console.log('일괄 삭제') },
                { text: '백업 설정', onPress: () => console.log('백업 설정') },
                { text: '취소', style: 'cancel' }
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
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.lg
                }}>
                    <View>
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 20,
                            color: theme.textPrimary,
                            marginBottom: theme.spacing.xs
                        }}>
                            보호 기록
                        </Text>
                        <Text style={{
                            fontFamily: 'GoogleSans-Regular',
                            fontSize: 14,
                            color: theme.textSecondary
                        }}>
                            유아 보호 활동을 확인하고 관리하세요
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.surfaceVariant,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={handleHeaderMenu}
                    >
                        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Date and Filter Controls */}
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                    <TouchableOpacity
                        onPress={() => setDatePickerVisible(true)}
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: theme.outline,
                            borderRadius: theme.borderRadius.button,
                            paddingVertical: theme.spacing.sm,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: theme.spacing.sm
                        }}>
                        <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 14,
                            color: theme.textPrimary
                        }}>
                            {`${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderColor: theme.outline,
                            borderRadius: theme.borderRadius.button,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={handleAdvancedFilter}
                    >
                        <Ionicons name="filter" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
                <DateTimePickerModal
                    isVisible={datePickerVisible}
                    mode="date"
                    date={selectedDate}
                    onConfirm={date => {
                        setSelectedDate(date);
                        setDatePickerVisible(false);
                    }}
                    onCancel={() => setDatePickerVisible(false)}
                />

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: theme.spacing.md }}
                >
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setSelectedFilter(filter.id)}
                                style={{
                                    backgroundColor: selectedFilter === filter.id ? theme.primary : theme.surfaceVariant,
                                    borderRadius: 20,
                                    paddingHorizontal: theme.spacing.md,
                                    paddingVertical: theme.spacing.sm
                                }}
                            >
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 12,
                                    color: selectedFilter === filter.id ? theme.onPrimary : theme.textSecondary
                                }}>
                                    {filter.label} ({filter.count})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Summary Stats */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: theme.borderRadius.card,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: theme.elevation.card },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: theme.elevation.card
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                            <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 14,
                                color: theme.textSecondary
                            }}>
                                오늘의 보호 활동
                            </Text>
                        </View>
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 14,
                            color: theme.textPrimary
                        }}>
                            {recordings.filter(r => isSameDay(new Date(r.timestamp), selectedDate)).length}건
                        </Text>
                    </View>
                </View>

                {/* Recordings List */}
                <View style={{ gap: theme.spacing.sm }}>
                    {searchedRecordings.length === 0 ? (
                        <View style={{
                            alignItems: 'center',
                            paddingVertical: 48
                        }}>
                            <View style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: theme.surfaceVariant,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: theme.spacing.md
                            }}>
                                <Ionicons name="shield-checkmark" size={24} color={theme.textSecondary} />
                            </View>
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 14,
                                color: theme.textSecondary
                            }}>
                                {'보호 활동 기록이 없습니다'}
                            </Text>
                        </View>
                    ) : (
                        searchedRecordings.map((recording) => {
                            const typeInfo = getTypeInfo(recording.type, recording.severity);
                            const isPlaying = playingRecording === recording.id;

                            return (
                                <View key={recording.id} style={{
                                    backgroundColor: theme.surface,
                                    borderRadius: theme.borderRadius.card,
                                    overflow: 'hidden',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: theme.elevation.card },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: theme.elevation.card
                                }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {/* Thumbnail */}
                                        <TouchableOpacity
                                            style={{
                                                width: 112,
                                                height: 80,
                                                position: 'relative'
                                            }}
                                            onPress={() => handlePlayRecording(recording.id)}
                                        >
                                            <Image
                                                source={{ uri: recording.thumbnail }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />

                                            {/* Play overlay */}
                                            <View style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <View style={{
                                                    backgroundColor: isPlaying ? theme.primary : 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: 16,
                                                    padding: 8
                                                }}>
                                                    <Ionicons
                                                        name={isPlaying ? "pause" : "play"}
                                                        size={14}
                                                        color={isPlaying ? theme.onPrimary : "#000"}
                                                        style={{ marginLeft: isPlaying ? 0 : 2 }}
                                                    />
                                                </View>
                                            </View>

                                            {/* Duration badge */}
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 4,
                                                right: 4,
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                borderRadius: 4,
                                                paddingHorizontal: 4,
                                                paddingVertical: 2
                                            }}>
                                                <Text style={{
                                                    fontFamily: 'GoogleSans-Medium',
                                                    fontSize: 10,
                                                    color: '#fff'
                                                }}>
                                                    {recording.duration}
                                                </Text>
                                            </View>

                                            {/* Severity indicator */}
                                            <View style={{
                                                position: 'absolute',
                                                top: 4,
                                                left: 4,
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: typeInfo.severityColor
                                            }} />
                                        </TouchableOpacity>

                                        {/* Content */}
                                        <View style={{ flex: 1, padding: theme.spacing.md }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                marginBottom: theme.spacing.sm
                                            }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontFamily: 'GoogleSans-Medium',
                                                        fontSize: 14,
                                                        color: theme.textPrimary,
                                                        marginBottom: theme.spacing.xs
                                                    }}>
                                                        {recording.description}
                                                    </Text>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: theme.spacing.xs
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: 'GoogleSans-Regular',
                                                            fontSize: 10,
                                                            color: theme.textSecondary
                                                        }}>
                                                            {formatDate(recording.timestamp)}
                                                        </Text>
                                                        <Text style={{
                                                            fontFamily: 'GoogleSans-Regular',
                                                            fontSize: 10,
                                                            color: theme.textSecondary
                                                        }}>
                                                            •
                                                        </Text>
                                                        <Text style={{
                                                            fontFamily: 'GoogleSans-Regular',
                                                            fontSize: 10,
                                                            color: theme.textSecondary
                                                        }}>
                                                            {formatTime(recording.timestamp)}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 16,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onPress={() => handleRecordingMenu(recording)}
                                                >
                                                    <Ionicons name="ellipsis-vertical" size={14} color={theme.textSecondary} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: theme.spacing.sm
                                                }}>
                                                    <View style={{
                                                        backgroundColor: typeInfo.color + '20',
                                                        borderRadius: 12,
                                                        paddingHorizontal: theme.spacing.sm,
                                                        paddingVertical: 2
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: 'GoogleSans-Medium',
                                                            fontSize: 10,
                                                            color: typeInfo.color
                                                        }}>
                                                            {typeInfo.icon} {typeInfo.label}
                                                        </Text>
                                                    </View>
                                                    <Text style={{
                                                        fontFamily: 'GoogleSans-Regular',
                                                        fontSize: 10,
                                                        color: theme.textSecondary
                                                    }}>
                                                        {recording.size}
                                                    </Text>
                                                </View>

                                                <TouchableOpacity
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 16,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onPress={() => handleDownloadRecording(recording)}
                                                >
                                                    <Ionicons name="download" size={14} color={theme.info} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
