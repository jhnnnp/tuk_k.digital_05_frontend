import Constants from 'expo-constants';

/**
 * 개발 환경(Expo)에서는 Metro 호스트(IP:PORT) 값을 이용해
 * 현재 실행 중인 Mac IP 를 자동 추출한다.
 *  - 터널 모드: exp.direct 도메인에서 IP 추출
 *  - LAN 모드: 직접 IP 사용
 *  - 실기기/시뮬레이터 모두 동작
 * 프로덕션 빌드(앱스토어 등)에서는 HTTPS 고정 도메인 사용
 */
const getDevHost = (): string | null => {
    // SDK 48 이전(manifest), 49+(expoConfig) : 둘 중 하나 존재
    // debuggerHost 예) "192.168.0.8:8081" (LAN 모드)
    // hostUri 예)      "192.168.0.8:8081" (LAN 모드)
    // 터널 모드 예)    "1__bofq-jhnnnnm-8081.exp.direct:8081"
    const host =
        (Constants as any)?.manifest?.debuggerHost ??
        (Constants as any)?.expoConfig?.hostUri ??
        null;

    if (!host) return null;

    // 터널 모드인지 확인 (exp.direct 포함)
    if (host.includes('exp.direct')) {
        // 터널 모드: exp.direct 도메인에서 IP 추출
        // 예: "1__bofq-jhnnnnm-8081.exp.direct:8081" -> "1__bofq-jhnnnnm-8081.exp.direct"
        const domain = host.split(':')[0];
        return domain;
    } else {
        // LAN 모드: IP만 추출
        return host.split(':').shift() || null;
    }
};

const devHost = getDevHost();

export const API_BASE_URL = devHost
    ? `http://${devHost}:3000/api`
    : 'https://api.my-production-domain.com/api'; // TODO: 실제 배포 도메인으로 교체

// Dev host와 앱 리턴 URL(export)
export const DEV_HOST = devHost;
export const APP_RETURN_URL = devHost
    ? (devHost.includes('exp.direct')
        ? `exp://${devHost}` // 터널 모드: 포트 없이 도메인만
        : `exp://${devHost}:8081`) // LAN 모드
    : 'exp://localhost:19000';

// 디버깅 로그
if (__DEV__) {
    console.log('🔧 [API CONFIG]');
    console.log(`  🌐 API_BASE_URL: ${API_BASE_URL}`);
    console.log(`  🔍 Dev Host: ${devHost}`);
    console.log(`  🔗 APP_RETURN_URL: ${APP_RETURN_URL}`);
    console.log(`  📱 Constants:`, {
        debuggerHost: (Constants as any)?.manifest?.debuggerHost,
        hostUri: (Constants as any)?.expoConfig?.hostUri
    });
} 