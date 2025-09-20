import { RoboCam, LiveStream } from '../types';
import { cameraService } from './CameraService';
import { httpClient } from '../utils/http';
import { BACKEND_BASE_URL } from '../config/api';

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

    // 라이브 스트림 시작 (릴레이 시작 + 스트림 URL 가져오기)
    async startStream(cameraId: string): Promise<void> {
        try {
            this.updateState({ cameraId, isActive: true, error: null });

            // 0) 사전 네트워크/백엔드 진단 (최대 5초)
            try {
                // 네트워크 연결 상태(선택적): 라이브러리 미존재 환경에서도 동작하도록 가드
                let NetInfo: any;
                try { NetInfo = require('react-native-netinfo').default; } catch (_) { }
                if (NetInfo?.fetch) {
                    const state = await NetInfo.fetch();
                    if (!state?.isConnected) {
                        throw new Error('네트워크에 연결되어 있지 않습니다.');
                    }
                }

                // 백엔드 헬스 체크로 CORS/도메인/포트 문제 조기 감지
                await httpClient.get(`/healthz`, { baseURL: BACKEND_BASE_URL, timeout: 5000 } as any);
            } catch (diagError: any) {
                const message = diagError?.message || '백엔드 연결 실패';
                throw new Error(`백엔드 연결 진단 실패: ${message} (${BACKEND_BASE_URL}/healthz)`);
            }

            // 1) 릴레이 시작 요청 (RTSP->RTMP->HLS), 최대 3회 재시도
            let relay;
            for (let i = 0; i < 3; i++) {
                try {
                    relay = await cameraService.startRelay(cameraId);
                    break;
                } catch (e) {
                    if (i === 2) throw e;
                    await new Promise(r => setTimeout(r, 1500));
                }
            }

            // 2) 스트림 URL 확보: 우선 릴레이 응답의 hls 사용, 없으면 기존 API로 조회
            let streamUrl = relay?.hls || null;
            if (!streamUrl) {
                const stream = await cameraService.getLiveStream(cameraId);
                streamUrl = stream.url;
            }

            // 3) m3u8 가용성 폴링 (HEAD), 최대 30초
            const deadline = Date.now() + 30000;
            const urlToCheck = streamUrl as string;
            while (Date.now() < deadline) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    const res = await fetch(urlToCheck, { method: 'HEAD', signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (res.ok) break;
                } catch (_) { }
                await new Promise(r => setTimeout(r, 800));
            }

            this.updateState({ streamUrl, quality: 'high' });
        } catch (error) {
            const message = error instanceof Error ? error.message : '스트림 시작 실패';
            this.updateState({ isActive: false, error: message });
            throw error;
        }
    }

    // 라이브 스트림 중지 (릴레이 중지)
    async stopStream(): Promise<void> {
        try {
            const id = this.state.cameraId;
            if (id) {
                try { await cameraService.stopRelay(id); } catch (_) { }
            }
        } finally {
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
    }

    // 녹화 토글
    toggleRecording(): void {
        this.updateState({ isRecording: !this.state.isRecording });
    }

    // 마이크 토글
    toggleMic(): void {
        this.updateState({ isMicOn: !this.state.isMicOn });
    }

    // 이동모드 토글
    toggleMoveMode(): void {
        this.updateState({ moveMode: !this.state.moveMode });
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