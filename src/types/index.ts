// TIBO App Types - Robo-Camera Management System

// User & Authentication
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'VIEWER';
    avatar?: string;
    createdAt: Date;
    lastLoginAt: Date;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
}

// RoboCam Device
export interface RoboCam {
    id: string;
    name: string;
    model: 'TIBO-PRO' | 'TIBO-MINI' | 'TIBO-PAN';
    status: 'online' | 'offline' | 'maintenance' | 'error';
    firmware: string;
    ipAddress: string;
    macAddress: string;
    location: {
        room: string;
        floor?: string;
        coordinates?: {
            x: number;
            y: number;
        };
    };
    capabilities: {
        ptz: boolean;
        nightVision: boolean;
        motionDetection: boolean;
        audioRecording: boolean;
        twoWayAudio: boolean;
        aiDetection: boolean;
    };
    settings: RoboCamSettings;
    stats: RoboCamStats;
    lastSeen: Date;
}

export interface RoboCamSettings {
    resolution: '720p' | '1080p' | '4K';
    frameRate: 15 | 30 | 60;
    quality: 'low' | 'medium' | 'high';
    nightMode: 'auto' | 'on' | 'off';
    motionSensitivity: 1 | 2 | 3 | 4 | 5;
    audioEnabled: boolean;
    recordingEnabled: boolean;
    aiDetection: {
        person: boolean;
        pet: boolean;
        vehicle: boolean;
        sound: boolean;
    };
    ptzLimits: {
        panMin: number;
        panMax: number;
        tiltMin: number;
        tiltMax: number;
        zoomMin: number;
        zoomMax: number;
    };
}

export interface RoboCamStats {
    batteryLevel: number; // 0-100
    wifiSignal: number; // -100 to -30 dBm
    storageUsed: number; // bytes
    storageTotal: number; // bytes
    uptime: number; // seconds
    temperature: number; // celsius
    recordingTime: number; // seconds today
    eventsToday: number;
}

// PTZ Control
export interface PTZPosition {
    pan: number; // -180 to 180 degrees
    tilt: number; // -90 to 90 degrees
    zoom: number; // 1x to 10x
}

export interface PTZCommand {
    type: 'move' | 'home' | 'preset' | 'patrol';
    position?: PTZPosition;
    presetId?: string;
    speed?: number; // 1-10
    duration?: number; // milliseconds
}

// Motion Events & AI Detection
export interface MotionEvent {
    id: string;
    cameraId: string;
    type: 'motion' | 'person' | 'pet' | 'vehicle' | 'sound' | 'unknown';
    confidence: number; // 0-1
    timestamp: Date;
    duration: number; // milliseconds
    location: {
        x: number; // 0-1 relative to frame
        y: number; // 0-1 relative to frame
        width: number; // 0-1 relative to frame
        height: number; // 0-1 relative to frame
    };
    metadata: {
        objectCount?: number;
        soundLevel?: number;
        movementDirection?: 'left' | 'right' | 'up' | 'down';
        speed?: number;
    };
    thumbnail?: string;
    recordingId?: string;
    isAcknowledged: boolean;
    isFalsePositive: boolean;
}

// Recordings
export interface Recording {
    id: string;
    cameraId: string;
    name: string;
    type: 'motion' | 'scheduled' | 'manual' | 'continuous';
    startTime: Date;
    endTime: Date;
    duration: number; // seconds
    fileSize: number; // bytes
    resolution: string;
    quality: 'low' | 'medium' | 'high';
    thumbnail?: string;
    events: string[]; // MotionEvent IDs
    tags: string[];
    isDownloaded: boolean;
    isShared: boolean;
    shareUrl?: string;
}

// Patrol Paths
export interface PatrolPath {
    id: string;
    cameraId: string;
    name: string;
    description?: string;
    waypoints: PTZPosition[];
    speed: number; // 1-10
    duration: number; // seconds per cycle
    isActive: boolean;
    schedule?: {
        startTime: string; // HH:MM
        endTime: string; // HH:MM
        days: number[]; // 0-6 (Sunday-Saturday)
    };
}

// Live Stream
export interface LiveStream {
    cameraId: string;
    url: string;
    protocol: 'webrtc' | 'rtsp' | 'hls';
    quality: 'low' | 'medium' | 'high';
    isActive: boolean;
    viewers: number;
    bitrate: number; // kbps
    frameRate: number;
    resolution: string;
}

// Notifications
export interface Notification {
    id: string;
    type: 'motion' | 'person' | 'pet' | 'offline' | 'low_battery' | 'storage_full' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    cameraId?: string;
    eventId?: string;
    actionUrl?: string;
}

// App Settings
export interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    language: 'ko' | 'en';
    notifications: {
        motion: boolean;
        person: boolean;
        pet: boolean;
        offline: boolean;
        lowBattery: boolean;
        storageFull: boolean;
    };
    privacy: {
        blurFaces: boolean;
        hideLocation: boolean;
        dataRetention: number; // days
    };
    performance: {
        autoQuality: boolean;
        preloadRecordings: boolean;
        cacheSize: number; // MB
    };
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// WebSocket Events
export interface WebSocketEvent {
    type: 'motion' | 'status' | 'recording' | 'ptz' | 'error';
    cameraId: string;
    timestamp: Date;
    data: any;
}

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}

// Navigation Types
export type RootStackParamList = {
    Home: undefined;
    Live: { cameraId: string };
    Recordings: { cameraId?: string };
    Settings: undefined;
    Profile: undefined;
    CameraDetail: { cameraId: string };
    EventDetail: { eventId: string };
    RecordingDetail: { recordingId: string };
    PTZControl: { cameraId: string };
    PatrolPaths: { cameraId: string };
};

// Component Props
export interface CameraCardProps {
    camera: RoboCam;
    onPress: (cameraId: string) => void;
    onSettingsPress: (cameraId: string) => void;
}

export interface EventCardProps {
    event: MotionEvent;
    onPress: (eventId: string) => void;
    onAcknowledge: (eventId: string) => void;
}

export interface RecordingCardProps {
    recording: Recording;
    onPress: (recordingId: string) => void;
    onShare: (recordingId: string) => void;
    onDelete: (recordingId: string) => void;
}

// Service Types
export interface CameraService {
    getCameras(): Promise<RoboCam[]>;
    getCamera(id: string): Promise<RoboCam>;
    updateCameraSettings(id: string, settings: Partial<RoboCamSettings>): Promise<void>;
    getCameraStats(id: string): Promise<RoboCamStats>;
    sendPTZCommand(id: string, command: PTZCommand): Promise<void>;
    getLiveStream(id: string): Promise<LiveStream>;
}

export interface EventService {
    getEvents(cameraId?: string, filters?: EventFilters): Promise<PaginatedResponse<MotionEvent>>;
    acknowledgeEvent(id: string): Promise<void>;
    markFalsePositive(id: string): Promise<void>;
    deleteEvent(id: string): Promise<void>;
}

export interface RecordingService {
    getRecordings(cameraId?: string, filters?: RecordingFilters): Promise<PaginatedResponse<Recording>>;
    getRecording(id: string): Promise<Recording>;
    downloadRecording(id: string): Promise<string>;
    shareRecording(id: string): Promise<string>;
    deleteRecording(id: string): Promise<void>;
}

export interface EventFilters {
    type?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    acknowledged?: boolean;
    confidence?: number;
}

export interface RecordingFilters {
    type?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    quality?: string;
    tags?: string[];
} 