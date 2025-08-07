import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

export interface CaptureNotificationProps {
    visible: boolean;
    onHide: () => void;
    type?: 'capture' | 'record' | 'save' | 'success';
    title?: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    duration?: number;
    showCheckmark?: boolean;
    onPress?: () => void;
    compact?: boolean; // 컴팩트 모드 (FullscreenVideoScreen용)
    topOffset?: number; // 상단 위치 조정
}

const CaptureNotification: React.FC<CaptureNotificationProps> = ({
    visible,
    onHide,
    type = 'capture',
    title,
    subtitle,
    icon,
    iconColor,
    backgroundColor,
    borderColor,
    duration = 3000,
    showCheckmark = true,
    onPress,
    compact = false,
    topOffset
}) => {
    const { theme } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(-100)).current;

    // 기본값 설정
    const getDefaultConfig = () => {
        switch (type) {
            case 'capture':
                return {
                    title: title || '캡쳐 완료',
                    subtitle: subtitle || '이미지가 갤러리에 저장되었습니다',
                    icon: icon || 'camera',
                    iconColor: iconColor || theme.primary,
                    backgroundColor: backgroundColor || theme.surface,
                    borderColor: borderColor || theme.primary + '20'
                };
            case 'record':
                return {
                    title: title || '녹화 완료',
                    subtitle: subtitle || '동영상이 저장되었습니다',
                    icon: icon || 'videocam',
                    iconColor: iconColor || '#F44336',
                    backgroundColor: backgroundColor || theme.surface,
                    borderColor: borderColor || '#F44336' + '20'
                };
            case 'save':
                return {
                    title: title || '저장 완료',
                    subtitle: subtitle || '파일이 저장되었습니다',
                    icon: icon || 'save',
                    iconColor: iconColor || '#4CAF50',
                    backgroundColor: backgroundColor || theme.surface,
                    borderColor: borderColor || '#4CAF50' + '20'
                };
            case 'success':
                return {
                    title: title || '성공',
                    subtitle: subtitle || '작업이 완료되었습니다',
                    icon: icon || 'checkmark-circle',
                    iconColor: iconColor || '#4CAF50',
                    backgroundColor: backgroundColor || theme.surface,
                    borderColor: borderColor || '#4CAF50' + '20'
                };
            default:
                return {
                    title: title || '완료',
                    subtitle: subtitle || '작업이 완료되었습니다',
                    icon: icon || 'checkmark',
                    iconColor: iconColor || theme.primary,
                    backgroundColor: backgroundColor || theme.surface,
                    borderColor: borderColor || theme.primary + '20'
                };
        }
    };

    const config = getDefaultConfig();

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

            // 자동으로 사라지는 애니메이션
            const timer = setTimeout(() => {
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
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, fadeAnim, slideAnim, onHide, duration]);

    if (!visible) return null;

    const NotificationContent = () => (
        <View style={[
            styles.toast,
            { backgroundColor: config.backgroundColor, borderColor: config.borderColor },
            compact && styles.toastCompact
        ]}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: config.iconColor + '15' },
                compact && styles.iconContainerCompact
            ]}>
                <Ionicons name={config.icon as any} size={compact ? 16 : 20} color={config.iconColor} />
            </View>
            <View style={[styles.content, compact && styles.contentCompact]}>
                <Text style={[
                    styles.title,
                    { color: config.iconColor },
                    compact && styles.titleCompact
                ]}>{config.title}</Text>
                <Text style={[
                    styles.subtitle,
                    { color: theme.textSecondary },
                    compact && styles.subtitleCompact
                ]}>{config.subtitle}</Text>
            </View>
            {showCheckmark && (
                <View style={[
                    styles.checkContainer,
                    { backgroundColor: '#4CAF50' + '15' },
                    compact && styles.checkContainerCompact
                ]}>
                    <Ionicons name="checkmark" size={compact ? 14 : 16} color="#4CAF50" />
                </View>
            )}
        </View>
    );

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: topOffset !== undefined ? topOffset : 60,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                    alignItems: 'center',
                },
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {onPress ? (
                <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                    <NotificationContent />
                </TouchableOpacity>
            ) : (
                <NotificationContent />
            )}
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
        alignItems: 'center', // 중앙 정렬 추가
    },
    toast: {
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
        borderWidth: 1,
    },
    toastCompact: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        maxWidth: 280, // 가로 길이 제한
        alignSelf: 'center', // 중앙 정렬
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconContainerCompact: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    content: {
        flex: 1,
    },
    contentCompact: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
        fontFamily: 'GoogleSans-Bold',
    },
    titleCompact: {
        fontSize: 14,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'GoogleSans-Regular',
    },
    subtitleCompact: {
        fontSize: 12,
    },
    checkContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkContainerCompact: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
});

export default CaptureNotification; 