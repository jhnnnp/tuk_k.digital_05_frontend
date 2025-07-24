import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
    return (
        <ThemeProvider>
            <AppNavigator />
        </ThemeProvider>
    );
} 