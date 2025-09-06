import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform,
    StatusBar,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme } from '../styles/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FeedbackCircleButton from '../components/atoms/FeedbackCircleButton';
import CaptureNotification from '../components/atoms/CaptureNotification';

// 캡쳐 알림을 간단하게 사용하는 훅
const useCaptureNotification = () => {
    const [visible, setVisible] = useState(false);

    const showCaptureNotification = useCallback(() => {
        setVisible(true);
        // 3초 후 자동 숨김
        setTimeout(() => {
            setVisible(false);
        }, 3000);
    }, []);

    const hideCaptureNotification = useCallback(() => {
        setVisible(false);
    }, []);

    return {
        visible,
        showCaptureNotification,
        hideCaptureNotification
    };
};

// Mock camera data
const mockCamera = {
    id: 'tibo-001',
    name: 'Living Room Cam',
    status: 'online',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop&auto=format',
    stats: {
        batteryLevel: 87,
        wifiSignal: -45,
        temperature: 24
    },
    settings: {
        resolution: '1080p'
    }
};

// Enhanced quick actions with better categorization (LiveScreen과 동일)
const quickActions = [
    {
        id: 'record',
        label: '녹화',
        icon: 'ellipse-outline',
        activeIcon: 'stop-circle',
        color: '#FF4444', // 쨍한 빨간색
        category: 'recording'
    },
    {
        id: 'capture',
        label: '캡쳐',
        icon: 'camera-outline',
        activeIcon: 'camera',
        color: '#4CAF50',
        category: 'capture'
    },
    {
        id: 'zoomIn',
        label: '줌인',
        icon: 'add-outline',
        activeIcon: 'add-circle',
        color: '#2196F3',
        category: 'zoom'
    },
    {
        id: 'zoomOut',
        label: '줌아웃',
        icon: 'remove-outline',
        activeIcon: 'remove-circle',
        color: '#2196F3',
        category: 'zoom'
    },
    {
        id: 'voice',
        label: '음성',
        icon: 'mic-outline',
        activeIcon: 'mic',
        color: '#4A90E2', // 쨍한 파란색
        category: 'audio'
    }
];

