import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

export interface SecureUserData {
    authToken: string;
    refreshToken: string;
    biometricCredentials?: {
        username: string;
        password: string;
    };
    sensitiveSettings?: {
        apiKeys: string[];
        privatePreferences: any;
    };
}

class SecureStorageService {
    // 사용자별 보안 키 생성
    private getUserSecureKey(userId: string, key: string): string {
        return `secure_user_${userId}_${key}`;
    }

    // 사용자별 암호화된 데이터 저장
    async saveSecureUserData(userId: string, data: SecureUserData): Promise<void> {
        try {
            const key = this.getUserSecureKey(userId, 'data');
            await EncryptedStorage.setItem(key, JSON.stringify(data));
            console.log(`사용자 ${userId} 보안 데이터 저장 완료`);
        } catch (error) {
            console.error('보안 데이터 저장 실패:', error);
            throw new Error('보안 데이터 저장에 실패했습니다.');
        }
    }

    // 사용자별 암호화된 데이터 불러오기
    async getSecureUserData(userId: string): Promise<SecureUserData | null> {
        try {
            const key = this.getUserSecureKey(userId, 'data');
            const value = await EncryptedStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('보안 데이터 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자별 인증 토큰 저장
    async saveAuthTokens(userId: string, authToken: string, refreshToken: string): Promise<void> {
        try {
            const key = this.getUserSecureKey(userId, 'tokens');
            const tokens = { authToken, refreshToken, savedAt: new Date().toISOString() };
            await EncryptedStorage.setItem(key, JSON.stringify(tokens));
            console.log(`사용자 ${userId} 인증 토큰 저장 완료`);
        } catch (error) {
            console.error('인증 토큰 저장 실패:', error);
            throw new Error('인증 토큰 저장에 실패했습니다.');
        }
    }

    // 사용자별 인증 토큰 불러오기
    async getAuthTokens(userId: string): Promise<{ authToken: string; refreshToken: string } | null> {
        try {
            const key = this.getUserSecureKey(userId, 'tokens');
            const value = await EncryptedStorage.getItem(key);
            if (!value) return null;

            const tokens = JSON.parse(value);
            return {
                authToken: tokens.authToken,
                refreshToken: tokens.refreshToken
            };
        } catch (error) {
            console.error('인증 토큰 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자별 생체 인증 정보 저장
    async saveBiometricCredentials(userId: string, username: string, password: string): Promise<void> {
        try {
            const key = this.getUserSecureKey(userId, 'biometric');
            const credentials = { username, password, savedAt: new Date().toISOString() };
            await EncryptedStorage.setItem(key, JSON.stringify(credentials));
            console.log(`사용자 ${userId} 생체 인증 정보 저장 완료`);
        } catch (error) {
            console.error('생체 인증 정보 저장 실패:', error);
            throw new Error('생체 인증 정보 저장에 실패했습니다.');
        }
    }

    // 사용자별 생체 인증 정보 불러오기
    async getBiometricCredentials(userId: string): Promise<{ username: string; password: string } | null> {
        try {
            const key = this.getUserSecureKey(userId, 'biometric');
            const value = await EncryptedStorage.getItem(key);
            if (!value) return null;

            const credentials = JSON.parse(value);
            return {
                username: credentials.username,
                password: credentials.password
            };
        } catch (error) {
            console.error('생체 인증 정보 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자별 민감한 설정 저장
    async saveSensitiveSettings(userId: string, settings: any): Promise<void> {
        try {
            const key = this.getUserSecureKey(userId, 'sensitive_settings');
            const data = { settings, savedAt: new Date().toISOString() };
            await EncryptedStorage.setItem(key, JSON.stringify(data));
            console.log(`사용자 ${userId} 민감한 설정 저장 완료`);
        } catch (error) {
            console.error('민감한 설정 저장 실패:', error);
            throw new Error('민감한 설정 저장에 실패했습니다.');
        }
    }

    // 사용자별 민감한 설정 불러오기
    async getSensitiveSettings(userId: string): Promise<any | null> {
        try {
            const key = this.getUserSecureKey(userId, 'sensitive_settings');
            const value = await EncryptedStorage.getItem(key);
            if (!value) return null;

            const data = JSON.parse(value);
            return data.settings;
        } catch (error) {
            console.error('민감한 설정 불러오기 실패:', error);
            return null;
        }
    }

    // 플랫폼별 보안 데이터 저장
    async savePlatformSecureData(userId: string, data: any): Promise<void> {
        try {
            const key = this.getUserSecureKey(userId, `platform_${Platform.OS}`);

            const platformData = {
                ...data,
                platform: Platform.OS,
                platformVersion: Platform.Version,
                savedAt: new Date().toISOString()
            };

            await EncryptedStorage.setItem(key, JSON.stringify(platformData));
            console.log(`사용자 ${userId} 플랫폼별 보안 데이터 저장 완료`);
        } catch (error) {
            console.error('플랫폼별 보안 데이터 저장 실패:', error);
        }
    }

    // 플랫폼별 보안 데이터 불러오기
    async getPlatformSecureData(userId: string): Promise<any | null> {
        try {
            const key = this.getUserSecureKey(userId, `platform_${Platform.OS}`);
            const value = await EncryptedStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('플랫폼별 보안 데이터 불러오기 실패:', error);
            return null;
        }
    }

    // 사용자별 보안 데이터 백업
    async backupSecureUserData(userId: string): Promise<any> {
        try {
            const [secureData, authTokens, biometricCredentials, sensitiveSettings, platformData] = await Promise.all([
                this.getSecureUserData(userId),
                this.getAuthTokens(userId),
                this.getBiometricCredentials(userId),
                this.getSensitiveSettings(userId),
                this.getPlatformSecureData(userId)
            ]);

            const backupData = {
                userId,
                secureData,
                authTokens,
                biometricCredentials,
                sensitiveSettings,
                platformData,
                backupDate: new Date().toISOString()
            };

            // 백업 데이터를 별도 키로 저장
            const backupKey = this.getUserSecureKey(userId, 'backup');
            await EncryptedStorage.setItem(backupKey, JSON.stringify(backupData));

            return backupData;
        } catch (error) {
            console.error('보안 데이터 백업 실패:', error);
            throw new Error('보안 데이터 백업에 실패했습니다.');
        }
    }

    // 사용자별 보안 데이터 복원
    async restoreSecureUserData(userId: string): Promise<void> {
        try {
            const backupKey = this.getUserSecureKey(userId, 'backup');
            const backupValue = await EncryptedStorage.getItem(backupKey);

            if (!backupValue) {
                throw new Error('보안 백업 데이터가 없습니다.');
            }

            const backupData = JSON.parse(backupValue);

            // 백업 데이터 복원
            if (backupData.secureData) {
                await this.saveSecureUserData(userId, backupData.secureData);
            }
            if (backupData.authTokens) {
                await this.saveAuthTokens(userId, backupData.authTokens.authToken, backupData.authTokens.refreshToken);
            }
            if (backupData.biometricCredentials) {
                await this.saveBiometricCredentials(userId, backupData.biometricCredentials.username, backupData.biometricCredentials.password);
            }
            if (backupData.sensitiveSettings) {
                await this.saveSensitiveSettings(userId, backupData.sensitiveSettings);
            }
            if (backupData.platformData) {
                await this.savePlatformSecureData(userId, backupData.platformData);
            }

            console.log(`사용자 ${userId} 보안 데이터 복원 완료`);
        } catch (error) {
            console.error('보안 데이터 복원 실패:', error);
            throw new Error('보안 데이터 복원에 실패했습니다.');
        }
    }

    // 사용자별 보안 데이터 삭제
    async clearSecureUserData(userId: string): Promise<void> {
        try {
            // EncryptedStorage는 getAllKeys를 지원하지 않으므로 다른 방법 사용
            const userKeys = [
                this.getUserSecureKey(userId, 'data'),
                this.getUserSecureKey(userId, 'tokens'),
                this.getUserSecureKey(userId, 'biometric'),
                this.getUserSecureKey(userId, 'sensitive_settings'),
                this.getUserSecureKey(userId, `platform_${Platform.OS}`),
                this.getUserSecureKey(userId, 'backup')
            ];

            await Promise.all(userKeys.map(key => EncryptedStorage.removeItem(key)));

            console.log(`사용자 ${userId} 보안 데이터 삭제 완료`);
        } catch (error) {
            console.error('보안 데이터 삭제 실패:', error);
            throw new Error('보안 데이터 삭제에 실패했습니다.');
        }
    }

    // 모든 보안 키 가져오기 (EncryptedStorage는 getAllKeys를 지원하지 않음)
    async getAllSecureKeys(): Promise<string[]> {
        try {
            // EncryptedStorage는 getAllKeys를 지원하지 않으므로 빈 배열 반환
            console.warn('EncryptedStorage는 getAllKeys를 지원하지 않습니다.');
            return [];
        } catch (error) {
            console.error('보안 키 목록 가져오기 실패:', error);
            return [];
        }
    }
}

export const secureStorageService = new SecureStorageService(); 