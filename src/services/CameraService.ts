import { RoboCam, RoboCamSettings, RoboCamStats, PTZCommand, LiveStream } from '../types';
import cameraData from '../mocks/cameras.json';

class CameraService {
    private baseUrl: string;
    private isMockMode: boolean;

    constructor() {
        this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.tibo.com';
        this.isMockMode = process.env.NODE_ENV === 'development' || !process.env.EXPO_PUBLIC_API_URL;
    }

    // Get all cameras
    async getCameras(): Promise<RoboCam[]> {
        try {
            if (this.isMockMode) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return cameraData.cameras.map(camera => ({
                    ...camera,
                    lastSeen: new Date(camera.lastSeen)
                }));
            }

            const response = await fetch(`${this.baseUrl}/api/cameras`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
                const camera = cameraData.cameras.find(c => c.id === id);
                if (!camera) {
                    throw new Error('Camera not found');
                }
                return {
                    ...camera,
                    lastSeen: new Date(camera.lastSeen)
                };
            }

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/ptz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(command)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/stream`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
                const camera = cameraData.cameras.find(c => c.id === id);
                return camera?.status || 'offline';
            }

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/restart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

            const response = await fetch(`${this.baseUrl}/api/cameras/${id}/firmware`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ version })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error updating firmware for camera ${id}:`, error);
            throw new Error('Failed to update firmware');
        }
    }

    // Private method to get auth token
    private async getAuthToken(): Promise<string> {
        // In a real app, this would get the token from secure storage
        return 'mock-token';
    }
}

export const cameraService = new CameraService(); 