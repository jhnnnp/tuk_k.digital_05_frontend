import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../styles/ThemeProvider';
import { QuietTimeService, QuietTimeSettings } from '../../services/QuietTimeService';

interface QuietTimeModalProps {
    visible: boolean;
    onClose: () => void;
    onSettingsChange?: (settings: QuietTimeSettings) => void;
}

const { width: screenWidth } = Dimensions.get('window');

// Modern Time Picker Component
const TimePicker = ({
    time,
    onTimeChange
}: {
    time: string;
    onTimeChange: (time: string) => void;
}) => {
    const { theme } = useTheme();
    const [hours, minutes] = time.split(':').map(Number);

    const generateNumbers = (start: number, end: number) => {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 60 }}>
            {/* Hours */}
            <View style={{ alignItems: 'center' }}>
                <Text style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginBottom: 16,
                    fontFamily: 'GoogleSans-Medium',
                    letterSpacing: 1,
                    textTransform: 'uppercase'
                }}>
                    시간
                </Text>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ height: 240 }}
                    snapToInterval={50}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: 80 }}
                >
                    {generateNumbers(0, 23).map((hour) => (
                        <TouchableOpacity
                            key={hour}
                            style={{
                                height: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: hour === hours ? theme.primary + '15' : 'transparent',
                                borderRadius: 12,
                                marginVertical: 1,
                                minWidth: 80,
                                borderWidth: hour === hours ? 1 : 0,
                                borderColor: theme.primary + '30'
                            }}
                            onPress={() => {
                                onTimeChange(`${formatNumber(hour)}:${formatNumber(minutes)}`);
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={{
                                fontSize: 20,
                                fontFamily: hour === hours ? 'GoogleSans-Bold' : 'GoogleSans-Regular',
                                color: hour === hours ? theme.primary : theme.textPrimary,
                                opacity: hour === hours ? 1 : 0.7
                            }}>
                                {formatNumber(hour)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Minutes */}
            <View style={{ alignItems: 'center' }}>
                <Text style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginBottom: 16,
                    fontFamily: 'GoogleSans-Medium',
                    letterSpacing: 1,
                    textTransform: 'uppercase'
                }}>
                    분
                </Text>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ height: 240 }}
                    snapToInterval={50}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: 80 }}
                >
                    {generateNumbers(0, 59).map((minute) => (
                        <TouchableOpacity
                            key={minute}
                            style={{
                                height: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: minute === minutes ? theme.primary + '15' : 'transparent',
                                borderRadius: 12,
                                marginVertical: 1,
                                minWidth: 80,
                                borderWidth: minute === minutes ? 1 : 0,
                                borderColor: theme.primary + '30'
                            }}
                            onPress={() => {
                                onTimeChange(`${formatNumber(hours)}:${formatNumber(minute)}`);
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={{
                                fontSize: 20,
                                fontFamily: minute === minutes ? 'GoogleSans-Bold' : 'GoogleSans-Regular',
                                color: minute === minutes ? theme.primary : theme.textPrimary,
                                opacity: minute === minutes ? 1 : 0.7
                            }}>
                                {formatNumber(minute)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default function QuietTimeModal({ visible, onClose, onSettingsChange }: QuietTimeModalProps) {
    const { theme } = useTheme();
    const [settings, setSettings] = useState<QuietTimeSettings>({ enabled: true, startTime: '22:00', endTime: '07:00' });
    const [editingStart, setEditingStart] = useState(false);
    const [editingEnd, setEditingEnd] = useState(false);

    useEffect(() => {
        if (visible) {
            QuietTimeService.loadSettings().then(setSettings).catch(console.error);
        }
    }, [visible]);

    const handleSave = async () => {
        try {
            await QuietTimeService.saveSettings(settings);
            onSettingsChange?.(settings);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 24,
                    width: '88%',
                    maxWidth: 380,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 16 },
                    shadowOpacity: 0.2,
                    shadowRadius: 24,
                    elevation: 12
                }}>
                    {/* Modern Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.outline + '10'
                    }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                backgroundColor: theme.surfaceVariant
                            }}
                        >
                            <Ionicons name="close" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 18,
                            fontFamily: 'GoogleSans-Bold',
                            color: theme.textPrimary,
                            letterSpacing: -0.3
                        }}>
                            조용한 시간 설정
                        </Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                backgroundColor: theme.primary
                            }}
                        >
                            <Ionicons name="checkmark" size={18} color={theme.onPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Modern Content */}
                    <View style={{ padding: 20 }}>
                        {/* Status Card */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 20,
                            paddingVertical: 14,
                            paddingHorizontal: 18,
                            backgroundColor: theme.primary + '10',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: theme.primary + '20'
                        }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: theme.primary + '20',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons
                                    name="moon"
                                    size={20}
                                    color={theme.primary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Bold',
                                    color: theme.textPrimary,
                                    marginBottom: 3
                                }}>
                                    조용한 시간 활성화
                                </Text>
                                <Text style={{
                                    fontSize: 13,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary
                                }}>
                                    설정된 시간 동안 알림을 조용히 합니다
                                </Text>
                            </View>
                        </View>

                        {/* Time Settings */}
                        <View style={{ gap: 24 }}>
                            {/* Start Time */}
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Ionicons name="bed" size={16} color={theme.primary} />
                                    <Text style={{
                                        fontSize: 15,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.textPrimary
                                    }}>
                                        시작 시간
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        backgroundColor: theme.surfaceVariant + '60',
                                        borderRadius: 14,
                                        borderWidth: 2,
                                        borderColor: editingStart ? theme.primary : 'transparent',
                                        alignItems: 'center'
                                    }}
                                    onPress={() => setEditingStart(true)}
                                >
                                    <Text style={{
                                        fontSize: 28,
                                        fontFamily: 'GoogleSans-Bold',
                                        color: theme.textPrimary,
                                        letterSpacing: 1.5
                                    }}>
                                        {settings.startTime}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* End Time */}
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Ionicons name="alarm" size={16} color={theme.primary} />
                                    <Text style={{
                                        fontSize: 15,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.textPrimary
                                    }}>
                                        종료 시간
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        backgroundColor: theme.surfaceVariant + '60',
                                        borderRadius: 14,
                                        borderWidth: 2,
                                        borderColor: editingEnd ? theme.primary : 'transparent',
                                        alignItems: 'center'
                                    }}
                                    onPress={() => setEditingEnd(true)}
                                >
                                    <Text style={{
                                        fontSize: 28,
                                        fontFamily: 'GoogleSans-Bold',
                                        color: theme.textPrimary,
                                        letterSpacing: 1.5
                                    }}>
                                        {settings.endTime}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Summary */}
                        <View style={{
                            marginTop: 24,
                            paddingVertical: 16,
                            paddingHorizontal: 20,
                            backgroundColor: theme.primary + '10',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: theme.primary + '20'
                        }}>
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Medium',
                                color: theme.primary,
                                textAlign: 'center'
                            }}>
                                {settings.startTime} - {settings.endTime}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Modern Time Picker Modal */}
            {(editingStart || editingEnd) && (
                <Modal visible={true} transparent={true} animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{
                            backgroundColor: theme.surface,
                            borderRadius: 28,
                            width: '90%',
                            maxWidth: 380,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.3,
                            shadowRadius: 30,
                            elevation: 15
                        }}>
                            {/* Modern Picker Header */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 24
                            }}>
                                <TouchableOpacity
                                    onPress={() => { setEditingStart(false); setEditingEnd(false); }}
                                    style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor: theme.surfaceVariant
                                    }}
                                >
                                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                                <Text style={{
                                    fontSize: 18,
                                    fontFamily: 'GoogleSans-Bold',
                                    color: theme.textPrimary
                                }}>
                                    {editingStart ? '시작 시간' : '종료 시간'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => { setEditingStart(false); setEditingEnd(false); }}
                                    style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor: theme.primary
                                    }}
                                >
                                    <Ionicons name="checkmark" size={20} color={theme.onPrimary} />
                                </TouchableOpacity>
                            </View>

                            {/* Modern Time Picker */}
                            <TimePicker
                                time={editingStart ? settings.startTime : settings.endTime}
                                onTimeChange={(newTime) => {
                                    setSettings(prev => ({
                                        ...prev,
                                        [editingStart ? 'startTime' : 'endTime']: newTime
                                    }));
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </Modal>
    );
}
