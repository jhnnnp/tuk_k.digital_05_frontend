// src/screens/Auth/SignupScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    View,
    ScrollView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TermsModal from '../components/atoms/TermsModal';
import termsData from '../mocks/terms.json';

// Validation Schema
const schema = yup.object({
    agreeTerms: yup.bool().oneOf([true], '필수 약관에 동의해주세요.').required(),
    agreePrivacy: yup.bool().oneOf([true], '개인정보 약관에 동의해주세요.').required(),
    agreeMicrophone: yup.bool().oneOf([true], '마이크 접근 권한에 동의해주세요.').required(),
    agreeLocation: yup.bool().oneOf([true], '위치 접근 권한에 동의해주세요.').required(),
    agreeMarketing: yup.bool().optional(),
    name: yup.string().required('이름을 입력해주세요.'),
    birth: yup
        .string()
        .matches(/^\d{8}$/, 'YYYYMMDD 형식으로 입력하세요.')
        .required('생년월일을 입력해주세요.'),
    phone: yup
        .string()
        .matches(/^\d{10,11}$/, '유효한 휴대폰 번호를 입력하세요.')
        .required('휴대폰 번호를 입력해주세요.'),
    code: yup
        .string()
        .length(6, '6자리 인증번호를 입력해주세요.')
        .required('인증번호를 입력해주세요.'),
    email: yup.string().email('유효한 이메일을 입력하세요.').required('이메일을 입력해주세요.'),
    password: yup
        .string()
        .matches(
            /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/,
            '비밀번호는 8~16자, 소문자/숫자/특수문자를 각각 1개 이상 포함해야 합니다.'
        )
        .required('비밀번호를 입력해주세요.'),
    confirm: yup
        .string()
        .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
        .required('비밀번호 확인을 입력해주세요.'),
});

interface FormData {
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeMicrophone: boolean;
    agreeLocation: boolean;
    agreeMarketing: boolean;
    name: string;
    birth: string;
    phone: string;
    code: string;
    email: string;
    password: string;
    confirm: string;
}

