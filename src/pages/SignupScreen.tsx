// src/screens/Auth/SignupScreen.tsx
import React, { useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Validation Schema
const schema = yup.object({
    agreeTerms: yup.bool().oneOf([true], '필수 약관에 동의해주세요.'),
    agreePrivacy: yup.bool().oneOf([true], '개인정보 약관에 동의해주세요.'),
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
        .required(),
    email: yup.string().email('유효한 이메일을 입력하세요.').required(),
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
        .required(),
});

type FormData = yup.InferType<typeof schema>;

export default function SignupScreen({ onBackToLogin }: { onBackToLogin?: () => void }) {
    const [step, setStep] = useState(1);
    const [certSent, setCertSent] = useState(false);
    const [timer, setTimer] = useState(180);
    const [loading, setLoading] = useState(false);

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
    const allAgree = agreeTerms && agreePrivacy;

    const onSendCode = () => {
        setCertSent(true);
        setTimer(180);
    };

    const onNext = () => step < 4 && setStep((s) => s + 1);
    const onPrev = () => step > 1 && setStep((s) => s - 1);

    const onSubmit = (data: FormData) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onNext();
        }, 1200);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
                        {/* 브랜드 헤더 */}
                        <View style={{ alignItems: 'center', marginBottom: 40 }}>
                            <Text style={{ color: '#29588A', fontSize: 48, fontWeight: 'bold', letterSpacing: 2 }}>TIBO</Text>
                            <Text style={{ color: '#29588A', fontSize: 18, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 }}>KDT PROJECT TEAM 5</Text>
                        </View>

                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            <Text style={{ color: '#29588A', fontSize: 14, fontWeight: '500' }}>STEP {step} of 4</Text>
                        </View>

                        {step === 1 && (
                            <View style={{ width: '100%', maxWidth: 400 }}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>약관 동의</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>서비스 이용을 위해 약관에 동의해 주세요.</Text>
                                </View>

                                <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                                        onPress={() => { setValue('agreeTerms', !allAgree); setValue('agreePrivacy', !allAgree); }}
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
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>이용약관 동의 (필수)</Text>
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
                                        <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>개인정보 수집·이용 동의 (필수)</Text>
                                    </TouchableOpacity>
                                    {errors.agreePrivacy && <Text style={{ color: '#ff3b30', fontSize: 13, marginLeft: 32, marginTop: 4 }}>{errors.agreePrivacy.message}</Text>}
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
                            </View>
                        )}

                        {step === 2 && (
                            <View style={{ width: '100%', maxWidth: 400 }}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>본인 인증</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>정보를 입력하고 인증번호를 받아주세요.</Text>
                                </View>

                                <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                                    <Controller name="name" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>이름</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                    paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                    borderWidth: 1, borderColor: errors.name ? '#ff3b30' : '#D1D5DB'
                                                }}
                                                placeholder="이름을 입력하세요"
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.name && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.name.message}</Text>}
                                        </View>
                                    )} />

                                    <Controller name="birth" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>생년월일</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                    paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                    borderWidth: 1, borderColor: errors.birth ? '#ff3b30' : '#D1D5DB'
                                                }}
                                                placeholder="YYYYMMDD"
                                                keyboardType="numeric"
                                                maxLength={8}
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.birth && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.birth.message}</Text>}
                                        </View>
                                    )} />

                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>휴대폰 번호</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Controller name="phone" control={control} render={({ field }) => (
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff', flex: 1, height: 48, borderRadius: 8,
                                                        paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                        borderWidth: 1, borderColor: errors.phone ? '#ff3b30' : '#D1D5DB',
                                                        marginRight: 12
                                                    }}
                                                    placeholder="휴대폰 번호"
                                                    keyboardType="phone-pad"
                                                    value={field.value}
                                                    onChangeText={field.onChange}
                                                />
                                            )} />
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#29588A', paddingHorizontal: 16, paddingVertical: 12,
                                                    borderRadius: 8, minWidth: 80, alignItems: 'center'
                                                }}
                                                onPress={onSendCode}
                                            >
                                                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>{certSent ? '재요청' : '인증요청'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {errors.phone && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.phone.message}</Text>}
                                    </View>

                                    {certSent && (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>인증번호</Text>
                                            <Controller name="code" control={control} render={({ field }) => (
                                                <TextInput
                                                    style={{
                                                        backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                        paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                        borderWidth: 1, borderColor: errors.code ? '#ff3b30' : '#D1D5DB'
                                                    }}
                                                    placeholder="인증번호 6자리"
                                                    keyboardType="numeric"
                                                    maxLength={6}
                                                    value={field.value}
                                                    onChangeText={field.onChange}
                                                />
                                            )} />
                                            {errors.code && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.code.message}</Text>}
                                            <Text style={{ color: '#29588A', fontSize: 14, marginTop: 8 }}>남은 시간: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</Text>
                                        </View>
                                    )}
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
                                            backgroundColor: '#29588A', paddingVertical: 16, paddingHorizontal: 32,
                                            borderRadius: 12, alignItems: 'center',
                                            shadowColor: '#29588A',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                            elevation: 4
                                        }}
                                        disabled={
                                            !!errors.name ||
                                            !!errors.birth ||
                                            !!errors.phone ||
                                            (certSent && !!errors.code)
                                        }
                                        onPress={onNext}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>다음</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <View style={{ width: '100%', maxWidth: 400 }}>
                                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>계정 정보 설정</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>이메일과 비밀번호를 입력해 주세요.</Text>
                                </View>

                                <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                                    <Controller name="email" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>이메일</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                    paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                    borderWidth: 1, borderColor: errors.email ? '#ff3b30' : '#D1D5DB'
                                                }}
                                                placeholder="이메일을 입력하세요"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.email && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.email.message}</Text>}
                                        </View>
                                    )} />

                                    <Controller name="password" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>비밀번호</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                    paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                    borderWidth: 1, borderColor: errors.password ? '#ff3b30' : '#D1D5DB'
                                                }}
                                                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                                secureTextEntry
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.password && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.password.message}</Text>}
                                        </View>
                                    )} />

                                    <Controller name="confirm" control={control} render={({ field }) => (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>비밀번호 확인</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff', height: 48, borderRadius: 8,
                                                    paddingHorizontal: 16, fontSize: 16, color: '#222',
                                                    borderWidth: 1, borderColor: errors.confirm ? '#ff3b30' : '#D1D5DB'
                                                }}
                                                placeholder="비밀번호를 다시 입력하세요"
                                                secureTextEntry
                                                value={field.value}
                                                onChangeText={field.onChange}
                                            />
                                            {errors.confirm && <Text style={{ color: '#ff3b30', fontSize: 13, marginTop: 4 }}>{errors.confirm.message}</Text>}
                                        </View>
                                    )} />
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
                                            backgroundColor: '#29588A', paddingVertical: 16, paddingHorizontal: 32,
                                            borderRadius: 12, alignItems: 'center',
                                            shadowColor: '#29588A',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                            elevation: 4
                                        }}
                                        onPress={handleSubmit(onSubmit)}
                                    >
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>회원가입</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === 4 && (
                            <View style={{ width: '100%', maxWidth: 400, alignItems: 'center' }}>
                                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                                    <Text style={{ color: '#222', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>환영합니다!</Text>
                                    <Text style={{ color: '#7BA6D9', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>회원가입이 완료되었습니다.</Text>
                                </View>

                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#29588A', paddingVertical: 16, paddingHorizontal: 32,
                                        borderRadius: 12, alignItems: 'center',
                                        shadowColor: '#29588A',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        elevation: 4
                                    }}
                                    onPress={onBackToLogin}
                                >
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>로그인으로 이동</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
