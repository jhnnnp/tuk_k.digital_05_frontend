import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';

interface SignupScreenProps {
    onSignupSuccess?: () => void;
    onBackToLogin?: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email || !name || !password || !confirmPassword) {
            setError('모든 항목을 입력해 주세요.');
            return false;
        }
        if (!email.includes('@')) {
            setError('올바른 이메일 주소를 입력해 주세요.');
            return false;
        }
        if (password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            // 이메일 중복 확인
            const dupRes = await fetch(`http://localhost:3000/api/auth/email-duplication?email=${encodeURIComponent(email)}`);
            const dupData = await dupRes.json();
            if (dupData.duplicated) {
                setError('이미 가입된 이메일입니다.');
                setLoading(false);
                return;
            }
            // 회원가입 요청
            const res = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            if (res.ok) {
                Alert.alert('회원가입 완료', '회원가입이 완료되었습니다.', [
                    { text: '확인', onPress: () => onSignupSuccess?.() || onBackToLogin?.() }
                ]);
            } else {
                const data = await res.json();
                setError(data.error || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>기본 정보를 입력해 주세요</Text>
            <TextInput
                style={styles.input}
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={loading ? '가입 중...' : '회원가입'} onPress={handleSignup} disabled={loading} />
            <TouchableOpacity onPress={onBackToLogin} style={styles.backLink}>
                <Text style={styles.backText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 24
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center'
    },
    input: {
        width: 280,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16
    },
    error: {
        color: 'red',
        marginBottom: 16,
        textAlign: 'center'
    },
    backLink: {
        marginTop: 24
    },
    backText: {
        color: '#007AFF',
        fontSize: 16
    },
});

export default SignupScreen; 