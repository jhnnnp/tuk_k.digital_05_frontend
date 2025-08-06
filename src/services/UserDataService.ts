import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface UserSettings {
    cameraPreferences?: {
        defaultQuality: 'low' | 'medium' | 'high';
        autoRecord: boolean;
        motionDetection: boolean;
    };
    notificationSettings?: {
        motionAlerts: boolean;
        systemAlerts: boolean;
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
        };
    };
    displaySettings?: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        timezone: string;
    };
    privacySettings?: {
        dataRetention: number; // days
        analyticsEnabled: boolean;
        crashReporting: boolean;
    };
}

export interface UserData {
    userId: string;
    settings: UserSettings;
    lastSync: string;
    appState: any;
    preferences: any;
}

class UserDataService {
    private currentUserId: string | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            // 마지막 로그인한 사용자 ID 복원
            const lastUserId = await AsyncStorage.getItem('last_user_id');
            if (lastUserId) {
                this.currentUserId = lastUserId;
            }
            this.isInitialized = true;
        } catch (error) {
            console.error('UserDataService 초기화 실패:', error);
        }
    }

    // 사용자별 키 생성
    private getUserKey(userId: string, key: string): string {
        return `user_${userId}_${key}`;
    }

    // 현재 사용자 키 생성
    private getCurrentUserKey(key: string): string {
        if (!this.currentUserId) {
            throw new Error('사용자가 로그인되지 않았습니다.');
        }
        return this.getUserKey(this.currentUserId, key);
    }

    // 사용자 설정 저장
    async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
        try {
            const key = this.getUserKey(userId, 'settings');
            await AsyncStorage.setItem(key, JSON.stringify(settings));
            console.log(`사용자 ${userId} 설정 저장 완료`);
        } catch (error) {
            console.error('사용자 설정 저장 실패:', error);
            throw new Error('설정 저장에 실패했습니다.');
        }
    }

    // 사용자 설정 불러오기
    async getUserSettings(userId: string): Promise<UserSettings | null> {
        try {
            const key = this.getUserKey(userId, 'settings');
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('사용자 설정 불러오기 실패:', error);
            return null;
        }
    }

    // 현재 사용자 설정 저장
    async saveCurrentUserSettings(settings: UserSettings): Promise<void> {
        if (!this.currentUserId) {
            throw new Error('현재 사용자가 설정되지 않았습니다.');
        }
        await this.saveUserSettings(this.currentUserId, settings);
    }

    // 현재 사용자 설정 불러오기
    async getCurrentUserSettings(): Promise<UserSettings | null> {
        if (!this.currentUserId) {
            return null;
        }
        return await this.getUserSettings(this.currentUserId);
    }

    // 사용자별 앱 상태 저장
    async saveUserAppState(userId: string, appState: any): Promise<void> {
        try {
            const key = this.getUserKey(userId, 'app_state');
            await AsyncStorage.setItem(key, JSON.stringify(appState));
        } catch (error) {
            console.error('앱 상태 저장 실패:', error);
        }
    }

    // 사용자별 앱 상태 불러오기
    async getUserAppState(userId: string): Promise<any | null> {
        try {
            const key = this.getUserKey(userId, 'app_state');
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('앱 상태 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자별 데이터 저장 (플랫폼별)
    async saveUserDataPlatformSpecific(userId: string, data: any): Promise<void> {
        try {
            const key = this.getUserKey(userId, `data_${Platform.OS}`);

            const platformSpecificData = {
                ...data,
                platform: Platform.OS,
                platformVersion: Platform.Version,
                savedAt: new Date().toISOString()
            };

            await AsyncStorage.setItem(key, JSON.stringify(platformSpecificData));
        } catch (error) {
            console.error('플랫폼별 데이터 저장 실패:', error);
        }
    }

    // 사용자별 데이터 불러오기 (플랫폼별)
    async getUserDataPlatformSpecific(userId: string): Promise<any | null> {
        try {
            const key = this.getUserKey(userId, `data_${Platform.OS}`);
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('플랫폼별 데이터 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자 전환
    async switchUser(newUserId: string): Promise<void> {
        try {
            // 현재 사용자 상태 저장
            if (this.currentUserId) {
                await this.saveCurrentUserState();
            }

            // 새 사용자로 전환
            this.currentUserId = newUserId;
            await AsyncStorage.setItem('last_user_id', newUserId);

            // 새 사용자 상태 복원
            await this.loadUserState(newUserId);

            console.log(`사용자 전환 완료: ${newUserId}`);
        } catch (error) {
            console.error('사용자 전환 실패:', error);
            throw new Error('사용자 전환에 실패했습니다.');
        }
    }

    // 현재 사용자 상태 저장
    private async saveCurrentUserState(): Promise<void> {
        if (!this.currentUserId) return;

        try {
            // Redux store 상태나 현재 앱 상태를 가져와서 저장
            // 실제 구현에서는 store.getState()를 사용
            const currentState = {
                timestamp: new Date().toISOString(),
                // 여기에 실제 앱 상태를 추가
            };

            await this.saveUserAppState(this.currentUserId, currentState);
        } catch (error) {
            console.error('현재 사용자 상태 저장 실패:', error);
        }
    }

    // 사용자 상태 복원
    private async loadUserState(userId: string): Promise<void> {
        try {
            const userState = await this.getUserAppState(userId);
            if (userState) {
                // Redux store에 상태 복원
                // 실제 구현에서는 store.dispatch(restoreUserState(userState))를 사용
                console.log(`사용자 ${userId} 상태 복원 완료`);
            }
        } catch (error) {
            console.error('사용자 상태 복원 실패:', error);
        }
    }

    // 사용자별 데이터 동기화
    async syncUserData(userId: string): Promise<void> {
        try {
            // 로컬 데이터 가져오기
            const localSettings = await this.getUserSettings(userId);
            const localAppState = await this.getUserAppState(userId);

            // 서버와 동기화 (실제 구현에서는 API 호출)
            const syncData = {
                settings: localSettings,
                appState: localAppState,
                lastSync: new Date().toISOString()
            };

            // 서버 응답을 로컬에 업데이트
            if (localSettings) {
                await this.saveUserSettings(userId, localSettings);
            }

            console.log(`사용자 ${userId} 데이터 동기화 완료`);
        } catch (error) {
            console.error('데이터 동기화 실패:', error);
            throw new Error('데이터 동기화에 실패했습니다.');
        }
    }

    // 사용자별 데이터 백업
    async backupUserData(userId: string): Promise<any> {
        try {
            const settings = await this.getUserSettings(userId);
            const appState = await this.getUserAppState(userId);
            const platformData = await this.getUserDataPlatformSpecific(userId);

            const backupData = {
                userId,
                settings,
                appState,
                platformData,
                backupDate: new Date().toISOString()
            };

            // 백업 데이터를 별도 키로 저장
            const backupKey = this.getUserKey(userId, 'backup');
            await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));

            return backupData;
        } catch (error) {
            console.error('데이터 백업 실패:', error);
            throw new Error('데이터 백업에 실패했습니다.');
        }
    }

    // 사용자별 데이터 복원
    async restoreUserData(userId: string): Promise<void> {
        try {
            const backupKey = this.getUserKey(userId, 'backup');
            const backupValue = await AsyncStorage.getItem(backupKey);

            if (!backupValue) {
                throw new Error('백업 데이터가 없습니다.');
            }

            const backupData = JSON.parse(backupValue);

            // 백업 데이터 복원
            if (backupData.settings) {
                await this.saveUserSettings(userId, backupData.settings);
            }
            if (backupData.appState) {
                await this.saveUserAppState(userId, backupData.appState);
            }
            if (backupData.platformData) {
                await this.saveUserDataPlatformSpecific(userId, backupData.platformData);
            }

            console.log(`사용자 ${userId} 데이터 복원 완료`);
        } catch (error) {
            console.error('데이터 복원 실패:', error);
            throw new Error('데이터 복원에 실패했습니다.');
        }
    }

    // 사용자별 데이터 삭제
    async clearUserData(userId: string): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const userKeys = keys.filter(key => key.startsWith(`user_${userId}_`));

            if (userKeys.length > 0) {
                await AsyncStorage.multiRemove(userKeys);
            }

            console.log(`사용자 ${userId} 데이터 삭제 완료`);
        } catch (error) {
            console.error('사용자 데이터 삭제 실패:', error);
            throw new Error('데이터 삭제에 실패했습니다.');
        }
    }

    // 현재 사용자 ID 가져오기
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    // 사용자 로그인
    async loginUser(userId: string): Promise<void> {
        this.currentUserId = userId;
        await AsyncStorage.setItem('last_user_id', userId);
        await this.loadUserState(userId);
    }

    // 사용자 로그아웃
    async logoutUser(): Promise<void> {
        if (this.currentUserId) {
            await this.saveCurrentUserState();
            this.currentUserId = null;
            await AsyncStorage.removeItem('last_user_id');
        }
    }

    // 모든 사용자 데이터 키 가져오기
    async getAllUserKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys.filter(key => key.startsWith('user_'));
        } catch (error) {
            console.error('사용자 키 목록 가져오기 실패:', error);
            return [];
        }
    }

    // 앱 잠금 설정 저장
    async saveAppLockSettings(userId: string, settings: {
        appLockEnabled: boolean;
        biometricEnabled: boolean;
        pinEnabled: boolean;
        currentPin: string;
        isPinRegistered?: boolean;
        pinSetupCompleted?: boolean;
    }): Promise<void> {
        try {
            const key = this.getUserKey(userId, 'appLockSettings');
            await AsyncStorage.setItem(key, JSON.stringify(settings));
            console.log(`사용자 ${userId} 앱 잠금 설정 저장 완료:`, settings);
        } catch (error) {
            console.error('앱 잠금 설정 저장 실패:', error);
            throw new Error('앱 잠금 설정 저장에 실패했습니다.');
        }
    }

    // 앱 잠금 설정 불러오기
    async getAppLockSettings(userId: string): Promise<{
        appLockEnabled: boolean;
        biometricEnabled: boolean;
        pinEnabled: boolean;
        currentPin: string;
        isPinRegistered?: boolean;
        pinSetupCompleted?: boolean;
    } | null> {
        try {
            const key = this.getUserKey(userId, 'appLockSettings');
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('앱 잠금 설정 불러오기 실패:', error);
            return null;
        }
    }

    // 기존 전역 앱 잠금 설정을 사용자별 설정으로 마이그레이션
    async migrateGlobalAppLockSettings(userId: string): Promise<void> {
        try {
            const globalSettings = await AsyncStorage.getItem('appLockSettings');
            if (globalSettings) {
                const settings = JSON.parse(globalSettings);
                await this.saveAppLockSettings(userId, settings);
                await AsyncStorage.removeItem('appLockSettings');
                console.log(`사용자 ${userId} 전역 앱 잠금 설정 마이그레이션 완료`);
            }
        } catch (error) {
            console.error('앱 잠금 설정 마이그레이션 실패:', error);
        }
    }

    // 📌 PIN 등록 상태 확인 (앱락 진입 로직을 위한 헬퍼 함수)
    async isPinRegistered(): Promise<boolean> {
        try {
            console.log('🔍 [USER DATA SERVICE] PIN 등록 상태 확인 시작');

            // 1. 현재 사용자 ID로 사용자별 설정 확인
            if (this.currentUserId) {
                console.log(`👤 [USER DATA SERVICE] 사용자별 설정 확인 - ID: ${this.currentUserId}`);
                const userSettings = await this.getAppLockSettings(this.currentUserId);

                if (userSettings) {
                    const hasPin = userSettings.currentPin && userSettings.currentPin.length > 0;
                    const isRegistered = userSettings.isPinRegistered || hasPin;
                    console.log(`✅ [USER DATA SERVICE] 사용자별 설정 발견 - PIN 등록: ${isRegistered ? '등록됨' : '미등록'}`);
                    return isRegistered;
                }
            }

            // 2. 전역 설정 확인 (fallback)
            console.log('📦 [USER DATA SERVICE] 전역 설정 확인 (fallback)');
            const globalSettings = await AsyncStorage.getItem('appLockSettings');

            if (globalSettings) {
                const settings = JSON.parse(globalSettings);
                const hasPin = settings.currentPin && settings.currentPin.length > 0;
                const isRegistered = settings.isPinRegistered || hasPin;
                console.log(`✅ [USER DATA SERVICE] 전역 설정 발견 - PIN 등록: ${isRegistered ? '등록됨' : '미등록'}`);
                return isRegistered;
            }

            // 3. 설정이 없으면 미등록 상태로 간주
            console.log('📝 [USER DATA SERVICE] 설정 없음 - PIN 미등록 상태로 간주');
            return false;

        } catch (error) {
            console.error('❌ [USER DATA SERVICE] PIN 등록 상태 확인 실패:', error);
            // 오류 시 안전하게 미등록 상태로 간주 (자유 진입 허용)
            return false;
        }
    }

    // 📌 앱락 인증 필요 여부 확인 (앱 시작 시 사용)
    async shouldRequireAppLockAuth(): Promise<boolean> {
        try {
            const pinRegistered = await this.isPinRegistered();

            if (!pinRegistered) {
                console.log('🔓 [USER DATA SERVICE] PIN 미등록 - 앱락 인증 불필요');
                return false;
            }

            // PIN이 등록된 경우 앱락 활성화 여부도 확인
            const settings = this.currentUserId
                ? await this.getAppLockSettings(this.currentUserId)
                : JSON.parse(await AsyncStorage.getItem('appLockSettings') || 'null');

            if (settings && settings.appLockEnabled) {
                console.log('🔒 [USER DATA SERVICE] PIN 등록 + 앱락 활성화 - 인증 필요');
                return true;
            }

            console.log('🔓 [USER DATA SERVICE] PIN 등록되었지만 앱락 비활성화 - 인증 불필요');
            return false;

        } catch (error) {
            console.error('❌ [USER DATA SERVICE] 앱락 인증 필요 여부 확인 실패:', error);
            // 오류 시 안전하게 인증 불필요로 간주
            return false;
        }
    }
}

export const userDataService = new UserDataService(); 