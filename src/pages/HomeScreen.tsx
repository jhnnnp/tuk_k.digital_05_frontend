import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Pressable,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    FadeInDown,
    SlideInRight,
    SlideInLeft,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
    useDerivedValue,
    runOnJS,
    Layout,
    FadeIn,
    useAnimatedGestureHandler
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useTheme } from '../styles/ThemeProvider';
import { BatteryCard } from '../components/atoms/BatteryCard';
import { WiFiCard } from '../components/atoms/WiFiCard';
import { liveStreamService, LiveStreamState } from '../services/LiveStreamService';
import CaptureNotification from '../components/atoms/CaptureNotification';
import * as ScreenOrientation from 'expo-screen-orientation';

// Performance optimized animated components
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.View;

interface RobotCamera {
    id: string;
    name: string;
    location: string;
    isOnline: boolean;
    isMoving: boolean;
    batteryLevel: number;
    wifiRSSI: number;
    temperature: number;
    currentPosition: { x: number; y: number };
    lastSnapshot: string;
    firmware: string;
    isCharging: boolean;
}

// Event types
interface Event {
    id: string;
    type: 'motion' | 'recording' | 'patrol' | 'security' | 'system';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    iconColor: string;
    statusColor: string;
}

// Mock events data
const mockEvents: Event[] = [
    {
        id: '1',
        type: 'motion',
        title: '모션 감지됨',
        description: '거실에서 움직임이 감지되었습니다',
        timestamp: '2분 전',
        icon: 'eye-outline',
        iconColor: '#FF9800',
        statusColor: '#FF9800'
    },
    {
        id: '2',
        type: 'recording',
        title: '녹화 시작',
        description: '자동 녹화가 시작되었습니다',
        timestamp: '5분 전',
        icon: 'videocam-outline',
        iconColor: '#F44336',
        statusColor: '#F44336'
    },
    {
        id: '3',
        type: 'patrol',
        title: '순찰 완료',
        description: '정기 순찰이 완료되었습니다',
        timestamp: '12분 전',
        icon: 'checkmark-circle-outline',
        iconColor: '#4CAF50',
        statusColor: '#4CAF50'
    },
    {
        id: '4',
        type: 'security',
        title: '보안 모드 활성화',
        description: '외출 모드로 전환되었습니다',
        timestamp: '15분 전',
        icon: 'shield-outline',
        iconColor: '#2196F3',
        statusColor: '#FF9800'
    },
    {
        id: '5',
        type: 'system',
        title: '시스템 업데이트',
        description: '펌웨어가 성공적으로 업데이트되었습니다',
        timestamp: '18분 전',
        icon: 'refresh-outline',
        iconColor: '#9C27B0',
        statusColor: '#9C27B0'
    },
    {
        id: '6',
        type: 'motion',
        title: '모션 감지됨',
        description: '주방에서 움직임이 감지되었습니다',
        timestamp: '25분 전',
        icon: 'eye-outline',
        iconColor: '#FF9800',
        statusColor: '#FF9800'
    },
    {
        id: '7',
        type: 'recording',
        title: '녹화 중지',
        description: '자동 녹화가 중지되었습니다',
        timestamp: '32분 전',
        icon: 'stop-circle-outline',
        iconColor: '#F44336',
        statusColor: '#F44336'
    },
    {
        id: '8',
        type: 'patrol',
        title: '순찰 시작',
        description: '자동 순찰이 시작되었습니다',
        timestamp: '45분 전',
        icon: 'play-circle-outline',
        iconColor: '#4CAF50',
        statusColor: '#4CAF50'
    },
    {
        id: '9',
        type: 'security',
        title: '보안 모드 비활성화',
        description: '재실 모드로 전환되었습니다',
        timestamp: '1시간 전',
        icon: 'shield-checkmark-outline',
        iconColor: '#2196F3',
        statusColor: '#4CAF50'
    },
    {
        id: '10',
        type: 'system',
        title: '배터리 충전 완료',
        description: '배터리 충전이 완료되었습니다',
        timestamp: '1시간 15분 전',
        icon: 'battery-charging-outline',
        iconColor: '#4CAF50',
        statusColor: '#4CAF50'
    }
];

