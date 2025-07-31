import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../styles/ThemeProvider';
import { isValidEmail } from '../../utils/validation';
import ModalStyles from '../../styles/ModalStyles';

interface FindPasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

type Step = 'email' | 'verification' | 'result';

// 이메일 포맷팅 함수
const formatEmail = (text: string): string => {
    // 소문자로 변환하고 앞뒤 공백 제거
    return text.toLowerCase().trim();
};

export default function FindPasswordModal({ visible, onClose }: FindPasswordModalProps) {
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [visibleConfirmPassword, setVisibleConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const modalScale = useSharedValue(0.8);
    const modalOpacity = useSharedValue(0);

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value,
    }));

    React.useEffect(() => {
        if (visible) {
            modalOpacity.value = withTiming(1, { duration: 300 });
        } else {
            modalOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    // 이메일 입력 처리
    const handleEmailChange = (text: string) => {
        const formatted = formatEmail(text);
        setEmail(formatted);
        clearError();
    };

    // 인증번호 발송
    const handleSendVerificationCode = async () => {
        if (!email.trim()) {
            setError('이메일을 입력해주세요.');
            return;
        }

        if (!isValidEmail(email)) {
            setError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://192.168.175.160:3000/api/auth/find-password/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep('verification');
            } else {
                setError(data.error || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            setError('서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 인증번호 확인 및 새 비밀번호 설정
    const handleResetPassword = async () => {
        if (!code.trim()) {
            setError('인증번호를 입력해주세요.');
            return;
        }

        if (!newPassword.trim()) {
            setError('새 비밀번호를 입력해주세요.');
            return;
        }

        if (newPassword.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://192.168.175.160:3000/api/auth/find-password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep('result');
            } else {
                setError(data.error || '비밀번호 재설정에 실패했습니다.');
            }
        } catch (error) {
            setError('서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setStep('email');
        onClose();
    };

    const clearError = () => {
        if (error) setError('');
    };

    const renderEmailStep = () => (
        <>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                가입 시 등록한 이메일 주소를 입력하시면{'\n'}인증번호를 발송해드립니다.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>이메일</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="이메일 주소를 입력하세요"
                        placeholderTextColor="#94A3B8"
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {error ? (
                <Animated.View
                    entering={FadeIn.springify()}
                    style={[styles.errorContainer, { backgroundColor: theme.error + '15' }]}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={theme.error}
                        style={styles.errorIcon}
                    />
                    <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                </Animated.View>
            ) : null}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.outline }]}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.findButton,
                        { backgroundColor: loading ? theme.primary + '80' : theme.primary },
                    ]}
                    onPress={handleSendVerificationCode}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                        <Text style={[styles.findButtonText, { color: theme.onPrimary }]}>인증번호 발송</Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderVerificationStep = () => (
        <>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                발송된 인증번호와 새 비밀번호를 입력하세요.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>인증번호</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons
                        name="key-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="인증번호 6자리를 입력하세요"
                        placeholderTextColor="#94A3B8"
                        value={code}
                        onChangeText={(text) => {
                            setCode(text);
                            clearError();
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>새 비밀번호</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="새 비밀번호를 입력하세요"
                        placeholderTextColor="#94A3B8"
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            clearError();
                        }}
                        secureTextEntry={!visiblePassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setVisiblePassword(!visiblePassword)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={visiblePassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>비밀번호 확인</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="비밀번호를 다시 입력하세요"
                        placeholderTextColor="#94A3B8"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            clearError();
                        }}
                        secureTextEntry={!visibleConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setVisibleConfirmPassword(!visibleConfirmPassword)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={visibleConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {error ? (
                <Animated.View
                    entering={FadeIn.springify()}
                    style={[styles.errorContainer, { backgroundColor: theme.error + '15' }]}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={theme.error}
                        style={styles.errorIcon}
                    />
                    <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                </Animated.View>
            ) : null}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.outline }]}
                    onPress={() => setStep('email')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>뒤로</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.findButton,
                        { backgroundColor: loading ? theme.primary + '80' : theme.primary },
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                        <Text style={[styles.findButtonText, { color: theme.onPrimary }]}>비밀번호 변경</Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderResultStep = () => (
        <>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                비밀번호 재설정이 완료되었습니다.
            </Text>

            <View style={styles.resultContainer}>
                <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color="#28a745"
                    style={styles.resultIcon}
                />
                <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>비밀번호 재설정 완료</Text>
                <Text style={[styles.resultDescription, { color: theme.textSecondary }]}>
                    새로운 비밀번호로 로그인하실 수 있습니다.
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.findButton, { backgroundColor: theme.primary }]}
                    onPress={handleClose}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.findButtonText, { color: theme.onPrimary }]}>확인</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={ModalStyles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={ModalStyles.container}
                >
                    <View style={ModalStyles.blurContainer}>
                        <Animated.View
                            style={[ModalStyles.modalContainer, modalAnimatedStyle]}
                        >
                            {/* 헤더 */}
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>비밀번호 찾기</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={theme.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {step === 'email' && renderEmailStep()}
                            {step === 'verification' && renderVerificationStep()}
                            {step === 'result' && renderResultStep()}
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'GoogleSans-Bold',
        fontWeight: '600',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Regular',
        lineHeight: 22,
        marginBottom: 28,
        textAlign: 'center',
        color: '#A0A4AB',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Medium',
        marginBottom: 10,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'GoogleSans-Regular',
    },
    eyeIcon: {
        padding: 8,
        marginLeft: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorIcon: {
        marginRight: 6,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'GoogleSans-Medium',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'GoogleSans-Medium',
    },
    findButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    findButtonText: {
        fontSize: 16,
        fontFamily: 'GoogleSans-Bold',
    },
    resultContainer: {
        alignItems: 'center',
        marginBottom: 28,
    },
    resultIcon: {
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontFamily: 'GoogleSans-Bold',
        marginBottom: 10,
    },
    resultDescription: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
}); 