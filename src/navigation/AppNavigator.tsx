import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
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
    const [activeTab, setActiveTab] = useState('home');
    const [moveMode, setMoveMode] = useState(false); // 이동모드 상태 리프팅
    const [showLiveView, setShowLiveView] = useState(false);
    const [showSignup, setShowSignup] = useState(false); // 회원가입 화면 상태

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
                                setActiveTab(targetTab);
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
                setActiveTab(targetTab);
            }
        } else {
            setActiveTab(targetTab);
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
        if (showLiveView) {
            return <LiveScreen onBack={() => setShowLiveView(false)} moveMode={moveMode} setMoveMode={setMoveMode} />;
        }
        if (showSignup) {
            return <SignupScreen
                onSignupSuccess={() => {
                    setShowSignup(false);
                    setActiveTab('home');
                }}
                onBackToLogin={() => setShowSignup(false)}
            />;
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
                return <LoginScreen
                    onLoginSuccess={() => setActiveTab('home')}
                    onSignup={() => setShowSignup(true)}
                />;
            default:
                return <HomeScreen />;
        }
    };

    if (showLiveView) {
        return renderScreen();
    }

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
                                            setActiveTab(tab.id);
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