export default function HomeScreen({ onNavigateToEvents }: { onNavigateToEvents?: () => void }) {
    const { theme } = useTheme();

    // 화면 크기에 따른 동적 패딩 계산
    const { width: screenWidth } = Dimensions.get('window');
    const isLargeScreen = screenWidth >= 1920;
    const horizontalPadding = isLargeScreen ? 32 : 16;

    // Enhanced state management
    const [streamState, setStreamState] = useState<LiveStreamState>(liveStreamService.getState());
    const [isPatrolling, setIsPatrolling] = useState(false);
    const [isMovingToHome, setIsMovingToHome] = useState(false);
    const [events, setEvents] = useState<Event[]>(mockEvents);

    // Animated values for enhanced UX
    const headerScale = useSharedValue(1);
    const cardScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);
    const statusOpacity = useSharedValue(1);

    const [robot, setRobot] = useState<RobotCamera>({
        id: 'tibo-001',
        name: 'TIBO ON AIR',
        location: '거실',
        isOnline: true,
        isMoving: false,
        batteryLevel: 87,
        wifiRSSI: -45,
        temperature: 24,
        currentPosition: { x: 120, y: 85 },
        lastSnapshot: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&auto=format',
        firmware: '2.1.3',
        isCharging: false
    });

    // Memoized styles for performance
    const themedStyles = useMemo(() => ({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: isLargeScreen ? 16 : 0,
        },
        scrollContent: {
            paddingHorizontal: horizontalPadding,
            paddingTop: 8,
            paddingBottom: 100,
            maxWidth: isLargeScreen ? 1400 : undefined,
            alignSelf: isLargeScreen ? 'center' : 'stretch',
        },
        headerContainer: {
            marginBottom: 24,
        },
        headerCard: {
            backgroundColor: theme.surface,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.outline + '15',
            overflow: 'hidden',
            position: 'relative',
        },
        headerGradient: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 10,
        },
        headerHighlight: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            borderRadius: 10,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        logoContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 100,
            width: 120,
            marginRight: -10,
            marginTop: 15,
        },
        logoImage: {
            width: 189,
            height: 141.75,
            opacity: 0.9,
        },
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
        },
        brandContainer: {
            flex: 1,
        },
        brandRow: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 12,
            marginBottom: 4,
        },
        brandText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 24,
            color: theme.primary,
            fontWeight: '700',
        },
        statusBadge: {
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
        },
        statusText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
        },
        subtitle: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 14,
            color: theme.textSecondary,
            opacity: 0.8,
        },
        teamText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 12,
            color: theme.primary,
            fontWeight: '700',
            marginBottom: 4,
            letterSpacing: 1,
            textTransform: 'uppercase',
        },

        mainCard: {
            backgroundColor: theme.surface,
            borderRadius: 24,
            padding: isLargeScreen ? 24 : 16,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
            borderWidth: 1,
            borderColor: theme.outline + '15',
        },
        robotHeader: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        robotInfo: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 12,
        },
        statusDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 2,
        },
        robotName: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 18,
            color: theme.textPrimary,
            fontWeight: '700',
            marginVertical: 2,
            letterSpacing: 1.2,
        },
        robotNameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        onAirBadge: {
            backgroundColor: theme.error,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            shadowColor: theme.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        onAirText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 10,
            color: '#fff',
            fontWeight: '700',
            letterSpacing: 0.8,
        },
        locationRow: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
        },
        locationText: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 13,
            color: theme.textSecondary,
        },
        movingBadge: {
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 3,
            marginTop: 4,
        },
        movingText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 10,
            fontWeight: '700',
        },
        cameraButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        videoContainer: {
            aspectRatio: 16 / 9,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 16,
            backgroundColor: theme.surfaceVariant,
            position: 'relative' as const,
            alignSelf: 'center' as const,
            width: isLargeScreen ? '96%' : '96%',
        },
        videoImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover' as const,
            alignSelf: 'center' as const,
        },
        gradientOverlay: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            zIndex: 1,
        },
        liveBadge: {
            position: 'absolute' as const,
            top: 12,
            left: 12,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            zIndex: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        liveRow: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 6,
        },
        liveDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            opacity: 0.9,
        },
        liveText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 12,
            fontWeight: '700',
        },
        indicatorBadge: {
            position: 'absolute' as const,
            right: 12,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            zIndex: 2,
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        statusGrid: {
            flexDirection: 'row' as const,
            gap: 12,
        },
        statsRow: {
            flexDirection: 'row' as const,
            gap: 12,
            marginBottom: 24,
        },
        statCard: {
            flex: 1,
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center' as const,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: theme.outline + '10',
        },
        statIcon: {
            marginBottom: 8,
        },
        statLabel: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 11,
            color: theme.textSecondary,
            marginBottom: 4,
            textAlign: 'center' as const,
        },
        statValue: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 13,
            color: theme.textPrimary,
            fontWeight: '700',
        },
        sectionTitle: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 18,
            color: theme.textPrimary,
            marginBottom: 16,
            fontWeight: '700',
        },
        actionsContainer: {
            gap: 12,
        },
        actionRow: {
            flexDirection: 'row' as const,
            gap: 12,
        },
        actionButton: {
            flex: 1,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        },
        actionButtonFull: {
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
        },
        actionText: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 14,
            fontWeight: '700',
        },
        // Event section styles
        eventsSection: {
            marginTop: 24,
        },
        eventsHeader: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        eventsTitle: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 18,
            color: theme.textPrimary,
            fontWeight: '700',
        },
        devButtonsContainer: {
            flexDirection: 'row' as const,
            gap: 8,
        },
        devButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            flexDirection: 'row' as const,
            alignItems: 'center',
            gap: 4,
        },
        devButtonText: {
            fontFamily: 'GoogleSans-Medium',
            fontSize: 11,
            fontWeight: '600',
        },

        eventsContainer: {
            gap: 12,
        },
        eventCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.outline + '08',
        },
        eventIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        eventContent: {
            flex: 1,
        },
        eventTitle: {
            fontFamily: 'GoogleSans-Bold',
            fontSize: 14,
            color: theme.textPrimary,
            fontWeight: '700',
            marginBottom: 2,
        },
        eventDescription: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: 4,
        },
        eventTimestamp: {
            fontFamily: 'GoogleSans-Regular',
            fontSize: 11,
            color: theme.textSecondary,
            opacity: 0.8,
        },
        eventStatusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },

    }), [theme]);

    // Enhanced animated styles
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: headerScale.value }],
    }));

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const statusAnimatedStyle = useAnimatedStyle(() => ({
        opacity: statusOpacity.value,
    }));

    // Live stream state subscription
    useEffect(() => {
        const unsubscribe = liveStreamService.subscribe((state) => {
            setStreamState(state);

            // Animate status indicators
            statusOpacity.value = withTiming(0.8, { duration: 100 }, () => {
                statusOpacity.value = withTiming(1, { duration: 100 });
            });
        });

        return unsubscribe;
    }, [statusOpacity]);

    // 화면 진입 시 세로모드로 고정
    useEffect(() => {
        const lockToPortrait = async () => {
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                console.log('Screen orientation locked to PORTRAIT_UP');
            } catch (error) {
                console.error('Failed to lock screen orientation:', error);
            }
        };

        lockToPortrait();
    }, []);

    // Enhanced action handlers
    const handleStartLiveStream = useCallback(async () => {
        cardScale.value = withSpring(0.98, { damping: 15 }, () => {
            cardScale.value = withSpring(1, { damping: 15 });
        });

        try {
            await liveStreamService.startStream(robot.id);
        } catch (error) {
            console.error('Failed to start live stream:', error);
            Alert.alert('오류', '라이브 스트림을 시작할 수 없습니다.');
        }
    }, [robot.id, cardScale]);

    const handlePatrolToggle = useCallback(async () => {
        buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
            buttonScale.value = withSpring(1, { damping: 15 });
        });

        if (isPatrolling) {
            Alert.alert(
                '순찰 중지',
                '순찰을 중지하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '중지',
                        style: 'destructive',
                        onPress: async () => {
                            setIsPatrolling(false);
                            setRobot(prev => ({ ...prev, isMoving: false }));
                            Alert.alert('순찰 중지됨', '로봇이 순찰을 중지했습니다.');
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                '순찰 시작',
                '자동 순찰을 시작하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '시작',
                        onPress: async () => {
                            setIsPatrolling(true);
                            setRobot(prev => ({ ...prev, isMoving: true }));
                            Alert.alert('순찰 시작됨', '로봇이 자동 순찰을 시작했습니다.');
                        }
                    }
                ]
            );
        }
    }, [isPatrolling, buttonScale]);

    const handleMoveToHome = useCallback(async () => {
        if (isMovingToHome) {
            Alert.alert('이동 중', '로봇이 홈 포지션으로 이동 중입니다.');
            return;
        }

        Alert.alert(
            '홈 포지션 이동',
            '로봇을 홈 포지션으로 이동시키시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '이동',
                    onPress: async () => {
                        setIsMovingToHome(true);
                        setRobot(prev => ({ ...prev, isMoving: true }));

                        setTimeout(() => {
                            setIsMovingToHome(false);
                            setRobot(prev => ({
                                ...prev,
                                isMoving: false,
                                currentPosition: { x: 0, y: 0 }
                            }));
                            Alert.alert('이동 완료', '로봇이 홈 포지션에 도착했습니다.');
                        }, 3000);
                    }
                }
            ]
        );
    }, [isMovingToHome]);





    const [showCaptureNotification, setShowCaptureNotification] = useState(false);

    // 개발자 모드 이벤트 관리 핸들러
    const handleAddMockEvent = useCallback(() => {
        const newEvent: Event = {
            id: `mock-${Date.now()}`,
            type: 'system',
            title: '새 이벤트 추가됨',
            description: `개발자 모드로 추가된 이벤트 (${new Date().toLocaleTimeString()})`,
            timestamp: '방금 전',
            icon: 'add-circle-outline',
            iconColor: '#9C27B0',
            statusColor: '#9C27B0'
        };
        setEvents(prev => [newEvent, ...prev]);
    }, []);

    const handleRemoveMockEvent = useCallback(() => {
        if (events.length > 0) {
            setEvents(prev => prev.slice(1)); // 첫 번째 이벤트 제거
        }
    }, [events.length]);

    // 슬라이드 제거 핸들러
    const handleRemoveEvent = useCallback((eventId: string) => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    }, []);

    const handleCameraPress = useCallback(() => {
        // 카메라 버튼 애니메이션
        buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
            buttonScale.value = withSpring(1, { damping: 15 });
        });

        // 캡쳐 완료 알림 표시
        setShowCaptureNotification(true);
    }, [buttonScale]);

    // Enhanced utility functions
    const getBatteryStatus = useCallback((level: number, isCharging: boolean) => {
        if (isCharging) return { color: theme.primary, bg: theme.primary, label: '충전 중' };
        if (level > 60) return { color: theme.primary, bg: theme.primary, label: '높음' };
        if (level > 30) return { color: theme.warning, bg: theme.warning, label: '보통' };
        return { color: theme.error, bg: theme.error, label: '낮음' };
    }, [theme]);

    const getWifiStatus = useCallback((rssi: number) => {
        if (rssi > -30) return { class: theme.wifi?.excellent || theme.primary, label: '탁월', bars: 4 };
        if (rssi > -50) return { class: theme.wifi?.good || theme.primary, label: '좋음', bars: 3 };
        if (rssi > -70) return { class: theme.wifi?.fair || theme.warning, label: '보통', bars: 2 };
        return { class: theme.wifi?.poor || theme.error, label: '약함', bars: 1 };
    }, [theme]);

    const batteryStatus = getBatteryStatus(robot.batteryLevel, robot.isCharging);
    const wifiStatus = getWifiStatus(robot.wifiRSSI);

    // Enhanced stat card component
    const StatCard = React.memo(({
        icon,
        iconColor,
        label,
        value,
        delay = 0
    }: {
        icon: string;
        iconColor: string;
        label: string;
        value: string;
        delay?: number;
    }) => (
        <View style={themedStyles.statCard}>
            <Ionicons
                name={icon as any}
                size={22}
                color={iconColor}
                style={themedStyles.statIcon}
            />
            <Text style={themedStyles.statLabel}>{label}</Text>
            <Text style={themedStyles.statValue}>{value}</Text>
        </View>
    ));

    // Swipeable Event card component
    const SwipeableEventCard = React.memo(({ event }: { event: Event }) => {
        const translateX = useSharedValue(0);
        const scale = useSharedValue(1);
        const opacity = useSharedValue(1);
        const { theme } = useTheme();
        const eventId = event.id; // 클로저에서 사용할 ID

        const panGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
            onStart: () => { },
            onActive: (event) => {
                if (event.translationX < 0) {
                    translateX.value = event.translationX;
                    // 스와이프 거리에 따라 스케일과 투명도 조정
                    const progress = Math.abs(event.translationX) / 100;
                    scale.value = withSpring(1 - progress * 0.05, { damping: 15 });
                    opacity.value = withSpring(1 - progress * 0.1, { damping: 15 });
                }
            },
            onEnd: (event) => {
                if (event.translationX < -80) {
                    // 삭제 임계값 도달 - 부드러운 삭제 애니메이션
                    translateX.value = withTiming(-200, {
                        duration: 300,
                        easing: (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic
                    });
                    scale.value = withTiming(0.8, { duration: 300 });
                    opacity.value = withTiming(0, { duration: 300 }, () => {
                        runOnJS(handleRemoveEvent)(eventId);
                    });
                } else {
                    // 원위치로 복귀 - 스프링 애니메이션
                    translateX.value = withSpring(0, {
                        damping: 15,
                        stiffness: 150,
                        mass: 0.8
                    });
                    scale.value = withSpring(1, { damping: 15 });
                    opacity.value = withSpring(1, { damping: 15 });
                }
            },
        });

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { scale: scale.value }
            ],
            opacity: opacity.value,
        }));



        return (
            <PanGestureHandler onGestureEvent={panGestureEvent}>
                <Animated.View style={[themedStyles.eventCard, animatedStyle]}>
                    <View style={[
                        themedStyles.eventIconContainer,
                        { backgroundColor: event.iconColor + '20' }
                    ]}>
                        <Ionicons
                            name={event.icon as any}
                            size={20}
                            color={event.iconColor}
                        />
                    </View>
                    <View style={themedStyles.eventContent}>
                        <Text style={themedStyles.eventTitle}>{event.title}</Text>
                        <Text style={themedStyles.eventDescription}>{event.description}</Text>
                        <Text style={themedStyles.eventTimestamp}>{event.timestamp}</Text>
                    </View>
                    <View style={[
                        themedStyles.eventStatusDot,
                        { backgroundColor: event.statusColor }
                    ]} />
                </Animated.View>
            </PanGestureHandler>
        );
    });

    return (
        <SafeAreaView style={themedStyles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.background}
            />

            <ScrollView
                contentContainerStyle={themedStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                contentInsetAdjustmentBehavior="automatic"
                showsHorizontalScrollIndicator={false}
                style={isLargeScreen ? { alignSelf: 'center', maxWidth: 1400 } : undefined}
            >
                {/* 헤더: FadeIn만 적용 */}
                <Animated.View entering={FadeIn.duration(300)} style={themedStyles.headerContainer}>
                    <View style={themedStyles.headerCard}>
                        {/* 그라데이션 배경 오버레이 */}
                        <LinearGradient
                            colors={[theme.primary + '06', 'transparent', theme.primary + '02']}
                            style={themedStyles.headerGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />

                        {/* 미묘한 하이라이트 효과 */}
                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'transparent']}
                            style={themedStyles.headerHighlight}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />

                        <View style={themedStyles.headerContent}>
                            <View style={themedStyles.brandContainer}>
                                <View style={themedStyles.brandRow}>
                                    <Text style={themedStyles.brandText}>TIBO</Text>
                                    <View style={[
                                        themedStyles.statusBadge,
                                        {
                                            backgroundColor: robot.isOnline ? theme.success + '15' : theme.error + '15',
                                            borderColor: robot.isOnline ? theme.success : theme.error,
                                            borderWidth: 1
                                        }
                                    ]}>
                                        <View style={[
                                            themedStyles.statusDot,
                                            { backgroundColor: robot.isOnline ? theme.success : theme.error }
                                        ]} />
                                        <Text style={[
                                            themedStyles.statusText,
                                            { color: robot.isOnline ? theme.success : theme.error }
                                        ]}>
                                            {robot.isOnline ? 'ONLINE' : 'OFFLINE'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={themedStyles.teamText}>
                                    KDT PROJECT TEAM 5
                                </Text>
                                <Text style={themedStyles.subtitle}>
                                    스마트 홈 로봇 카메라 시스템
                                </Text>
                            </View>

                            {/* 한국공학대학교 로고 */}
                            <View style={themedStyles.logoContainer}>
                                <Image
                                    source={require('../assets/tukorea logo.png')}
                                    style={themedStyles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* 메인 카드: FadeIn만 적용 */}
                <Animated.View entering={FadeIn.duration(300)} style={themedStyles.mainCard}>
                    {/* Robot Header */}
                    <View style={themedStyles.robotHeader}>
                        <View style={themedStyles.robotInfo}>
                            <View style={[
                                themedStyles.statusDot,
                                {
                                    backgroundColor: robot.isOnline
                                        ? robot.isMoving
                                            ? theme.info
                                            : theme.online
                                        : theme.offline
                                }
                            ]} />
                            <View>
                                <View style={themedStyles.robotNameContainer}>
                                    <Text style={themedStyles.robotName}>
                                        TIBO
                                    </Text>
                                    <View style={themedStyles.onAirBadge}>
                                        <Text style={themedStyles.onAirText}>
                                            ON AIR
                                        </Text>
                                    </View>
                                </View>
                                {robot.isMoving && (
                                    <View style={[
                                        themedStyles.movingBadge,
                                        { backgroundColor: theme.info + '20' }
                                    ]}>
                                        <Text style={[
                                            themedStyles.movingText,
                                            { color: theme.info }
                                        ]}>
                                            이동 중
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                themedStyles.cameraButton,
                                { backgroundColor: theme.primary + '15' }
                            ]}
                            onPress={handleCameraPress}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={18}
                                color={theme.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Enhanced Video Feed */}
                    <View style={themedStyles.videoContainer}>
                        <Image
                            source={{ uri: robot.lastSnapshot }}
                            style={themedStyles.videoImage}
                        />

                        {/* Gradient Overlay */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'transparent']}
                            style={themedStyles.gradientOverlay}
                        />



                        {/* Enhanced Recording Indicator */}
                        {streamState.isRecording && (
                            <View
                                style={[
                                    themedStyles.indicatorBadge,
                                    {
                                        backgroundColor: 'rgba(244, 67, 54, 0.9)',
                                        top: 12
                                    }
                                ]}
                            >
                                <View style={[
                                    themedStyles.liveDot,
                                    { backgroundColor: '#fff' }
                                ]} />
                                <Text style={[
                                    themedStyles.liveText,
                                    { color: '#fff' }
                                ]}>
                                    REC
                                </Text>
                            </View>
                        )}

                        {/* Enhanced Mic Indicator */}
                        {streamState.isMicOn && (
                            <View
                                style={[
                                    themedStyles.indicatorBadge,
                                    {
                                        backgroundColor: 'rgba(74, 144, 226, 0.9)',
                                        top: streamState.isRecording ? 52 : 12
                                    }
                                ]}
                            >
                                <View style={[
                                    themedStyles.liveDot,
                                    { backgroundColor: '#fff' }
                                ]} />
                                <Text style={[
                                    themedStyles.liveText,
                                    { color: '#fff' }
                                ]}>
                                    MIC
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Enhanced Status Grid */}
                    <View style={themedStyles.statusGrid}>
                        <BatteryCard percent={robot.batteryLevel} isCharging={robot.isCharging} />
                        <WiFiCard dBm={robot.wifiRSSI} />
                    </View>
                </Animated.View>

                {/* Enhanced Quick Stats */}
                <View style={themedStyles.statsRow}>
                    {/* Removed '보안 모드' stat card */}
                </View>

                {/* 최근 이벤트 섹션 */}
                <Animated.View entering={FadeIn.duration(300)} style={[themedStyles.eventsSection, { marginTop: 0 }]}>
                    <View style={themedStyles.eventsHeader}>
                        <Text style={themedStyles.eventsTitle}>최근 이벤트</Text>
                        <View style={themedStyles.devButtonsContainer}>
                            <TouchableOpacity
                                style={[
                                    themedStyles.devButton,
                                    { backgroundColor: theme.success + '20' }
                                ]}
                                onPress={handleAddMockEvent}
                            >
                                <Ionicons name="add" size={12} color={theme.success} />
                                <Text style={[
                                    themedStyles.devButtonText,
                                    { color: theme.success }
                                ]}>
                                    Mock 추가
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    themedStyles.devButton,
                                    { backgroundColor: theme.error + '20' }
                                ]}
                                onPress={handleRemoveMockEvent}
                            >
                                <Ionicons name="remove" size={12} color={theme.error} />
                                <Text style={[
                                    themedStyles.devButtonText,
                                    { color: theme.error }
                                ]}>
                                    Mock 제거
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={themedStyles.eventsContainer}>
                        {events.map((event, index) => (
                            <SwipeableEventCard key={event.id} event={event} />
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* 캡쳐 완료 알림 */}
            <CaptureNotification
                visible={showCaptureNotification}
                onHide={() => setShowCaptureNotification(false)}
                type="capture"
            />
        </SafeAreaView>
    );
}