export default function FullscreenVideoScreen({ navigation, route }: { navigation: any; route: any }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [showControls, setShowControls] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false); // 화면 준비 상태
    const [zoomLevel, setZoomLevel] = useState(1); // 줌 레벨 (1 = 기본, 2 = 2배, 3 = 3배)

    // 캡쳐 알림 훅 사용
    const { visible: captureVisible, showCaptureNotification, hideCaptureNotification } = useCaptureNotification();

    // Animated values
    const controlsOpacity = useSharedValue(1);
    const controlsScale = useSharedValue(1);
    const controlsScale2 = useSharedValue(1);
    const zoomScale = useSharedValue(1); // 줌 애니메이션 값

    // Animated styles
    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
        transform: [{ scale: controlsScale.value }],
    }));

    const controlsAnimatedStyle2 = useAnimatedStyle(() => ({
        transform: [{ scale: controlsScale2.value }],
    }));

    // 줌 애니메이션 스타일
    const videoZoomStyle = useAnimatedStyle(() => ({
        transform: [{ scale: zoomScale.value }],
    }));

    // 즉시 가로모드 설정 (컴포넌트 마운트 즉시)
    useEffect(() => {
        console.log('[전체화면] 화면 진입 - 가로모드 확인 및 강제 설정');

        // 화면 진입 시 가로모드 강제
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

        // Android StatusBar 숨김
        if (Platform.OS === 'android') {
            StatusBar.setHidden(true);
        }

        // 바로 화면 준비
        setIsReady(true);

        return () => {
            console.log('[전체화면] 화면 나가기 - 세로모드 복구');
            // 화면 나가기 시 세로모드 복구
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            if (Platform.OS === 'android') {
                StatusBar.setHidden(false);
            }
        };
    }, []);

    // 화면 포커스/블러 시 Orientation 처리
    useFocusEffect(
        useCallback(() => {
            console.log('[전체화면] 화면 포커스 - 가로모드 강제 설정');
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

            return () => {
                console.log('[전체화면] 화면 블러 - 세로모드 복구');
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            };
        }, [])
    );

    // Auto-hide controls (화면 준비 후에만)
    useEffect(() => {
        if (!isReady) return;

        const timer = setTimeout(() => {
            if (showControls) {
                controlsOpacity.value = withTiming(0, { duration: 300 });
                controlsScale.value = withSpring(0.8);
                setShowControls(false);
            }
        }, 5000); // 3초에서 5초로 변경

        return () => clearTimeout(timer);
    }, [showControls, controlsOpacity, controlsScale, isReady]);

    // Toggle controls visibility
    const handleScreenPress = useCallback(() => {
        if (!isReady) return;

        if (showControls) {
            controlsOpacity.value = withTiming(0, { duration: 300 });
            controlsScale.value = withSpring(0.8);
            setShowControls(false);
        } else {
            controlsOpacity.value = withTiming(1, { duration: 300 });
            controlsScale.value = withSpring(1);
            setShowControls(true);
        }
    }, [showControls, controlsOpacity, controlsScale, isReady]);

    // Action handlers (LiveScreen과 동일한 로직)
    const handleActionPress = useCallback((actionId: string) => {
        // Haptic feedback simulation
        controlsScale2.value = withSpring(0.95, { damping: 15 }, () => {
            controlsScale2.value = withSpring(1, { damping: 15 });
        });

        switch (actionId) {
            case 'record':
                console.log('[전체화면] 녹화 버튼 터치');
                setIsRecording(prev => !prev);
                break;
            case 'voice':
                console.log('[전체화면] 마이크 버튼 터치');
                setIsMicOn(prev => !prev);
                break;
            case 'zoomIn':
                console.log('[전체화면] 줌인 버튼 터치');
                handleZoomIn();
                // 줌인 버튼을 눌렀다가 바로 꺼지는 효과
                setSelectedAction(actionId);
                setTimeout(() => setSelectedAction(null), 150);
                break;
            case 'zoomOut':
                console.log('[전체화면] 줌아웃 버튼 터치');
                handleZoomOut();
                // 줌아웃 버튼을 눌렀다가 바로 꺼지는 효과
                setSelectedAction(actionId);
                setTimeout(() => setSelectedAction(null), 150);
                break;
            case 'capture':
                console.log('[전체화면] 캡처 버튼 터치');
                handleCapture();
                break;
            default:
                setSelectedAction(actionId);
                setTimeout(() => setSelectedAction(null), 200);
        }
    }, [controlsScale2]);

    // 줌인 함수
    const handleZoomIn = useCallback(() => {
        if (zoomLevel < 3) {
            const newZoom = Math.min(3, zoomLevel + 0.5);
            setZoomLevel(newZoom);
            zoomScale.value = withSpring(newZoom, { damping: 15 });
            console.log(`[전체화면] 줌인: ${newZoom}x`);
        }
    }, [zoomLevel, zoomScale]);

    // 줌아웃 함수
    const handleZoomOut = useCallback(() => {
        if (zoomLevel > 1) {
            const newZoom = Math.max(1, zoomLevel - 0.5);
            setZoomLevel(newZoom);
            zoomScale.value = withSpring(newZoom, { damping: 15 });
            console.log(`[전체화면] 줌아웃: ${newZoom}x`);
        }
    }, [zoomLevel, zoomScale]);

    // 캡쳐 함수
    const handleCapture = useCallback(() => {
        console.log('[전체화면] 캡쳐 실행');

        // 캡쳐 알림 표시 (훅에서 자동으로 3초 후 숨김)
        showCaptureNotification();

        // 실제 캡쳐 로직이 있다면 이곳에 추가
        // 예: saveScreenshotToGallery();
    }, [showCaptureNotification]);

    // Action handlers
    const handleBackPress = useCallback(() => {
        console.log('[전체화면] 뒤로가기 버튼 터치');
        navigation.goBack();
    }, [navigation]);

    // Enhanced action button component using FeedbackCircleButton (LiveScreen과 동일)
    const ActionButton = React.memo(({
        action,
        isActive,
        onPress,
        delay = 0,
        disabled
    }: {
        action: typeof quickActions[0];
        isActive: boolean;
        onPress: () => void;
        delay?: number;
        disabled: boolean;
    }) => {
        return (
            <Animated.View
                style={styles.actionButton}
            >
                <FeedbackCircleButton
                    icon={action.id}
                    label={action.label}
                    onPress={onPress}
                    activeColor={action.color}
                    size={60}
                    hapticFeedback={true}
                    scaleAnimation={true}
                    rippleEffect={true}
                    disabled={disabled}
                    isActive={isActive}
                />
            </Animated.View>
        );
    });

    // 화면이 준비되지 않았으면 가로모드 로딩 화면 표시
    if (!isReady) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>전체화면 모드 준비 중...</Text>
                    <Text style={styles.loadingSubText}>가로모드로 자동 전환 중</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Video Container */}
            <TouchableOpacity
                style={styles.videoContainer}
                onPress={handleScreenPress}
                activeOpacity={1}
            >
                <Animated.Image
                    source={require('../assets/baby.jpeg')}
                    style={[styles.videoImage, videoZoomStyle]}
                    resizeMode="cover"
                />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.1)']}
                    style={styles.gradientOverlay}
                />

                {/* Controls Overlay */}
                <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
                    {/* Top Controls */}
                    <View style={styles.topControls}>
                        <View style={styles.statusBadges}>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <Text style={[styles.badgeText, { color: '#fff' }]}>LIVE</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                                <Text style={[styles.badgeText, { color: '#fff' }]}>HD {mockCamera.settings.resolution}</Text>
                            </View>
                            {zoomLevel > 1 && (
                                <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                                    <Text style={[styles.badgeText, { color: '#fff' }]}>{zoomLevel.toFixed(1)}x</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Status Indicators */}
                    {(isRecording || isMicOn) && (
                        <View style={styles.statusIndicators}>
                            {isRecording && (
                                <View style={styles.statusIndicator}>
                                    <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                                    <Text style={styles.statusText}>REC</Text>
                                </View>
                            )}
                            {isMicOn && (
                                <View style={styles.statusIndicator}>
                                    <View style={[styles.statusDot, { backgroundColor: '#4A90E2' }]} />
                                    <Text style={styles.statusText}>MIC</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Bottom Controls - LiveScreen과 동일한 5개 버튼 */}
                    <Animated.View style={[styles.bottomControls, controlsAnimatedStyle2]}>
                        {quickActions.map((action, index) => {
                            let isActive = false;
                            if (action.id === 'record') isActive = isRecording;
                            else if (action.id === 'voice') isActive = isMicOn;
                            else if (action.id === 'zoomIn') isActive = false; // 줌인 버튼은 불이 들어오지 않도록 수정
                            else if (action.id === 'zoomOut') isActive = false; // 줌아웃 버튼은 불이 들어오지 않도록 수정
                            else isActive = selectedAction === action.id;

                            return (
                                <ActionButton
                                    key={action.id}
                                    action={action}
                                    isActive={isActive}
                                    onPress={() => {
                                        console.log('[전체화면 ActionButton] onPress', action.id);
                                        handleActionPress(action.id);
                                    }}
                                    delay={300 + (index * 50)}
                                    disabled={false}
                                />
                            );
                        })}
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
            <CaptureNotification
                visible={captureVisible}
                onHide={hideCaptureNotification}
                type="capture"
                title="캡쳐 완료"
                subtitle="갤러리에 저장됨"
                compact={true}
                topOffset={20}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
    },
    videoImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 20,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 20,
    },
    statusBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    badgeText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        fontWeight: '600',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    statusIndicators: {
        position: 'absolute',
        top: 80,
        right: 20,
        gap: 6,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        color: '#fff',
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10,
        fontWeight: '600',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    actionButton: {
        alignItems: 'center',
        minWidth: 56,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    loadingSubText: {
        color: '#ccc',
        fontSize: 14,
        opacity: 0.8,
    },
}); 