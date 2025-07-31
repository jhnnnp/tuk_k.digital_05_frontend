import React, { useCallback, useEffect, useRef } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Platform,
    Vibration
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    withSpring,
    withRepeat,
    Easing,
    runOnJS,
    interpolate,
    interpolateColor,
    Extrapolate,
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../styles/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface IntroScreenProps {
    onAnimationComplete?: () => void;
}

export default function IntroScreen({ onAnimationComplete }: IntroScreenProps) {
    const { theme } = useTheme();

    // Clean animation values
    const backgroundOpacity = useSharedValue(0);
    const titleScale = useSharedValue(0.3);
    const titleOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(40);
    const loadingProgress = useSharedValue(0);
    const finalFadeOut = useSharedValue(1);

    // Enhanced completion callback
    const onAnimationFinish = useCallback(() => {
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Vibration.vibrate([100, 50, 100]);
        }

        if (onAnimationComplete) {
            onAnimationComplete();
        }
    }, [onAnimationComplete]);

    // Clean animation sequence
    useEffect(() => {
        const sequence = async () => {
            // Phase 1: Background fade in (0-0.3s)
            backgroundOpacity.value = withTiming(1, {
                duration: 600,
                easing: Easing.out(Easing.cubic)
            });

            // Phase 2: Logo entrance with dramatic scale (0.5-1.8s)
            setTimeout(() => {
                titleOpacity.value = withTiming(1, { duration: 1500 });
                titleScale.value = withSpring(1, {
                    damping: 10,
                    stiffness: 60
                });
            }, 500);

            // Phase 3: Loading animation (2.5-4s)
            setTimeout(() => {
                loadingProgress.value = withTiming(1, {
                    duration: 1500,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                });
            }, 2500);

            // Phase 4: Final fade out (1-2s)
            setTimeout(() => {
                finalFadeOut.value = withTiming(0, {
                    duration: 1000,
                    easing: Easing.out(Easing.cubic)
                }, (finished) => {
                    if (finished) {
                        runOnJS(onAnimationFinish)();
                    }
                });
            }, 1000);
        };

        sequence();
    }, []);

    // Clean animated styles
    const backgroundStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    const titleContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: titleScale.value }],
        opacity: titleOpacity.value,
    }));

    const textContainerStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const loadingBarStyle = useAnimatedStyle(() => ({
        width: `${loadingProgress.value * 100}%`,
        opacity: interpolate(
            loadingProgress.value,
            [0, 0.1, 0.9, 1],
            [0, 1, 1, 0],
            Extrapolate.CLAMP
        ),
        transform: [
            {
                scaleX: interpolate(
                    loadingProgress.value,
                    [0, 0.5, 1],
                    [0.8, 1, 1],
                    Extrapolate.CLAMP
                )
            }
        ],
    }));

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            {/* Clean White Background */}
            <Animated.View style={[StyleSheet.absoluteFillObject, backgroundStyle]}>
                <View style={styles.backgroundGradient}>
                    <LinearGradient
                        colors={['#ffffff', '#f8f9fa', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>
            </Animated.View>

            {/* Animated Title Section */}
            <View style={[styles.titleContainer, titleContainerStyle]}>
                <Animated.Image
                    source={require('../assets/Text Logo.png')}
                    resizeMode="contain"
                    style={styles.logoImage}
                />
            </View>

            {/* Clean Text Section */}
            <Animated.View style={[styles.textContainer, textContainerStyle]}>
            </Animated.View>

            {/* University Logo */}
            <View style={styles.universityLogoContainer}>
                <Animated.Image
                    source={require('../assets/tukorea.png')}
                    resizeMode="contain"
                    style={styles.universityLogo}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    backgroundGradient: {
        flex: 1,
        width: '100%',
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 100,
    },
    titleText: {
        fontSize: 76,
        fontWeight: '900',
        letterSpacing: 16,
        marginBottom: 24,
        textTransform: 'uppercase',
        color: '#1e3a8a',
        textShadowColor: 'rgba(30, 58, 138, 0.15)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    },
    subtitleText: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 6,
        textTransform: 'uppercase',
        color: '#1e3a8a',
        opacity: 0.85,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 140,
    },
    taglineText: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        color: '#1f2937',
        marginBottom: 18,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    },
    sloganText: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        color: '#6b7280',
        letterSpacing: 1,
        lineHeight: 28,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    },
    universityLogoContainer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
        padding: 10,
    },
    universityLogo: {
        width: 160,
        height: 80,
        opacity: 0.7,
    },
    logoImage: {
        width: 300,
        height: 300,
        marginBottom: 24,
        tintColor: '#1e3a8a',
    },
    universityText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        textAlign: 'center',
        letterSpacing: 1,
        opacity: 0.8,
    },
});
