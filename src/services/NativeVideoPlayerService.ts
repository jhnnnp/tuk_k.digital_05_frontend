import { Platform, Linking, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

interface VideoPlayerOptions {
    videoUri: string;
    title?: string;
    description?: string;
}

class NativeVideoPlayerService {
    /**
     * 갤럭시/아이폰 네이티브 비디오 플레이어로 비디오 열기
     */
    static async openInNativePlayer(options: VideoPlayerOptions): Promise<void> {
        try {
            if (Platform.OS === 'android') {
                await this.openInAndroidPlayer(options);
            } else if (Platform.OS === 'ios') {
                await this.openInIOSPlayer(options);
            }
        } catch (error) {
            console.error('네이티브 플레이어 열기 실패:', error);
            throw error;
        }
    }

    /**
     * Android (갤럭시) 네이티브 비디오 플레이어
     */
    private static async openInAndroidPlayer(options: VideoPlayerOptions): Promise<void> {
        try {
            // 1. 먼저 기본 비디오 플레이어로 열기 시도
            const canOpen = await Linking.canOpenURL(options.videoUri);
            if (canOpen) {
                await Linking.openURL(options.videoUri);
                return;
            }

            // 2. 갤러리 앱으로 열기 시도
            try {
                const galleryUrl = `content://media/external/video/media`;
                await Linking.openURL(galleryUrl);
            } catch (galleryError) {
                console.warn('갤러리 앱 열기 실패:', galleryError);
            }

            // 3. 설치된 비디오 플레이어 앱들로 열기 시도
            const videoApps = [
                'com.sec.android.app.videoplayer', // 갤럭시 비디오 플레이어
                'com.google.android.youtube', // YouTube
                'com.netflix.mediaclient', // Netflix
                'com.spotify.music', // Spotify (음악)
            ];

            for (const appPackage of videoApps) {
                try {
                    const appUrl = `intent://${options.videoUri}#Intent;package=${appPackage};end`;
                    await Linking.openURL(appUrl);
                    return;
                } catch (appError) {
                    console.warn(`${appPackage} 열기 실패:`, appError);
                }
            }

            // 4. 마지막 수단: 파일 다운로드 후 갤러리에서 열기
            await this.downloadAndOpenInGallery(options);

        } catch (error) {
            Alert.alert(
                '비디오 플레이어',
                '기본 비디오 플레이어를 찾을 수 없습니다.\n\n갤러리 앱에서 비디오를 확인하거나, 다른 비디오 플레이어 앱을 설치해주세요.',
                [{ text: '확인' }]
            );
        }
    }

    /**
     * iOS 네이티브 비디오 플레이어
     */
    private static async openInIOSPlayer(options: VideoPlayerOptions): Promise<void> {
        try {
            // iOS에서는 expo-av의 Video 컴포넌트가 이미 네이티브 AVPlayer를 사용
            // 추가로 외부 앱으로 열기 시도
            const canOpen = await Linking.canOpenURL(options.videoUri);
            if (canOpen) {
                await Linking.openURL(options.videoUri);
            } else {
                // iOS 기본 비디오 플레이어 사용 중임을 알림
                Alert.alert(
                    'iOS 비디오 플레이어',
                    'iOS 기본 비디오 플레이어를 사용하고 있습니다.\n\n• 재생/일시정지\n• 스크러빙\n• 전체화면\n• 볼륨 조절\n• 재생 속도 조절\n\n모든 기능을 사용할 수 있습니다.',
                    [{ text: '확인' }]
                );
            }
        } catch (error) {
            console.error('iOS 플레이어 열기 실패:', error);
            Alert.alert('오류', '비디오를 열 수 없습니다.');
        }
    }

    /**
     * 비디오 다운로드 후 갤러리에서 열기
     */
    private static async downloadAndOpenInGallery(options: VideoPlayerOptions): Promise<void> {
        try {
            // 권한 체크
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '미디어 라이브러리 접근 권한이 필요합니다.');
                return;
            }

            // 파일 다운로드
            const fileName = `video_${Date.now()}.mp4`;
            const fileUri = FileSystem.documentDirectory + fileName;

            const downloadResumable = FileSystem.createDownloadResumable(
                options.videoUri,
                fileUri
            );

            const result = await downloadResumable.downloadAsync();
            if (!result || !result.uri) {
                throw new Error('다운로드 실패');
            }

            // 갤러리에 저장
            const asset = await MediaLibrary.createAssetAsync(result.uri);
            await MediaLibrary.createAlbumAsync('TIBO Videos', asset, false);

            Alert.alert(
                '다운로드 완료',
                '비디오가 갤러리에 저장되었습니다.\n갤러리 앱에서 확인해주세요.',
                [{ text: '확인' }]
            );

        } catch (error) {
            console.error('다운로드 및 갤러리 저장 실패:', error);
            Alert.alert('오류', '비디오 다운로드에 실패했습니다.');
        }
    }

    /**
     * 플랫폼별 최적화된 비디오 플레이어 설정 가져오기
     */
    static getPlatformOptimizedSettings() {
        if (Platform.OS === 'android') {
            return {
                useNativeControls: true,
                androidImplementation: 'MediaPlayer',
                shouldPlay: false,
                isMuted: false,
                volume: 1.0,
                resizeMode: 'contain' as const,
            };
        } else if (Platform.OS === 'ios') {
            return {
                useNativeControls: true,
                iosImplementation: 'AVPlayer',
                shouldPlay: false,
                isMuted: false,
                volume: 1.0,
                resizeMode: 'contain' as const,
            };
        }
        return {};
    }

    /**
     * 플랫폼별 비디오 플레이어 정보
     */
    static getPlatformInfo() {
        if (Platform.OS === 'android') {
            return {
                name: '갤럭시 기본 비디오 플레이어',
                icon: 'logo-android',
                features: [
                    '재생/일시정지',
                    '스크러빙',
                    '전체화면',
                    '볼륨 조절',
                    '재생 속도 조절',
                    '화질 조절'
                ]
            };
        } else if (Platform.OS === 'ios') {
            return {
                name: 'iOS 기본 비디오 플레이어',
                icon: 'logo-apple',
                features: [
                    '재생/일시정지',
                    '스크러빙',
                    '전체화면',
                    '볼륨 조절',
                    '재생 속도 조절',
                    'AirPlay 지원'
                ]
            };
        }
        return {
            name: '기본 비디오 플레이어',
            icon: 'play-circle',
            features: ['재생/일시정지', '스크러빙', '전체화면']
        };
    }
}

export default NativeVideoPlayerService; 