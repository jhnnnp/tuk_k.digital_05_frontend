import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JoystickProps {
    size?: number;
    onMove?: (dx: number, dy: number) => void;
    onRelease?: () => void;
}

export const Joystick: React.FC<JoystickProps> = ({ size = 120, onMove, onRelease }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                Animated.spring(scale, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }).start();
            },
            onPanResponderMove: (_, gesture) => {
                const radius = size / 2 - 30;
                let dx = gesture.dx;
                let dy = gesture.dy;
                // 원 밖으로 못 나가게 제한
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > radius) {
                    const angle = Math.atan2(dy, dx);
                    dx = Math.cos(angle) * radius;
                    dy = Math.sin(angle) * radius;
                }
                pan.setValue({ x: dx, y: dy });
                onMove && onMove(dx / radius, dy / radius);
            },
            onPanResponderRelease: () => {
                Animated.parallel([
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true,
                    })
                ]).start();
                onRelease && onRelease();
            },
        })
    ).current;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* 귀여운 배경 원 */}
            <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]} />

            {/* 귀여운 방향 표시선들 */}
            <View style={[styles.directionLines, { width: size, height: size }]}>
                <View style={styles.directionLine} />
                <View style={[styles.directionLine, { transform: [{ rotate: '90deg' }] }]} />
            </View>

            {/* 귀여운 중앙 스틱 */}
            <Animated.View
                style={[
                    styles.stick,
                    {
                        width: size / 2.5,
                        height: size / 2.5,
                        borderRadius: size / 5,
                        transform: [
                            ...pan.getTranslateTransform(),
                            { scale: scale }
                        ],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                {/* 귀여운 로봇 아이콘 */}
                <Ionicons name="game-controller" size={size / 6} color="#60a5fa" />
            </Animated.View>

            {/* 귀여운 방향 표시 */}
            <View style={[styles.directionIndicators, { width: size, height: size }]}>
                <View style={[styles.directionIndicator, styles.upIndicator]}>
                    <Ionicons name="chevron-up" size={12} color="#60a5fa" />
                </View>
                <View style={[styles.directionIndicator, styles.downIndicator]}>
                    <Ionicons name="chevron-down" size={12} color="#60a5fa" />
                </View>
                <View style={[styles.directionIndicator, styles.leftIndicator]}>
                    <Ionicons name="chevron-back" size={12} color="#60a5fa" />
                </View>
                <View style={[styles.directionIndicator, styles.rightIndicator]}>
                    <Ionicons name="chevron-forward" size={12} color="#60a5fa" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    base: {
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: '#e2e8f0',
        position: 'absolute',
        top: 0,
        left: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    directionLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    directionLine: {
        position: 'absolute',
        width: '80%',
        height: 1,
        backgroundColor: 'transparent',
        borderRadius: 0.5,
    },
    stick: {
        backgroundColor: '#ffffff',
        borderWidth: 3,
        borderColor: '#60a5fa',
        position: 'absolute',
        top: '30%',
        left: '30%',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    directionIndicators: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    directionIndicator: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    upIndicator: {
        top: 8,
        left: '50%',
        marginLeft: -12,
    },
    downIndicator: {
        bottom: 8,
        left: '50%',
        marginLeft: -12,
    },
    leftIndicator: {
        left: 8,
        top: '50%',
        marginTop: -12,
    },
    rightIndicator: {
        right: 8,
        top: '50%',
        marginTop: -12,
    },
});

export default Joystick; 