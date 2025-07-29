import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RecordingAction {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    color: string;
    type: 'default' | 'destructive' | 'premium';
    onPress: () => void;
}

interface RecordingActionSheetProps {
    visible: boolean;
    onClose: () => void;
    recording: {
        title: string;
        description: string;
        thumbnail?: string;
        duration: string;
        size: string;
        timestamp: string;
    } | null;
    actions: RecordingAction[];
}

export default function RecordingActionSheet({
    visible,
    onClose,
    recording,
    actions
}: RecordingActionSheetProps) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
            });
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withSpring(0, {
                damping: 15,
                stiffness: 300,
            });
        }
    }, [visible]);

    const animatedOverlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const animatedModalStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const handleActionPress = (action: RecordingAction) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        action.onPress();
        onClose();
    };

    const getActionIconColor = (type: string) => {
        switch (type) {
            case 'destructive': return '#EF4444';
            case 'premium': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    const getActionBackgroundColor = (type: string) => {
        switch (type) {
            case 'destructive': return '#FEF2F2';
            case 'premium': return '#FFFBEB';
            default: return '#F8FAFC';
        }
    };

    if (!recording) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    onPress={onClose}
                    activeOpacity={1}
                />

                <Animated.View style={[styles.modal, animatedModalStyle]}>
                    <View style={styles.container}>
                        {/* 헤더 */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <Text style={styles.title}>{recording.title}</Text>
                                <Text style={styles.description}>{recording.description}</Text>
                                <View style={styles.metaInfo}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>{recording.duration}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="hardware-chip" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>{recording.size}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            {new Date(recording.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* 액션 목록 */}
                        <View style={styles.actionsContainer}>
                            {actions.map((action, index) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[
                                        styles.actionItem,
                                        { backgroundColor: getActionBackgroundColor(action.type) }
                                    ]}
                                    onPress={() => handleActionPress(action)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.actionContent}>
                                        <View style={[
                                            styles.actionIcon,
                                            { backgroundColor: getActionIconColor(action.type) + '15' }
                                        ]}>
                                            <Ionicons
                                                name={action.icon as any}
                                                size={18}
                                                color={getActionIconColor(action.type)}
                                            />
                                        </View>
                                        <View style={styles.actionText}>
                                            <Text style={[
                                                styles.actionTitle,
                                                { color: getActionIconColor(action.type) }
                                            ]}>
                                                {action.title}
                                            </Text>
                                            {action.subtitle && (
                                                <Text style={styles.actionSubtitle}>
                                                    {action.subtitle}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={14}
                                        color="#D1D5DB"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 취소 버튼 */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modal: {
        width: screenWidth * 0.85,
        maxWidth: 400,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    metaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    actionsContainer: {
        padding: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    cancelButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
}); 