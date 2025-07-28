import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './styles/ThemeProvider';
import { UserDataProvider } from './contexts/UserDataContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './store';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const appState = useRef(AppState.currentState);

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
            }
            appState.current = nextAppState;
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <ThemeProvider>
                        <UserDataProvider>
                            <AppNavigator />
                        </UserDataProvider>
                    </ThemeProvider>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
} 