export default function SignupScreen({ onBackToLogin }: { onBackToLogin?: () => void }) {
    const [step, setStep] = useState(1);
    const [certSent, setCertSent] = useState(false);
    const [timer, setTimer] = useState(180);
    const [loading, setLoading] = useState(false);
    const [certVerified, setCertVerified] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [selectedTerms, setSelectedTerms] = useState<{ title: string; content: string } | null>(null);
    const [mockVerificationCode, setMockVerificationCode] = useState<string>('');

    // 스크롤뷰 참조
    const scrollViewRef = React.useRef<ScrollView>(null);

    // 애니메이션 값들
    const slideAnim = useSharedValue(0);
    const fadeAnim = useSharedValue(1);
    const scaleAnim = useSharedValue(1);
    const progressAnim = useSharedValue(0);

    // 초기 프로그레스 바 애니메이션
    useEffect(() => {
        updateProgressAnimation(step);
    }, []);

    // 타이머 효과
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (certSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCertSent(false);
                        setCertVerified(false);
                        return 180;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [certSent, timer]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            agreeTerms: false,
            agreePrivacy: false,
            agreeMicrophone: false,
            agreeLocation: false,
            agreeMarketing: false,
            name: '',
            birth: '',
            phone: '',
            code: '',
            email: '',
            password: '',
            confirm: '',
        },
    });

    const agreeTerms = watch('agreeTerms');
    const agreePrivacy = watch('agreePrivacy');
    const agreeMicrophone = watch('agreeMicrophone');
    const agreeLocation = watch('agreeLocation');
    const agreeMarketing = watch('agreeMarketing');
    const allAgree = agreeTerms && agreePrivacy && agreeMicrophone && agreeLocation;

    const onSendCode = () => {
        setCertSent(true);
        setTimer(180);
        setCertVerified(false);

        // 개발환경에서 모킹 인증번호 생성
        if (__DEV__) {
            const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
            setMockVerificationCode(mockCode);
            console.log('📱 모킹 인증번호 발송:', mockCode);
            console.log('💡 데모 환경: 인증번호를 입력하면 자동으로 다음 단계로 넘어갑니다!');
        }
        // 실제로는 여기서 API 호출
        // const response = await fetch('/api/auth/send-code', {
        //     method: 'POST',
        //     body: JSON.stringify({ phone: watch('phone') })
        // });
    };

    const onVerifyCode = () => {
        const code = watch('code');
        if (code && code.length === 6) {
            // 개발환경에서 모킹 인증번호 검증
            if (__DEV__) {
                if (code === mockVerificationCode) {
                    setCertVerified(true);
                    console.log('✅ 인증번호 검증 성공!');
                } else {
                    console.log('❌ 인증번호가 일치하지 않습니다.');
                    console.log('📱 발송된 인증번호:', mockVerificationCode);
                    console.log('🔢 입력한 인증번호:', code);
                }
            } else {
                // 실제 환경에서는 API 호출
                setCertVerified(true);
                console.log('인증번호 검증:', code);
            }
        }
    };

    const showTermsModal = (termsKey: string) => {
        const terms = termsData[termsKey as keyof typeof termsData];
        if (terms) {
            setSelectedTerms(terms);
            setTermsModalVisible(true);
        }
    };

    const closeTermsModal = () => {
        setTermsModalVisible(false);
        setSelectedTerms(null);
    };

    // 애니메이션 스타일
    const slideAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideAnim.value }],
        opacity: fadeAnim.value,
    }));

    const scaleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressAnim.value * 100}%`,
    }));

    // 애니메이션 함수들
    const animateStepTransition = (direction: 'next' | 'prev', callback: () => void) => {
        const slideDistance = direction === 'next' ? -300 : 300;

        // 현재 화면을 밖으로 슬라이드
        slideAnim.value = withTiming(slideDistance, { duration: 300 });
        fadeAnim.value = withTiming(0, { duration: 200 });

        setTimeout(() => {
            // 콜백 실행 (스텝 변경)
            callback();

            // 새 화면을 반대 방향에서 시작
            slideAnim.value = -slideDistance;
            fadeAnim.value = 0;

            // 새 화면을 중앙으로 슬라이드
            slideAnim.value = withTiming(0, { duration: 300 });
            fadeAnim.value = withTiming(1, { duration: 200 });
        }, 200);
    };

    const updateProgressAnimation = (newStep: number) => {
        const progress = (newStep - 1) / 3; // 0~1 사이의 값으로 변환
        progressAnim.value = withSpring(progress, {
            damping: 15,
            stiffness: 100,
        });
    };

    // 부드러운 스크롤 초기화 함수
    const smoothScrollToTop = () => {
        if (scrollViewRef.current) {
            // 현재 스크롤 위치를 확인하고 부드럽게 상단으로 이동
            scrollViewRef.current.scrollTo({
                y: 0,
                animated: true
            });
        }
    };

    const onNext = () => {
        if (step < 4) {
            animateStepTransition('next', () => {
                const newStep = step + 1;
                setStep(newStep);
                updateProgressAnimation(newStep);
                // 스크롤 위치 초기화 (부드러운 애니메이션)
                setTimeout(() => {
                    smoothScrollToTop();
                }, 150); // 페이지 전환 애니메이션 완료 후 스크롤 실행
            });
        }
    };

    const onPrev = () => {
        if (step > 1) {
            animateStepTransition('prev', () => {
                const newStep = step - 1;
                setStep(newStep);
                updateProgressAnimation(newStep);
                // 스크롤 위치 초기화 (부드러운 애니메이션)
                setTimeout(() => {
                    smoothScrollToTop();
                }, 150); // 페이지 전환 애니메이션 완료 후 스크롤 실행
            });
        }
    };

    const onSubmit = (data: FormData) => {
        console.log('🚀 회원가입 제출 시작');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log('✅ 회원가입 완료, 다음 단계로 이동');
            onNext();
        }, 1200);
    };

    const isStep2Valid = () => {
        const name = watch('name');
        const birth = watch('birth');
        const phone = watch('phone');
        const code = watch('code');

        // 포맷팅된 값에서 숫자만 추출하여 검증
        const birthNumbers = birth.replace(/[^0-9]/g, '');
        const phoneNumbers = phone.replace(/[^0-9]/g, '');

        console.log('🔍 Step 2 유효성 검사 디버깅:');
        console.log('  - 이름:', name, '| 유효:', !!name);
        console.log('  - 생년월일 (원본):', birth);
        console.log('  - 생년월일 (숫자만):', birthNumbers, '| 길이:', birthNumbers.length);
        console.log('  - 휴대폰 (원본):', phone);
        console.log('  - 휴대폰 (숫자만):', phoneNumbers, '| 길이:', phoneNumbers.length);
        console.log('  - 인증번호:', code, '| 길이:', code?.length);
        console.log('  - 인증 완료:', certVerified);
        console.log('  - 인증 요청됨:', certSent);

        const isValid = name &&
            birthNumbers.length === 8 &&
            phoneNumbers.length >= 10 &&
            (!certSent || (certSent && code && code.length === 6 && certVerified));

        console.log('  - 최종 유효성:', isValid);
        console.log('  - 조건별 결과:');
        console.log('    * 이름 유효:', !!name);
        console.log('    * 생년월일 8자리:', birthNumbers.length === 8);
        console.log('    * 휴대폰 10자리 이상:', phoneNumbers.length >= 10);
        console.log('    * 인증 조건:', (!certSent || (certSent && code && code.length === 6 && certVerified)));

        return isValid;
    };

    const getStep2ValidationMessage = () => {
        const name = watch('name');
        const birth = watch('birth');
        const phone = watch('phone');
        const code = watch('code');

        // 포맷팅된 값에서 숫자만 추출하여 검증
        const birthNumbers = birth.replace(/[^0-9]/g, '');
        const phoneNumbers = phone.replace(/[^0-9]/g, '');

        console.log('🔍 Step 2 오류 메시지 디버깅:');
        console.log('  - 이름:', name, '| 빈 값:', !name);
        console.log('  - 생년월일 (숫자만):', birthNumbers, '| 길이:', birthNumbers.length, '| 부족:', birthNumbers.length < 8);
        console.log('  - 휴대폰 (숫자만):', phoneNumbers, '| 길이:', phoneNumbers.length, '| 부족:', phoneNumbers.length < 10);
        console.log('  - 인증번호:', code, '| 길이:', code?.length);
        console.log('  - 인증 요청됨:', certSent);
        console.log('  - 인증 완료:', certVerified);

        if (!name) {
            console.log('  ❌ 오류: 이름 미입력');
            return '이름을 입력해주세요';
        }
        if (!birthNumbers || birthNumbers.length < 8) {
            console.log('  ❌ 오류: 생년월일 부족 (현재:', birthNumbers.length, '자리)');
            return '생년월일을 완전히 입력해주세요';
        }
        if (!phoneNumbers || phoneNumbers.length < 10) {
            console.log('  ❌ 오류: 휴대폰 번호 부족 (현재:', phoneNumbers.length, '자리)');
            return '휴대폰 번호를 완전히 입력해주세요';
        }
        if (certSent && !code) {
            console.log('  ❌ 오류: 인증번호 미입력');
            return '인증번호를 입력해주세요';
        }
        if (certSent && code && code.length !== 6) {
            console.log('  ❌ 오류: 인증번호 6자리 아님 (현재:', code.length, '자리)');
            return '인증번호 6자리를 입력해주세요';
        }
        if (certSent && code && code.length === 6 && !certVerified) {
            console.log('  ❌ 오류: 인증번호 미확인');
            return '인증번호를 확인해주세요';
        }

        console.log('  ✅ 모든 조건 통과');
        return '';
    };

    // 생년월일 자동 포맷팅 함수
    const formatBirthDate = (text: string) => {
        // 숫자만 추출
        const numbers = text.replace(/[^0-9]/g, '');

        console.log('📅 생년월일 포맷팅:', text, '→ 숫자만:', numbers, '→ 길이:', numbers.length);

        let result;
        if (numbers.length <= 4) {
            result = numbers;
        } else if (numbers.length <= 6) {
            result = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        } else {
            result = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }

        console.log('  결과:', result);
        return result;
    };

    // 휴대폰 번호 자동 포맷팅 함수
    const formatPhoneNumber = (text: string) => {
        // 숫자만 추출
        const numbers = text.replace(/[^0-9]/g, '');

        console.log('📱 휴대폰 번호 포맷팅:', text, '→ 숫자만:', numbers, '→ 길이:', numbers.length);

        let result;
        if (numbers.length <= 3) {
            result = numbers;
        } else if (numbers.length <= 7) {
            result = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            result = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }

        console.log('  결과:', result);
        return result;
    };

    // 실시간 유효성 검사 함수들
    const validateEmail = (email: string) => {
        if (!email) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return '올바른 이메일 형식을 입력해주세요';
        return '';
    };

    const validatePassword = (password: string) => {
        if (!password) return '';
        if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다';
        if (!/(?=.*[a-zA-Z])/.test(password)) return '영문자를 포함해주세요';
        if (!/(?=.*[0-9])/.test(password)) return '숫자를 포함해주세요';
        if (!/(?=.*[!@#$%^&*])/.test(password)) return '특수문자를 포함해주세요';
        return '';
    };

    const validatePasswordConfirm = (confirm: string, password: string) => {
        if (!confirm) return '';
        if (confirm !== password) return '비밀번호가 일치하지 않습니다';
        return '';
    };

    // Step 3 유효성 검사 함수
    const isStep3Valid = () => {
        const email = watch('email');
        const password = watch('password');
        const confirm = watch('confirm');

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const confirmError = validatePasswordConfirm(confirm, password);

        const isValid = !emailError && !passwordError && !confirmError && email && password && confirm;
        return isValid;
    };

    const getStep3ValidationMessage = () => {
        const email = watch('email');
        const password = watch('password');
        const confirm = watch('confirm');

        if (!email) return '이메일을 입력해주세요';
        const emailError = validateEmail(email);
        if (emailError) return emailError;
        if (!password) return '비밀번호를 입력해주세요';
        const passwordError = validatePassword(password);
        if (passwordError) return passwordError;
        if (!confirm) return '비밀번호 확인을 입력해주세요';
        const confirmError = validatePasswordConfirm(confirm, password);
        if (confirmError) return confirmError;
        return '';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingTop: 30 }}
                >
                    <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
                        {/* 브랜드 헤더 */}
                        <View style={{ alignItems: 'center', marginBottom: 60 }}>
                            <Text style={{ color: '#29588A', fontSize: 48, fontWeight: 'bold', letterSpacing: 2 }}>TIBO</Text>
                            <Text style={{ color: '#29588A', fontSize: 18, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 }}>KDT PROJECT TEAM 5</Text>
                        </View>

                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            {/* 프로그레스 바 */}
                            <View style={{ width: '100%', maxWidth: 300, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                                    <Text style={{ color: '#29588A', fontSize: 14, fontWeight: '600' }}>STEP {step} of 4</Text>
                                </View>
                                <View style={{
                                    width: '100%', height: 6, backgroundColor: '#E5E7EB',
                                    borderRadius: 3, overflow: 'hidden'
                                }}>
                                    <Animated.View style={[{
                                        height: '100%',
                                        backgroundColor: '#29588A', borderRadius: 3,
                                        shadowColor: '#29588A', shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.3, shadowRadius: 2, elevation: 2
                                    }, progressAnimatedStyle]} />
                                </View>
                            </View>

                            {/* 스텝 인디케이터 */}
                            <View style={{ width: '100%', maxWidth: 300, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                {[1, 2, 3, 4].map((stepNumber) => (
                                    <View key={stepNumber} style={{ alignItems: 'center' }}>
                                        <View style={{
                                            width: 28, height: 28, borderRadius: 14,
                                            backgroundColor: step >= stepNumber ? '#29588A' : '#E5E7EB',
                                            justifyContent: 'center', alignItems: 'center',
                                            shadowColor: step >= stepNumber ? '#29588A' : 'transparent',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: step >= stepNumber ? 0.3 : 0,
                                            shadowRadius: 4, elevation: step >= stepNumber ? 2 : 0
                                        }}>
                                            {step > stepNumber ? (
                                                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                                            ) : (
                                                <Text style={{
                                                    color: step >= stepNumber ? 'white' : '#9CA3AF',
                                                    fontSize: 12,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {stepNumber}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={{
                                            color: step >= stepNumber ? '#29588A' : '#9CA3AF',
                                            fontSize: 10,
                                            fontWeight: '500',
                                            marginTop: 4
                                        }}>
                                            {stepNumber === 1 ? '약관' :
                                                stepNumber === 2 ? '인증' :
                                                    stepNumber === 3 ? '계정' : '완료'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {step === 1 && (
                            <Animated.View style={[{ width: '100%', maxWidth: 400 }, slideAnimatedStyle]}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>약관 동의</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>서비스 이용을 위해 약관에 동의해 주세요.</Text>
                                </View>

                                <View style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    borderRadius: 12,
                                    padding: 20,
                                    marginBottom: 24,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                    elevation: 5,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                                        onPress={() => {
                                            setValue('agreeTerms', !allAgree);
                                            setValue('agreePrivacy', !allAgree);
                                            setValue('agreeMicrophone', !allAgree);
                                            setValue('agreeLocation', !allAgree);
                                            setValue('agreeMarketing', !allAgree);
                                        }}
                                    >
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 6,
                                            backgroundColor: allAgree ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: allAgree ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {allAgree && <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 16, fontWeight: '600' }}>전체 동의</Text>
                                    </TouchableOpacity>

                                    <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 16 }} />

                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                        onPress={() => setValue('agreeTerms', !agreeTerms)}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            backgroundColor: agreeTerms ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: agreeTerms ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {agreeTerms && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>
                                            <Text style={{ color: '#29588A', textDecorationLine: 'underline' }} onPress={() => showTermsModal('termsOfService')}>
                                                이용약관
                                            </Text>
                                            {' 동의 (필수)'}
                                        </Text>
                                    </TouchableOpacity>
                                    {errors.agreeTerms && <Text style={{ color: '#ff3b30', fontSize: 13, marginLeft: 32, marginTop: 4 }}>{errors.agreeTerms.message}</Text>}

                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                        onPress={() => setValue('agreePrivacy', !agreePrivacy)}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            backgroundColor: agreePrivacy ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: agreePrivacy ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {agreePrivacy && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>
                                            <Text style={{ color: '#29588A', textDecorationLine: 'underline' }} onPress={() => showTermsModal('privacyPolicy')}>
                                                개인정보 수집·이용
                                            </Text>
                                            {' 동의 (필수)'}
                                        </Text>
                                    </TouchableOpacity>
                                    {errors.agreePrivacy && <Text style={{ color: '#ff3b30', fontSize: 13, marginLeft: 32, marginTop: 4 }}>{errors.agreePrivacy.message}</Text>}

                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                        onPress={() => setValue('agreeMicrophone', !watch('agreeMicrophone'))}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            backgroundColor: watch('agreeMicrophone') ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: watch('agreeMicrophone') ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {watch('agreeMicrophone') && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>
                                            <Text style={{ color: '#29588A', textDecorationLine: 'underline' }} onPress={() => showTermsModal('microphonePermission')}>
                                                마이크 접근 권한
                                            </Text>
                                            {' 동의 (필수)'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                        onPress={() => setValue('agreeLocation', !watch('agreeLocation'))}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            backgroundColor: watch('agreeLocation') ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: watch('agreeLocation') ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {watch('agreeLocation') && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>
                                            <Text style={{ color: '#29588A', textDecorationLine: 'underline' }} onPress={() => showTermsModal('locationPermission')}>
                                                위치 접근 권한
                                            </Text>
                                            {' 동의 (필수)'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                        onPress={() => setValue('agreeMarketing', !watch('agreeMarketing'))}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            backgroundColor: watch('agreeMarketing') ? '#29588A' : 'white',
                                            borderWidth: 2, borderColor: watch('agreeMarketing') ? '#29588A' : '#D1D5DB',
                                            marginRight: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {watch('agreeMarketing') && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>
                                            <Text style={{ color: '#29588A', textDecorationLine: 'underline' }} onPress={() => showTermsModal('marketingConsent')}>
                                                마케팅 정보 수신
                                            </Text>
                                            {' 동의 (선택)'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={{
                                        backgroundColor: allAgree ? '#29588A' : '#E5E7EB',
                                        paddingVertical: 16, borderRadius: 12, alignItems: 'center',
                                        shadowColor: allAgree ? '#29588A' : 'transparent',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: allAgree ? 0.2 : 0,
                                        shadowRadius: 4,
                                        elevation: allAgree ? 4 : 0
                                    }}
                                    disabled={!allAgree}
                                    onPress={onNext}
                                >
                                    <Text style={{ color: allAgree ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: '600' }}>다음</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View style={[{ width: '100%', maxWidth: 400 }, slideAnimatedStyle]}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{
                                        color: '#1F2937',
                                        fontSize: 32,
                                        fontWeight: '800',
                                        marginBottom: 12,
                                        textShadowColor: 'rgba(0, 0, 0, 0.1)',
                                        textShadowOffset: { width: 0, height: 1 },
                                        textShadowRadius: 2
                                    }}>본인 인증</Text>
                                    <Text style={{
                                        color: '#6B7280',
                                        fontSize: 15,
                                        textAlign: 'center',
                                        lineHeight: 22,
                                        fontWeight: '400'
                                    }}>정보를 입력하고 인증번호를 받아주세요.</Text>
                                </View>

                                <View style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    borderRadius: 12,
                                    padding: 20,
                                    marginBottom: 24,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                    elevation: 5,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                    <Controller name="name" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{
                                                color: '#374151',
                                                fontSize: 15,
                                                fontWeight: '600',
                                                marginBottom: 10,
                                                letterSpacing: 0.5
                                            }}>이름</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff',
                                                    height: 52,
                                                    borderRadius: 12,
                                                    paddingHorizontal: 18,
                                                    fontSize: 16,
                                                    color: '#1F2937',
                                                    borderWidth: 1.5,
                                                    borderColor: errors.name ? '#EF4444' : '#E5E7EB',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.08,
                                                    shadowRadius: 4,
                                                    elevation: 2
                                                }}
                                                placeholder="이름을 입력하세요"
                                                placeholderTextColor="#6B7280"
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.name && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' }}>{errors.name.message}</Text>}
                                        </View>
                                    )} />

                                    <Controller name="birth" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{
                                                color: '#374151',
                                                fontSize: 15,
                                                fontWeight: '600',
                                                marginBottom: 10,
                                                letterSpacing: 0.5
                                            }}>생년월일</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff',
                                                    height: 52,
                                                    borderRadius: 12,
                                                    paddingHorizontal: 18,
                                                    fontSize: 16,
                                                    color: '#1F2937',
                                                    borderWidth: 1.5,
                                                    borderColor: errors.birth ? '#EF4444' : '#E5E7EB',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.08,
                                                    shadowRadius: 4,
                                                    elevation: 2
                                                }}
                                                placeholder="YYYY-MM-DD"
                                                placeholderTextColor="#6B7280"
                                                keyboardType="numeric"
                                                maxLength={10}
                                                value={field.value}
                                                onChangeText={(text) => {
                                                    const formatted = formatBirthDate(text);
                                                    field.onChange(formatted);
                                                }}
                                            />
                                            {errors.birth && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' }}>{errors.birth.message}</Text>}
                                        </View>
                                    )} />

                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{
                                            color: '#374151',
                                            fontSize: 15,
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            letterSpacing: 0.5
                                        }}>휴대폰 번호</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Controller name="phone" control={control} render={({ field }) => (
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff',
                                                        flex: 1,
                                                        height: 52,
                                                        borderRadius: 12,
                                                        paddingHorizontal: 18,
                                                        fontSize: 16,
                                                        color: '#1F2937',
                                                        borderWidth: 1.5,
                                                        borderColor: errors.phone ? '#EF4444' : '#E5E7EB',
                                                        marginRight: 12,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.08,
                                                        shadowRadius: 4,
                                                        elevation: 2
                                                    }}
                                                    placeholder="010-1234-5678"
                                                    placeholderTextColor="#6B7280"
                                                    keyboardType="phone-pad"
                                                    maxLength={13}
                                                    value={field.value}
                                                    onChangeText={(text) => {
                                                        const formatted = formatPhoneNumber(text);
                                                        field.onChange(formatted);
                                                    }}
                                                />
                                            )} />
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#29588A',
                                                    height: 52,
                                                    paddingHorizontal: 18,
                                                    borderRadius: 12,
                                                    minWidth: 90,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    shadowColor: '#29588A',
                                                    shadowOffset: { width: 0, height: 3 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 6,
                                                    elevation: 4
                                                }}
                                                activeOpacity={0.7}
                                                onPress={onSendCode}
                                            >
                                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{certSent ? '재요청' : '인증요청'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {errors.phone && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' }}>{errors.phone.message}</Text>}
                                    </View>

                                    {certSent && (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{
                                                color: '#374151',
                                                fontSize: 15,
                                                fontWeight: '600',
                                                marginBottom: 10,
                                                letterSpacing: 0.5
                                            }}>인증번호</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                                <Controller name="code" control={control} render={({ field }) => (
                                                    <TextInput
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            flex: 1,
                                                            height: 52,
                                                            borderRadius: 12,
                                                            paddingHorizontal: 18,
                                                            fontSize: 16,
                                                            color: '#1F2937',
                                                            borderWidth: 1.5,
                                                            borderColor: errors.code ? '#EF4444' : '#E5E7EB',
                                                            marginRight: 12,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.08,
                                                            shadowRadius: 4,
                                                            elevation: 2
                                                        }}
                                                        placeholder="인증번호 6자리"
                                                        placeholderTextColor="#6B7280"
                                                        keyboardType="numeric"
                                                        maxLength={6}
                                                        value={field.value}
                                                        onChangeText={(text) => {
                                                            field.onChange(text);
                                                            // 6자리 입력 완료 시 자동 검증 (데모 환경)
                                                            if (__DEV__ && text.length === 6) {
                                                                setTimeout(() => {
                                                                    onVerifyCode();
                                                                }, 500);
                                                            }
                                                        }}
                                                    />
                                                )} />
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: certVerified ? '#10B981' : '#29588A',
                                                        height: 52,
                                                        paddingHorizontal: 18,
                                                        borderRadius: 12,
                                                        minWidth: 90,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        shadowColor: certVerified ? '#10B981' : '#29588A',
                                                        shadowOffset: { width: 0, height: 3 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 6,
                                                        elevation: 4
                                                    }}
                                                    disabled={!watch('code') || watch('code').length !== 6}
                                                    activeOpacity={0.7}
                                                    onPress={onVerifyCode}
                                                >
                                                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                                                        {certVerified ? '✓ 인증완료' : '인증확인'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            {errors.code && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' }}>{errors.code.message}</Text>}
                                            <View style={{
                                                backgroundColor: 'rgba(41, 88, 138, 0.1)',
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 8,
                                                marginTop: 12,
                                                alignSelf: 'flex-start'
                                            }}>
                                                <Text style={{
                                                    color: '#29588A',
                                                    fontSize: 13,
                                                    fontWeight: '600',
                                                    letterSpacing: 0.5
                                                }}>⏱️ 남은 시간: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</Text>
                                            </View>
                                            {__DEV__ && mockVerificationCode && (
                                                <View style={{
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 8,
                                                    borderRadius: 8,
                                                    marginTop: 8,
                                                    alignSelf: 'flex-start'
                                                }}>
                                                    <Text style={{
                                                        color: '#10B981',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        letterSpacing: 0.5
                                                    }}>💡 데모: 인증번호 {mockVerificationCode}</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 8
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(41, 88, 138, 0.1)'
                                        }}
                                        activeOpacity={0.7}
                                        onPress={onPrev}
                                    >
                                        <Text style={{
                                            color: '#29588A',
                                            fontSize: 16,
                                            fontWeight: '600',
                                            letterSpacing: 0.5
                                        }}>← 이전</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: isStep2Valid() ? '#29588A' : '#E5E7EB',
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            shadowColor: '#29588A',
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: isStep2Valid() ? 0.25 : 0,
                                            shadowRadius: 6,
                                            elevation: isStep2Valid() ? 4 : 0
                                        }}
                                        disabled={!isStep2Valid()}
                                        activeOpacity={0.7}
                                        onPress={onNext}
                                    >
                                        <Text style={{
                                            color: isStep2Valid() ? '#fff' : '#9CA3AF',
                                            fontSize: 16,
                                            fontWeight: '600',
                                            letterSpacing: 0.5
                                        }}>다음 →</Text>
                                    </TouchableOpacity>
                                </View>
                                {!isStep2Valid() && getStep2ValidationMessage() && (
                                    <View style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                        marginTop: 8,
                                        alignSelf: 'center'
                                    }}>
                                        <Text style={{
                                            color: '#EF4444',
                                            fontSize: 13,
                                            fontWeight: '500',
                                            textAlign: 'center'
                                        }}>⚠️ {getStep2ValidationMessage()}</Text>
                                    </View>
                                )}
                            </Animated.View>
                        )}

                        {step === 3 && (
                            <Animated.View style={[{ width: '100%', maxWidth: 400 }, slideAnimatedStyle]}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>계정 정보 설정</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>이메일과 비밀번호를 입력해 주세요.</Text>
                                </View>

                                <View style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    borderRadius: 12,
                                    padding: 20,
                                    marginBottom: 24,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                    elevation: 5,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                    <Controller name="email" control={control} render={({ field }) => {
                                        const emailError = validateEmail(field.value);
                                        return (
                                            <View style={{ marginBottom: 16 }}>
                                                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>이메일</Text>
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                        paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                        borderWidth: 1, borderColor: emailError ? '#EF4444' : '#D1D5DB'
                                                    }}
                                                    placeholder="이메일을 입력하세요"
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    value={field.value}
                                                    onChangeText={field.onChange}
                                                />
                                                {emailError && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4, fontWeight: '500' }}>{emailError}</Text>}
                                            </View>
                                        );
                                    }} />

                                    <Controller name="password" control={control} render={({ field }) => {
                                        const passwordError = validatePassword(field.value);
                                        return (
                                            <View style={{ marginBottom: 16 }}>
                                                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>비밀번호</Text>
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                        paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                        borderWidth: 1, borderColor: passwordError ? '#EF4444' : '#D1D5DB'
                                                    }}
                                                    placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                                    secureTextEntry
                                                    value={field.value}
                                                    onChangeText={field.onChange}
                                                />
                                                {passwordError && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4, fontWeight: '500' }}>{passwordError}</Text>}
                                            </View>
                                        );
                                    }} />

                                    <Controller name="confirm" control={control} render={({ field }) => {
                                        const confirmError = validatePasswordConfirm(field.value, watch('password'));
                                        return (
                                            <View style={{ marginBottom: 16 }}>
                                                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>비밀번호 확인</Text>
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                        paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                        borderWidth: 1, borderColor: confirmError ? '#EF4444' : '#D1D5DB'
                                                    }}
                                                    placeholder="비밀번호를 다시 입력하세요"
                                                    secureTextEntry
                                                    value={field.value}
                                                    onChangeText={field.onChange}
                                                />
                                                {confirmError && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4, fontWeight: '500' }}>{confirmError}</Text>}
                                            </View>
                                        );
                                    }} />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                                        onPress={onPrev}
                                    >
                                        <Text style={{ color: '#29588A', fontSize: 16, fontWeight: '500' }}>이전</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: isStep3Valid() ? '#29588A' : '#E5E7EB',
                                            paddingVertical: 16, paddingHorizontal: 32,
                                            borderRadius: 12, alignItems: 'center',
                                            shadowColor: '#29588A',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isStep3Valid() ? 0.2 : 0,
                                            shadowRadius: 4,
                                            elevation: isStep3Valid() ? 4 : 0
                                        }}
                                        disabled={!isStep3Valid()}
                                        onPress={() => {
                                            console.log('🔘 회원가입 버튼 클릭됨!');
                                            if (isStep3Valid()) {
                                                console.log('✅ 유효성 통과, 제출 실행');
                                                try {
                                                    // react-hook-form의 handleSubmit 대신 직접 호출
                                                    const formData = {
                                                        email: watch('email'),
                                                        password: watch('password'),
                                                        confirm: watch('confirm'),
                                                        name: watch('name'),
                                                        birth: watch('birth'),
                                                        phone: watch('phone'),
                                                        code: watch('code'),
                                                        agreeTerms: watch('agreeTerms'),
                                                        agreePrivacy: watch('agreePrivacy'),
                                                        agreeMicrophone: watch('agreeMicrophone'),
                                                        agreeLocation: watch('agreeLocation'),
                                                        agreeMarketing: watch('agreeMarketing')
                                                    };
                                                    console.log('📋 수집된 폼 데이터:', formData);
                                                    onSubmit(formData);
                                                } catch (error) {
                                                    console.log('❌ 회원가입 제출 실패:', error);
                                                }
                                            } else {
                                                console.log('❌ 유효성 검사 실패');
                                            }
                                        }}
                                    >
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: isStep3Valid() ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: '600' }}>회원가입</Text>}
                                    </TouchableOpacity>
                                </View>
                                {!isStep3Valid() && getStep3ValidationMessage() && (
                                    <View style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                        marginTop: 8,
                                        alignSelf: 'center'
                                    }}>
                                        <Text style={{
                                            color: '#EF4444',
                                            fontSize: 13,
                                            fontWeight: '500',
                                            textAlign: 'center'
                                        }}>⚠️ {getStep3ValidationMessage()}</Text>
                                    </View>
                                )}
                            </Animated.View>
                        )}

                        {step === 4 && (
                            <Animated.View style={[{ width: '100%', maxWidth: 400, alignItems: 'center' }, slideAnimatedStyle]}>
                                {/* 축하 이모지와 아이콘 */}
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <View style={{
                                        width: 80, height: 80, borderRadius: 40,
                                        backgroundColor: '#E8F4FD', justifyContent: 'center', alignItems: 'center',
                                        marginBottom: 24, shadowColor: '#29588A', shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
                                    }}>
                                        <Text style={{ fontSize: 40 }}>🎉</Text>
                                    </View>
                                    <Text style={{ color: '#222', fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>환영합니다!</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 18, textAlign: 'center', lineHeight: 26, marginBottom: 8 }}>
                                        회원가입이 완료되었습니다
                                    </Text>
                                    <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                                        이제 TIBO의 모든 서비스를 이용하실 수 있습니다
                                    </Text>
                                </View>

                                {/* 완료 정보 카드 */}
                                <View style={{
                                    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 32,
                                    width: '100%', borderWidth: 1, borderColor: '#E5E7EB'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 12,
                                            backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
                                            marginRight: 12
                                        }}>
                                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                        </View>
                                        <Text style={{ color: '#222', fontSize: 16, fontWeight: '600' }}>계정 생성 완료</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 12,
                                            backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
                                            marginRight: 12
                                        }}>
                                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                        </View>
                                        <Text style={{ color: '#6B7280', fontSize: 14 }}>본인 인증 완료</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 12,
                                            backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
                                            marginRight: 12
                                        }}>
                                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                        </View>
                                        <Text style={{ color: '#6B7280', fontSize: 14 }}>약관 동의 완료</Text>
                                    </View>
                                </View>

                                {/* 버튼들 */}
                                <View style={{ width: '100%' }}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#29588A', paddingVertical: 16, paddingHorizontal: 32,
                                            borderRadius: 12, alignItems: 'center', marginBottom: 12,
                                            shadowColor: '#29588A', shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
                                        }}
                                        activeOpacity={0.8}
                                        onPress={onBackToLogin}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>로그인으로 이동</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 32,
                                            borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB'
                                        }}
                                        activeOpacity={0.6}
                                        onPress={() => setStep(1)}
                                    >
                                        <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '500' }}>홈으로 이동</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* 약관 모달 */}
            <TermsModal
                visible={termsModalVisible}
                onClose={closeTermsModal}
                title={selectedTerms?.title || ''}
                content={selectedTerms?.content || ''}
            />
        </SafeAreaView>
    );
}
