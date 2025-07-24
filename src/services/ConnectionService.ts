import { Platform } from 'react-native';

export interface ConnectionConfig {
    type: 'wifi' | 'bluetooth' | 'hybrid';
    ssid?: string;
    password?: string;
    deviceId: string;
    autoReconnect: boolean;
}

export interface ConnectionStatus {
    isConnected: boolean;
    signalStrength: number; // dBm
    bandwidth: string;
    latency: number; // ms
    connectionType: 'wifi' | 'bluetooth' | 'hybrid';
    error?: string;
}

class ConnectionService {
    private config: ConnectionConfig;
    private status: ConnectionStatus;
    private listeners: Set<(status: ConnectionStatus) => void> = new Set();

    constructor() {
        this.config = {
            type: 'wifi',
            ssid: 'TIBO_Camera_Network',
            password: 'secure_password',
            deviceId: 'tibo-001',
            autoReconnect: true
        };

        this.status = {
            isConnected: false,
            signalStrength: -70,
            bandwidth: '0Mbps',
            latency: 0,
            connectionType: 'wifi'
        };
    }

    // 연결 설정
    async setupConnection(config: Partial<ConnectionConfig>): Promise<boolean> {
        try {
            this.config = { ...this.config, ...config };

            // Wi-Fi 연결 시도
            if (this.config.type === 'wifi' || this.config.type === 'hybrid') {
                const wifiSuccess = await this.connectWiFi();
                if (wifiSuccess) {
                    this.updateStatus({
                        isConnected: true,
                        connectionType: 'wifi',
                        signalStrength: -45,
                        bandwidth: '100Mbps',
                        latency: 25
                    });
                    return true;
                }
            }

            // Bluetooth 연결 시도 (백업)
            if (this.config.type === 'bluetooth' || this.config.type === 'hybrid') {
                const bluetoothSuccess = await this.connectBluetooth();
                if (bluetoothSuccess) {
                    this.updateStatus({
                        isConnected: true,
                        connectionType: 'bluetooth',
                        signalStrength: -60,
                        bandwidth: '2Mbps',
                        latency: 100
                    });
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Connection setup failed:', error);
            this.updateStatus({
                isConnected: false,
                error: error instanceof Error ? error.message : '연결 실패'
            });
            return false;
        }
    }

    // Wi-Fi 연결
    private async connectWiFi(): Promise<boolean> {
        try {
            // 실제 구현에서는 네이티브 모듈 사용
            console.log('Connecting to Wi-Fi:', this.config.ssid);

            // 시뮬레이션: 연결 성공
            await new Promise(resolve => setTimeout(resolve, 2000));

            return true;
        } catch (error) {
            console.error('Wi-Fi connection failed:', error);
            return false;
        }
    }

    // Bluetooth 연결
    private async connectBluetooth(): Promise<boolean> {
        try {
            console.log('Connecting via Bluetooth to device:', this.config.deviceId);

            // 시뮬레이션: 연결 성공
            await new Promise(resolve => setTimeout(resolve, 1500));

            return true;
        } catch (error) {
            console.error('Bluetooth connection failed:', error);
            return false;
        }
    }

    // 연결 상태 구독
    subscribe(listener: (status: ConnectionStatus) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    // 상태 업데이트
    private updateStatus(updates: Partial<ConnectionStatus>) {
        this.status = { ...this.status, ...updates };
        this.notifyListeners();
    }

    // 리스너들에게 상태 알림
    private notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.status);
            } catch (error) {
                console.error('Error in connection listener:', error);
            }
        });
    }

    // 연결 해제
    async disconnect(): Promise<void> {
        try {
            console.log('Disconnecting from device');
            this.updateStatus({
                isConnected: false,
                signalStrength: 0,
                bandwidth: '0Mbps',
                latency: 0
            });
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }

    // 연결 상태 확인
    getStatus(): ConnectionStatus {
        return { ...this.status };
    }

    // 연결 품질 확인
    getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
        const { signalStrength, latency } = this.status;

        if (signalStrength > -30 && latency < 50) return 'excellent';
        if (signalStrength > -50 && latency < 100) return 'good';
        if (signalStrength > -70 && latency < 200) return 'fair';
        return 'poor';
    }

    // 자동 재연결
    async autoReconnect(): Promise<boolean> {
        if (!this.config.autoReconnect) return false;

        console.log('Attempting auto-reconnect...');
        return await this.setupConnection(this.config);
    }

    // 연결 테스트
    async testConnection(): Promise<{
        ping: number;
        downloadSpeed: string;
        uploadSpeed: string;
    }> {
        try {
            // 실제 구현에서는 네트워크 테스트 수행
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                ping: 25,
                downloadSpeed: '50Mbps',
                uploadSpeed: '20Mbps'
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
}

export const connectionService = new ConnectionService(); 