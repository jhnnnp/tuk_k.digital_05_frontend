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
import ModalStyles from '../../styles/ModalStyles';

interface FindIdModalProps {
    visible: boolean;
    onClose: () => void;
}

type Step = 'phone' | 'verification' | 'result';

// 전화번호 포맷팅 함수
const formatPhoneNumber = (text: string): string => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');

    // 길이에 따라 하이픈 추가
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
};

export default function FindIdModal({ visible, onClose }: FindIdModalProps) {
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [foundEmail, setFoundEmail] = useState('');

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

    // 전화번호 입력 처리
    const handlePhoneChange = (text: string) => {
        const formatted = formatPhoneNumber(text);
        setPhone(formatted);
        clearError();
    };

    // 전화번호 인증번호 발송
    const handleSendVerificationCode = async () => {
        // 하이픈 제거한 전화번호로 API 호출
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        if (!cleanPhone.trim()) {
            setError('휴대폰 번호를 입력해주세요.');
            return;
        }

        if (cleanPhone.length !== 11) {
            setError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://192.168.175.160:3000/api/auth/phone/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: cleanPhone }),
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

    // 인증번호 확인 및 아이디 찾기
    const handleVerifyCode = async () => {
        if (!code.trim()) {
            setError('인증번호를 입력해주세요.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const response = await fetch('http://192.168.175.160:3000/api/auth/find-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: cleanPhone, code }),
            });

            const data = await response.json();

            if (response.ok) {
                setFoundEmail(data.email);
                setStep('result');
            } else {
                setError(data.error || '인증번호가 올바르지 않습니다.');
            }
        } catch (error) {
            setError('서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPhone('');
        setCode('');
        setError('');
        setFoundEmail('');
        setStep('phone');
        onClose();
    };

    const clearError = () => {
        if (error) setError('');
    };

    const renderPhoneStep = () => (
        <>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                가입 시 등록한 휴대폰 번호를 입력하시면{'\n'}인증번호를 발송해드립니다.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>휴대폰 번호</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons
                        name="call-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="휴대폰 번호를 입력하세요"
                        placeholderTextColor="#94A3B8"
                        value={phone}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
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
                발송된 인증번호를 입력하시면{'\n'}아이디 정보를 확인해드립니다.
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
                    onPress={() => setStep('phone')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>뒤로</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.findButton,
                        { backgroundColor: loading ? theme.primary + '80' : theme.primary },
                    ]}
                    onPress={handleVerifyCode}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                        <Text style={[styles.findButtonText, { color: theme.onPrimary }]}>아이디 찾기</Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderResultStep = () => (
        <>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                아이디 찾기가 완료되었습니다.
            </Text>

            <View style={styles.resultContainer}>
                <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color="#28a745"
                    style={styles.resultIcon}
                />
                <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>아이디 찾기 완료</Text>
                <Text style={[styles.resultEmail, { color: theme.textSecondary }]}>{foundEmail}</Text>
                <Text style={[styles.resultDescription, { color: theme.textSecondary }]}>
                    위의 이메일 주소가 귀하의 아이디입니다.
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
                                <Text style={[styles.title, { color: theme.textPrimary }]}>아이디 찾기</Text>
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

                            {step === 'phone' && renderPhoneStep()}
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
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        width: '98%',
        maxWidth: 500,
        minWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        alignSelf: 'center',
    },
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
    resultEmail: {
        fontSize: 17,
        fontFamily: 'GoogleSans-Medium',
        marginBottom: 10,
        textAlign: 'center',
    },
    resultDescription: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
}); 