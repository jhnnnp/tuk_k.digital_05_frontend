import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../pages/SettingsScreen';
import NetworkSettingsScreen from '../screens/settings/NetworkSettingsScreen';
import WiFiSettingsScreen from '../screens/settings/WiFiSettingsScreen';
import MobileDataSettingsScreen from '../screens/settings/MobileDataSettingsScreen';

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
        </Stack.Navigator>
    );
} 