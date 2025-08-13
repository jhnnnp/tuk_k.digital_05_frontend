import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
    BackHandler,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { unifiedTheme as theme } from '../../styles/theme';
import NativeVideoPlayerService from '../../services/NativeVideoPlayerService';

interface VideoPlayerProps {
    videoUri: string;
    title: string;
    isVisible: boolean;
    onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUri,
    title,
    isVisible,
    onClose,
}) => {
    const [status, setStatus] = useState<any>({});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<Video>(null);

    // Android 뒤로가기 버튼 처리
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isVisible) {
                onClose();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [isVisible, onClose]);

    const handlePlaybackStatusUpdate = (status: any) => {
        setStatus(status);
    };

    // 외부 네이티브 비디오 플레이어로 열기
    const openInNativePlayer = async () => {
        try {
            await NativeVideoPlayerService.openInNativePlayer({
                videoUri,
                title,
                description: title
            });
        } catch (error) {
            console.error('외부 플레이어 열기 실패:', error);
            Alert.alert('오류', '비디오를 열 수 없습니다.');
        }
    };

    // 전체화면 토글
    const toggleFullscreen = async () => {
        try {
            if (videoRef.current) {
                if (isFullscreen) {
                    await videoRef.current.presentFullscreenPlayer();
                } else {
                    await videoRef.current.dismissFullscreenPlayer();
                }
                setIsFullscreen(!isFullscreen);
            }
        } catch (error) {
            console.error('전체화면 토글 실패:', error);
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="fullScreen"
            statusBarTranslucent={true}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>

                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={toggleFullscreen}
                        >
                            <Ionicons
                                name={isFullscreen ? "contract" : "expand"}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={openInNativePlayer}
                        >
                            <Ionicons
                                name={Platform.OS === 'ios' ? "play-circle" : "play-circle"}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Video Player */}
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: videoUri }}
                        style={styles.video}
                        {...NativeVideoPlayerService.getPlatformOptimizedSettings()}
                        isLooping={false}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        posterStyle={{ resizeMode: 'contain' }}
                        onFullscreenUpdate={async (event) => {
                            setIsFullscreen(event.fullscreenUpdate === 1);
                        }}
                    />
                </View>

                {/* 플랫폼별 안내 메시지 */}
                <View style={styles.infoContainer}>
                    <View style={styles.platformInfo}>
                        <Ionicons
                            name={NativeVideoPlayerService.getPlatformInfo().icon}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.infoText}>
                            {NativeVideoPlayerService.getPlatformInfo().name}
                        </Text>
                    </View>
                    <Text style={styles.infoSubText}>
                        {NativeVideoPlayerService.getPlatformInfo().features.join(' • ')}
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        alignItems: 'center',
    },
    platformInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    infoSubText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default VideoPlayer; 