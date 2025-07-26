import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemeProvider';
import HomeScreen from '../pages/HomeScreen';
import LiveScreen from '../pages/LiveScreen';
import RecordingsScreen from '../pages/RecordingsScreen';
import SettingsScreen from '../pages/SettingsScreen';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../pages/LoginScreen';
import SignupScreen from '../pages/SignupScreen';

export default function AppNavigator() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'home' | 'live' | 'recordings' | 'settings' | 'login'>('login');
    const [moveMode, setMoveMode] = useState(false); // 이동모드 상태 리프팅
    const [showLiveView, setShowLiveView] = useState(false);
    const [showSignup, setShowSignup] = useState(false); // 회원가입 화면 상태
    const [loading, setLoading] = useState(true); // 초기 로딩 상태

    // 화면 전환 애니메이션 값들
    const slideAnim = useSharedValue(0);
    const fadeAnim = useSharedValue(1);
    const scaleAnim = useSharedValue(1);

    useEffect(() => {
        const checkToken = async () => {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setActiveTab('home');
            } else {
                setActiveTab('login');
            }
            setLoading(false);
        };
        checkToken();
    }, []);

    // 이동모드 해제 UX 모드: 'confirm' | 'auto'
    const moveModeExitUX: 'confirm' | 'auto' = 'confirm'; // 'auto'로 바꾸면 자동 OFF+Toast

    // 이동모드 해제 및 탭 이동 처리
    const handleNavigateAway = (targetTab: string) => {
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
                                setActiveTab(targetTab as 'home' | 'live' | 'recordings' | 'settings');
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
                setActiveTab(targetTab as 'home' | 'live' | 'recordings' | 'settings');
            }
        } else {
            setActiveTab(targetTab as 'home' | 'live' | 'recordings' | 'settings');
        }
    };

    // 애니메이션 스타일
    const slideAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideAnim.value }],
        opacity: fadeAnim.value,
    }));

    const scaleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    // 화면 전환 애니메이션 함수
    const animateScreenTransition = (direction: 'in' | 'out', callback: () => void) => {
        const slideDistance = direction === 'in' ? 300 : -300;

        if (direction === 'out') {
            // 현재 화면을 밖으로 슬라이드
            slideAnim.value = withTiming(slideDistance, { duration: 300 });
            fadeAnim.value = withTiming(0, { duration: 200 });

            setTimeout(() => {
                callback();
                // 새 화면을 반대 방향에서 시작
                slideAnim.value = -slideDistance;
                fadeAnim.value = 0;

                // 새 화면을 중앙으로 슬라이드
                slideAnim.value = withTiming(0, { duration: 300 });
                fadeAnim.value = withTiming(1, { duration: 200 });
            }, 200);
        } else {
            // 새 화면을 중앙으로 슬라이드
            slideAnim.value = withTiming(0, { duration: 300 });
            fadeAnim.value = withTiming(1, { duration: 200 });
            callback();
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        setActiveTab('login');
    };

    const tabs = [
        { id: 'home', icon: 'home', label: '홈' },
        { id: 'live', icon: 'videocam', label: '실시간' },
        { id: 'recordings', icon: 'play-circle', label: '녹화' },
        { id: 'settings', icon: 'settings', label: '설정' },
    ];

    const renderScreen = () => {
        if (loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            );
        }
        if (showLiveView) {
            return <LiveScreen onBack={() => setShowLiveView(false)} moveMode={moveMode} setMoveMode={setMoveMode} />;
        }
        if (showSignup) {
            return (
                <Animated.View style={[{ flex: 1 }, slideAnimatedStyle]}>
                    <SignupScreen
                        onSignupSuccess={() => {
                            animateScreenTransition('out', () => {
                                setShowSignup(false);
                                setActiveTab('home');
                            });
                        }}
                        onBackToLogin={() => {
                            animateScreenTransition('out', () => setShowSignup(false));
                        }}
                    />
                </Animated.View>
            );
        }
        switch (activeTab) {
            case 'home':
                return <HomeScreen />;
            case 'live':
                return <LiveScreen onBack={() => setActiveTab('home')} moveMode={moveMode} setMoveMode={setMoveMode} />;
            case 'recordings':
                return <RecordingsScreen />;
            case 'settings':
                return <SettingsScreen onLogout={handleLogout} />;
            case 'login':
                return (
                    <Animated.View style={[{ flex: 1 }, slideAnimatedStyle]}>
                        <LoginScreen
                            onLoginSuccess={() => setActiveTab('home')}
                            onSignup={() => {
                                animateScreenTransition('out', () => setShowSignup(true));
                            }}
                        />
                    </Animated.View>
                );
            default:
                return <HomeScreen />;
        }
    };

    // 로그인/회원가입/인트로에서는 하단탭 숨김
    const hideTabs = activeTab === 'login' || showSignup;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Main Content */}
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>

            {/* Bottom Navigation: 로그인/회원가입/인트로에서는 숨김 */}
            {!hideTabs && (
                <View style={{
                    backgroundColor: theme.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.outline,
                    paddingBottom: 20,
                    paddingTop: 8
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        paddingHorizontal: 16
                    }}>
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => {
                                        if (activeTab === 'live' && tab.id !== 'live') {
                                            handleNavigateAway(tab.id);
                                        } else {
                                            setActiveTab(tab.id as 'home' | 'live' | 'recordings' | 'settings');
                                        }
                                    }}
                                    style={{
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 12
                                    }}
                                >
                                    <View style={{
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <Ionicons
                                            name={tab.icon as any}
                                            size={24}
                                            color={isActive ? theme.primary : theme.textSecondary}
                                            style={{
                                                transform: [{ scale: isActive ? 1.1 : 1 }]
                                            }}
                                        />
                                        <Text style={{
                                            fontFamily: isActive ? 'GoogleSans-Medium' : 'GoogleSans-Regular',
                                            fontSize: 10,
                                            color: isActive ? theme.primary : theme.textSecondary
                                        }}>
                                            {tab.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
            <Toast />
        </View>
    );
} 