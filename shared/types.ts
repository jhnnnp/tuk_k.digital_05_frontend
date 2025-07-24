// 공통 타입 정의

export interface Camera {
    id: string;
    name: string;
    model: string;
    ipAddress: string;
    status: 'online' | 'offline' | 'error';
    capabilities: {
        ptz: boolean;
        nightVision: boolean;
        aiDetection: boolean;
        recording: boolean;
    };
    settings: {
        resolution: string;
        frameRate: number;
        quality: 'low' | 'medium' | 'high';
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Event {
    id: string;
    cameraId: string;
    type: 'motion' | 'sound' | 'person' | 'vehicle' | 'pet';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    duration: number;
    location: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metadata: {
        confidence: number;
        objectCount: number;
        description?: string;
    };
    recordingUrl?: string;
    thumbnailUrl?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'viewer';
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PTZCommand {
    cameraId: string;
    command: 'pan' | 'tilt' | 'zoom' | 'home' | 'preset';
    value?: {
        x?: number;
        y?: number;
        zoom?: number;
        preset?: number;
    };
}

export interface Recording {
    id: string;
    cameraId: string;
    eventId?: string;
    type: 'motion' | 'scheduled' | 'manual';
    startTime: Date;
    endTime: Date;
    duration: number;
    fileSize: number;
    filePath: string;
    thumbnailUrl?: string;
    status: 'recording' | 'completed' | 'failed';
}

export interface SystemStatus {
    cameras: {
        total: number;
        online: number;
        offline: number;
    };
    storage: {
        total: number;
        used: number;
        available: number;
    };
    events: {
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
    recordings: {
        total: number;
        today: number;
        size: number;
    };
}

// API 응답 타입
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// WebSocket 이벤트 타입
export interface WebSocketEvent {
    type: 'event' | 'status' | 'recording' | 'ptz';
    data: any;
    timestamp: Date;
} 