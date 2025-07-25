import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Image,
    Dimensions,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
    Pressable,
    Platform,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    FadeInDown,
    SlideInRight,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
    useDerivedValue,
    runOnJS,
    Layout
} from 'react-native-reanimated';
import {
    PinchGestureHandler,
    GestureHandlerRootView,
    State as GestureState
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../styles/ThemeProvider';
import { BatteryCard } from '../components/atoms/BatteryCard';
import { WiFiCard } from '../components/atoms/WiFiCard';
import { Card } from '../components/layout/Card';
import { Joystick } from '../components/atoms/Joystick';
import { liveStreamService, LiveStreamState } from '../services/LiveStreamService';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Performance optimized animated components
// const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// const AnimatedCard = Animated.createAnimatedComponent(Card);

// Mock data with enhanced structure
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

// Enhanced quick actions with better categorization
const quickActions = [
    {
        id: 'record',
        label: '녹화',
        icon: 'ellipse-outline',
        activeIcon: 'stop-circle',
        color: '#F44336',
        category: 'recording'
    },
    {
        id: 'gallery',
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
        id: 'audio',
        label: '음성',
        icon: 'mic-outline',
        activeIcon: 'mic',
        color: '#FF9800',
        category: 'audio'
    }
];

// 심플한 Badge 컴포넌트 생성
function StatusBadge({ color, text }: { color: string; text: string }) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginBottom: 4,
        }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 6, backgroundColor: color }} />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{text}</Text>
        </View>
    );
}

