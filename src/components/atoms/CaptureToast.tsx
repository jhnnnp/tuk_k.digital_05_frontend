import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { unifiedTheme as theme } from '../../styles/theme';

interface CaptureToastProps {
    visible: boolean;
    onHide: () => void;
}

const CaptureToast: React.FC<CaptureToastProps> = ({ visible, onHide }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-100)).current;

    React.useEffect(() => {
        if (visible) {
            // 나타나는 애니메이션
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // 3초 후 사라지는 애니메이션
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => onHide());
            }, 3000);
        }
    }, [visible, fadeAnim, slideAnim, onHide]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.toast}>
                <View style={styles.iconContainer}>
                    <Ionicons name="camera" size={20} color="#29588A" />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>캡쳐 완료</Text>
                    <Text style={styles.subtitle}>이미지가 갤러리에 저장되었습니다</Text>
                </View>
                <View style={styles.checkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    toast: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#B3D9FF',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#B3D9FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        color: '#29588A',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    checkContainer: {
        marginLeft: 12,
    },
});

export default CaptureToast; 