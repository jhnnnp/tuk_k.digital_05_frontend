import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../pages/SettingsScreen';
import AppLockScreen from '../pages/AppLockScreen';

import NetworkSettingsScreen from '../screens/settings/NetworkSettingsScreen';
import WiFiSettingsScreen from '../screens/settings/WiFiSettingsScreen';
import MobileDataSettingsScreen from '../screens/settings/MobileDataSettingsScreen';
import QuietTimeSettingsScreen from '../screens/settings/QuietTimeSettingsScreen';
import DataRetentionSettingsScreen from '../screens/settings/DataRetentionSettingsScreen';
import QualitySettingsScreen from '../screens/settings/QualitySettingsScreen';

const Stack = createStackNavigator();

export default function SettingsStackNavigator({ onLogout }: { onLogout: () => void }) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="SettingsMain"
                component={(props) => <SettingsScreen {...props} onLogout={onLogout} />}
            />
            <Stack.Screen
                name="NetworkSettings"
                component={NetworkSettingsScreen}
            />
            <Stack.Screen
                name="WiFiSettings"
                component={WiFiSettingsScreen}
            />
            <Stack.Screen
                name="MobileDataSettings"
                component={MobileDataSettingsScreen}
            />
            <Stack.Screen
                name="QuietTimeSettings"
                component={QuietTimeSettingsScreen}
            />
            <Stack.Screen
                name="DataRetentionSettings"
                component={DataRetentionSettingsScreen}
            />
            <Stack.Screen
                name="QualitySettings"
                component={QualitySettingsScreen}
            />

            <Stack.Screen
                name="AppLock"
                component={AppLockScreen}
            />
        </Stack.Navigator>
    );
} 