export default function LiveScreen({ navigation, onBack, moveMode, setMoveMode }: { navigation?: any; onBack?: () => void; moveMode: boolean; setMoveMode: (v: boolean) => void }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // Enhanced state management
    const [camera, setCamera] = useState(mockCamera);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const [streamState, setStreamState] = useState<LiveStreamState>(liveStreamService.getState());

    // Animated values for enhanced UX
    const zoomScale = useSharedValue(1);
    const videoOpacity = useSharedValue(1);
    const controlsScale = useSharedValue(1);
    const joystickScale = useSharedValue(0);

    // Derived values for complex animations
    const zoomLevel = useDerivedValue(() => zoomScale.value);

    // Enhanced animated styles
    const videoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: zoomScale.value }],
        opacity: videoOpacity.value,
    }));

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: controlsScale.value }],
    }));

    const joystickAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: joystickScale.value }],
        opacity: joystickScale.value,
    }));

    // Enhanced gesture handlers
    const handlePinchGesture = useCallback((event: any) => {
        const scale = Math.max(1, Math.min(3, event.nativeEvent.scale));
        zoomScale.value = withSpring(scale, { damping: 15 });
    }, [zoomScale]);

    // Live stream state subscription with cleanup
    useEffect(() => {
        // joystick 애니메이션만 moveMode prop으로 제어
        if (moveMode) {
            joystickScale.value = withSpring(1, { damping: 20 });
        } else {
            joystickScale.value = withSpring(0, { damping: 20 });
        }
        // 녹화/음성 상태는 계속 구독
        const unsubscribe = liveStreamService.subscribe((state) => {
            setStreamState(state);
        });
        return unsubscribe;
    }, [moveMode, joystickScale]);

    // Enhanced action handlers with better feedback
    const handleActionPress = useCallback((actionId: string) => {
        // Haptic feedback simulation
        controlsScale.value = withSpring(0.95, { damping: 15 }, () => {
            controlsScale.value = withSpring(1, { damping: 15 });
        });

        switch (actionId) {
            case 'record':
                liveStreamService.toggleRecording();
                break;
            case 'audio':
                liveStreamService.toggleMic();
                break;
            case 'zoomIn':
                handleZoomIn();
                break;
            case 'zoomOut':
                handleZoomOut();
                break;
            case 'gallery':
                handleCapture();
                break;
            default:
                setSelectedAction(actionId);
                setTimeout(() => setSelectedAction(null), 200);
        }
    }, [controlsScale]);

    const handleZoomIn = useCallback(() => {
        if (zoomScale.value < 3) {
            const newZoom = Math.min(3, zoomScale.value + 0.5);
            zoomScale.value = withSpring(newZoom, { damping: 15 });
        }
        // 최대 줌 도달 시 아무 동작 없음 (알림 없음)
    }, [zoomScale]);

    const handleZoomOut = useCallback(() => {
        if (zoomScale.value > 1) {
            const newZoom = Math.max(1, zoomScale.value - 0.5);
            zoomScale.value = withSpring(newZoom, { damping: 15 });
        }
        // 최소 줌 도달 시 아무 동작 없음 (알림 없음)
    }, [zoomScale]);

    const handleCapture = useCallback(() => {
        // 바로 캡쳐 애니메이션 및 완료 처리 (알림 없이)
        videoOpacity.value = withTiming(0.5, { duration: 100 }, () => {
            videoOpacity.value = withTiming(1, { duration: 100 });
        });
        // 실제 캡쳐 로직이 있다면 이곳에 추가
        // 예: saveScreenshotToGallery();
    }, [videoOpacity]);

    // Fixed Joystick handler to match the expected interface
    const handleJoystickMove = useCallback((dx: number, dy: number) => {
        const position = { x: dx, y: dy };
        setJoystickPosition(position);

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            console.log(`로봇 이동: X=${dx.toFixed(2)}, Y=${dy.toFixed(2)}`);
        }
    }, []);

    // Enhanced switch component
    const AnimatedSwitch = React.memo(({
        value,
        onValueChange
    }: {
        value: boolean;
        onValueChange: (value: boolean) => void;
    }) => {
        const switchScale = useSharedValue(1);

        const handleChange = useCallback((newValue: boolean) => {
            switchScale.value = withSpring(0.9, { damping: 15 }, () => {
                switchScale.value = withSpring(1, { damping: 15 });
            });
            onValueChange(newValue);
        }, [onValueChange, switchScale]);

        const animatedSwitchStyle = useAnimatedStyle(() => ({
            transform: [{ scale: switchScale.value }],
        }));

        return (
            <Animated.View style={animatedSwitchStyle}>
                <Switch
                    value={value}
                    onValueChange={handleChange}
                    trackColor={{ false: theme.outline, true: theme.primary }}
                    thumbColor={value ? theme.onPrimary : theme.surfaceVariant}
                />
            </Animated.View>
        );
    });

    // Enhanced action button component
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
        const buttonScale = useSharedValue(1);
        const buttonOpacity = useSharedValue(1);

        const animatedButtonStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScale.value }],
            opacity: buttonOpacity.value,
        }));

        const handlePressIn = useCallback(() => {
            buttonScale.value = withSpring(0.9, { damping: 15 });
            buttonOpacity.value = withTiming(0.8, { duration: 100 });
        }, [buttonScale, buttonOpacity]);

        const handlePressOut = useCallback(() => {
            buttonScale.value = withSpring(1, { damping: 15 });
            buttonOpacity.value = withTiming(1, { duration: 100 });
        }, [buttonScale, buttonOpacity]);

        return (
            <Animated.View
                // entering={FadeInUp.delay(delay).springify()}
                style={styles.actionButton}
            >
                <Pressable
                    style={[styles.actionCircle, animatedButtonStyle]}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => {
                        console.log('[Pressable] onPress', action.id, 'disabled:', disabled);
                        onPress();
                    }}
                    disabled={disabled}
                >
                    <Ionicons
                        name={isActive ? (action.activeIcon as any) : (action.icon as any)}
                        size={28}
                        color={isActive ? '#fff' : action.color}
                    />
                </Pressable>
                <Text style={[
                    styles.actionLabel,
                    { color: isActive ? action.color : '#888' }
                ]}>
                    {action.label}
                </Text>
            </Animated.View>
        );
    });

    // 이동모드 해제 UX 모드: 'confirm' | 'auto'
    const moveModeExitUX: 'confirm' | 'auto' = 'confirm'; // 'auto'로 바꾸면 자동 OFF+Toast

    // 페이지 이동 함수 예시 (원하는 네비게이션 버튼/탭에서 호출)
    const handleNavigateAway = useCallback((targetPage: string) => {
        if (moveMode) {
            if (moveModeExitUX === 'confirm') {
                Alert.alert(
                    '이동모드 해제',
                    '이동모드를 취소할까요?',
                    [
                        { text: '아니오', style: 'cancel' },
                        {
                            text: '예',
                            onPress: () => {
                                setMoveMode(false);
                                if (navigation) navigation.navigate(targetPage as never);
                            }
                        }
                    ]
                );
            } else if (moveModeExitUX === 'auto') {
                setMoveMode(false);
                Toast.show({
                    type: 'info',
                    text1: '이동모드가 해제되었습니다.'
                });
                if (navigation) navigation.navigate(targetPage as never);
            }
        } else {
            if (navigation) navigation.navigate(targetPage as never);
        }
    }, [moveMode, navigation, moveModeExitUX, setMoveMode]);

    const handleRecordPress = () => {
        console.log('[녹화버튼] handleRecordPress 호출됨, insets.top:', insets.top, 'streamState:', streamState, 'isRecording:', streamState?.isRecording);
        if (insets.top === 0) {
            console.log('[녹화버튼] insets.top이 0이므로 동작하지 않음');
            return;
        }
        handleActionPress('record');
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={{ flex: 1 }}>
                    {/* 비디오 컨테이너만 PinchGestureHandler + Animated.View */}
                    <PinchGestureHandler onGestureEvent={handlePinchGesture}>
                        <Animated.View style={styles.videoContainer}>
                            <Animated.Image
                                source={{ uri: camera.thumbnail }}
                                style={[styles.videoImage, videoAnimatedStyle]}
                            />
                            {/* Gradient Overlay */}
                            <LinearGradient
                                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.1)']}
                                style={styles.gradientOverlay}
                            />
                            {/* Enhanced Status Badges */}
                            <Animated.View
                                style={styles.badgeContainer}
                                entering={FadeInDown.delay(200).springify()}
                            >
                                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                                    <Text style={[styles.badgeText, { color: theme.onPrimary }]}>LIVE</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                                    <Text style={[styles.badgeText, { color: '#fff' }]}>HD {camera.settings.resolution} • {zoomLevel.value.toFixed(1)}x</Text>
                                </View>
                            </Animated.View>
                            {/* Enhanced Status Indicators */}
                            {insets.top > 0 && streamState && (streamState.isRecording || streamState.isMicOn) && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 20, // LIVE 뱃지와 동일한 y축 위치
                                        right: 20,
                                        zIndex: 3,
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    {streamState.isRecording && <StatusBadge color="#F44336" text="REC" />}
                                    {streamState.isMicOn && <StatusBadge color="#4A90E2" text="MIC" />}
                                </View>
                            )}
                        </Animated.View>
                    </PinchGestureHandler>
                    {/* 나머지 UI (컨트롤 카드 등) */}
                    <Card
                        style={styles.controlCard}
                    // entering={FadeInUp.delay(400).springify()}
                    >
                        <View style={styles.controlHeader}>
                            <View>
                                <Text style={[styles.controlTitle, { color: theme.textPrimary }]}>로봇 컨트롤</Text>
                                <Text style={[styles.controlSubtitle, { color: theme.textSecondary }]}>이동모드 {moveMode ? 'ON' : 'OFF'}</Text>
                            </View>
                            <AnimatedSwitch
                                value={moveMode}
                                onValueChange={setMoveMode}
                            />
                        </View>
                        {/* Enhanced Action Buttons */}
                        <View
                            style={styles.actionGrid}
                        // entering={FadeInUp.delay(500).springify()}
                        >
                            {quickActions.map((action, index) => {
                                let isActive = false;
                                if (action.id === 'record') isActive = streamState && streamState.isRecording;
                                else if (action.id === 'audio') isActive = streamState && streamState.isMicOn;
                                else if (action.id === 'zoomIn') isActive = zoomScale.value > 1;
                                else if (action.id === 'zoomOut') isActive = zoomScale.value > 1;
                                else isActive = selectedAction === action.id;
                                const isRecordButton = action.id === 'record';
                                return (
                                    <ActionButton
                                        key={action.id}
                                        action={action}
                                        isActive={isActive}
                                        onPress={() => {
                                            console.log('[ActionButton] onPress', action.id);
                                            if (isRecordButton) handleRecordPress();
                                            else handleActionPress(action.id);
                                        }}
                                        delay={300 + (index * 50)}
                                        disabled={isRecordButton && insets.top === 0}
                                    />
                                );
                            })}
                        </View>
                        {/* Enhanced Joystick */}
                        <Animated.View
                            style={[styles.joystickContainer, joystickAnimatedStyle]}
                        // entering={FadeInUp.delay(600).springify()}
                        >
                            <View style={styles.joystickWrapper}>
                                <Joystick
                                    size={Math.min(300, Math.round(Dimensions.get('window').width * 0.65))}
                                    onMove={handleJoystickMove}
                                />
                            </View>
                            {/* X, Y 좌표 텍스트 완전히 제거 */}
                        </Animated.View>
                    </Card>
                </View>
            </SafeAreaView>
            {/* ToastMessage 컴포넌트는 앱 루트(App.tsx 등)에 <Toast />로 한 번만 추가 필요 */}
            <Toast />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        width: '100%',
        height: Math.round(Dimensions.get('window').width * 9 / 16),
        backgroundColor: '#000',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
    },
    videoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 1,
    },
    badgeContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 3,
        gap: 8,
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    badgeText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        fontWeight: '700',
    },
    statusIndicator: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 3,
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: '#fff',
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        fontWeight: '700',
    },
    controlCard: {
        marginHorizontal: 20,
        marginTop: 0,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    controlHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    controlTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 20,
        fontWeight: '700',
    },
    controlSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 14,
        marginTop: 2,
        opacity: 0.8,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 0,
        paddingHorizontal: 16,
    },
    actionButton: {
        alignItems: 'center',
        minWidth: 56,
    },
    actionCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    actionLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    joystickContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    joystickWrapper: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    positionText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
}); 