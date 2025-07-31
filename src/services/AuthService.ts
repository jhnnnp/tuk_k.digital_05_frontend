import { API_BASE_URL } from '../config/api';

/**
 * 휴대폰 인증번호 발송
 */
export const sendPhoneVerification = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('📱 [SEND SMS] 인증번호 발송 시작');
        console.log(`  📱 휴대폰 번호: ${phone}`);

        const response = await fetch(`${API_BASE_URL}/auth/phone/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ [SEND SMS] 인증번호 발송 성공');
            return { success: true };
        } else {
            console.log('❌ [SEND SMS] 인증번호 발송 실패');
            console.log(`  📝 오류: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('❌ [SEND SMS] 네트워크 오류');
        console.log(`  📝 오류: ${error}`);
        return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
};

/**
 * 휴대폰 인증번호 확인
 */
export const confirmPhoneCode = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('🔍 [VERIFY SMS] 인증번호 확인 시작');
        console.log(`  📱 휴대폰 번호: ${phone}`);
        console.log(`  🔢 인증번호: ${code}`);

        const response = await fetch(`${API_BASE_URL}/auth/phone/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, code }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ [VERIFY SMS] 인증번호 확인 성공');
            return { success: true };
        } else {
            console.log('❌ [VERIFY SMS] 인증번호 확인 실패');
            console.log(`  📝 오류: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('❌ [VERIFY SMS] 네트워크 오류');
        console.log(`  📝 오류: ${error}`);
        return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
};

/**
 * 아이디 찾기 (휴대폰 번호로)
 */
export const findIdByPhone = async (phone: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    try {
        console.log('🔍 [FIND ID] 아이디 찾기 시작');
        console.log(`  📱 휴대폰 번호: ${phone}`);

        const response = await fetch(`${API_BASE_URL}/auth/find-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.log('❌ [FIND ID] 서버 응답이 JSON이 아님');
            console.log(`  📝 Content-Type: ${contentType}`);
            return { success: false, error: '서버 응답 오류가 발생했습니다.' };
        }

        const data = await response.json();

        if (response.ok) {
            console.log('✅ [FIND ID] 아이디 찾기 성공');
            console.log(`  📧 찾은 이메일: ${data.email}`);
            return { success: true, email: data.email };
        } else {
            console.log('❌ [FIND ID] 아이디 찾기 실패');
            console.log(`  📝 오류: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('❌ [FIND ID] 네트워크 오류');
        console.log(`  📝 오류: ${error}`);
        return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
};

/**
 * 비밀번호 찾기 (이메일로)
 */
export const findPasswordByEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('🔍 [FIND PASSWORD] 비밀번호 찾기 시작');
        console.log(`  📧 이메일: ${email}`);

        const response = await fetch(`${API_BASE_URL}/auth/find-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.log('❌ [FIND PASSWORD] 서버 응답이 JSON이 아님');
            console.log(`  📝 Content-Type: ${contentType}`);
            return { success: false, error: '서버 응답 오류가 발생했습니다.' };
        }

        const data = await response.json();

        if (response.ok) {
            console.log('✅ [FIND PASSWORD] 비밀번호 찾기 성공');
            console.log(`  📧 이메일: ${email}`);
            return { success: true };
        } else {
            console.log('❌ [FIND PASSWORD] 비밀번호 찾기 실패');
            console.log(`  📝 오류: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('❌ [FIND PASSWORD] 네트워크 오류');
        console.log(`  📝 오류: ${error}`);
        return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
}; 