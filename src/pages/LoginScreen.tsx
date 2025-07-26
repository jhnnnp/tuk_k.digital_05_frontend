// src/screens/Auth/LoginScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
    Image
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
    const [autoLogin, setAutoLogin] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

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
        setErrors([]);
        if (validationErrors.length) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors([data.error || '로그인 실패']);
            } else if (data.accessToken) {
                if (autoLogin) {
                    await storage.set('token', data.accessToken);
                } else {
                    await storage.remove('token');
                }
                onLoginSuccess();
            } else {
                setErrors(['알 수 없는 오류가 발생했습니다.']);
            }
        } catch (err) {
            setErrors(['서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.']);
        } finally {
            setLoading(false);
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
                    {/* 입력창 */}
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary }]}
                            placeholder="아이디(이메일)"
                            placeholderTextColor={theme.textSecondary + '99'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary }]}
                            placeholder="비밀번호"
                            placeholderTextColor={theme.textSecondary + '99'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!visiblePW}
                        />
                        <TouchableOpacity
                            style={styles.pwToggle}
                            onPress={() => setVisiblePW(v => !v)}
                            hitSlop={10}
                        >
                            <Ionicons
                                name={visiblePW ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                    {/* 자동 로그인 체크박스 */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={toggleAutoLogin}
                        activeOpacity={0.8}
                    >
                        <Animated.View
                            style={[
                                styles.checkbox,
                                autoLogin && { backgroundColor: theme.primary, borderColor: theme.primary },
                                animatedCheckboxStyle
                            ]}
                        >
                            {autoLogin && <Ionicons name="checkmark" size={14} color={theme.onPrimary} />}
                        </Animated.View>
                        <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>자동 로그인</Text>
                    </TouchableOpacity>
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
    innerContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 28, paddingTop: 0 },
    logo: { width: 1188, height: 315, marginTop: -20, marginBottom: 8, resizeMode: 'contain' },
    title: { fontFamily: 'GoogleSans-Bold', fontSize: 22, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontFamily: 'GoogleSans-Regular', fontSize: 15, textAlign: 'center', marginBottom: 28 },
    inputGroup: { width: '100%', marginBottom: 8 },
    input: { width: '100%', height: 48, borderWidth: 1, borderColor: '#e0e3e7', borderRadius: 10, paddingHorizontal: 16, marginBottom: 12, fontSize: 16, backgroundColor: '#fafbfc' },
    pwToggle: { position: 'absolute', right: 16, top: 60 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 10, marginTop: 2 },
    checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#bbb', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    checkboxLabel: { color: '#333', fontSize: 15 },
    errorBox: { width: '100%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
    errorText: { fontFamily: 'GoogleSans-Medium', fontSize: 13 },
    loginButton: { width: '100%', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 18 },
    loginButtonText: { fontFamily: 'GoogleSans-Bold', fontSize: 17 },
    linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    linkText: { color: '#888', fontSize: 13, paddingHorizontal: 6 },
    linkDivider: { color: '#ddd', fontSize: 13 },
});
