import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../styles/ThemeProvider';

interface NicknameChangeModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function NicknameChangeModal({ visible, onClose, onSuccess }: NicknameChangeModalProps) {
    const { theme } = useTheme();
    const [currentNickname, setCurrentNickname] = useState('');
    const [newNickname, setNewNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchCurrentNickname();
        }
    }, [visible]);

    const fetchCurrentNickname = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                onClose();
                return;
            }

            const res = await fetch('http://192.168.175.160:3000/api/auth/account', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // 닉네임이 없으면 빈 문자열로 설정 (이름을 기본값으로 사용하지 않음)
                const nickname = data.nickname || '';
                setCurrentNickname(nickname);
                setNewNickname(nickname);
            } else {
                Alert.alert('오류', '프로필 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('닉네임 로딩 실패:', error);
            Alert.alert('오류', '네트워크 연결을 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNickname = async () => {
        if (newNickname.trim().length < 2) {
            Alert.alert('닉네임 오류', '닉네임은 2자 이상 입력해주세요.');
            return;
        }

        if (newNickname.trim() === currentNickname) {
            onClose();
            return;
        }

        try {
            setIsSaving(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다.');
                return;
            }

            const res = await fetch('http://192.168.175.160:3000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nickname: newNickname.trim() })
            });

            if (res.ok) {
                setCurrentNickname(newNickname.trim());
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('성공', '닉네임이 변경되었습니다.', [
                    {
                        text: '확인', onPress: () => {
                            onClose();
                            onSuccess?.();
                        }
                    }
                ]);
            } else {
                Alert.alert('저장 실패', '닉네임 변경에 실패했습니다.');
            }
        } catch (error) {
            Alert.alert('저장 실패', '네트워크 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (isSaving) return;
        setNewNickname(currentNickname);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
            }}>
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 24,
                    width: '100%',
                    maxWidth: 320,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 8,
                }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontFamily: 'GoogleSans-Medium',
                            color: theme.textPrimary,
                        }}>
                            {currentNickname ? '닉네임 변경' : '닉네임 설정'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} disabled={isSaving}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {isLoading ? (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={{
                                marginTop: 16,
                                fontSize: 14,
                                fontFamily: 'GoogleSans-Regular',
                                color: theme.textSecondary,
                            }}>
                                닉네임 정보를 불러오는 중...
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Current Nickname */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary,
                                    marginBottom: 8,
                                }}>
                                    현재 닉네임
                                </Text>
                                <View style={{
                                    backgroundColor: theme.surfaceVariant,
                                    borderRadius: 8,
                                    padding: 12,
                                }}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Regular',
                                        color: currentNickname ? theme.textSecondary : theme.textTertiary,
                                    }}>
                                        {currentNickname || '닉네임이 설정되지 않았습니다'}
                                    </Text>
                                </View>
                            </View>

                            {/* New Nickname Input */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.textPrimary,
                                    marginBottom: 8,
                                }}>
                                    새 닉네임
                                </Text>
                                <TextInput
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Regular',
                                        color: theme.textPrimary,
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderWidth: 1,
                                        borderColor: theme.outline,
                                        borderRadius: 8,
                                        backgroundColor: theme.background,
                                    }}
                                    value={newNickname}
                                    onChangeText={setNewNickname}
                                    placeholder={currentNickname ? "새 닉네임을 입력하세요" : "닉네임을 입력하세요"}
                                    placeholderTextColor={theme.textSecondary}
                                    autoFocus={true}
                                    maxLength={20}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSaveNickname}
                                />
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary,
                                    marginTop: 8,
                                    textAlign: 'right',
                                }}>
                                    {newNickname.length}/20자
                                </Text>
                            </View>

                            {/* Buttons */}
                            <View style={{
                                flexDirection: 'row',
                                gap: 12,
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        borderRadius: 8,
                                        backgroundColor: theme.surfaceVariant,
                                        alignItems: 'center',
                                    }}
                                    onPress={handleClose}
                                    disabled={isSaving}
                                >
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: theme.textSecondary,
                                    }}>
                                        취소
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        borderRadius: 8,
                                        backgroundColor: theme.primary,
                                        alignItems: 'center',
                                        opacity: isSaving ? 0.6 : 1,
                                    }}
                                    onPress={handleSaveNickname}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator size="small" color={theme.onPrimary} />
                                    ) : (
                                        <Text style={{
                                            fontSize: 16,
                                            fontFamily: 'GoogleSans-Medium',
                                            color: theme.onPrimary,
                                        }}>
                                            {currentNickname ? '저장' : '설정'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
} 