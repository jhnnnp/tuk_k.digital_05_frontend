// PasswordChangeModal.tsx (새 버전 – Reanimated 제거)

/* 1) ──────────────────────  import  ────────────────────── */
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../styles/ThemeProvider';
import { API_BASE_URL } from '../../config/api';

/* 2) ─────────────────────── constants ──────────────────── */
const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

/* 3) ────────────────────── component ───────────────────── */
export default function PasswordChangeModal({
    visible,
    onClose,
    onSuccess,
}: Props) {
    const { theme } = useTheme();

    /* state */
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState<'current' | 'next' | 'confirm' | null>(null);
    const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
    const [validatingCurrent, setValidatingCurrent] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

    // 모달이 열릴 때마다 모든 상태 초기화
    useEffect(() => {
        if (visible) {
            setCurrent('');
            setNext('');
            setConfirm('');
            setShow(null);
            setCurrentPasswordValid(null);
            setValidatingCurrent(false);
            setPasswordMatch(null);
            setLoading(false);
        }
    }, [visible]);

    /* validation helpers */
    const pwValid = (pw: string) =>
        pw.length >= 8 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /[0-9]/.test(pw);

    const handleChange = async () => {
        if (!current || !next || !confirm) {
            Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
            return;
        }
        if (next !== confirm) {
            Alert.alert('입력 오류', '새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!pwValid(next)) {
            Alert.alert(
                '입력 오류',
                '비밀번호는 8자 이상이며 대문자·소문자·숫자를 모두 포함해야 합니다.',
            );
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('로그인이 필요합니다.');

            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: current,
                    newPassword: next,
                }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || '비밀번호 변경 실패');
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.');
            setCurrent('');
            setNext('');
            setConfirm('');
            onSuccess?.();
            onClose();
        } catch (e: any) {
            Alert.alert('오류', e.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 현재 비밀번호 검증 함수
    const validateCurrentPassword = async (password: string) => {
        if (!password || password.length < 3) {
            setCurrentPasswordValid(null);
            return;
        }

        try {
            setValidatingCurrent(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/auth/validate-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            const isValid = response.ok;
            setCurrentPasswordValid(isValid);
        } catch (error) {
            setCurrentPasswordValid(false);
        } finally {
            setValidatingCurrent(false);
        }
    };

    // 현재 비밀번호 입력 핸들러 (디바운스 적용)
    const handleCurrentPasswordChange = (text: string) => {
        setCurrent(text);
        setCurrentPasswordValid(null);

        // 디바운스: 500ms 후 검증
        const timeoutId = setTimeout(() => {
            validateCurrentPassword(text);
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    // 비밀번호 일치 확인
    const checkPasswordMatch = (confirmPassword: string) => {
        if (!confirmPassword) {
            setPasswordMatch(null);
            return;
        }
        setPasswordMatch(confirmPassword === next);
    };

    /* 4) ───────────────────────  UI  ─────────────────────── */
    if (!visible) return null;

    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent>
            <StatusBar barStyle="light-content" />
            {/* 반투명 배경 */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                {/* 키보드 대응 */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%', alignItems: 'center' }}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        keyboardShouldPersistTaps="handled">
                        {/* 카드 */}
                        <View
                            style={{
                                width: SCREEN_W * 0.9,
                                maxWidth: 400,
                                backgroundColor: theme.surface,
                                borderRadius: 24,
                                padding: 32,
                            }}>
                            {/* 헤더 */}
                            <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                <LinearGradient
                                    colors={[theme.primary + '20', theme.primary + '10']}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 24,
                                    }}>
                                    <Ionicons name="lock-closed" size={36} color={theme.primary} />
                                </LinearGradient>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontFamily: 'GoogleSans-Bold',
                                        color: theme.textPrimary,
                                        marginBottom: 8,
                                    }}>
                                    비밀번호 변경
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: theme.textSecondary,
                                        textAlign: 'center',
                                    }}>
                                    안전한 비밀번호로 계정을 보호하세요
                                </Text>
                            </View>

                            {/* 입력 필드 */}
                            <PasswordField
                                label="현재 비밀번호"
                                value={current}
                                onChange={handleCurrentPasswordChange}
                                placeholder="현재 비밀번호"
                                show={show === 'current'}
                                toggle={() => setShow(p => (p === 'current' ? null : 'current'))}
                                isValid={currentPasswordValid}
                                validating={validatingCurrent}
                            />
                            <PasswordField
                                label="새 비밀번호 (8자 이상)"
                                value={next}
                                onChange={setNext}
                                placeholder="새 비밀번호"
                                show={show === 'next'}
                                toggle={() => setShow(p => (p === 'next' ? null : 'next'))}
                                isNewPassword={true}
                                isValid={null}
                                validating={false}
                            />
                            <PasswordField
                                label="새 비밀번호 확인"
                                value={confirm}
                                onChange={(text) => {
                                    setConfirm(text);
                                    checkPasswordMatch(text);
                                }}
                                placeholder="새 비밀번호 확인"
                                show={show === 'confirm'}
                                toggle={() => setShow(p => (p === 'confirm' ? null : 'confirm'))}
                                isValid={passwordMatch}
                                validating={false}
                            />

                            {/* 버튼 */}
                            <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{
                                        flex: 1,
                                        padding: 14,
                                        borderRadius: 16,
                                        borderWidth: 2,
                                        borderColor: theme.outline + '40',
                                        alignItems: 'center',
                                        marginRight: 8,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: 'GoogleSans-Medium',
                                            color: theme.textPrimary,
                                        }}>
                                        취소
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleChange}
                                    disabled={loading || !pwValid(next) || next !== confirm}
                                    style={{
                                        flex: 1,
                                        padding: 14,
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: (loading || !pwValid(next) || next !== confirm) ? 0.6 : 1,
                                    }}>
                                    <LinearGradient
                                        colors={[theme.primary, theme.primary + 'DD']}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                    {loading ? (
                                        <ActivityIndicator color={theme.onPrimary} />
                                    ) : (
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: 'GoogleSans-Medium',
                                                color: theme.onPrimary,
                                            }}>
                                            변경하기
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

/* 5) ─────────────────── sub-component ─────────────────── */
function PasswordField({
    label,
    value,
    onChange,
    placeholder,
    show,
    toggle,
    isNewPassword = false,
    isValid = null,
    validating = false,
}: {
    label: string;
    value: string;
    onChange: (t: string) => void;
    placeholder: string;
    show: boolean;
    toggle: () => void;
    isNewPassword?: boolean;
    isValid?: boolean | null;
    validating?: boolean;
}) {
    const { theme } = useTheme();

    // 현재 비밀번호 검증 상태에 따른 테두리 색상
    const getBorderColor = () => {
        if (isValid === null) return theme.outline + '40';
        if (isValid) return '#00AA00';
        return '#FF4444';
    };

    // 새 비밀번호 확인 필드인지 확인
    const isConfirmField = label.includes('확인');

    return (
        <View style={{ marginBottom: 20 }}>
            <Text
                style={{
                    fontSize: 14,
                    fontFamily: 'GoogleSans-Medium',
                    color: theme.textPrimary,
                    marginBottom: 8,
                }}>
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: getBorderColor(),
                    borderRadius: 12,
                    backgroundColor: theme.background,
                    paddingHorizontal: 16,
                }}>
                <TextInput
                    style={{
                        flex: 1,
                        fontSize: 16,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textPrimary,
                        paddingVertical: 12,
                    }}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                />
                {/* 검증 상태 표시 */}
                {validating && (
                    <ActivityIndicator size="small" color={theme.textSecondary} style={{ marginRight: 8 }} />
                )}
                {isValid !== null && !validating && (
                    <Ionicons
                        name={isValid ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={isValid ? '#00AA00' : '#FF4444'}
                        style={{ marginRight: 8 }}
                    />
                )}
                <TouchableOpacity onPress={toggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons
                        name={show ? 'eye-off' : 'eye'}
                        size={20}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>
            {/* 새 비밀번호 확인 필드에 특별한 메시지 표시 */}
            {isConfirmField && value && (
                <View style={{
                    marginTop: 6,
                    paddingHorizontal: 4
                }}>
                    <Text style={{
                        fontSize: 11,
                        fontFamily: 'GoogleSans-Medium',
                        color: isValid ? '#00AA00' : '#FF4444',
                        textAlign: 'center'
                    }}>
                        {isValid ? '✅ 비밀번호가 일치합니다' : '❌ 비밀번호가 일치하지 않습니다'}
                    </Text>
                </View>
            )}
            {/* 새 비밀번호에만 강도 표시 */}
            {isNewPassword && <PasswordStrengthIndicator password={value} />}
        </View>
    );
}

// 비밀번호 강도 검증 함수
const checkPasswordStrength = (password: string) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { level: 'weak', color: '#FF4444', text: '약함' };
    if (score <= 3) return { level: 'fair', color: '#FFAA00', text: '보통' };
    if (score <= 4) return { level: 'good', color: '#00AA00', text: '좋음' };
    return { level: 'strong', color: '#00FF00', text: '강함' };
};

