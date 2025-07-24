import { RoboCam, LiveStream } from '../types';
import { cameraService } from './CameraService';

export interface LiveStreamState {
    cameraId: string | null;
    isActive: boolean;
    isRecording: boolean;
    isMicOn: boolean;
    moveMode: boolean;
    streamUrl: string | null;
    quality: 'low' | 'medium' | 'high';
    error: string | null;
    lastUpdate: Date;
}

class LiveStreamService {
    private state: LiveStreamState = {
        cameraId: null,
        isActive: false,
        isRecording: false,
        isMicOn: false,
        moveMode: false,
        streamUrl: null,
        quality: 'high',
        error: null,
        lastUpdate: new Date()
    };

    private listeners: Set<(state: LiveStreamState) => void> = new Set();

    // 현재 상태 가져오기
    getState(): LiveStreamState {
        return { ...this.state };
    }

    // 상태 변경 구독
    subscribe(listener: (state: LiveStreamState) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    // 상태 업데이트 및 알림
    private updateState(updates: Partial<LiveStreamState>) {
        this.state = { ...this.state, ...updates, lastUpdate: new Date() };
        this.notifyListeners();
    }

    // 리스너들에게 상태 변경 알림
    private notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in live stream listener:', error);
            }
        });
    }

    // 라이브 스트림 시작
    async startStream(cameraId: string): Promise<void> {
        try {
            this.updateState({
                cameraId,
                isActive: true,
                error: null
            });

            // 실제 스트림 URL 가져오기
            const stream = await cameraService.getLiveStream(cameraId);
            this.updateState({
                streamUrl: stream.url,
                quality: stream.resolution === '1080p' ? 'high' :
                    stream.resolution === '720p' ? 'medium' : 'low'
            });
        } catch (error) {
            this.updateState({
                isActive: false,
                error: error instanceof Error ? error.message : '스트림 시작 실패'
            });
            throw error;
        }
    }

    // 라이브 스트림 중지
    stopStream(): void {
        this.updateState({
            cameraId: null,
            isActive: false,
            isRecording: false,
            isMicOn: false,
            moveMode: false,
            streamUrl: null,
            error: null
        });
    }

    // 녹화 토글
    toggleRecording(): void {
        this.updateState({
            isRecording: !this.state.isRecording
        });
    }

    // 마이크 토글
    toggleMic(): void {
        this.updateState({
            isMicOn: !this.state.isMicOn
        });
    }

    // 이동모드 토글
    toggleMoveMode(): void {
        this.updateState({
            moveMode: !this.state.moveMode
        });
    }

    // 화질 변경
    setQuality(quality: 'low' | 'medium' | 'high'): void {
        this.updateState({ quality });
    }

    // 에러 설정
    setError(error: string | null): void {
        this.updateState({ error });
    }

    // 현재 카메라 정보 가져오기
    async getCurrentCamera(): Promise<RoboCam | null> {
        if (!this.state.cameraId) return null;

        try {
            return await cameraService.getCamera(this.state.cameraId);
        } catch (error) {
            console.error('Error fetching current camera:', error);
            return null;
        }
    }

    // 스트림 상태 확인
    isStreamActive(): boolean {
        return this.state.isActive && this.state.cameraId !== null;
    }

    // 녹화 상태 확인
    isRecording(): boolean {
        return this.state.isRecording;
    }

    // 마이크 상태 확인
    isMicOn(): boolean {
        return this.state.isMicOn;
    }

    // 이동모드 상태 확인
    isMoveMode(): boolean {
        return this.state.moveMode;
    }
}

export const liveStreamService = new LiveStreamService(); 