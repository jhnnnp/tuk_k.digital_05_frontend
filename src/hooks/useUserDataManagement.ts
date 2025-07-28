import { useState, useCallback } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { userDataService, UserSettings } from '../services/UserDataService';
import { secureStorageService, SecureUserData } from '../services/SecureStorageService';

export const useUserDataManagement = () => {
    const { currentUserId, userSettings, updateUserSettings, syncUserData, backupUserData, restoreUserData, performDataClear: contextPerformDataClear } = useUserData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 카메라 설정 업데이트
    const updateCameraSettings = useCallback(async (cameraSettings: UserSettings['cameraPreferences']) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await updateUserSettings({
                cameraPreferences: cameraSettings
            });
        } catch (err) {
            setError('카메라 설정 업데이트에 실패했습니다.');
            console.error('카메라 설정 업데이트 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, updateUserSettings]);

    // 알림 설정 업데이트
    const updateNotificationSettings = useCallback(async (notificationSettings: UserSettings['notificationSettings']) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await updateUserSettings({
                notificationSettings: notificationSettings
            });
        } catch (err) {
            setError('알림 설정 업데이트에 실패했습니다.');
            console.error('알림 설정 업데이트 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, updateUserSettings]);

    // 디스플레이 설정 업데이트
    const updateDisplaySettings = useCallback(async (displaySettings: UserSettings['displaySettings']) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await updateUserSettings({
                displaySettings: displaySettings
            });
        } catch (err) {
            setError('디스플레이 설정 업데이트에 실패했습니다.');
            console.error('디스플레이 설정 업데이트 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, updateUserSettings]);

    // 개인정보 설정 업데이트
    const updatePrivacySettings = useCallback(async (privacySettings: UserSettings['privacySettings']) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await updateUserSettings({
                privacySettings: privacySettings
            });
        } catch (err) {
            setError('개인정보 설정 업데이트에 실패했습니다.');
            console.error('개인정보 설정 업데이트 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, updateUserSettings]);

    // 보안 데이터 저장
    const saveSecureData = useCallback(async (secureData: SecureUserData) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await secureStorageService.saveSecureUserData(currentUserId, secureData);
        } catch (err) {
            setError('보안 데이터 저장에 실패했습니다.');
            console.error('보안 데이터 저장 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 보안 데이터 불러오기
    const loadSecureData = useCallback(async (): Promise<SecureUserData | null> => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const secureData = await secureStorageService.getSecureUserData(currentUserId);
            return secureData;
        } catch (err) {
            setError('보안 데이터 불러오기에 실패했습니다.');
            console.error('보안 데이터 불러오기 실패:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 인증 토큰 저장
    const saveAuthTokens = useCallback(async (authToken: string, refreshToken: string) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await secureStorageService.saveAuthTokens(currentUserId, authToken, refreshToken);
        } catch (err) {
            setError('인증 토큰 저장에 실패했습니다.');
            console.error('인증 토큰 저장 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 인증 토큰 불러오기
    const loadAuthTokens = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const tokens = await secureStorageService.getAuthTokens(currentUserId);
            return tokens;
        } catch (err) {
            setError('인증 토큰 불러오기에 실패했습니다.');
            console.error('인증 토큰 불러오기 실패:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 생체 인증 정보 저장
    const saveBiometricCredentials = useCallback(async (username: string, password: string) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await secureStorageService.saveBiometricCredentials(currentUserId, username, password);
        } catch (err) {
            setError('생체 인증 정보 저장에 실패했습니다.');
            console.error('생체 인증 정보 저장 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 생체 인증 정보 불러오기
    const loadBiometricCredentials = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const credentials = await secureStorageService.getBiometricCredentials(currentUserId);
            return credentials;
        } catch (err) {
            setError('생체 인증 정보 불러오기에 실패했습니다.');
            console.error('생체 인증 정보 불러오기 실패:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 데이터 동기화 실행
    const performDataSync = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await syncUserData();
        } catch (err) {
            setError('데이터 동기화에 실패했습니다.');
            console.error('데이터 동기화 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, syncUserData]);

    // 데이터 백업 실행
    const performDataBackup = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const backupData = await backupUserData();
            return backupData;
        } catch (err) {
            setError('데이터 백업에 실패했습니다.');
            console.error('데이터 백업 실패:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, backupUserData]);

    // 데이터 복원 실행
    const performDataRestore = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await restoreUserData();
        } catch (err) {
            setError('데이터 복원에 실패했습니다.');
            console.error('데이터 복원 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, restoreUserData]);

    // 사용자 데이터 삭제
    const performDataClear = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await contextPerformDataClear();
            await secureStorageService.clearSecureUserData(currentUserId);
        } catch (err) {
            setError('데이터 삭제에 실패했습니다.');
            console.error('데이터 삭제 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, contextPerformDataClear]);

    // 플랫폼별 데이터 저장
    const savePlatformData = useCallback(async (data: any) => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await userDataService.saveUserDataPlatformSpecific(currentUserId, data);
        } catch (err) {
            setError('플랫폼별 데이터 저장에 실패했습니다.');
            console.error('플랫폼별 데이터 저장 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // 플랫폼별 데이터 불러오기
    const loadPlatformData = useCallback(async () => {
        if (!currentUserId) {
            setError('사용자가 로그인되지 않았습니다.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const platformData = await userDataService.getUserDataPlatformSpecific(currentUserId);
            return platformData;
        } catch (err) {
            setError('플랫폼별 데이터 불러오기에 실패했습니다.');
            console.error('플랫폼별 데이터 불러오기 실패:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    return {
        // 상태
        isLoading,
        error,
        currentUserId,
        userSettings,

        // 설정 업데이트 함수들
        updateCameraSettings,
        updateNotificationSettings,
        updateDisplaySettings,
        updatePrivacySettings,

        // 보안 데이터 함수들
        saveSecureData,
        loadSecureData,
        saveAuthTokens,
        loadAuthTokens,
        saveBiometricCredentials,
        loadBiometricCredentials,

        // 데이터 관리 함수들
        performDataSync,
        performDataBackup,
        performDataRestore,
        performDataClear,

        // 플랫폼별 데이터 함수들
        savePlatformData,
        loadPlatformData,

        // 에러 초기화
        clearError: () => setError(null),
    };
}; 