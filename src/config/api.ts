import Constants from 'expo-constants';

/**
 * 개발 환경(Expo)에서는 Metro 호스트(IP:PORT)에서 IP/호스트를 자동 추출하고,
 * 운영 환경에서는 환경변수(EXPO_PUBLIC_API_URL 등)를 우선 사용한다.
 */
const getDevHost = (): string | null => {
    const host =
        (Constants as any)?.manifest?.debuggerHost ??
        (Constants as any)?.expoConfig?.hostUri ??
        null;

    if (!host) return null;

    // 터널 모드: exp.direct 도메인 그대로 사용, LAN 모드: IP만 추출
    return host.includes('exp.direct') ? host.split(':')[0] : (host.split(':').shift() || null);
};

const devHost = getDevHost();

// 1) 명시적 환경변수 우선
const EXPLICIT_API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || '';

// 2) devHost가 있으면 내부망 URL 구성 (백엔드 기본 포트 3001, '/api' 접미사 고정)
const DEV_API_URL = devHost ? `http://${devHost}:3001/api` : '';

// 3) 최종 API_BASE_URL 결정 (환경변수 > devHost > localhost)
export const API_BASE_URL = (EXPLICIT_API_URL || DEV_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

// 추가 유틸 URL들 (필요시 사용)
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
export const DEV_HOST = devHost;
export const MQTT_WS_URL =
    process.env.EXPO_PUBLIC_MQTT_WS_URL || (devHost ? `ws://${devHost}:8083/mqtt` : 'ws://localhost:8083/mqtt');
export const HLS_BASE_URL =
    process.env.EXPO_PUBLIC_HLS_BASE_URL || (devHost ? `http://${devHost}:3001` : 'http://localhost:3001');

export const APP_RETURN_URL = devHost
    ? (devHost.includes('exp.direct') ? `exp://${devHost}` : `exp://${devHost}:8081`)
    : 'exp://localhost:19000';

// 디버깅 로그
if (__DEV__) {
    console.log('🔧 [API CONFIG]');
    console.log(`  🌐 API_BASE_URL: ${API_BASE_URL}`);
    console.log(`  🔗 BACKEND_BASE_URL: ${BACKEND_BASE_URL}`);
    console.log(`  🔍 Dev Host: ${devHost}`);
    console.log(`  🔗 APP_RETURN_URL: ${APP_RETURN_URL}`);
    console.log(`  🔌 MQTT_WS_URL: ${MQTT_WS_URL}`);
    console.log(`  🎬 HLS_BASE_URL: ${HLS_BASE_URL}`);
    console.log('  📱 Constants:', {
        debuggerHost: (Constants as any)?.manifest?.debuggerHost,
        hostUri: (Constants as any)?.expoConfig?.hostUri
    });
}