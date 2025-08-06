// src/pages/RecordingsScreen.tsx
import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View, Text, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';
import AnimatedTabButton from '../components/atoms/AnimatedTabButton';
import VideoPlayer from '../components/atoms/VideoPlayer';
import DownloadProgressModal from '../components/atoms/DownloadProgressModal';
import DownloadSuccessAlert from '../components/atoms/DownloadSuccessAlert';
import RecordingActionSheet from '../components/atoms/RecordingActionSheet';
import CalendarPicker from '../components/atoms/CalendarPicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth } = Dimensions.get('window');

interface Recording {
    id: string;
    camera: string;
    timestamp: string;
    duration: string;
    type: 'danger' | 'movement' | 'boundary' | 'sleep' | 'activity' | 'manual';
    severity: 'high' | 'medium' | 'low';
    thumbnail: string;
    videoUrl: string;
    size: string;
    description: string;
}

interface DownloadSuccessConfig {
    title: string;
    message: string;
    fileName: string;
    fileSize: string;
}

export default function RecordingsScreen() {
    const { theme } = useTheme();

    // State management
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [playingRecording, setPlayingRecording] = useState<string | null>(null);
    const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingFile, setDownloadingFile] = useState<Recording | null>(null);
    const [downloadSuccessVisible, setDownloadSuccessVisible] = useState(false);
    const [downloadSuccessConfig, setDownloadSuccessConfig] = useState<DownloadSuccessConfig>({
        title: '',
        message: '',
        fileName: '',
        fileSize: '',
    });
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [recordingActions, setRecordingActions] = useState<any[]>([]);

    // Mock data
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
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
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
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            description: '비정상적인 움직임 감지'
        },
        {
            id: '4',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T21:05:00',
            duration: '4:18',
            type: 'sleep',
            severity: 'low',
            size: '234MB',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            description: '수면 상태 변화 감지'
        },
        {
            id: '5',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T14:30:00',
            duration: '1:45',
            type: 'activity',
            severity: 'medium',
            size: '89MB',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            description: '높은 활동량 감지'
        },
        {
            id: '6',
            camera: 'TIBO 로봇캠',
            timestamp: '2025-07-23T16:20:00',
            duration: '2:30',
            type: 'manual',
            severity: 'low',
            size: '28MB',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            description: '수동 녹화'
        }
    ];

    // Computed values using useMemo for performance
    const filters = useMemo(() => [
        {
            id: 'all',
            label: '전체',
            count: recordings.length,
            icon: 'shield-checkmark',
            color: theme.primary,
            description: '모든 보호 활동'
        },
        {
            id: 'danger',
            label: '위험',
            count: recordings.filter(r => r.type === 'danger').length,
            icon: 'warning',
            color: theme.error,
            description: '위험 상황 감지'
        },
        {
            id: 'boundary',
            label: '경계',
            count: recordings.filter(r => r.type === 'boundary').length,
            icon: 'alert-circle',
            color: theme.warning,
            description: '경계선 침범'
        },
        {
            id: 'movement',
            label: '움직임',
            count: recordings.filter(r => r.type === 'movement').length,
            icon: 'eye',
            color: theme.info,
            description: '비정상 움직임'
        },
        {
            id: 'sleep',
            label: '수면',
            count: recordings.filter(r => r.type === 'sleep').length,
            icon: 'moon',
            color: theme.primary,
            description: '수면 상태 변화'
        },
        {
            id: 'activity',
            label: '활동',
            count: recordings.filter(r => r.type === 'activity').length,
            icon: 'fitness',
            color: theme.success,
            description: '높은 활동량'
        },
        {
            id: 'manual',
            label: '수동',
            count: recordings.filter(r => r.type === 'manual').length,
            icon: 'hand-right',
            color: theme.textSecondary,
            description: '수동 녹화'
        },
    ], [recordings, theme]);

    // Utility functions
    const isDateInRange = (date: Date): boolean => {
        const recordingDate = new Date(date);
        const startDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);

        // 시간을 제거하고 날짜만 비교
        recordingDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return recordingDate >= startDate && recordingDate <= endDate;
    };

    const filteredRecordings = useMemo(() => {
        const filtered = selectedFilter === 'all'
            ? recordings
            : recordings.filter(r => r.type === selectedFilter);

        return filtered.filter(r => isDateInRange(new Date(r.timestamp)));
    }, [recordings, selectedFilter, selectedStartDate, selectedEndDate]);

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp: string): string => {
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

    const formatDateRange = (): string => {
        if (selectedStartDate.getTime() === selectedEndDate.getTime()) {
            return `${selectedStartDate.getFullYear()}년 ${selectedStartDate.getMonth() + 1}월 ${selectedStartDate.getDate()}일`;
        } else {
            return `${selectedStartDate.getMonth() + 1}월 ${selectedStartDate.getDate()}일 - ${selectedEndDate.getMonth() + 1}월 ${selectedEndDate.getDate()}일`;
        }
    };

    // Event handlers
    const handleDateRangeConfirm = (startDate: Date, endDate: Date): void => {
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
        setCalendarVisible(false);
    };

    const handlePlayRecording = (recording: Recording): void => {
        setSelectedVideo(recording);
        setVideoPlayerVisible(true);
        setPlayingRecording(recording.id);
    };

    const handleCancelDownload = (): void => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadingFile(null);
    };

    const handleDownloadRecording = async (recording: Recording): Promise<void> => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('권한 필요', '미디어 라이브러리 접근 권한이 필요합니다.');
                return;
            }

            setIsDownloading(true);
            setDownloadingFile(recording);
            setDownloadProgress(0);

            const downloadResumable = FileSystem.createDownloadResumable(
                recording.videoUrl,
                FileSystem.documentDirectory + `recording_${recording.id}.mp4`,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    setDownloadProgress(progress);
                }
            );

            const { uri } = await downloadResumable.downloadAsync();

            if (uri) {
                const asset = await MediaLibrary.createAssetAsync(uri);
                await MediaLibrary.createAlbumAsync('TIBO Recordings', asset, false);

                setDownloadSuccessConfig({
                    title: '다운로드 완료',
                    message: '녹화 파일이 갤러리에 저장되었습니다.',
                    fileName: recording.description,
                    fileSize: recording.size,
                });
                setDownloadSuccessVisible(true);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('다운로드 오류:', error);
            setDownloadSuccessConfig({
                title: '다운로드 실패',
                message: '파일 다운로드에 실패했습니다.',
                fileName: recording.description,
                fileSize: recording.size,
            });
            setDownloadSuccessVisible(true);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
            setDownloadingFile(null);
        }
    };

    const handleShareRecording = async (recording: Recording): Promise<void> => {
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                recording.videoUrl,
                FileSystem.documentDirectory + `share_${recording.id}.mp4`
            );

            const { uri } = await downloadResumable.downloadAsync();

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'video/mp4',
                    dialogTitle: recording.description,
                    UTI: 'public.movie'
                });
            } else {
                Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
            }
        } catch (error) {
            console.error('공유 오류:', error);
            Alert.alert('공유 실패', '파일 다운로드 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteRecording = (recording: Recording): void => {
        Alert.alert(
            '삭제 확인',
            `${recording.description}\n\n이 녹화를 삭제하시겠습니까?\n\n삭제된 녹화는 복구할 수 없습니다.`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        console.log('삭제 시작:', recording.id);
                        Alert.alert('삭제 중...', '녹화 파일을 삭제하고 있습니다.');

                        setTimeout(() => {
                            Alert.alert('삭제 완료', '녹화가 성공적으로 삭제되었습니다.');
                        }, 2000);
                    }
                }
            ]
        );
    };

    const handleRecordingMenu = (recording: Recording): void => {
        setSelectedRecording(recording);
        setRecordingActions([
            {
                id: 'play',
                title: '재생',
                subtitle: '녹화를 재생합니다',
                icon: 'play',
                color: theme.primary,
                type: 'default',
                onPress: () => handlePlayRecording(recording),
            },
            {
                id: 'download',
                title: '다운로드',
                subtitle: '기기에 저장합니다',
                icon: 'download',
                color: '#10B981',
                type: 'default',
                onPress: () => handleDownloadRecording(recording),
            },
            {
                id: 'share',
                title: '공유',
                subtitle: '다른 앱으로 공유합니다',
                icon: 'share-social',
                color: '#8B5CF6',
                type: 'default',
                onPress: () => handleShareRecording(recording),
            },
            {
                id: 'delete',
                title: '삭제',
                subtitle: '녹화를 영구 삭제합니다',
                icon: 'trash',
                color: '#EF4444',
                type: 'destructive',
                onPress: () => handleDeleteRecording(recording),
            },
        ]);
        setActionSheetVisible(true);
    };

    const handleHeaderMenu = (): void => {
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

            {/* 헤더 */}
            <View style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.lg,
                backgroundColor: theme.background,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.3)',
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                        <View style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            overflow: 'hidden',
                            shadowColor: '#5B9BD5',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 8,
                        }}>
                            <LinearGradient
                                colors={['#5B9BD5', '#3B82F6']}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <View>
                            <Text style={{
                                fontSize: 28,
                                fontWeight: '800',
                                color: theme.textPrimary,
                                marginBottom: 6,
                                letterSpacing: -0.8,
                            }}>
                                보호 기록
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                color: theme.textSecondary,
                                opacity: 0.8,
                                lineHeight: 20,
                            }}>
                                유아 보호 활동을 확인하고 관리하세요
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: 'rgba(248, 250, 252, 0.8)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                        onPress={handleHeaderMenu}
                    >
                        <Ionicons name="ellipsis-horizontal" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >


                {/* Professional Date Range Selection */}
                <View style={{
                    marginBottom: theme.spacing.md,
                    paddingHorizontal: theme.spacing.xs
                }}>
                    <TouchableOpacity
                        onPress={() => setCalendarVisible(true)}
                        style={{
                            backgroundColor: theme.surface,
                            borderWidth: 1,
                            borderColor: theme.outline,
                            borderRadius: 16,
                            paddingVertical: theme.spacing.md,
                            paddingHorizontal: theme.spacing.md,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1
                        }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing.sm
                        }}>
                            <View style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.primary + '10',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons name="calendar" size={16} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Medium',
                                    fontSize: 14,
                                    color: theme.textPrimary,
                                    marginBottom: 2
                                }}>
                                    {formatDateRange()}
                                </Text>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Regular',
                                    fontSize: 11,
                                    color: theme.textSecondary
                                }}>
                                    날짜 범위 선택
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
                <CalendarPicker
                    isVisible={calendarVisible}
                    onClose={() => setCalendarVisible(false)}
                    onConfirm={handleDateRangeConfirm}
                    initialStartDate={selectedStartDate}
                    initialEndDate={selectedEndDate}
                />

                {/* Professional Filter Tabs */}
                <View style={{
                    marginBottom: theme.spacing.md,
                    paddingHorizontal: theme.spacing.xs
                }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: theme.spacing.sm,
                            gap: 8
                        }}
                    >
                        {filters.map((filter) => (
                            <AnimatedTabButton
                                key={filter.id}
                                title={filter.label}
                                count={filter.count}
                                isActive={selectedFilter === filter.id}
                                onPress={() => setSelectedFilter(filter.id)}
                                activeColor={filter.color}
                                inactiveColor={theme.textSecondary}
                                icon={filter.icon}
                                hapticFeedback={true}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Professional Summary Stats */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 20,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.lg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: theme.spacing.md
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: theme.primary + '15',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Bold',
                                    fontSize: 16,
                                    color: theme.textPrimary,
                                    marginBottom: 2
                                }}>
                                    오늘의 보호 활동
                                </Text>
                                <Text style={{
                                    fontFamily: 'GoogleSans-Regular',
                                    fontSize: 12,
                                    color: theme.textSecondary
                                }}>
                                    실시간 모니터링 결과
                                </Text>
                            </View>
                        </View>
                        <View style={{
                            alignItems: 'flex-end'
                        }}>
                            <Text style={{
                                fontFamily: 'GoogleSans-Bold',
                                fontSize: 24,
                                color: theme.primary,
                                marginBottom: 2
                            }}>
                                {recordings.filter(r => isDateInRange(new Date(r.timestamp))).length}
                            </Text>
                            <Text style={{
                                fontFamily: 'GoogleSans-Medium',
                                fontSize: 12,
                                color: theme.textSecondary
                            }}>
                                건의 활동
                            </Text>
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        gap: theme.spacing.md
                    }}>
                        <View style={{
                            flex: 1,
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 12,
                            padding: theme.spacing.sm,
                            alignItems: 'center'
                        }}>
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: theme.error + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 4
                            }}>
                                <Ionicons name="warning" size={12} color={theme.error} />
                            </View>
                            <Text style={{
                                fontFamily: 'GoogleSans-Bold',
                                fontSize: 16,
                                color: theme.textPrimary
                            }}>
                                {recordings.filter(r => r.type === 'danger' && isDateInRange(new Date(r.timestamp))).length}
                            </Text>
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 10,
                                color: theme.textSecondary
                            }}>
                                위험
                            </Text>
                        </View>

                        <View style={{
                            flex: 1,
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 12,
                            padding: theme.spacing.sm,
                            alignItems: 'center'
                        }}>
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: theme.warning + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 4
                            }}>
                                <Ionicons name="alert-circle" size={12} color={theme.warning} />
                            </View>
                            <Text style={{
                                fontFamily: 'GoogleSans-Bold',
                                fontSize: 16,
                                color: theme.textPrimary
                            }}>
                                {recordings.filter(r => r.type === 'boundary' && isDateInRange(new Date(r.timestamp))).length}
                            </Text>
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 10,
                                color: theme.textSecondary
                            }}>
                                경계
                            </Text>
                        </View>

                        <View style={{
                            flex: 1,
                            backgroundColor: theme.surfaceVariant,
                            borderRadius: 12,
                            padding: theme.spacing.sm,
                            alignItems: 'center'
                        }}>
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: theme.info + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 4
                            }}>
                                <Ionicons name="eye" size={12} color={theme.info} />
                            </View>
                            <Text style={{
                                fontFamily: 'GoogleSans-Bold',
                                fontSize: 16,
                                color: theme.textPrimary
                            }}>
                                {recordings.filter(r => r.type === 'movement' && isDateInRange(new Date(r.timestamp))).length}
                            </Text>
                            <Text style={{
                                fontFamily: 'GoogleSans-Regular',
                                fontSize: 10,
                                color: theme.textSecondary
                            }}>
                                움직임
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Recordings List */}
                <View style={{ gap: theme.spacing.sm }}>
                    {filteredRecordings.length === 0 ? (
                        <View style={{
                            alignItems: 'center',
                            paddingVertical: 48
                        }}>
                            <View style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: '#FFFFFF',
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
                        filteredRecordings.map((recording) => {
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
                                            onPress={() => handlePlayRecording(recording)}
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

            {/* Video Player Modal */}
            {
                selectedVideo && (
                    <VideoPlayer
                        videoUri={selectedVideo.videoUrl}
                        title={selectedVideo.description}
                        isVisible={videoPlayerVisible}
                        onClose={() => {
                            setVideoPlayerVisible(false);
                            setSelectedVideo(null);
                            setPlayingRecording(null); // Stop playback when closing
                        }}
                    />
                )
            }

            {/* 다운로드 진행률 모달 */}
            <DownloadProgressModal
                isVisible={isDownloading}
                progress={downloadProgress}
                fileName={downloadingFile?.description || ''}
                fileSize={downloadingFile?.size}
                onCancel={handleCancelDownload}
            />

            {/* Download Success Alert */}
            <DownloadSuccessAlert
                isVisible={downloadSuccessVisible}
                title={downloadSuccessConfig.title}
                message={downloadSuccessConfig.message}
                fileName={downloadSuccessConfig.fileName}
                fileSize={downloadSuccessConfig.fileSize}
                onConfirm={() => setDownloadSuccessVisible(false)}
            />

            {/* Recording Action Sheet */}
            <RecordingActionSheet
                visible={actionSheetVisible}
                onClose={() => setActionSheetVisible(false)}
                recording={selectedRecording ? {
                    title: selectedRecording.type,
                    description: selectedRecording.description,
                    thumbnail: selectedRecording.thumbnail,
                    duration: selectedRecording.duration,
                    size: selectedRecording.size,
                    timestamp: selectedRecording.timestamp,
                } : null}
                actions={recordingActions}
            />
        </SafeAreaView >
    );
}
