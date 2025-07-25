import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onSignup?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const data = await response.json();
                setError(data.error || '로그인 실패');
            } else {
                const data = await response.json();
                if (data.accessToken) {
                    await AsyncStorage.setItem('token', data.accessToken);
                }
                onLoginSuccess();
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput
                style={styles.input}
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#aaa"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>로그인</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignup} style={styles.signupLink} activeOpacity={0.7}>
                <Text style={styles.signupText}>아직 회원이 아니신가요? <Text style={styles.signupTextBold}>회원가입</Text></Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#222' },
    input: { width: 280, height: 48, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 16, marginBottom: 18, fontSize: 16, backgroundColor: '#fafbfc' },
    error: { color: 'red', marginBottom: 16, textAlign: 'center' },
    button: { width: 280, height: 48, backgroundColor: '#007AFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 12 },
    buttonDisabled: { backgroundColor: '#b5d1f8' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    signupLink: { marginTop: 12 },
    signupText: { color: '#555', fontSize: 15 },
    signupTextBold: { color: '#007AFF', fontWeight: 'bold', fontSize: 15 },
});

export default LoginScreen; 