import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, Dimensions } from 'react-native';

interface JoystickProps {
    size?: number;
    onMove?: (dx: number, dy: number) => void;
    onRelease?: () => void;
}

export const Joystick: React.FC<JoystickProps> = ({ size = 120, onMove, onRelease }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                const radius = size / 2 - 24;
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
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: true,
                }).start();
                onRelease && onRelease();
            },
        })
    ).current;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]} />
            <Animated.View
                style={[
                    styles.stick,
                    {
                        width: size / 2,
                        height: size / 2,
                        borderRadius: size / 4,
                        transform: pan.getTranslateTransform(),
                    },
                ]}
                {...panResponder.panHandlers}
            />
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
        backgroundColor: '#F0F0F0',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    stick: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1CC38C',
        position: 'absolute',
        top: '25%',
        left: '25%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default Joystick; 