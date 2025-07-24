import React from 'react';
import { View, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../styles/ThemeProvider';

export const Loader = ({ visible = true }: { visible?: boolean }) => {
    const { theme } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;
    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: theme.colors.overlay }]}> {/* theme 기반 오버레이 */}
            <View style={[
                styles.loaderBox,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radii.lg,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.10,
                    shadowRadius: 16,
                    elevation: 6,
                },
            ]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    loaderBox: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 88,
        minHeight: 88,
    },
}); 