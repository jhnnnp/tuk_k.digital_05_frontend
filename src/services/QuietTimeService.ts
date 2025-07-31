import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuietTimeSettings {
    enabled: boolean;
    startTime: string; // HH:mm 형식
    endTime: string;   // HH:mm 형식
}

export class QuietTimeService {
    private static readonly STORAGE_KEY = 'quietTimeSettings';
    private static readonly DEFAULT_SETTINGS: QuietTimeSettings = {
        enabled: true,
        startTime: '22:00', // 오후 10시
        endTime: '07:00'    // 오전 7시
    };

    /**
     * 무음시간 설정을 로드합니다.
     */
    static async loadSettings(): Promise<QuietTimeSettings> {
        try {
            const savedSettings = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                console.log('🔇 [QUIET TIME SERVICE] 설정 로드됨:', parsedSettings);
                return parsedSettings;
            }
        } catch (error) {
            console.error('🔇 [QUIET TIME SERVICE] 설정 로드 실패:', error);
        }

        console.log('🔇 [QUIET TIME SERVICE] 기본 설정 사용');
        return this.DEFAULT_SETTINGS;
    }

    /**
     * 무음시간 설정을 저장합니다.
     */
    static async saveSettings(settings: QuietTimeSettings): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
            console.log('🔇 [QUIET TIME SERVICE] 설정 저장됨:', settings);
        } catch (error) {
            console.error('🔇 [QUIET TIME SERVICE] 설정 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 무음시간 설정을 기본값으로 초기화합니다.
     */
    static async resetToDefault(): Promise<QuietTimeSettings> {
        const defaultSettings = this.DEFAULT_SETTINGS;
        await this.saveSettings(defaultSettings);
        console.log('🔇 [QUIET TIME SERVICE] 기본값으로 초기화됨');
        return defaultSettings;
    }

    /**
     * 현재 시간이 무음시간인지 확인합니다.
     */
    static isQuietTime(settings: QuietTimeSettings): boolean {
        if (!settings.enabled) {
            return false;
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // 분 단위로 변환

        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.endTime.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        // 자정을 넘어가는 경우 (예: 오후 10시 ~ 오전 7시)
        if (startTime > endTime) {
            return currentTime >= startTime || currentTime < endTime;
        } else {
            return currentTime >= startTime && currentTime < endTime;
        }
    }

    /**
     * 시간을 표시용 형식으로 변환합니다.
     */
    static formatTimeForDisplay(timeString: string): string {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${period} ${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * 표시용 시간을 저장용 형식으로 변환합니다.
     */
    static formatTimeForStorage(period: string, hours: number, minutes: number): string {
        let adjustedHours = hours;
        if (period === '오후' && hours !== 12) {
            adjustedHours += 12;
        } else if (period === '오전' && hours === 12) {
            adjustedHours = 0;
        }
        return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * 무음시간 설정의 유효성을 검사합니다.
     */
    static validateSettings(settings: QuietTimeSettings): { isValid: boolean; error?: string } {
        if (!settings.enabled) {
            return { isValid: true };
        }

        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.endTime.split(':').map(Number);

        // 시간 범위 검사
        if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
            return { isValid: false, error: '시간은 0-23 사이여야 합니다.' };
        }

        if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
            return { isValid: false, error: '분은 0-59 사이여야 합니다.' };
        }

        // 시작 시간과 종료 시간이 같은 경우
        if (settings.startTime === settings.endTime) {
            return { isValid: false, error: '시작 시간과 종료 시간이 같을 수 없습니다.' };
        }

        return { isValid: true };
    }

    /**
     * 무음시간 설정의 설명을 생성합니다.
     */
    static getDescription(settings: QuietTimeSettings): string {
        if (!settings.enabled) {
            return '무음 시간이 비활성화됨';
        }
        return `${this.formatTimeForDisplay(settings.startTime)} - ${this.formatTimeForDisplay(settings.endTime)}`;
    }
} 