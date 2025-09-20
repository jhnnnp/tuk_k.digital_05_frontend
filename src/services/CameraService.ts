import { RoboCam, RoboCamSettings, RoboCamStats, PTZCommand, LiveStream } from '../types';
import cameraData from '../mocks/cameras.json';
import { httpClient } from '../utils/http';
import { API_BASE_URL } from '../config/api';

class CameraService {
    private baseUrl: string;
    private isMockMode: boolean;

    constructor() {
        // API_BASE_URL은 '/api'까지 포함하므로 제거하여 백엔드 루트로 설정
        this.baseUrl = (API_BASE_URL || '').replace(/\/api$/, '') || 'http://192.168.123.105:3001';
        this.isMockMode = false; // 실제 백엔드와 연동하므로 mock 모드 비활성화
    }

    // Get all cameras
    async getCameras(): Promise<RoboCam[]> {
        try {
            if (this.isMockMode) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return cameraData.cameras.map((camera: any) => ({
                    ...camera,
                    // 모델/상태가 문자열일 수 있으므로 합리적인 기본값으로 정규화
                    model: (/mini/i.test(camera.model) ? 'TIBO-MINI' : /pan/i.test(camera.model) ? 'TIBO-PAN' : 'TIBO-PRO'),
                    status: (['online', 'offline', 'maintenance', 'error'].includes(camera.status) ? camera.status : 'offline'),
                    lastSeen: new Date(camera.lastSeen)
                })) as unknown as RoboCam[];
            }

            const data = await httpClient.get<{ cameras: RoboCam[] }>(`/cameras`, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
            return data.cameras;
        } catch (error) {
            console.error('Error fetching cameras:', error);
            throw new Error('Failed to fetch cameras');
        }
    }

    // Get specific camera
    async getCamera(id: string): Promise<RoboCam> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const camera: any = cameraData.cameras.find((c: any) => c.id === id);
                if (!camera) {
                    throw new Error('Camera not found');
                }
                return ({
                    ...camera,
                    model: (/mini/i.test(camera.model) ? 'TIBO-MINI' : /pan/i.test(camera.model) ? 'TIBO-PAN' : 'TIBO-PRO'),
                    status: (['online', 'offline', 'maintenance', 'error'].includes(camera.status) ? camera.status : 'offline'),
                    lastSeen: new Date(camera.lastSeen)
                }) as unknown as RoboCam;
            }

            const data = await httpClient.get<{ camera: RoboCam }>(`/cameras/${id}`, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
            return data.camera;
        } catch (error) {
            console.error(`Error fetching camera ${id}:`, error);
            throw new Error('Failed to fetch camera');
        }
    }

    // Update camera settings
    async updateCameraSettings(id: string, settings: Partial<RoboCamSettings>): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 800));
                // In mock mode, we just simulate success
                console.log(`Mock: Updated settings for camera ${id}`, settings);
                return;
            }

            await httpClient.patch(`/cameras/${id}/settings`, settings, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
        } catch (error) {
            console.error(`Error updating camera settings for ${id}:`, error);
            throw new Error('Failed to update camera settings');
        }
    }

    // Get camera statistics
    async getCameraStats(id: string): Promise<RoboCamStats> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 400));
                const camera = cameraData.cameras.find(c => c.id === id);
                if (!camera) {
                    throw new Error('Camera not found');
                }
                return camera.stats;
            }

            const data = await httpClient.get<{ stats: RoboCamStats }>(`/cameras/${id}/stats`, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
            return data.stats;
        } catch (error) {
            console.error(`Error fetching camera stats for ${id}:`, error);
            throw new Error('Failed to fetch camera statistics');
        }
    }

    // Send PTZ command
    async sendPTZCommand(id: string, command: PTZCommand): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 200));
                console.log(`Mock: PTZ command for camera ${id}`, command);
                return;
            }

            await httpClient.post(`/cameras/${id}/ptz`, command, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
        } catch (error) {
            console.error(`Error sending PTZ command to camera ${id}:`, error);
            throw new Error('Failed to send PTZ command');
        }
    }

    // Get live stream
    async getLiveStream(id: string): Promise<LiveStream> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 600));
                return {
                    cameraId: id,
                    url: `webrtc://mock.tibo.com/stream/${id}`,
                    protocol: 'webrtc',
                    quality: 'high',
                    isActive: true,
                    viewers: 1,
                    bitrate: 2048,
                    frameRate: 30,
                    resolution: '1080p'
                };
            }

            const data = await httpClient.get<{ stream: LiveStream }>(`/cameras/${id}/stream`, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
            return data.stream;
        } catch (error) {
            console.error(`Error fetching live stream for camera ${id}:`, error);
            throw new Error('Failed to get live stream');
        }
    }

    // Get camera status
    async getCameraStatus(id: string): Promise<'online' | 'offline' | 'maintenance' | 'error'> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 100));
                const camera: any = cameraData.cameras.find((c: any) => c.id === id);
                const s: any = camera?.status;
                return (s === 'online' || s === 'offline' || s === 'maintenance' || s === 'error') ? s : 'offline';
            }

            const data = await httpClient.get<{ status: 'online' | 'offline' | 'maintenance' | 'error' }>(`/cameras/${id}/status`, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
            return data.status;
        } catch (error) {
            console.error(`Error fetching camera status for ${id}:`, error);
            return 'offline';
        }
    }

    // Restart camera
    async restartCamera(id: string): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`Mock: Restarting camera ${id}`);
                return;
            }

            await httpClient.post(`/cameras/${id}/restart`, undefined, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
        } catch (error) {
            console.error(`Error restarting camera ${id}:`, error);
            throw new Error('Failed to restart camera');
        }
    }

    // Update firmware
    async updateFirmware(id: string, version: string): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                console.log(`Mock: Updating firmware for camera ${id} to ${version}`);
                return;
            }

            await httpClient.post(`/cameras/${id}/firmware`, { version }, {
                baseURL: `${this.baseUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            } as any);
        } catch (error) {
            console.error(`Error updating firmware for camera ${id}:`, error);
            throw new Error('Failed to update firmware');
        }
    }

    // === Relay controls (RTSP -> RTMP -> HLS) ===
    async startRelay(id: string, options?: {
        videoCodec?: 'copy' | 'h264';
        audioCodec?: 'aac' | 'copy' | 'none';
        gop?: number;
        audioBitrateK?: number;
        audioSampleRate?: number;
    }): Promise<{ ok: boolean; hls?: string; message?: string }> {
        return httpClient.post<{ ok: boolean; hls?: string; message?: string }>(`/cameras/${id}/relay/start`, options || {}, {
            baseURL: `${this.baseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            }
        } as any);
    }

    async stopRelay(id: string): Promise<void> {
        await httpClient.post(`/cameras/${id}/relay/stop`, undefined, {
            baseURL: `${this.baseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            }
        } as any);
    }

    async getRelayStatus(id: string): Promise<{ running: boolean }> {
        return httpClient.get<{ running: boolean }>(`/cameras/${id}/relay/status`, {
            baseURL: `${this.baseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await this.getAuthToken()}`
            }
        } as any);
    }

    // Private method to get auth token
    private async getAuthToken(): Promise<string> {
        // DEMO: use static demo token to pass backend middleware
        if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
            return 'demo';
        }
        // TODO: integrate real token from secure storage when available
        return 'mock-token';
    }
}

export const cameraService = new CameraService(); 