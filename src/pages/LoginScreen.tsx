// src/screens/Auth/LoginScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    TextInput,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    Image,
    Switch
} from 'react-native';
import Animated, {
    FadeInUp,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../styles/ThemeProvider';
import { isValidEmail } from '../utils/validation';
import { storage } from '../utils/storage'; // AsyncStorage wrapper

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onSignup?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onSignup }: LoginScreenProps) {
    // ────────────────────────────────────────────────────────────────────────────────
    // Theme & Animated shared values
    // ────────────────────────────────────────────────────────────────────────────────
    const { theme, isDark } = useTheme();

    const buttonScale = useSharedValue(1);
    const checkboxScale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }]
    }));

    const animatedCheckboxStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkboxScale.value }]
    }));

    // ────────────────────────────────────────────────────────────────────────────────
    // State
    // ────────────────────────────────────────────────────────────────────────────────
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visiblePW, setVisiblePW] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoLogin, setAutoLogin] = useState(true); // 기본값을 true로 변경
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        AsyncStorage.setItem('autoLogin', autoLogin ? 'true' : 'false');
    }, [autoLogin]);

    // ────────────────────────────────────────────────────────────────────────────────
    // Memoized validation results
    // ────────────────────────────────────────────────────────────────────────────────
    const validationErrors = useMemo<string[]>(() => {
        const errs: string[] = [];
        if (email && !isValidEmail(email)) errs.push('올바른 이메일 형식이 아닙니다.');
        if (password && password.length < 6) errs.push('비밀번호는 최소 6자리여야 합니다.');
        return errs;
    }, [email, password]);

    // ────────────────────────────────────────────────────────────────────────────────
    // Handlers
    // ────────────────────────────────────────────────────────────────────────────────
    const handleLogin = useCallback(async () => {
        console.log('==============================');
        console.log('[LOGIN] 로그인 시도 시작');
        console.log(`  📧 이메일: ${email}`);
        console.log(`  🔐 자동로그인: ${autoLogin ? '활성화' : '비활성화'}`);
        console.log('==============================');

        setErrors([]);
        if (validationErrors.length) {
            console.log('❌ [LOGIN] 유효성 검사 실패');
            console.log('  📝 오류 목록:', validationErrors);
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            console.log('🌐 [LOGIN] 서버 요청 시작');
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                console.log('❌ [LOGIN] 로그인 실패');
                console.log(`  📊 상태 코드: ${res.status}`);
                console.log(`  📝 오류 메시지: ${data.error || '로그인 실패'}`);
                setErrors([data.error || '로그인 실패']);
            } else if (data.accessToken) {
                console.log('✅ [LOGIN] 로그인 성공');
                console.log(`  👤 사용자 ID: ${data.user?.userId || 'N/A'}`);
                console.log(`  📧 사용자 이메일: ${data.user?.email || 'N/A'}`);
                console.log(`  🔐 토큰 발급: ${data.accessToken ? '성공' : '실패'}`);
                console.log(`  🔐 토큰 길이: ${data.accessToken?.length || 0}자`);
                console.log(`  🔐 토큰 시작: ${data.accessToken?.substring(0, 20) || 'N/A'}...`);

                // 토큰 저장 로직 개선 - 로그인 성공 시 항상 토큰 저장
                try {
                    await storage.set('token', data.accessToken);
                    console.log('💾 [LOGIN] 토큰 저장 완료');

                    // 토큰 저장 확인
                    const savedToken = await storage.get('token');
                    console.log(`  🔍 저장된 토큰 확인: ${savedToken ? '성공' : '실패'}`);

                    if (!savedToken) {
                        console.log('⚠️ [LOGIN] 토큰 저장 확인 실패 - 다시 시도');
                        await storage.set('token', data.accessToken);
                        const retryToken = await storage.get('token');
                        console.log(`  🔍 재시도 토큰 확인: ${retryToken ? '성공' : '실패'}`);
                    }
                } catch (tokenError) {
                    console.log('❌ [LOGIN] 토큰 저장 실패');
                    console.log('  📝 오류 내용:', tokenError);
                }

                console.log('🎉 [LOGIN] 로그인 프로세스 완료');
                onLoginSuccess();
            } else {
                console.log('❌ [LOGIN] 토큰 없음 - 알 수 없는 오류');
                setErrors(['알 수 없는 오류가 발생했습니다.']);
            }
        } catch (err) {
            console.log('❌ [LOGIN] 네트워크 오류');
            console.log('  📝 오류 내용:', err);
            setErrors(['서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.']);
        } finally {
            setLoading(false);
            console.log('🏁 [LOGIN] 로그인 프로세스 종료');
        }
    }, [email, password, autoLogin, validationErrors, onLoginSuccess]);

    const toggleAutoLogin = useCallback(() => {
        checkboxScale.value = withSpring(0.85, { damping: 15 }, () => {
            checkboxScale.value = withSpring(1, { damping: 15 });
        });
        setAutoLogin(prev => !prev);
    }, [checkboxScale]);

    // ────────────────────────────────────────────────────────────────────────────────
    // JSX
    // ────────────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <View style={styles.innerContainer}>
                    {/* 로고 */}
                    <Image source={require('../assets/Text Logo.png')} style={styles.logo} resizeMode="contain" />
                    {/* 타이틀/설명 */}
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>회원 서비스 이용을 위해 로그인 해주세요.</Text>
                    {/* 이메일 입력 */}
                    <View style={styles.inputGroup}>
                        <View style={[styles.inputContainer, { borderColor: errors.some(e => e.includes('이메일')) ? '#EF4444' : '#e0e3e7' }]}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons name="person-outline" size={18} color="#6B7280" />
                                <Text style={styles.inputLabel}>ID</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="이메일을 입력하세요"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* 구분선 */}
                    <View style={styles.divider} />

                    {/* 비밀번호 입력 */}
                    <View style={styles.inputGroup}>
                        <View style={[styles.inputContainer, { borderColor: errors.some(e => e.includes('비밀번호')) ? '#EF4444' : '#e0e3e7' }]}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                                <Text style={styles.inputLabel}>PW</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호를 입력하세요"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!visiblePW}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setVisiblePW(!visiblePW)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={visiblePW ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={errors.some(e => e.includes('비밀번호')) ? '#EF4444' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* 자동 로그인 체크박스 */}
                    <View style={styles.switchRow}>
                        <View style={styles.leftSection}>
                            <Animated.View
                                style={[
                                    styles.checkbox,
                                    autoLogin && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    animatedCheckboxStyle
                                ]}
                            >
                                {autoLogin && <Ionicons name="checkmark" size={14} color={theme.onPrimary} />}
                            </Animated.View>
                            <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>자동 로그인</Text>
                        </View>
                        <Switch
                            value={autoLogin}
                            onValueChange={setAutoLogin}
                            trackColor={{ false: '#e0e0e0', true: theme.primary }}
                            thumbColor={autoLogin ? '#fff' : '#f4f3f4'}
                            ios_backgroundColor="#e0e0e0"
                        />
                    </View>
                    {/* 에러 메시지 */}
                    {errors.length > 0 && (
                        <Animated.View
                            entering={FadeInUp.springify()}
                            style={[styles.errorBox, { backgroundColor: theme.error + '20' }]}
                        >
                            {errors.map((e, i) => (
                                <Text key={i} style={[styles.errorText, { color: theme.error }]}>• {e}</Text>
                            ))}
                        </Animated.View>
                    )}
                    {/* 로그인 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            { backgroundColor: loading ? theme.primary + '80' : theme.primary }
                        ]}
                        disabled={loading}
                        activeOpacity={0.9}
                        onPress={() => {
                            buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
                                buttonScale.value = withSpring(1, { damping: 15 });
                            });
                            handleLogin();
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.onPrimary} />
                        ) : (
                            <Text style={[styles.loginButtonText, { color: theme.onPrimary }]}>로그인하기</Text>
                        )}
                    </TouchableOpacity>
                    {/* 부가 링크 */}
                    <View style={styles.linkRow}>
                        <TouchableOpacity onPress={() => Alert.alert('아이디 찾기 준비중')}><Text style={styles.linkText}>아이디 찾기</Text></TouchableOpacity>
                        <Text style={styles.linkDivider}>|</Text>
                        <TouchableOpacity onPress={() => Alert.alert('비밀번호 찾기 준비중')}><Text style={styles.linkText}>비밀번호 찾기</Text></TouchableOpacity>
                        <Text style={styles.linkDivider}>|</Text>
                        <TouchableOpacity onPress={onSignup}><Text style={styles.linkText}>회원가입</Text></TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    innerContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 28, paddingTop: 60 },
    logo: { width: 1188, height: 315, marginTop: -20, marginBottom: 8, resizeMode: 'contain' },
    title: { fontFamily: 'GoogleSans-Bold', fontSize: 22, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontFamily: 'GoogleSans-Medium', fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#374151' },
    inputGroup: { width: '100%', marginBottom: 0 },
    input: {
        flex: 1,
        borderWidth: 0,
        paddingHorizontal: 0,
        fontSize: 16,
        backgroundColor: 'transparent',
        color: '#1F2937',
        fontFamily: 'GoogleSans-Regular',
        textAlignVertical: 'center',
    },

    checkboxRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 10, marginTop: 2 },
    checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#bbb', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    checkboxLabel: { color: '#333', fontSize: 15 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10, marginTop: 16 },
    switchLabel: { color: '#333', fontSize: 15, marginLeft: 8 },
    errorBox: { width: '100%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
    errorText: { fontFamily: 'GoogleSans-Medium', fontSize: 13 },
    loginButton: { width: '100%', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 18 },
    loginButtonText: { fontFamily: 'GoogleSans-Bold', fontSize: 17 },
    linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    linkText: { color: '#888', fontSize: 13, paddingHorizontal: 6 },
    linkDivider: { color: '#ddd', fontSize: 13 },
    leftSection: { flexDirection: 'row', alignItems: 'center' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e0e3e7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 56,
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        minWidth: 40,
    },
    inputLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 4,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
        opacity: 0.8,
    },
    eyeIcon: {
        padding: 12,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
        borderRadius: 8,
    },
});
