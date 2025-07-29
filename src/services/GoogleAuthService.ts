import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// API 설정
const API_BASE_URL = 'http://localhost:3000/api';

// 웹 클라이언트 ID만 사용 (개발용)
const getGoogleClientId = () => {
    const clientId = '706502232476-22nfajuo4f4luvs0n8ofp9h1svjd1s9m.apps.googleusercontent.com';

    console.log('🔍 [GOOGLE AUTH] 웹 클라이언트 ID 사용');
    console.log(`  📱 플랫폼: ${Platform.OS}`);
    console.log(`  🆔 클라이언트 ID: ${clientId}`);

    return clientId;
};

// 구글 로그인 실행 (백엔드에서 Google OAuth 처리)
export const signInWithGoogle = async () => {
    try {
        console.log('🔍 [GOOGLE AUTH] 구글 로그인 시작');

        // 백엔드에서 Google OAuth URL 생성 요청
        const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId: getGoogleClientId(),
                platform: Platform.OS
            }),
        });

        const data = await response.json();

        if (response.ok && data.authUrl) {
            console.log('✅ [GOOGLE AUTH] Google OAuth URL 생성 성공');
            console.log(`  🔗 Auth URL: ${data.authUrl}`);

            // 브라우저에서 Google OAuth URL 열기
            console.log('🔍 [GOOGLE AUTH] WebBrowser 시작');
            console.log(`  🔗 URL: ${data.authUrl}`);

            const result = await WebBrowser.openAuthSessionAsync(
                data.authUrl,
                'http://localhost:3000/auth/google/callback'
            );

            console.log('🔍 [GOOGLE AUTH] WebBrowser 결과');
            console.log(`  📱 타입: ${result.type}`);

            if (result.type === 'success') {
                console.log('✅ [GOOGLE AUTH] Google 로그인 성공');

                // URL에서 에러 파라미터 확인 (타입 안전성 보장)
                const resultUrl = (result as any).url;
                if (resultUrl) {
                    console.log(`  🔗 URL: ${resultUrl}`);
                    try {
                        const url = new URL(resultUrl);
                        const error = url.searchParams.get('error');
                        const errorDescription = url.searchParams.get('error_description');

                        if (error) {
                            console.log('❌ [GOOGLE AUTH] URL에서 에러 발견');
                            console.log(`  📝 에러: ${error}`);
                            console.log(`  📝 설명: ${errorDescription || 'N/A'}`);

                            return {
                                success: false,
                                error: `Google 로그인 실패: ${errorDescription || error}`
                            };
                        }

                        // 성공 시 토큰 추출
                        const success = url.searchParams.get('success');
                        const userId = url.searchParams.get('userId');
                        const accessToken = url.searchParams.get('accessToken');
                        const refreshToken = url.searchParams.get('refreshToken');

                        if (success === 'true' && accessToken) {
                            console.log('✅ [GOOGLE AUTH] 토큰 추출 성공');
                            console.log(`  👤 사용자 ID: ${userId}`);
                            console.log(`  🔑 Access Token: ${accessToken ? '발급됨' : '발급안됨'}`);
                            console.log(`  🔄 Refresh Token: ${refreshToken ? '발급됨' : '발급안됨'}`);

                            // 토큰 저장
                            const { storage } = require('../utils/storage');
                            await storage.set('token', accessToken);
                            if (refreshToken) {
                                await storage.set('refreshToken', refreshToken);
                            }

                            console.log('💾 [GOOGLE AUTH] 토큰 저장 완료');

                            return {
                                success: true,
                                message: 'Google 로그인이 완료되었습니다.',
                                userId: userId,
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            };
                        }
                    } catch (urlError) {
                        console.log('⚠️ [GOOGLE AUTH] URL 파싱 오류:', urlError);
                    }
                }

                return {
                    success: true,
                    message: 'Google 로그인이 완료되었습니다.'
                };
            } else if (result.type === 'cancel') {
                console.log('ℹ️ [GOOGLE AUTH] 사용자가 로그인을 취소했습니다.');
                return {
                    success: false,
                    error: '사용자가 로그인을 취소했습니다.'
                };
            }

            console.log('❌ [GOOGLE AUTH] 예상치 못한 WebBrowser 결과');
            console.log(`  📱 타입: ${result.type}`);

            return {
                success: false,
                error: 'Google 로그인 처리 중 오류가 발생했습니다.'
            };
        } else {
            console.log('❌ [GOOGLE AUTH] Google OAuth URL 생성 실패');
            console.log(`  📝 응답 상태: ${response.status}`);
            console.log(`  📝 응답 데이터: ${JSON.stringify(data, null, 2)}`);

            return {
                success: false,
                error: data.error || 'Google OAuth URL 생성에 실패했습니다.',
            };
        }
    } catch (error) {
        console.error('Google 로그인 오류:', error);
        return {
            success: false,
            error: '구글 로그인 중 오류가 발생했습니다.',
        };
    }
};

// 구글 로그인 가능 여부 확인
export const isGoogleSignInAvailable = () => {
    return true;
};

// 구글 로그아웃
export const signOutFromGoogle = async () => {
    try {
        console.log('🔍 [GOOGLE AUTH] 구글 로그아웃 시작');

        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ [GOOGLE AUTH] 구글 로그아웃 성공');
            return {
                success: true,
                message: data.message,
            };
        } else {
            console.log('❌ [GOOGLE AUTH] 구글 로그아웃 실패');
            return {
                success: false,
                error: data.error || '구글 로그아웃에 실패했습니다.',
            };
        }
    } catch (error) {
        console.error('Google 로그아웃 오류:', error);
        return {
            success: false,
            error: '구글 로그아웃 중 오류가 발생했습니다.',
        };
    }
}; 