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
    Switch,
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
import { API_BASE_URL } from '../config/api';
// Firebase 관련 코드 제거됨

// Validation Schema
const schema = yup.object({
    agreeTerms: yup.bool().oneOf([true], '필수 약관에 동의해주세요.').required(),
    agreePrivacy: yup.bool().oneOf([true], '개인정보 약관에 동의해주세요.').required(),
    agreeMicrophone: yup.bool().oneOf([true], '마이크 접근 권한에 동의해주세요.').required(),
    agreeLocation: yup.bool().oneOf([true], '위치 접근 권한에 동의해주세요.').required(),
    agreeMarketing: yup.bool().optional(),
    name: yup.string().required('이름을 입력해주세요.'),
    nickname: yup.string().required('닉네임을 입력해주세요.'),
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
    nickname: string;
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 스크롤뷰 참조
    const scrollViewRef = React.useRef<ScrollView>(null);

    // 애니메이션 값들
    const slideAnim = useSharedValue(0);
    const fadeAnim = useSharedValue(1);
    const scaleAnim = useSharedValue(1);
    const progressAnim = useSharedValue(0);
    const stepIndicatorAnim = useSharedValue(0);
    const contentScaleAnim = useSharedValue(1);
    const buttonScaleAnim = useSharedValue(1);

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
            nickname: '',
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

    // 백엔드 API 기본 URL (자동 감지)
    const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

    // Firebase 관련 상태 제거됨

    const onSendCode = async () => {
        console.log('🔥 [DEBUG] onSendCode 함수 호출됨!');
        console.log('==============================');
        console.log('[SMS] 인증번호 발송 시작');
        console.log(`  📱 휴대폰 번호: ${watch('phone')}`);
        console.log('==============================');

        setCertSent(true);
        setTimer(180);
        setCertVerified(false);

        // 실제 API 호출 (Twilio)
        try {
            console.log('🌐 [SMS] 실제 API 호출 시작');

            // 원본 번호 형식 사용 (백엔드에서 처리)
            const phoneNumber = watch('phone');
            console.log('📱 원본 번호 사용:', phoneNumber);

            if (!phoneNumber || phoneNumber.length < 10) {
                console.log('❌ [SMS] 유효하지 않은 휴대폰 번호');
                alert('유효하지 않은 휴대폰 번호입니다.');
                return;
            }

            console.log('🌐 [SMS] API 요청 시작');
            console.log(`  📡 URL: ${BACKEND_BASE_URL}/api/auth/phone/send`);
            console.log(`  📱 전화번호: ${phoneNumber}`);
            console.log(`  📦 요청 데이터:`, { phone: phoneNumber });

            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/phone/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber })
            });

            console.log('📡 [SMS] 응답 수신');
            console.log(`  📊 상태 코드: ${response.status}`);
            console.log(`  📋 응답 헤더:`, response.headers);

            const data = await response.json();
            console.log(`  📄 응답 데이터:`, data);

            if (!response.ok) {
                console.log('❌ [SMS] 인증번호 발송 실패');
                console.log(`  📊 상태 코드: ${response.status}`);
                console.log(`  📝 오류 메시지: ${data.error || '인증번호 발송 실패'}`);
                alert(data.error || '인증번호 발송 실패');
            } else {
                console.log('✅ [SMS] 인증번호 발송 성공');
                console.log('  📱 실제 SMS 발송 완료');
            }
        } catch (err) {
            console.log('❌ [SMS] 네트워크 오류');
            console.log('  📝 오류 내용:', err);
            alert('네트워크 오류: 인증번호 발송 실패');
        }

        console.log('🏁 [SMS] 인증번호 발송 프로세스 종료');
    };

    const onVerifyCode = async () => {
        const code = watch('code');

        console.log('==============================');
        console.log('[VERIFY] 인증번호 검증 시작');
        console.log(`  📱 휴대폰 번호: ${watch('phone')}`);
        console.log(`  🔢 입력한 인증번호: ${code}`);
        console.log('==============================');

        if (code && code.length === 6) {
            // 실제 API에서 검증
            try {
                console.log('🌐 [VERIFY] 실제 API 호출 시작');

                const phoneNumber = watch('phone');
                const response = await fetch(`${BACKEND_BASE_URL}/api/auth/phone/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: phoneNumber,
                        code: code
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setCertVerified(true);
                    console.log('✅ [VERIFY] 실제 인증번호 검증 성공!');
                    console.log('  🎉 휴대폰 인증 완료');
                } else {
                    console.log('❌ [VERIFY] 인증번호 검증 실패');
                    console.log(`  📊 상태 코드: ${response.status}`);
                    console.log(`  📝 오류 메시지: ${data.error || '인증번호가 일치하지 않습니다.'}`);
                    alert(data.error || '인증번호가 일치하지 않습니다.');
                }
            } catch (err) {
                console.log('❌ [VERIFY] 네트워크 오류');
                console.log('  📝 오류 내용:', err);
                alert('네트워크 오류: 인증번호 검증 실패');
            }
        } else {
            console.log('❌ [VERIFY] 인증번호 형식 오류');
            console.log(`  🔢 인증번호 길이: ${code?.length || 0} (필요: 6자리)`);
        }

        console.log('🏁 [VERIFY] 인증번호 검증 프로세스 종료');
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
        transform: [
            { translateX: slideAnim.value },
            { scale: contentScaleAnim.value }
        ] as any,
        opacity: fadeAnim.value,
    }));

    const scaleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressAnim.value * 100}%`,
    }));

    const stepIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: stepIndicatorAnim.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScaleAnim.value }],
    }));

    // 애니메이션 함수들
    const animateStepTransition = (direction: 'next' | 'prev', callback: () => void) => {
        const slideDistance = direction === 'next' ? -300 : 300;

        // 현재 화면을 밖으로 슬라이드 + 스케일 애니메이션
        slideAnim.value = withTiming(slideDistance, { duration: 300 });
        fadeAnim.value = withTiming(0, { duration: 200 });
        contentScaleAnim.value = withTiming(0.95, { duration: 200 });

        setTimeout(() => {
            // 콜백 실행 (스텝 변경)
            callback();

            // 새 화면을 반대 방향에서 시작
            slideAnim.value = -slideDistance;
            fadeAnim.value = 0;
            contentScaleAnim.value = 0.95;

            // 새 화면을 중앙으로 슬라이드 + 스케일 복원
            slideAnim.value = withTiming(0, { duration: 300 });
            fadeAnim.value = withTiming(1, { duration: 200 });
            contentScaleAnim.value = withTiming(1, { duration: 300 });

            // 스텝 인디케이터 애니메이션
            stepIndicatorAnim.value = withSpring(1, {
                damping: 15,
                stiffness: 100,
            });
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
            // 버튼 클릭 애니메이션
            buttonScaleAnim.value = withSpring(0.95, { duration: 100 }, () => {
                buttonScaleAnim.value = withSpring(1, { duration: 100 });
            });

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
            // 버튼 클릭 애니메이션
            buttonScaleAnim.value = withSpring(0.95, { duration: 100 }, () => {
                buttonScaleAnim.value = withSpring(1, { duration: 100 });
            });

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
        console.log('==============================');
        console.log('[SIGNUP] 회원가입 제출 시작');
        console.log(`  👤 이름: ${data.name}`);
        console.log(`  📧 이메일: ${data.email}`);
        console.log(`  📱 휴대폰: ${data.phone}`);
        console.log(`  📅 생년월일: ${data.birth}`);
        console.log(`  ✅ 약관 동의: ${data.agreeTerms ? '동의' : '미동의'}`);
        console.log(`  🔒 개인정보: ${data.agreePrivacy ? '동의' : '미동의'}`);
        console.log(`  🎤 마이크: ${data.agreeMicrophone ? '동의' : '미동의'}`);
        console.log(`  📍 위치: ${data.agreeLocation ? '동의' : '미동의'}`);
        console.log(`  📢 마케팅: ${data.agreeMarketing ? '동의' : '미동의'}`);
        console.log('==============================');

        setLoading(true);

        // 실제 회원가입 API 호출
        const performSignup = async () => {
            try {
                console.log('🌐 [SIGNUP] 서버 요청 시작');

                // 휴대폰 번호에서 하이픈 제거
                const cleanPhone = data.phone.replace(/[^0-9]/g, '');

                const signupData = {
                    email: data.email,
                    password: data.password,
                    name: data.name,
                    nickname: data.nickname,
                    phone: cleanPhone,
                    birth: data.birth,
                    code: data.code, // 인증번호 추가
                    agreeTerms: data.agreeTerms,
                    agreePrivacy: data.agreePrivacy,
                    agreeMicrophone: data.agreeMicrophone,
                    agreeLocation: data.agreeLocation,
                    agreeMarketing: data.agreeMarketing
                };

                const response = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signupData)
                });

                const result = await response.json();

                if (!response.ok) {
                    console.log('❌ [SIGNUP] 회원가입 실패');
                    console.log(`  📊 상태 코드: ${response.status}`);
                    console.log(`  📝 오류 메시지: ${result.error || '회원가입 실패'}`);
                    alert(result.error || '회원가입에 실패했습니다.');
                } else {
                    console.log('✅ [SIGNUP] 회원가입 성공');
                    console.log(`  👤 사용자 ID: ${result.user?.userId || 'N/A'}`);
                    console.log(`  📧 사용자 이메일: ${result.user?.email || 'N/A'}`);
                    console.log(`  📱 휴대폰 인증: ${result.user?.phoneVerified ? '완료' : '미완료'}`);
                    console.log(`  📧 이메일 인증: ${result.user?.emailVerified ? '완료' : '미완료'}`);
                    console.log('🎉 [SIGNUP] 회원가입 프로세스 완료');

                    // 성공 시 다음 단계로 이동
                    onNext();
                }
            } catch (error) {
                console.log('❌ [SIGNUP] 네트워크 오류');
                console.log('  📝 오류 내용:', error);
                alert('서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.');
            } finally {
                setLoading(false);
                console.log('🏁 [SIGNUP] 회원가입 프로세스 종료');
            }
        };

        // 실제 API 호출 실행
        performSignup();
    };

    const isStep2Valid = () => {
        const name = watch('name');
        const nickname = watch('nickname');
        const birth = watch('birth');
        const phone = watch('phone');
        const code = watch('code');

        // 포맷팅된 값에서 숫자만 추출하여 검증
        const birthNumbers = birth.replace(/[^0-9]/g, '');
        const phoneNumbers = phone.replace(/[^0-9]/g, '');

        console.log('🔍 Step 2 유효성 검사 디버깅:');
        console.log('  - 이름:', name, '| 유효:', !!name);
        console.log('  - 닉네임:', nickname, '| 유효:', !!nickname);
        console.log('  - 생년월일 (원본):', birth);
        console.log('  - 생년월일 (숫자만):', birthNumbers, '| 길이:', birthNumbers.length);
        console.log('  - 휴대폰 (원본):', phone);
        console.log('  - 휴대폰 (숫자만):', phoneNumbers, '| 길이:', phoneNumbers.length);
        console.log('  - 인증번호:', code, '| 길이:', code?.length);
        console.log('  - 인증 완료:', certVerified);
        console.log('  - 인증 요청됨:', certSent);

        const isValid = name &&
            nickname &&
            birthNumbers.length === 8 &&
            phoneNumbers.length >= 10 &&
            (!certSent || (certSent && code && code.length === 6 && certVerified));

        console.log('  - 최종 유효성:', isValid);
        console.log('  - 조건별 결과:');
        console.log('    * 이름 유효:', !!name);
        console.log('    * 닉네임 유효:', !!nickname);
        console.log('    * 생년월일 8자리:', birthNumbers.length === 8);
        console.log('    * 휴대폰 10자리 이상:', phoneNumbers.length >= 10);
        console.log('    * 인증 조건:', (!certSent || (certSent && code && code.length === 6 && certVerified)));

        return isValid;
    };

    const getStep2ValidationMessage = () => {
        const name = watch('name');
        const nickname = watch('nickname');
        const birth = watch('birth');
        const phone = watch('phone');
        const code = watch('code');

        // 포맷팅된 값에서 숫자만 추출하여 검증
        const birthNumbers = birth.replace(/[^0-9]/g, '');
        const phoneNumbers = phone.replace(/[^0-9]/g, '');

        console.log('🔍 Step 2 오류 메시지 디버깅:');
        console.log('  - 이름:', name, '| 빈 값:', !name);
        console.log('  - 닉네임:', nickname, '| 빈 값:', !nickname);
        console.log('  - 생년월일 (숫자만):', birthNumbers, '| 길이:', birthNumbers.length, '| 부족:', birthNumbers.length < 8);
        console.log('  - 휴대폰 (숫자만):', phoneNumbers, '| 길이:', phoneNumbers.length, '| 부족:', phoneNumbers.length < 10);
        console.log('  - 인증번호:', code, '| 길이:', code?.length);
        console.log('  - 인증 요청됨:', certSent);
        console.log('  - 인증 완료:', certVerified);

        // 이름 미입력 시 메시지 제거
        // if (!name) {
        //     console.log('  ❌ 오류: 이름 미입력');
        //     return '이름을 입력해주세요';
        // }
        if (!nickname) {
            console.log('  ❌ 오류: 닉네임 미입력');
            return '닉네임을 입력해주세요';
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

    // 휴대폰 번호 자동 포맷팅 함수 (프론트엔드용)
    const formatPhoneNumber = (text: string): string => {
        // 모든 문자 제거하고 숫자만 추출
        const numbers = text.replace(/[^0-9]/g, '');

        console.log('📱 휴대폰 번호 포맷팅:', text, '→ 숫자만:', numbers, '→ 길이:', numbers.length);

        // 11자리 이상인 경우 11자리까지만 사용
        const limitedNumbers = numbers.slice(0, 11);

        // 010으로 시작하지 않는 경우 빈 문자열 반환 (또는 원본 반환)
        if (!limitedNumbers.startsWith('010') && limitedNumbers.length >= 3) {
            console.log('  결과 (010으로 시작하지 않음):', '');
            return '';
        }

        // 길이에 따른 포맷팅
        if (limitedNumbers.length <= 3) {
            // 3자리 이하: 그대로 반환
            console.log('  결과 (입력 초기):', limitedNumbers);
            return limitedNumbers;
        } else if (limitedNumbers.length <= 7) {
            // 4-7자리: 010-XXXX 형태
            const formatted = `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
            console.log('  결과 (부분 입력):', formatted);
            return formatted;
        } else if (limitedNumbers.length <= 11) {
            // 8-11자리: 010-XXXX-XXXX 형태 또는 E.164 형식
            const remaining = limitedNumbers.slice(3);

            // 사용자 친화적 표시 형식 (프론트엔드용)
            const userFriendlyFormat = `010-${remaining.slice(0, 4)}-${remaining.slice(4)}`;

            // 11자리 완성 시 국제 형식도 함께 제공
            if (limitedNumbers.length === 11) {
                // E.164 형식 (API 전송용) - 공백 없음
                const e164Format = `+8210${remaining}`;
                console.log('  결과 (완성):', userFriendlyFormat, '/ E.164:', e164Format);

                // 프론트엔드에서는 사용자 친화적 형식 반환
                // E.164 형식은 별도 함수로 제공하거나 data attribute로 저장
                return userFriendlyFormat;
            } else {
                console.log('  결과 (입력 중):', userFriendlyFormat);
                return userFriendlyFormat;
            }
        }

        // 예외 상황
        console.log('  결과 (예외):', '');
        return '';
    };

    // E.164 형식 검증 함수
    const isValidE164 = (phoneNumber: string): boolean => {
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phoneNumber);
    };

    // E.164 형식 변환 함수 (API 전송용)
    const toE164Format = (phoneNumber: string): string => {
        // 모든 공백과 특수문자 제거
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // 이미 올바른 E.164 형식인 경우
        if (cleanNumber.match(/^\+[1-9]\d{1,14}$/)) {
            return cleanNumber;
        }

        // 숫자만 추출
        const numbers = cleanNumber.replace(/[^0-9]/g, '');

        // 010으로 시작하는 11자리 한국 휴대폰 번호 검증
        if (numbers.startsWith('010') && numbers.length === 11) {
            const remaining = numbers.slice(3); // 010 제거
            return `+8210${remaining}`; // E.164 형식: +821032839307
        }

        return ''; // 유효하지 않은 경우 빈 문자열 반환
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
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingTop: 20, paddingBottom: 40 }}
                >
                    <View style={{ paddingHorizontal: 24, paddingVertical: 10 }}>
                        {/* 뒤로가기 버튼 */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: 10,
                                left: 24,
                                zIndex: 10,
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'rgba(0, 0, 0, 0.05)'
                            }}
                            onPress={onBackToLogin}
                            activeOpacity={0.7}
                        >
                            <Text style={{
                                color: '#29588A',
                                fontSize: 20,
                                fontWeight: 'bold'
                            }}>←</Text>
                        </TouchableOpacity>

                        {/* 브랜드 헤더 */}
                        <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 20 }}>
                            <Text style={{ color: '#29588A', fontSize: 48, fontWeight: 'bold', letterSpacing: 2 }}>TIBO</Text>
                            <Text style={{ color: '#29588A', fontSize: 18, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 }}>KDT PROJECT TEAM 5</Text>
                        </View>

                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            {/* 프로그레스 바 */}
                            <View style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16,
                                    paddingHorizontal: 2
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: '#29588A',
                                            marginRight: 8
                                        }} />
                                        <Text style={{
                                            color: '#1F2937',
                                            fontSize: 14,
                                            fontWeight: '600',
                                            letterSpacing: -0.2
                                        }}>
                                            {step === 1 ? '약관 동의' :
                                                step === 2 ? '본인 인증' :
                                                    step === 3 ? '계정 생성' : '가입 완료'}
                                        </Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: 'rgba(41, 88, 138, 0.08)',
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        borderWidth: 1.5,
                                        borderColor: 'rgba(41, 88, 138, 0.15)',
                                        shadowColor: '#29588A',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 2,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6
                                    }}>
                                        <View style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: '#29588A',
                                            opacity: 0.8
                                        }} />
                                        <Text style={{
                                            color: '#29588A',
                                            fontSize: 13,
                                            fontWeight: '800',
                                            letterSpacing: 0.3
                                        }}>
                                            {step}
                                        </Text>
                                        <Text style={{
                                            color: 'rgba(41, 88, 138, 0.6)',
                                            fontSize: 11,
                                            fontWeight: '600',
                                            letterSpacing: 0.2
                                        }}>
                                            /4
                                        </Text>
                                    </View>
                                </View>
                                <View style={{
                                    width: '100%', height: 6, backgroundColor: '#F1F5F9',
                                    borderRadius: 3, overflow: 'hidden',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1
                                }}>
                                    <Animated.View style={[{
                                        height: '100%',
                                        backgroundColor: '#29588A', borderRadius: 3,
                                        shadowColor: '#29588A', shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3, shadowRadius: 4, elevation: 2
                                    }, progressAnimatedStyle]} />
                                </View>
                            </View>

                            {/* 스텝 인디케이터 - 동적 업데이트 */}
                            <View style={{
                                width: '100%',
                                maxWidth: 320,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 20,
                                paddingHorizontal: 4
                            }}>
                                {/* 스텝 1 */}
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: step >= 1 ? '#29588A' : '#F8FAFC',
                                        justifyContent: 'center', alignItems: 'center',
                                        borderWidth: step >= 1 ? 0 : 2,
                                        borderColor: '#E2E8F0',
                                        shadowColor: step >= 1 ? '#29588A' : 'transparent',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: step >= 1 ? 0.4 : 0,
                                        shadowRadius: 6,
                                        elevation: step >= 1 ? 3 : 0
                                    }}>
                                        <Text style={{
                                            color: step >= 1 ? 'white' : '#94A3B8',
                                            fontSize: 16,
                                            fontWeight: '700'
                                        }}>1</Text>
                                    </View>
                                    <Text style={{
                                        color: step >= 1 ? '#1F2937' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: '600',
                                        marginTop: 8,
                                        textAlign: 'center'
                                    }}>약관</Text>
                                </View>

                                {/* 스텝 2 */}
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: step >= 2 ? '#29588A' : '#F8FAFC',
                                        justifyContent: 'center', alignItems: 'center',
                                        borderWidth: step >= 2 ? 0 : 2,
                                        borderColor: '#E2E8F0',
                                        shadowColor: step >= 2 ? '#29588A' : 'transparent',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: step >= 2 ? 0.4 : 0,
                                        shadowRadius: 6,
                                        elevation: step >= 2 ? 3 : 0
                                    }}>
                                        <Text style={{
                                            color: step >= 2 ? 'white' : '#94A3B8',
                                            fontSize: 16,
                                            fontWeight: '700'
                                        }}>2</Text>
                                    </View>
                                    <Text style={{
                                        color: step >= 2 ? '#1F2937' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: '600',
                                        marginTop: 8,
                                        textAlign: 'center'
                                    }}>인증</Text>
                                </View>

                                {/* 스텝 3 */}
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: step >= 3 ? '#29588A' : '#F8FAFC',
                                        justifyContent: 'center', alignItems: 'center',
                                        borderWidth: step >= 3 ? 0 : 2,
                                        borderColor: '#E2E8F0',
                                        shadowColor: step >= 3 ? '#29588A' : 'transparent',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: step >= 3 ? 0.4 : 0,
                                        shadowRadius: 6,
                                        elevation: step >= 3 ? 3 : 0
                                    }}>
                                        <Text style={{
                                            color: step >= 3 ? 'white' : '#94A3B8',
                                            fontSize: 16,
                                            fontWeight: '700'
                                        }}>3</Text>
                                    </View>
                                    <Text style={{
                                        color: step >= 3 ? '#1F2937' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: '600',
                                        marginTop: 8,
                                        textAlign: 'center'
                                    }}>계정</Text>
                                </View>

                                {/* 스텝 4 */}
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: step >= 4 ? '#29588A' : '#F8FAFC',
                                        justifyContent: 'center', alignItems: 'center',
                                        borderWidth: step >= 4 ? 0 : 2,
                                        borderColor: '#E2E8F0',
                                        shadowColor: step >= 4 ? '#29588A' : 'transparent',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: step >= 4 ? 0.4 : 0,
                                        shadowRadius: 6,
                                        elevation: step >= 4 ? 3 : 0
                                    }}>
                                        <Text style={{
                                            color: step >= 4 ? 'white' : '#94A3B8',
                                            fontSize: 16,
                                            fontWeight: '700'
                                        }}>4</Text>
                                    </View>
                                    <Text style={{
                                        color: step >= 4 ? '#1F2937' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: '600',
                                        marginTop: 8,
                                        textAlign: 'center'
                                    }}>완료</Text>
                                </View>
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

                                <Animated.View style={buttonAnimatedStyle}>
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
                                                    backgroundColor: '#F8FAFC',
                                                    height: 56,
                                                    borderRadius: 16,
                                                    paddingHorizontal: 20,
                                                    fontSize: 16,
                                                    color: '#1F2937',
                                                    borderWidth: 2,
                                                    borderColor: errors.name ? '#EF4444' : '#E2E8F0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 8,
                                                    elevation: 3,
                                                    // 포커스 시 테두리 색상 변경을 위한 준비
                                                }}
                                                placeholder="이름을 입력하세요"
                                                placeholderTextColor="#94A3B8"
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {/* 이름 에러 메시지 제거 */}
                                        </View>
                                    )} />

                                    <Controller name="nickname" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{
                                                color: '#374151',
                                                fontSize: 15,
                                                fontWeight: '600',
                                                marginBottom: 10,
                                                letterSpacing: 0.5
                                            }}>닉네임</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#F8FAFC',
                                                    height: 56,
                                                    borderRadius: 16,
                                                    paddingHorizontal: 20,
                                                    fontSize: 16,
                                                    color: '#1F2937',
                                                    borderWidth: 2,
                                                    borderColor: errors.nickname ? '#EF4444' : '#E2E8F0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 8,
                                                    elevation: 3,
                                                }}
                                                placeholder="닉네임을 입력하세요"
                                                placeholderTextColor="#94A3B8"
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.nickname && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' }}>{errors.nickname.message}</Text>}
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
                                                    backgroundColor: '#F8FAFC',
                                                    height: 56,
                                                    borderRadius: 16,
                                                    paddingHorizontal: 20,
                                                    fontSize: 16,
                                                    color: '#1F2937',
                                                    borderWidth: 2,
                                                    borderColor: errors.birth ? '#EF4444' : '#E2E8F0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 8,
                                                    elevation: 3
                                                }}
                                                placeholder="YYYY-MM-DD"
                                                placeholderTextColor="#94A3B8"
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
                                                        backgroundColor: '#F8FAFC',
                                                        flex: 1,
                                                        height: 56,
                                                        borderRadius: 16,
                                                        paddingHorizontal: 20,
                                                        fontSize: 16,
                                                        color: '#1F2937',
                                                        borderWidth: 2,
                                                        borderColor: errors.phone ? '#EF4444' : '#E2E8F0',
                                                        marginRight: 12,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.06,
                                                        shadowRadius: 8,
                                                        elevation: 3
                                                    }}
                                                    placeholder="010-1234-5678"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="phone-pad"
                                                    maxLength={15}
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
                                                    height: 56,
                                                    paddingHorizontal: 20,
                                                    borderRadius: 16,
                                                    minWidth: 100,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    shadowColor: '#29588A',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                    elevation: 6,
                                                    // 그라데이션 효과를 위한 준비
                                                }}
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    console.log('👆 [DEBUG] 인증요청 버튼 탭됨!');
                                                    onSendCode();
                                                }}
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
                                                            backgroundColor: '#F8FAFC',
                                                            flex: 1,
                                                            height: 56,
                                                            borderRadius: 16,
                                                            paddingHorizontal: 20,
                                                            fontSize: 16,
                                                            color: '#1F2937',
                                                            borderWidth: 2,
                                                            borderColor: errors.code ? '#EF4444' : '#E2E8F0',
                                                            marginRight: 12,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.06,
                                                            shadowRadius: 8,
                                                            elevation: 3
                                                        }}
                                                        placeholder="인증번호 6자리"
                                                        placeholderTextColor="#94A3B8"
                                                        keyboardType="numeric"
                                                        maxLength={6}
                                                        value={field.value}
                                                        onChangeText={field.onChange}
                                                    />
                                                )} />
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: certVerified ? '#10B981' : '#29588A',
                                                        height: 56,
                                                        paddingHorizontal: 20,
                                                        borderRadius: 16,
                                                        minWidth: 100,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        shadowColor: certVerified ? '#10B981' : '#29588A',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 8,
                                                        elevation: 6
                                                    }}
                                                    disabled={!watch('code') || watch('code').length !== 6}
                                                    activeOpacity={0.8}
                                                    onPress={() => {
                                                        console.log('👆 [DEBUG] 인증확인 버튼 탭됨!');
                                                        onVerifyCode();
                                                    }}
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
                                                        backgroundColor: '#F8FAFC',
                                                        height: 56,
                                                        borderRadius: 16,
                                                        paddingHorizontal: 20,
                                                        fontSize: 16,
                                                        color: '#222',
                                                        borderWidth: 2,
                                                        borderColor: emailError ? '#EF4444' : '#E2E8F0',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.06,
                                                        shadowRadius: 8,
                                                        elevation: 3
                                                    }}
                                                    placeholder="이메일을 입력하세요"
                                                    placeholderTextColor="#94A3B8"
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
                                                <View style={{
                                                    backgroundColor: '#F8FAFC',
                                                    height: 56,
                                                    borderRadius: 16,
                                                    paddingHorizontal: 20,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    borderWidth: 2,
                                                    borderColor: passwordError ? '#EF4444' : '#E2E8F0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 8,
                                                    elevation: 3
                                                }}>
                                                    <TextInput
                                                        style={{
                                                            flex: 1,
                                                            fontSize: 16,
                                                            color: '#222',
                                                        }}
                                                        placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                                        placeholderTextColor="#94A3B8"
                                                        secureTextEntry={!showPassword}
                                                        value={field.value}
                                                        onChangeText={field.onChange}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => setShowPassword(!showPassword)}
                                                        style={{ padding: 8 }}
                                                    >
                                                        <View style={{
                                                            width: 20,
                                                            height: 12,
                                                            borderWidth: 1.5,
                                                            borderColor: passwordError ? '#EF4444' : '#6B7280',
                                                            borderRadius: 6,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: showPassword ? 'rgba(107, 114, 128, 0.1)' : 'transparent'
                                                        }}>
                                                            <View style={{
                                                                width: 4,
                                                                height: 4,
                                                                borderRadius: 2,
                                                                backgroundColor: passwordError ? '#EF4444' : '#6B7280'
                                                            }} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                {passwordError && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4, fontWeight: '500' }}>{passwordError}</Text>}
                                            </View>
                                        );
                                    }} />

                                    <Controller name="confirm" control={control} render={({ field }) => {
                                        const confirmError = validatePasswordConfirm(field.value, watch('password'));
                                        return (
                                            <View style={{ marginBottom: 16 }}>
                                                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>비밀번호 확인</Text>
                                                <View style={{
                                                    backgroundColor: '#F8FAFC',
                                                    height: 56,
                                                    borderRadius: 16,
                                                    paddingHorizontal: 20,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    borderWidth: 2,
                                                    borderColor: confirmError ? '#EF4444' : '#E2E8F0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.06,
                                                    shadowRadius: 8,
                                                    elevation: 3
                                                }}>
                                                    <TextInput
                                                        style={{
                                                            flex: 1,
                                                            fontSize: 16,
                                                            color: '#222',
                                                        }}
                                                        placeholder="비밀번호를 다시 입력하세요"
                                                        placeholderTextColor="#94A3B8"
                                                        secureTextEntry={!showConfirmPassword}
                                                        value={field.value}
                                                        onChangeText={field.onChange}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        style={{ padding: 8 }}
                                                    >
                                                        <View style={{
                                                            width: 20,
                                                            height: 12,
                                                            borderWidth: 1.5,
                                                            borderColor: confirmError ? '#EF4444' : '#6B7280',
                                                            borderRadius: 6,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: showConfirmPassword ? 'rgba(107, 114, 128, 0.1)' : 'transparent'
                                                        }}>
                                                            <View style={{
                                                                width: 4,
                                                                height: 4,
                                                                borderRadius: 2,
                                                                backgroundColor: confirmError ? '#EF4444' : '#6B7280'
                                                            }} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                {confirmError && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4, fontWeight: '500' }}>{confirmError}</Text>}
                                            </View>
                                        );
                                    }} />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                                        nickname: watch('nickname'),
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
                                {/* Step3 하단 경고 메시지(알림) 제거 */}
                            </Animated.View>
                        )}

                        {step === 4 && (
                            <Animated.View style={[{ width: '100%', maxWidth: 400, alignItems: 'center' }, slideAnimatedStyle]}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
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
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>시작하기</Text>
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
