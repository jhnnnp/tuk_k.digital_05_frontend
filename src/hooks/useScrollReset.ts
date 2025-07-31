import { useRef, useEffect } from 'react';
import { ScrollView } from 'react-native';

export const useScrollReset = (screenKey: string) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // 화면이 마운트될 때마다 스크롤 위치를 맨 위로 초기화
        const resetScroll = () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
                console.log(`🔄 [SCROLL] ${screenKey} 화면 스크롤 초기화 완료`);
            }
        };

        // 약간의 지연을 두고 실행 (렌더링 완료 후)
        const timer = setTimeout(resetScroll, 150);

        return () => clearTimeout(timer);
    }, [screenKey]);

    // 외부에서 호출할 수 있는 초기화 함수
    const resetScrollNow = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
            console.log(`🔄 [SCROLL] ${screenKey} 화면 스크롤 즉시 초기화`);
        }
    };

    return { scrollViewRef, resetScrollNow };
};
