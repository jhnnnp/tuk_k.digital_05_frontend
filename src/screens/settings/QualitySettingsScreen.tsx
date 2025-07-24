import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

export default function QualitySettingsScreen() {
    const { theme } = useTheme();

    const [selectedQuality, setSelectedQuality] = useState('1080p');

    const qualityOptions = [
        {
            id: '4k',
            name: '4K Ultra HD',
            resolution: '3840x2160',
            description: '최고 화질, 대용량 저장공간 필요',
            icon: 'videocam'
        },
        {
            id: '1080p',
            name: 'Full HD',
            resolution: '1920x1080',
            description: '고화질, 권장 설정',
            icon: 'videocam'
        },
        {
            id: '720p',
            name: 'HD',
            resolution: '1280x720',
            description: '표준 화질, 빠른 처리',
            icon: 'videocam'
        },
        {
            id: '480p',
            name: 'SD',
            resolution: '854x480',
            description: '저화질, 최소 저장공간',
            icon: 'videocam'
        }
    ];

    const handleQualitySelect = (quality: string) => {
        setSelectedQuality(quality);
        Alert.alert(
            '화질 설정 완료',
            `${qualityOptions.find(q => q.id === quality)?.name}로 설정되었습니다.`,
            [{ text: '확인' }]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 헤더 */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.surfaceVariant,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 16
                        }}
                        onPress={() => {/* 네비게이션 뒤로가기 */ }}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontFamily: 'GoogleSans-Bold',
                        color: theme.textPrimary
                    }}>
                        화질 설정
                    </Text>
                </View>

                {/* 설명 */}
                <View style={{
                    backgroundColor: theme.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 20
                    }}>
                        녹화 화질을 선택하세요. 높은 화질은 더 선명한 영상을 제공하지만 더 많은 저장공간을 사용합니다.
                    </Text>
                </View>

                {/* 화질 옵션들 */}
                {qualityOptions.map((option, index) => (
                    <TouchableOpacity
                        key={option.id}
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 12,
                            borderWidth: selectedQuality === option.id ? 2 : 1,
                            borderColor: selectedQuality === option.id ? theme.primary : theme.outline
                        }}
                        onPress={() => handleQualitySelect(option.id)}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{ flex: 1 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <Ionicons
                                        name={option.icon as any}
                                        size={20}
                                        color={selectedQuality === option.id ? theme.primary : theme.textSecondary}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: 'GoogleSans-Medium',
                                        color: selectedQuality === option.id ? theme.primary : theme.textPrimary
                                    }}>
                                        {option.name}
                                    </Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary,
                                    marginBottom: 4
                                }}>
                                    {option.resolution}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'GoogleSans-Regular',
                                    color: theme.textSecondary,
                                    opacity: 0.8
                                }}>
                                    {option.description}
                                </Text>
                            </View>
                            {selectedQuality === option.id && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={theme.primary}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* 저장공간 정보 */}
                <View style={{
                    backgroundColor: theme.surfaceVariant,
                    borderRadius: 16,
                    padding: 16,
                    marginTop: 16
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'GoogleSans-Medium',
                        color: theme.textPrimary,
                        marginBottom: 8
                    }}>
                        저장공간 정보
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        fontFamily: 'GoogleSans-Regular',
                        color: theme.textSecondary,
                        lineHeight: 16
                    }}>
                        • 4K: 1시간당 약 8GB{'\n'}
                        • Full HD: 1시간당 약 2GB{'\n'}
                        • HD: 1시간당 약 1GB{'\n'}
                        • SD: 1시간당 약 500MB
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 