import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

interface ProfileHeaderProps {
    onMenuPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onMenuPress }) => {
    const { theme } = useTheme();

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg
        }}>
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                    <Text style={{
                        fontFamily: 'GoogleSans-Medium',
                        fontSize: 20,
                        color: theme.primary
                    }}>
                        TIBO
                    </Text>
                    <View style={{
                        backgroundColor: theme.primary,
                        borderRadius: 12,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs
                    }}>
                        <Text style={{
                            fontFamily: 'GoogleSans-Medium',
                            fontSize: 10,
                            color: theme.onPrimary
                        }}>
                            온라인
                        </Text>
                    </View>
                </View>
                <Text style={{
                    fontFamily: 'GoogleSans-Regular',
                    fontSize: 14,
                    color: theme.textSecondary,
                    marginTop: theme.spacing.xs
                }}>
                    스마트 홈 로봇 카메라 시스템
                </Text>
            </View>

            <TouchableOpacity onPress={onMenuPress}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
        </View>
    );
}; 