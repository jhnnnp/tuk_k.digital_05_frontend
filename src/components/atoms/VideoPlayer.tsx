import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { unifiedTheme as theme } from '../../styles/theme';

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
    const videoRef = useRef<Video>(null);

    const handlePlaybackStatusUpdate = (status: any) => {
        setStatus(status);
    };

    const handlePlayPause = async () => {
        if (status.isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
    };

    const handleSeek = async (position: number) => {
        await videoRef.current?.setPositionAsync(position);
    };

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (status.durationMillis && status.positionMillis) {
            return status.positionMillis / status.durationMillis;
        }
        return 0;
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

                    <View style={styles.headerSpacer} />
                </View>

                {/* Video Player */}
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: videoUri }}
                        style={styles.video}
                        useNativeControls={false}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />

                    {/* Custom Controls Overlay */}
                    <View style={styles.controlsOverlay}>
                        <TouchableOpacity
                            style={styles.playPauseButton}
                            onPress={handlePlayPause}
                        >
                            <Ionicons
                                name={status.isPlaying ? "pause" : "play"}
                                size={32}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${getProgress() * 100}%` }
                            ]}
                        />
                    </View>

                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(status.positionMillis || 0)}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(status.durationMillis || 0)}
                        </Text>
                    </View>
                </View>

                {/* Control Buttons */}
                <View style={styles.controlButtons}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => handleSeek(Math.max(0, (status.positionMillis || 0) - 10000))}
                    >
                        <Ionicons name="play-back" size={20} color="#fff" />
                        <Text style={styles.controlButtonText}>10초 뒤로</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => handleSeek((status.positionMillis || 0) + 10000)}
                    >
                        <Ionicons name="play-forward" size={20} color="#fff" />
                        <Text style={styles.controlButtonText}>10초 앞으로</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    headerSpacer: {
        width: 40,
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
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playPauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    controlButton: {
        alignItems: 'center',
        gap: 4,
    },
    controlButtonText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
});

export default VideoPlayer; 