// 비밀번호 강도 표시 컴포넌트
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const { theme } = useTheme();
    const strength = checkPasswordStrength(password);

    if (!password) return null;

    return (
        <View style={{ marginTop: 12 }}>
            {/* 🎯 핵심 개선: 시각적 계층 강화 */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                paddingHorizontal: 4
            }}>
                {/* 애니메이션 타이밍: 자연스러운 물리 법칙 적용 */}
                <View style={{
                    flex: 1,
                    height: 6,
                    backgroundColor: theme.outline + '15',
                    borderRadius: 3,
                    overflow: 'hidden'
                }}>
                    <LinearGradient
                        colors={strength.level === 'weak' ? ['#FF4444', '#FF6666'] :
                            strength.level === 'fair' ? ['#FFAA00', '#FFCC00'] :
                                strength.level === 'good' ? ['#00AA00', '#00CC00'] :
                                    ['#00FF00', '#00DD00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            height: '100%',
                            borderRadius: 3,
                            width: `${Math.min((password.length / 12) * 100, 100)}%`,
                        }}
                    />
                </View>

                {/* 색상 심리학: 그라데이션으로 부드러운 느낌 연출 */}
                <View style={{
                    marginLeft: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: strength.color + '15',
                    borderWidth: 1,
                    borderColor: strength.color + '30'
                }}>
                    <Text style={{
                        fontSize: 11,
                        fontFamily: 'GoogleSans-Bold',
                        color: strength.color,
                        textAlign: 'center'
                    }}>
                        {strength.text}
                    </Text>
                </View>
            </View>

            {/* 인터랙션 피드백: 모든 터치에 시각적 응답 */}
            <View style={{
                backgroundColor: theme.surface,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.outline + '20'
            }}>
                {[
                    { key: 'length', text: '8자 이상', check: password.length >= 8 },
                    { key: 'uppercase', text: '대문자 포함', check: /[A-Z]/.test(password) },
                    { key: 'lowercase', text: '소문자 포함', check: /[a-z]/.test(password) },
                    { key: 'number', text: '숫자 포함', check: /[0-9]/.test(password) },
                    { key: 'special', text: '특수문자 포함', check: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                ].map((item, index) => (
                    <View key={item.key} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: index < 4 ? 6 : 0,
                        paddingVertical: 2
                    }}>
                        {/* 일관성: 전체 앱과 통일된 디자인 시스템 */}
                        <View style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: item.check ? '#00AA00' + '20' : theme.outline + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 8
                        }}>
                            <Ionicons
                                name={item.check ? 'checkmark' : 'ellipse'}
                                size={10}
                                color={item.check ? '#00AA00' : theme.textSecondary}
                            />
                        </View>
                        <Text style={{
                            fontSize: 12,
                            fontFamily: 'GoogleSans-Medium',
                            color: item.check ? '#00AA00' : theme.textSecondary,
                            flex: 1
                        }}>
                            {item.text}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};