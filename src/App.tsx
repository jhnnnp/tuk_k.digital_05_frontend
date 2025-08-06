import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './styles/ThemeProvider';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './store';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AppLockModal from './components/atoms/AppLockModal';
import { userDataService } from './services/UserDataService';

// 네비게이션을 사용하기 위한 래퍼 컴포넌트
function AppContent() {
    const navigation = useNavigation();
    const { currentUserId } = useUserData(); // UserDataContext 사용
    const appState = useRef(AppState.currentState);
    const [isAppLocked, setIsAppLocked] = useState(false);
    const [appLockEnabled, setAppLockEnabled] = useState(false);

    useEffect(() => {
        checkAppLockSettings();
    }, []);

    // 로그인 상태 변경 시 앱 잠금 재체크
    useEffect(() => {
        const checkLoginAndAppLock = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                console.log(`🔍 [APP] 로그인 상태 체크 - 토큰: ${token ? '있음' : '없음'}, 사용자ID: ${currentUserId || '없음'}`);

                if (token && currentUserId) {
                    console.log('✅ [APP] 로그인 상태 확인됨 - 앱 잠금 설정 재체크');
                    await checkAppLockSettings();
                }
            } catch (error) {
                console.error('❌ [APP] 로그인 상태 체크 실패:', error);
            }
        };

        // currentUserId가 변경될 때마다 체크
        if (currentUserId) {
            checkLoginAndAppLock();
        }
    }, [currentUserId]); // currentUserId 의존성 추가

    // 앱 잠금 설정이 변경될 때마다 다시 체크
    useEffect(() => {
        if (appLockEnabled) {
            console.log('🔒 [APP] 앱 잠금 활성화됨 - 초기 상태 체크');
            // 앱 시작 시에도 앱 잠금 체크
            const checkInitialLock = async () => {
                try {
                    const backgroundTime = await AsyncStorage.getItem('appBackgroundTime');
                    if (backgroundTime) {
                        console.log('🔒 [APP] 이전 백그라운드 시간 발견 - 앱 잠금 활성화');
                        setIsAppLocked(true);
                    }
                } catch (error) {
                    console.error('❌ [APP] 초기 앱 잠금 체크 실패:', error);
                }
            };
            checkInitialLock();
        }
    }, [appLockEnabled]);

    const checkAppLockSettings = async () => {
        try {
            console.log('🔍 [APP] 앱 잠금 설정 확인 시작');

            console.log(`👤 [APP] 현재 사용자 ID: ${currentUserId || '없음'}`);

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
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
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

                // 앱 잠금이 활성화되어 있으면 백그라운드 시간 기록
                if (appLockEnabled) {
                    console.log('🔒 [APP] 앱 잠금 모드 활성화 (백그라운드)');
                    await AsyncStorage.setItem('appBackgroundTime', Date.now().toString());
                }
            } else if (
                appState.current.match(/inactive|background/) &&
                nextAppState.match(/active/)
            ) {
                // 앱이 포그라운드로 돌아올 때 - 카카오톡 방식
                if (appLockEnabled) {
                    console.log('🔒 [APP] 앱 포그라운드 복귀 - 앱 잠금 활성화');
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

    // 디버깅용: 앱 잠금 강제 활성화 (개발 모드에서만)
    const forceAppLock = () => {
        console.log('🔒 [DEBUG] 앱 잠금 강제 활성화');
        setIsAppLocked(true);
    };

    // 개발 모드에서 앱 잠금 테스트
    useEffect(() => {
        if (__DEV__) {
            // 개발 모드에서 5초 후 앱 잠금 테스트
            const timer = setTimeout(() => {
                console.log('🧪 [DEBUG] 개발 모드 - 앱 잠금 테스트');
                if (appLockEnabled) {
                    forceAppLock();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [appLockEnabled]);

    return (
        <>
            <AppNavigator />
            <AppLockModal
                visible={isAppLocked}
                onUnlock={handleUnlock}
                navigation={navigation}
            />
        </>
    );
}

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <ThemeProvider>
                        <UserDataProvider>
                            <NavigationContainer>
                                <AppContent />
                            </NavigationContainer>
                        </UserDataProvider>
                    </ThemeProvider>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
} 