import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { RoboCam, MotionEvent, PTZPosition } from '../types';

// MQTT 메시지 타입 정의
export interface MqttCameraStatus {
    camera_id: string;
    timestamp: string;
    status: 'online' | 'offline' | 'maintenance' | 'error';
    stats: {
        battery_level: number;
        wifi_signal: number;
        storage_used: number;
        storage_total: number;
        uptime: number;
        temperature: number;
        recording_time: number;
        events_today: number;
    };
}

export interface MqttMotionEvent {
    camera_id: string;
    timestamp: string;
    event_type: 'motion' | 'person' | 'pet' | 'vehicle' | 'sound' | 'unknown';
    confidence: number;
    duration: number;
    location: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metadata: {
        object_count: number;
        movement_direction?: 'left' | 'right' | 'up' | 'down';
        speed?: number;
    };
    thumbnail_url?: string;
    recording_id?: string;
}

export interface MqttSoundEvent {
    camera_id: string;
    timestamp: string;
    sound_type: 'glass_break' | 'door_bell' | 'alarm' | 'voice' | 'unknown';
    decibel_level: number;
    duration: number;
    confidence: number;
    location: string;
    audio_file_url?: string;
    spectrogram_url?: string;
}

export interface MqttRecordingEvent {
    camera_id: string;
    timestamp: string;
    action: 'start' | 'stop' | 'error';
    recording_type: 'motion' | 'scheduled' | 'manual' | 'continuous';
    recording_id: string;
    file_path: string;
    file_size: number;
    duration: number;
    resolution: string;
    quality: 'low' | 'medium' | 'high';
}

export interface MqttPtzPosition {
    camera_id: string;
    timestamp: string;
    position: {
        pan: number;
        tilt: number;
        zoom: number;
    };
    is_moving: boolean;
    speed: number;
}

export interface MqttErrorEvent {
    camera_id: string;
    timestamp: string;
    error_type: 'low_battery' | 'storage_full' | 'network_error' | 'hardware_error';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    details?: any;
}

// MQTT 서비스 클래스
class MqttService {
    private client: MqttClient | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 5000; // 5초

    // 연결 상태 구독자들
    private connectionListeners: Set<(connected: boolean) => void> = new Set();

