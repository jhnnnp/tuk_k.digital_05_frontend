import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userDataService, UserSettings } from '../services/UserDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    setUserId,
    setUserSettings,
    setAppState,
    setPreferences,
    setLastSync,
    setLoaded,
    clearUserData,
    restoreUserState
} from '../store/userSlice';
import { RootState } from '../store';

interface UserDataContextType {
    currentUserId: string | null;
    userSettings: UserSettings | null;
    isLoaded: boolean;
    loginUser: (userId: string) => Promise<void>;
    logoutUser: () => Promise<void>;
    switchUser: (newUserId: string) => Promise<void>;
    updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
    syncUserData: () => Promise<void>;
    backupUserData: () => Promise<any>;
    restoreUserData: () => Promise<void>;
    performDataClear: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
    children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
    const dispatch = useDispatch();
    const { userId, settings, isLoaded } = useSelector((state: RootState) => state.user);
    const [isInitializing, setIsInitializing] = useState(true);

    // 앱 초기화 시 사용자 데이터 복원
    useEffect(() => {
        const initializeUserData = async () => {
            try {
                console.log('🔍 [USER DATA] 앱 초기화 시작');

                // 토큰 확인
                const token = await AsyncStorage.getItem('token');
                console.log(`🔐 [USER DATA] 토큰 상태: ${token ? '있음' : '없음'}`);

                if (token) {
                    // 토큰이 있으면 현재 사용자 ID 확인
                    const currentUserId = userDataService.getCurrentUserId();
                    console.log(`👤 [USER DATA] 현재 사용자 ID: ${currentUserId || '없음'}`);

                    if (currentUserId) {
                        console.log('✅ [USER DATA] 로그인된 사용자 발견 - 데이터 로드 시작');
                        await loadUserData(currentUserId);
                    } else {
                        console.log('⚠️ [USER DATA] 토큰은 있지만 사용자 ID가 없음');
                    }
                } else {
                    console.log('📝 [USER DATA] 토큰 없음 - 로그인 필요');
                }
            } catch (error) {
                console.error('❌ [USER DATA] 사용자 데이터 초기화 실패:', error);
            } finally {
                setIsInitializing(false);
                console.log('✅ [USER DATA] 앱 초기화 완료');
            }
        };

        initializeUserData();
    }, []);

    // 사용자 데이터 로드
    const loadUserData = async (userId: string) => {
        try {
            console.log(`📦 [USER DATA] 사용자 ${userId} 데이터 로드 시작`);

            const [settings, appState, platformData] = await Promise.all([
                userDataService.getUserSettings(userId),
                userDataService.getUserAppState(userId),
                userDataService.getUserDataPlatformSpecific(userId)
            ]);

            console.log(`📦 [USER DATA] 사용자 ${userId} 데이터 로드 완료:`);
            console.log(`  - 설정: ${settings ? '있음' : '없음'}`);
            console.log(`  - 앱 상태: ${appState ? '있음' : '없음'}`);
            console.log(`  - 플랫폼 데이터: ${platformData ? '있음' : '없음'}`);

            // Redux store에 사용자 데이터 복원
            dispatch(restoreUserState({
                userId,
                settings: settings || null,
                appState: appState || null,
                preferences: platformData || null,
                lastSync: new Date().toISOString(),
                isLoaded: true
            }));

            console.log(`✅ [USER DATA] 사용자 ${userId} Redux store 업데이트 완료`);
        } catch (error) {
            console.error(`❌ [USER DATA] 사용자 ${userId} 데이터 로드 실패:`, error);
        }
    };

    // 사용자 로그인
    const loginUser = async (userId: string) => {
        try {
            await userDataService.loginUser(userId);

            // 기존 전역 앱 잠금 설정을 사용자별 설정으로 마이그레이션
            await userDataService.migrateGlobalAppLockSettings(userId);

            await loadUserData(userId);
            dispatch(setUserId(userId));
            console.log(`사용자 ${userId} 로그인 완료`);
        } catch (error) {
            console.error('사용자 로그인 실패:', error);
            throw error;
        }
    };

