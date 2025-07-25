import React from 'react';
import { View, StyleSheet } from 'react-native';
// TIBO 컴포넌트 import 예시 (실제 경로/이름에 맞게 수정 필요)
// import { Card, Typography, Button } from 'tibo-ui';
import { useNavigation } from '@react-navigation/native';

const IntroScreen: React.FC = () => {
    const navigation = useNavigation();

    const handleStart = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            {/* <Card> */}
            {/* <Typography variant="h2">TIBO</Typography> */}
            {/* <Typography variant="subtitle1">스마트한 보안, TIBO와 함께</Typography> */}
            {/* <Button onPress={handleStart}>시작하기</Button> */}
            {/* </Card> */}
            {/* 실제 TIBO 컴포넌트로 대체 필요 */}
            <View style={styles.card}>
                <View style={styles.logo} />
                <View style={styles.textWrap}>
                    {/* 브랜드명/슬로건 */}
                </View>
                <View style={styles.buttonWrap}>
                    {/* 시작하기 버튼 */}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    card: { width: 320, padding: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
    logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#222', marginBottom: 24 },
    textWrap: { marginBottom: 32 },
    buttonWrap: { width: '100%' },
});

export default IntroScreen; 