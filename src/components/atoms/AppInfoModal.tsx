import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StatusBar,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../styles/ThemeProvider';

interface AppInfoModalProps {
    visible: boolean;
    onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function AppInfoModal({ visible, onClose }: AppInfoModalProps) {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);

    // 애니메이션 값들
    const modalScale = useSharedValue(0);
    const modalOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(30);
    const buttonScale = useSharedValue(1);
    const githubButtonScale = useSharedValue(1);
    const emailButtonScale = useSharedValue(1);
    const toastScale = useSharedValue(0);
    const toastOpacity = useSharedValue(0);

    // 모달 표시 애니메이션
    useEffect(() => {
        if (visible) {
            // 배경 페이드인
            backgroundOpacity.value = withTiming(1, { duration: 200 });

            // 모달 스케일 애니메이션
            modalScale.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.8,
            });

            // 모달 투명도
            modalOpacity.value = withTiming(1, { duration: 300 });



            // 콘텐츠 애니메이션
            setTimeout(() => {
                contentOpacity.value = withTiming(1, { duration: 400 });
                contentTranslateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 200,
                });
            }, 200);
        } else {
            // 모달 숨김 애니메이션
            backgroundOpacity.value = withTiming(0, { duration: 200 });
            modalScale.value = withSpring(0, {
                damping: 20,
                stiffness: 300,
            });
            modalOpacity.value = withTiming(0, { duration: 200 });
            contentOpacity.value = withTiming(0, { duration: 200 });
            contentTranslateY.value = withTiming(30, { duration: 200 });
        }
    }, [visible]);

    // 애니메이션 스타일들
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value,
        transform: [
            { scale: modalScale.value },
            {
                translateY: interpolate(
                    modalScale.value,
                    [0, 1],
                    [50, 0],
                    Extrapolate.CLAMP
                ),
            },
        ],
    }));



    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const githubButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: githubButtonScale.value }],
    }));

    const emailButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: emailButtonScale.value }],
    }));

    const toastAnimatedStyle = useAnimatedStyle(() => ({
        opacity: toastOpacity.value,
        transform: [{ scale: toastScale.value }],
    }));

    // 버튼 터치 핸들러
    const handleClosePress = () => {
        Haptics.selectionAsync();
        buttonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );
        setTimeout(onClose, 100);
    };

    const handleGithubPress = async () => {
        Haptics.selectionAsync();
        githubButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );

        try {
            await Linking.openURL('https://github.com/jhnnnp');
        } catch (error) {
            console.error('GitHub 링크 열기 실패:', error);
        }
    };

    const handleEmailPress = async () => {
        Haptics.selectionAsync();
        emailButtonScale.value = withSequence(
            withSpring(0.95, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );

        try {
            await Clipboard.setStringAsync('jhnnn.park@gmail.com');

            // 토스트 표시
            setShowCopyToast(true);
            toastScale.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.8,
            });
            toastOpacity.value = withTiming(1, { duration: 200 });

            // 2초 후 토스트 숨김
            setTimeout(() => {
                toastScale.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                });
                toastOpacity.value = withTiming(0, { duration: 200 });
                setTimeout(() => setShowCopyToast(false), 200);
            }, 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            Alert.alert('복사 실패', '이메일 주소 복사에 실패했습니다.');
        }
    };

    const InfoItem = ({ icon, title, value, color = theme.textPrimary }: {
        icon: string;
        title: string;
        value: string;
        color?: string;
    }) => (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            paddingVertical: 6,
            paddingHorizontal: 8,
            backgroundColor: 'transparent',
            borderRadius: 6,
        }}>
            <View style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: theme.primary + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
            }}>
                <Ionicons name={icon as any} size={16} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 13,
                    fontFamily: 'GoogleSans-Medium',
                    color: theme.textSecondary,
                    marginBottom: 3,
                }}>
                    {title}
                </Text>
                <Text style={{
                    fontSize: 16,
                    fontFamily: 'GoogleSans-Bold',
                    color: color,
                }}>
                    {value}
                </Text>
            </View>
        </View>
    );

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            {/* 배경 오버레이 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    backgroundAnimatedStyle,
                ]}
            >
                {/* 모달 컨테이너 */}
                <Animated.View
                    style={[
                        {
                            width: screenWidth * 0.8,
                            maxWidth: 340,
                            backgroundColor: theme.surface,
                            borderRadius: 16,
                            padding: 18,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 15 },
                            shadowOpacity: 0.25,
                            shadowRadius: 30,
                            elevation: 15,
                        },
                        modalAnimatedStyle,
                    ]}
                >


                    {/* 콘텐츠 */}
                    <Animated.View style={contentAnimatedStyle}>
                        {/* 앱 정보 */}
                        <View style={{
                            backgroundColor: theme.background,
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: theme.outline + '15',
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'GoogleSans-Bold',
                                color: theme.textPrimary,
                                marginBottom: 10,
                            }}>
                                앱 정보
                            </Text>
                            <InfoItem
                                icon="phone-portrait"
                                title="앱 이름"
                                value="TIBO"
                            />
                        </View>

                        {/* 개발자 정보 */}
                        <View style={{
                            backgroundColor: theme.background,
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: theme.outline + '15',
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'GoogleSans-Bold',
                                color: theme.textPrimary,
                                marginBottom: 10,
                            }}>
                                개발자 정보
                            </Text>
                            <InfoItem
                                icon="person"
                                title="개발자"
                                value="박진한"
                            />
                            <InfoItem
                                icon="school"
                                title="소속"
                                value="한국공학대학교"
                            />
                            <InfoItem
                                icon="id-card"
                                title="학번"
                                value="2022150049"
                            />
                            <InfoItem
                                icon="mail"
                                title="이메일"
                                value="jhnnn.park@gmail.com"
                            />
                        </View>

                        {/* 링크 버튼들 */}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Animated.View style={[{ flex: 1 }, githubButtonAnimatedStyle]}>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 14,
                                        borderRadius: 10,
                                        borderWidth: 1.5,
                                        borderColor: theme.outline + '30',
                                        backgroundColor: 'transparent',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={handleGithubPress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="logo-github" size={18} color={theme.textPrimary} />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontFamily: 'GoogleSans-Medium',
                                            color: theme.textPrimary,
                                            marginTop: 3,
                                        }}
                                    >
                                        GitHub
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View style={[{ flex: 1 }, emailButtonAnimatedStyle]}>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 14,
                                        borderRadius: 10,
                                        borderWidth: 1.5,
                                        borderColor: theme.outline + '30',
                                        backgroundColor: 'transparent',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={handleEmailPress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="mail" size={18} color={theme.textPrimary} />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontFamily: 'GoogleSans-Medium',
                                            color: theme.textPrimary,
                                            marginTop: 3,
                                        }}
                                    >
                                        이메일
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </Animated.View>

                    {/* 버튼 */}
                    <Animated.View
                        style={[
                            {
                                width: '100%',
                                marginTop: 10,
                            },
                            buttonAnimatedStyle,
                        ]}
                    >
                        <TouchableOpacity
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 18,
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={handleClosePress}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[theme.primary, theme.primary + 'DD']}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 10,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'GoogleSans-Medium',
                                    color: theme.onPrimary,
                                }}
                            >
                                확인
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Animated.View>

            {/* 복사 완료 토스트 */}
            {showCopyToast && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            bottom: 100,
                            left: 20,
                            right: 20,
                            backgroundColor: theme.surface,
                            borderRadius: 12,
                            padding: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 10,
                        },
                        toastAnimatedStyle,
                    ]}
                >
                    <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: theme.success + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}>
                        <Ionicons name="checkmark" size={18} color={theme.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: 'GoogleSans-Bold',
                            color: theme.textPrimary,
                            marginBottom: 2,
                        }}>
                            복사 완료
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'GoogleSans-Regular',
                            color: theme.textSecondary,
                        }}>
                            이메일 주소가 클립보드에 복사되었습니다
                        </Text>
                    </View>
                </Animated.View>
            )}
        </Modal>
    );
} 