    // MQTT 브로커 연결
    async connect(brokerUrl: string, cameraId: string, options?: IClientOptions): Promise<boolean> {
        try {
            const defaultOptions: IClientOptions = {
                clientId: `tibo-app-${Date.now()}`,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000,
                ...options
            };

            this.client = mqtt.connect(brokerUrl, defaultOptions);

            this.client.on('connect', () => {
                console.log('✅ MQTT Connected to broker:', brokerUrl);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notifyConnectionListeners(true);

                // 카메라별 토픽 구독
                this.subscribeToCameraTopics(cameraId);
            });

            this.client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleMessage(topic, data);
                } catch (error) {
                    console.error('❌ MQTT 메시지 파싱 오류:', error);
                }
            });

            this.client.on('error', (error) => {
                console.error('❌ MQTT 연결 오류:', error);
                this.isConnected = false;
                this.notifyConnectionListeners(false);
            });

            this.client.on('close', () => {
                console.log('🔌 MQTT 연결 종료');
                this.isConnected = false;
                this.notifyConnectionListeners(false);
            });

            this.client.on('reconnect', () => {
                console.log('🔄 MQTT 재연결 시도...');
                this.reconnectAttempts++;
            });

            return true;
        } catch (error) {
            console.error('❌ MQTT 연결 실패:', error);
            return false;
        }
    }

    // 카메라별 토픽 구독
    private subscribeToCameraTopics(cameraId: string) {
        if (!this.client) return;

        const topics = [
            `tibo/camera/${cameraId}/status`,
            `tibo/camera/${cameraId}/motion`,
            `tibo/camera/${cameraId}/sound`,
            `tibo/camera/${cameraId}/recording`,
            `tibo/camera/${cameraId}/ptz/position`,
            `tibo/camera/${cameraId}/error`
        ];

        topics.forEach(topic => {
            this.client!.subscribe(topic, (err) => {
                if (err) {
                    console.error(`❌ 토픽 구독 실패: ${topic}`, err);
                } else {
                    console.log(`✅ 토픽 구독 성공: ${topic}`);
                }
            });
        });
    }

    // 메시지 핸들링
    private handleMessage(topic: string, data: any) {
        console.log(`📨 MQTT 메시지 수신: ${topic}`, data);

        // 토픽별 리스너들에게 알림
        this.notifyListeners(topic, data);

        // 전체 메시지 리스너들에게도 알림
        this.notifyListeners('*', { topic, data });
    }

    // 특정 토픽 구독
    subscribe(topic: string, callback: (data: any) => void) {
        if (!this.listeners.has(topic)) {
            this.listeners.set(topic, new Set());
        }
        this.listeners.get(topic)!.add(callback);
    }

    // 구독 해제
    unsubscribe(topic: string, callback: (data: any) => void) {
        this.listeners.get(topic)?.delete(callback);
    }

    // 연결 상태 구독
    onConnectionChange(callback: (connected: boolean) => void) {
        this.connectionListeners.add(callback);
    }

    // 연결 상태 구독 해제
    offConnectionChange(callback: (connected: boolean) => void) {
        this.connectionListeners.delete(callback);
    }

    // 리스너들에게 알림
    private notifyListeners(topic: string, data: any) {
        this.listeners.get(topic)?.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('❌ MQTT 리스너 콜백 오류:', error);
            }
        });
    }

    // 연결 상태 리스너들에게 알림
    private notifyConnectionListeners(connected: boolean) {
        this.connectionListeners.forEach(callback => {
            try {
                callback(connected);
            } catch (error) {
                console.error('❌ 연결 상태 리스너 콜백 오류:', error);
            }
        });
    }

    // PTZ 명령 전송
    async sendPtzCommand(cameraId: string, command: any): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            console.error('❌ MQTT 클라이언트가 연결되지 않았습니다.');
            return false;
        }

        try {
            const topic = `tibo/camera/${cameraId}/ptz/command`;
            const message = JSON.stringify({
                ...command,
                timestamp: new Date().toISOString()
            });

            this.client.publish(topic, message, (err) => {
                if (err) {
                    console.error('❌ PTZ 명령 전송 실패:', err);
                } else {
                    console.log('✅ PTZ 명령 전송 성공:', command);
                }
            });

            return true;
        } catch (error) {
            console.error('❌ PTZ 명령 전송 오류:', error);
            return false;
        }
    }

    // 녹화 명령 전송
    async sendRecordingCommand(cameraId: string, action: 'start' | 'stop'): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            console.error('❌ MQTT 클라이언트가 연결되지 않았습니다.');
            return false;
        }

        try {
            const topic = `tibo/camera/${cameraId}/recording/command`;
            const message = JSON.stringify({
                action,
                timestamp: new Date().toISOString()
            });

            this.client.publish(topic, message, (err) => {
                if (err) {
                    console.error('❌ 녹화 명령 전송 실패:', err);
                } else {
                    console.log('✅ 녹화 명령 전송 성공:', action);
                }
            });

            return true;
        } catch (error) {
            console.error('❌ 녹화 명령 전송 오류:', error);
            return false;
        }
    }

    // 캡처 명령 전송
    async sendCaptureCommand(cameraId: string): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            console.error('❌ MQTT 클라이언트가 연결되지 않았습니다.');
            return false;
        }

        try {
            const topic = `tibo/camera/${cameraId}/capture/command`;
            const message = JSON.stringify({
                action: 'capture',
                timestamp: new Date().toISOString()
            });

            this.client.publish(topic, message, (err) => {
                if (err) {
                    console.error('❌ 캡처 명령 전송 실패:', err);
                } else {
                    console.log('✅ 캡처 명령 전송 성공');
                }
            });

            return true;
        } catch (error) {
            console.error('❌ 캡처 명령 전송 오류:', error);
            return false;
        }
    }

    // 연결 해제
    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.isConnected = false;
            this.listeners.clear();
            this.connectionListeners.clear();
            console.log('🔌 MQTT 연결 해제됨');
        }
    }

    // 연결 상태 확인
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // 현재 구독 중인 토픽 목록
    getSubscribedTopics(): string[] {
        return Array.from(this.listeners.keys());
    }
}

// 싱글톤 인스턴스 생성
export const mqttService = new MqttService(); 