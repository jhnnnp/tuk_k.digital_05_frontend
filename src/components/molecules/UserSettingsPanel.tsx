import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { useUserDataManagement } from '../../hooks/useUserDataManagement';
import { Button } from '../atoms/Button';
import { Card } from '../layout/Card';
import { SectionTitle } from '../layout/SectionTitle';

export const UserSettingsPanel: React.FC = () => {
    const {
        userSettings,
        isLoading,
        error,
        updateCameraSettings,
        updateNotificationSettings,
        updateDisplaySettings,
        updatePrivacySettings,
        performDataSync,
        performDataBackup,
        performDataRestore,
        performDataClear,
        clearError
    } = useUserDataManagement();

    const [localSettings, setLocalSettings] = useState({
        cameraPreferences: {
            defaultQuality: 'medium' as const,
            autoRecord: false,
            motionDetection: true
        },
        notificationSettings: {
            motionAlerts: true,
            systemAlerts: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        },
        displaySettings: {
            theme: 'auto' as const,
            language: 'ko',
            timezone: 'Asia/Seoul'
        },
        privacySettings: {
            dataRetention: 30,
            analyticsEnabled: true,
            crashReporting: true
        }
    });

    // 사용자 설정 로드
    useEffect(() => {
        if (userSettings) {
            setLocalSettings(prev => ({
                ...prev,
                ...userSettings
            }));
        }
    }, [userSettings]);

    // 에러 처리
    useEffect(() => {
        if (error) {
            Alert.alert('오류', error, [{ text: '확인', onPress: clearError }]);
        }
    }, [error, clearError]);

    const handleCameraSettingChange = (key: string, value: any) => {
        const newSettings = {
            ...localSettings.cameraPreferences,
            [key]: value
        };
        setLocalSettings(prev => ({
            ...prev,
            cameraPreferences: newSettings
        }));
        updateCameraSettings(newSettings);
    };

    const handleNotificationSettingChange = (key: string, value: any) => {
        const newSettings = {
            ...localSettings.notificationSettings,
            [key]: value
        };
        setLocalSettings(prev => ({
            ...prev,
            notificationSettings: newSettings
        }));
        updateNotificationSettings(newSettings);
    };

    const handleDisplaySettingChange = (key: string, value: any) => {
        const newSettings = {
            ...localSettings.displaySettings,
            [key]: value
        };
        setLocalSettings(prev => ({
            ...prev,
            displaySettings: newSettings
        }));
        updateDisplaySettings(newSettings);
    };

    const handlePrivacySettingChange = (key: string, value: any) => {
        const newSettings = {
            ...localSettings.privacySettings,
            [key]: value
        };
        setLocalSettings(prev => ({
            ...prev,
            privacySettings: newSettings
        }));
        updatePrivacySettings(newSettings);
    };

    const handleDataSync = async () => {
        try {
            await performDataSync();
            Alert.alert('성공', '데이터 동기화가 완료되었습니다.');
        } catch (error) {
            Alert.alert('오류', '데이터 동기화에 실패했습니다.');
        }
    };

    const handleDataBackup = async () => {
        try {
            const backupData = await performDataBackup();
            if (backupData) {
                Alert.alert('성공', '데이터 백업이 완료되었습니다.');
            }
        } catch (error) {
            Alert.alert('오류', '데이터 백업에 실패했습니다.');
        }
    };

    const handleDataRestore = async () => {
        Alert.alert(
            '데이터 복원',
            '백업된 데이터로 복원하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '복원',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await performDataRestore();
                            Alert.alert('성공', '데이터 복원이 완료되었습니다.');
                        } catch (error) {
                            Alert.alert('오류', '데이터 복원에 실패했습니다.');
                        }
                    }
                }
            ]
        );
    };

    const handleDataClear = async () => {
        Alert.alert(
            '데이터 삭제',
            '모든 사용자 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await performDataClear();
                            Alert.alert('성공', '데이터 삭제가 완료되었습니다.');
                        } catch (error) {
                            Alert.alert('오류', '데이터 삭제에 실패했습니다.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <SectionTitle title="사용자 설정" />

            {/* 카메라 설정 */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>카메라 설정</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>자동 녹화</Text>
                    <Switch
                        value={localSettings.cameraPreferences.autoRecord}
                        onValueChange={(value) => handleCameraSettingChange('autoRecord', value)}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>모션 감지</Text>
                    <Switch
                        value={localSettings.cameraPreferences.motionDetection}
                        onValueChange={(value) => handleCameraSettingChange('motionDetection', value)}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>기본 화질</Text>
                    <Text style={styles.settingValue}>
                        {localSettings.cameraPreferences.defaultQuality === 'low' ? '낮음' :
                            localSettings.cameraPreferences.defaultQuality === 'medium' ? '보통' : '높음'}
                    </Text>
                </View>
            </Card>

            {/* 알림 설정 */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>알림 설정</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>모션 알림</Text>
                    <Switch
                        value={localSettings.notificationSettings.motionAlerts}
                        onValueChange={(value) => handleNotificationSettingChange('motionAlerts', value)}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>시스템 알림</Text>
                    <Switch
                        value={localSettings.notificationSettings.systemAlerts}
                        onValueChange={(value) => handleNotificationSettingChange('systemAlerts', value)}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>방해 금지 시간</Text>
                    <Switch
                        value={localSettings.notificationSettings.quietHours.enabled}
                        onValueChange={(value) => handleNotificationSettingChange('quietHours', {
                            ...localSettings.notificationSettings.quietHours,
                            enabled: value
                        })}
                        disabled={isLoading}
                    />
                </View>
            </Card>

            {/* 디스플레이 설정 */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>디스플레이 설정</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>테마</Text>
                    <Text style={styles.settingValue}>
                        {localSettings.displaySettings.theme === 'light' ? '밝음' :
                            localSettings.displaySettings.theme === 'dark' ? '어둠' : '자동'}
                    </Text>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>언어</Text>
                    <Text style={styles.settingValue}>
                        {localSettings.displaySettings.language === 'ko' ? '한국어' : 'English'}
                    </Text>
                </View>
            </Card>

            {/* 개인정보 설정 */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>개인정보 설정</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>데이터 보관 기간</Text>
                    <Text style={styles.settingValue}>{localSettings.privacySettings.dataRetention}일</Text>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>분석 데이터 수집</Text>
                    <Switch
                        value={localSettings.privacySettings.analyticsEnabled}
                        onValueChange={(value) => handlePrivacySettingChange('analyticsEnabled', value)}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>크래시 리포트</Text>
                    <Switch
                        value={localSettings.privacySettings.crashReporting}
                        onValueChange={(value) => handlePrivacySettingChange('crashReporting', value)}
                        disabled={isLoading}
                    />
                </View>
            </Card>

            {/* 데이터 관리 */}
            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>데이터 관리</Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="데이터 동기화"
                        onPress={handleDataSync}
                        disabled={isLoading}
                        style={styles.button}
                    />

                    <Button
                        title="데이터 백업"
                        onPress={handleDataBackup}
                        disabled={isLoading}
                        style={styles.button}
                    />

                    <Button
                        title="데이터 복원"
                        onPress={handleDataRestore}
                        disabled={isLoading}
                        style={styles.button}
                    />

                    <Button
                        title="데이터 삭제"
                        onPress={handleDataClear}
                        disabled={isLoading}
                        style={[styles.button, styles.dangerButton]}
                    />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    settingValue: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        marginBottom: 8,
    },
    dangerButton: {
        backgroundColor: '#ff4444',
    },
}); 