    // 사용자 로그아웃
    const logoutUser = async () => {
        try {
            if (userId) {
                // 현재 상태 저장
                const currentState = {
                    timestamp: new Date().toISOString(),
                    settings,
                    // 추가 앱 상태들
                };
                await userDataService.saveUserAppState(userId, currentState);
            }

            await userDataService.logoutUser();
            dispatch(clearUserData());
            console.log('사용자 로그아웃 완료');
        } catch (error) {
            console.error('사용자 로그아웃 실패:', error);
        }
    };

    // 사용자 전환
    const switchUser = async (newUserId: string) => {
        try {
            await userDataService.switchUser(newUserId);
            await loadUserData(newUserId);
            dispatch(setUserId(newUserId));
            console.log(`사용자 전환 완료: ${newUserId}`);
        } catch (error) {
            console.error('사용자 전환 실패:', error);
            throw error;
        }
    };

    // 사용자 설정 업데이트
    const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
        try {
            if (!userId) {
                throw new Error('사용자가 로그인되지 않았습니다.');
            }

            const updatedSettings = settings ? { ...settings, ...newSettings } : newSettings as UserSettings;

            // 로컬 저장
            await userDataService.saveUserSettings(userId, updatedSettings);

            // Redux store 업데이트
            dispatch(setUserSettings(updatedSettings));

            console.log('사용자 설정 업데이트 완료');
        } catch (error) {
            console.error('사용자 설정 업데이트 실패:', error);
            throw error;
        }
    };

    // 사용자 데이터 동기화
    const syncUserData = async () => {
        try {
            if (!userId) {
                throw new Error('사용자가 로그인되지 않았습니다.');
            }

            await userDataService.syncUserData(userId);
            dispatch(setLastSync(new Date().toISOString()));
            console.log('사용자 데이터 동기화 완료');
        } catch (error) {
            console.error('사용자 데이터 동기화 실패:', error);
            throw error;
        }
    };

    // 사용자 데이터 백업
    const backupUserData = async () => {
        try {
            if (!userId) {
                throw new Error('사용자가 로그인되지 않았습니다.');
            }

            const backupData = await userDataService.backupUserData(userId);
            console.log('사용자 데이터 백업 완료');
            return backupData;
        } catch (error) {
            console.error('사용자 데이터 백업 실패:', error);
            throw error;
        }
    };

    // 사용자 데이터 복원
    const restoreUserData = async () => {
        try {
            if (!userId) {
                throw new Error('사용자가 로그인되지 않았습니다.');
            }

            await userDataService.restoreUserData(userId);
            await loadUserData(userId);
            console.log('사용자 데이터 복원 완료');
        } catch (error) {
            console.error('사용자 데이터 복원 실패:', error);
            throw error;
        }
    };

    // 사용자 데이터 삭제
    const performDataClear = async () => {
        try {
            if (!userId) {
                throw new Error('사용자가 로그인되지 않았습니다.');
            }

            await userDataService.clearUserData(userId);
            dispatch(clearUserData());
            console.log('사용자 데이터 삭제 완료');
        } catch (error) {
            console.error('사용자 데이터 삭제 실패:', error);
            throw error;
        }
    };

    const contextValue: UserDataContextType = {
        currentUserId: userId,
        userSettings: settings,
        isLoaded,
        loginUser,
        logoutUser,
        switchUser,
        updateUserSettings,
        syncUserData,
        backupUserData,
        restoreUserData,
        performDataClear,
    };

    if (isInitializing) {
        // 로딩 상태 표시
        return null;
    }

    return (
        <UserDataContext.Provider value={contextValue}>
            {children}
        </UserDataContext.Provider>
    );
};

// Custom hook for using UserDataContext
export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
}; 