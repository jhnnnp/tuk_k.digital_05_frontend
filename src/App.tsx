import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './styles/ThemeProvider';
import { UserDataProvider } from './contexts/UserDataContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './store';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import AppLockModal from './components/atoms/AppLockModal';
import { userDataService } from './services/UserDataService';

export default function App() {
    const appState = useRef(AppState.currentState);
    const [isAppLocked, setIsAppLocked] = useState(false);
    const [appLockEnabled, setAppLockEnabled] = useState(false);

    useEffect(() => {
        checkAppLockSettings();
    }, []);

    const checkAppLockSettings = async () => {
        try {
            console.log('🔍 [APP] 앱 잠금 설정 확인 시작');

            const currentUserId = userDataService.getCurrentUserId();
            if (!currentUserId) {
                console.log('⚠️ [APP] 현재 사용자 ID 없음');
                setAppLockEnabled(false);
                return;
            }

            // 기존 전역 설정이 있는지 확인하고 마이그레이션
            const globalSettings = await AsyncStorage.getItem('appLockSettings');
            if (globalSettings) {
                console.log('🔄 [APP] 기존 전역 설정 발견 - 마이그레이션 수행');
                await userDataService.migrateGlobalAppLockSettings(currentUserId);
            }

            const settings = await userDataService.getAppLockSettings(currentUserId);
            if (settings) {
                console.log('📦 [APP] 앱 잠금 설정:', settings);
                setAppLockEnabled(settings.appLockEnabled || false);
                console.log(`🔒 [APP] 앱 잠금 상태: ${settings.appLockEnabled ? '활성화' : '비활성화'}`);
            } else {
                console.log('📝 [APP] 앱 잠금 설정 없음');
                setAppLockEnabled(false);
            }
        } catch (error) {
            console.error('❌ [APP] 앱 잠금 설정 확인 실패:', error);
            setAppLockEnabled(false);
        }
    };

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: string) => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                // 앱이 백그라운드/종료로 전환될 때
                // 자동로그인 옵션이 꺼져 있으면 토큰 삭제
                try {
                    const autoLogin = await AsyncStorage.getItem('autoLogin');
                    if (autoLogin === 'false') {
                        await AsyncStorage.removeItem('token');
                        console.log('🗑️ [AUTOLOGIN] 자동로그인 꺼짐 - 앱 종료 시 토큰 삭제');
                    }
                } catch (e) {
                    console.log('❌ [AUTOLOGIN] 토큰 삭제 중 오류:', e);
                }

                // 앱 잠금이 활성화되어 있으면 앱 잠금 모드 활성화
                if (appLockEnabled) {
                    console.log('🔒 [APP] 앱 잠금 모드 활성화 (백그라운드)');
                    setIsAppLocked(true);
                }
            } else if (
                appState.current.match(/inactive|background/) &&
                nextAppState.match(/active/)
            ) {
                // 앱이 포그라운드로 돌아올 때
                if (appLockEnabled) {
                    console.log('🔒 [APP] 앱 잠금 모드 활성화 (포그라운드)');
                    setIsAppLocked(true);
                }
            }
            appState.current = nextAppState;
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [appLockEnabled]);

    const handleUnlock = () => {
        console.log('🔓 [APP] 앱 잠금 해제');
        setIsAppLocked(false);
    };

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <ThemeProvider>
                        <UserDataProvider>
                            <NavigationContainer>
                                <AppNavigator />
                            </NavigationContainer>
                            <AppLockModal
                                visible={isAppLocked}
                                onUnlock={handleUnlock}
                            />
                        </UserDataProvider>
                    </ThemeProvider>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
} 