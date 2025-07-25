import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppNavigator />
            </ThemeProvider>
        </SafeAreaProvider>
    );
} 