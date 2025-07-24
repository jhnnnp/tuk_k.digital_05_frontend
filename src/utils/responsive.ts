import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// 플랫폼별 상수
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// 기준 디바이스 (iPhone 12)
const baseWidth = 375;
const baseHeight = 812;

// 반응형 크기 계산
export const getResponsiveSize = (size: number): number => {
    const scale = Math.min(width / baseWidth, height / baseHeight);
    return Math.round(size * scale);
};

// 플랫폼별 여백 계산
export const getPlatformPadding = () => {
    if (isIOS) {
        return {
            top: 0,
            bottom: 34, // iPhone 하단 홈 인디케이터
            left: 0,
            right: 0,
        };
    }
    if (isAndroid) {
        return {
            top: 24, // Android 상태바 높이
            bottom: 0,
            left: 0,
            right: 0,
        };
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
};

// 플랫폼별 폰트 크기 조정
export const getPlatformFontSize = (size: number): number => {
    if (isAndroid) {
        // Android는 일반적으로 더 큰 폰트가 필요
        return getResponsiveSize(size + 1);
    }
    return getResponsiveSize(size);
};

// 플랫폼별 아이콘 크기 조정
export const getPlatformIconSize = (size: number): number => {
    if (isAndroid) {
        // Android는 더 큰 터치 영역이 필요
        return getResponsiveSize(size + 2);
    }
    return getResponsiveSize(size);
};

// 플랫폼별 버튼 높이
export const getPlatformButtonHeight = (): number => {
    if (isAndroid) {
        return getResponsiveSize(48); // Material Design 권장
    }
    return getResponsiveSize(44); // iOS 권장
};

// 플랫폼별 카드 여백
export const getPlatformCardMargin = (): number => {
    if (isAndroid) {
        return getResponsiveSize(8);
    }
    return getResponsiveSize(12);
};

// 플랫폼별 그림자 설정
export const getPlatformShadow = (elevation: number = 4) => {
    if (isAndroid) {
        return {
            elevation,
            shadowColor: 'transparent',
        };
    }
    return {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: elevation / 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: elevation,
        elevation: 0,
    };
};

// 플랫폼별 테두리 반경
export const getPlatformBorderRadius = (size: number): number => {
    if (isAndroid) {
        // Android는 더 둥근 모서리
        return getResponsiveSize(size + 2);
    }
    return getResponsiveSize(size);
};

// 화면 크기별 브레이크포인트
export const getScreenBreakpoint = () => {
    const screenWidth = width;
    if (screenWidth < 375) return 'small'; // iPhone SE
    if (screenWidth < 414) return 'medium'; // iPhone 12 Pro Max
    if (screenWidth < 768) return 'large'; // iPad
    return 'xlarge'; // iPad Pro
};

// 플랫폼별 색상 투명도
export const getPlatformOpacity = (baseOpacity: number): number => {
    if (isAndroid) {
        // Android는 더 높은 투명도가 필요
        return Math.min(baseOpacity + 0.1, 1);
    }
    return baseOpacity;
};

// 플랫폼별 애니메이션 지속시간
export const getPlatformAnimationDuration = (baseDuration: number): number => {
    if (isAndroid) {
        // Android는 더 빠른 애니메이션
        return baseDuration * 0.8;
    }
    return baseDuration;
};

// 플랫폼별 터치 피드백
export const getPlatformTouchFeedback = () => {
    if (isAndroid) {
        return {
            android_ripple: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderless: false,
            },
        };
    }
    return {
        activeOpacity: 0.7,
    };
}; 