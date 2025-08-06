import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StatusBar,
    StyleSheet,
    Dimensions,
    Platform,
    Alert,
    Linking,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../styles/ThemeProvider';

interface AppInfoModalProps {
    visible: boolean;
    onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AppInfoModal({ visible, onClose }: AppInfoModalProps) {
    const { theme } = useTheme();
    const [toastVisible, setToastVisible] = useState(false);

    // Enhanced animations
    const backdropOpacity = useSharedValue(0);
    const modalScale = useSharedValue(0);
    const modalTranslateY = useSharedValue(100);
    const modalOpacity = useSharedValue(0);
    const toastOpacity = useSharedValue(0);
    const toastScale = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Backdrop fade in
            backdropOpacity.value = withTiming(1, { duration: 300 });

            // Modal slide up and scale
            modalTranslateY.value = withSpring(0, {
                damping: 20,
                stiffness: 300,
                mass: 0.8,
            });
            modalScale.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.8,
            });
            modalOpacity.value = withTiming(1, { duration: 400 });
        } else {
            // Backdrop fade out
            backdropOpacity.value = withTiming(0, { duration: 200 });

            // Modal slide down and scale down
            modalTranslateY.value = withSpring(100, {
                damping: 20,
                stiffness: 300,
            });
            modalScale.value = withSpring(0.8, {
                damping: 20,
                stiffness: 300,
            });
            modalOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const modalStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            modalScale.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity: modalOpacity.value,
            transform: [
                { translateY: modalTranslateY.value },
                { scale },
            ],
        };
    });

    const toastStyle = useAnimatedStyle(() => ({
        opacity: toastOpacity.value,
        transform: [{ scale: toastScale.value }],
    }));

    const handleClose = () => {
        Haptics.selectionAsync();
        onClose();
    };

    const handleGitHub = async () => {
        try {
            await Linking.openURL('https://github.com/jhnnnp');
        } catch {
            Alert.alert('오류', 'GitHub를 열 수 없습니다.');
        }
    };

    const handleEmail = async () => {
        try {
            await Clipboard.setStringAsync('jhnnn.park@gmail.com');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setToastVisible(true);
            toastOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
            toastScale.value = withSpring(1, { damping: 15, stiffness: 200 });

            setTimeout(() => {
                toastOpacity.value = withSpring(0, { damping: 15, stiffness: 200 });
                toastScale.value = withSpring(0, { damping: 15, stiffness: 200 });
                setTimeout(() => setToastVisible(false), 200);
            }, 2000);
        } catch {
            Alert.alert('오류', '이메일을 복사할 수 없습니다.');
        }
    };

    if (!visible) return null;

    return (
        <Modal visible transparent statusBarTranslucent animationType="none">
            <StatusBar barStyle="dark-content" backgroundColor="rgba(255,255,255,0.8)" />

            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />

                {/* Modal Card */}
                <Animated.View style={[styles.modalCard, modalStyle]}>
                    <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFillObject} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={[theme.primary, theme.primary + 'DD']}
                                style={styles.avatarGradient}
                            >
                                <Ionicons name="person" size={36} color={theme.onPrimary} />
                            </LinearGradient>
                        </View>

                        <Text style={[styles.name, { color: theme.textPrimary }]}>
                            Jinhan Park
                        </Text>

                        <Text style={[styles.title, { color: theme.textSecondary }]}>
                            Full Stack Developer
                        </Text>

                        <View style={styles.badge}>
                            <Text style={[styles.badgeText, { color: theme.primary }]}>
                                Tech University of Korea
                            </Text>
                        </View>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <InfoItem
                            icon="mail"
                            title="Email"
                            value="jhnnn.park@gmail.com"
                            onPress={handleEmail}
                        />
                        <InfoItem
                            icon="logo-github"
                            title="GitHub"
                            value="jhnnnp"
                            onPress={handleGitHub}
                        />
                        <InfoItem
                            icon="phone-portrait"
                            title="App"
                            value="TIBO - Smart Camera"
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <ActionButton
                            icon="logo-github"
                            label="GitHub"
                            onPress={handleGitHub}
                            theme={theme}
                        />
                        <ActionButton
                            icon="mail"
                            label="Email"
                            onPress={handleEmail}
                            theme={theme}
                        />
                    </View>

                    {/* Close Button */}
                    <Pressable onPress={handleClose} style={styles.closeButton}>
                        <LinearGradient
                            colors={[theme.primary, theme.primary + 'DD']}
                            style={styles.closeGradient}
                        >
                            <Text style={[styles.closeText, { color: theme.onPrimary }]}>
                                Close
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </Animated.View>

            {/* Toast */}
            {toastVisible && (
                <Animated.View style={[styles.toast, toastStyle]}>
                    <View style={styles.toastIcon}>
                        <Ionicons name="checkmark" size={20} color={theme.success} />
                    </View>
                    <Text style={[styles.toastText, { color: theme.textPrimary }]}>
                        Copied to Clipboard
                    </Text>
                </Animated.View>
            )}
        </Modal>
    );
}

// Sub-components
function InfoItem({ icon, title, value, onPress }: {
    icon: string;
    title: string;
    value: string;
    onPress?: () => void;
}) {
    const { theme } = useTheme();

    const content = (
        <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name={icon as any} size={20} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>
                    {title}
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                    {value}
                </Text>
            </View>
        </View>
    );

    if (!onPress) {
        return <View style={styles.infoItemWrapper}>{content}</View>;
    }

    return (
        <Pressable
            onPress={onPress}
            style={styles.infoItemWrapper}
            android_ripple={{ color: theme.primary + '10' }}
        >
            {content}
        </Pressable>
    );
}

function ActionButton({ icon, label, onPress, theme }: {
    icon: string;
    label: string;
    onPress: () => void;
    theme: any;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.actionButton, { borderColor: theme.primary + '30' }]}
            android_ripple={{ color: theme.primary + '10' }}
        >
            <Ionicons name={icon as any} size={20} color={theme.primary} />
            <Text style={[styles.actionLabel, { color: theme.primary }]}>{label}</Text>
        </Pressable>
    );
}

// Styles
const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    header: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatarGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    name: {
        fontSize: 24,
        fontFamily: 'GoogleSans-Bold',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontFamily: 'GoogleSans-Regular',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: 'rgba(0, 255, 189, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 189, 0.2)',
    },
    badgeText: {
        fontSize: 12,
        fontFamily: 'GoogleSans-Medium',
        textAlign: 'center',
    },
    infoSection: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    infoItemWrapper: {
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 11,
        fontFamily: 'GoogleSans-Medium',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderWidth: 1,
        gap: 8,
    },
    actionLabel: {
        fontSize: 14,
        fontFamily: 'GoogleSans-Medium',
    },
    closeButton: {
        marginHorizontal: 24,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    closeGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeText: {
        fontSize: 16,
        fontFamily: 'GoogleSans-Bold',
    },
    toast: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    toastIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    toastText: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Bold',
        flex: 1,
    },
});
