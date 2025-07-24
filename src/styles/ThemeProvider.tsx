// src/styles/ThemeProvider.tsx
import React, { createContext, useContext, useState, useMemo, PropsWithChildren } from 'react';
import { lightTheme, darkTheme } from './theme';

// ThemeContext 타입 명확화
interface ThemeContextType {
    toggleTheme: () => void;
    isDark: boolean;
    theme: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType>({
    toggleTheme: () => { },
    isDark: false,
    theme: lightTheme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [isDark, setIsDark] = useState(false);
    const toggleTheme = () => setIsDark((v) => !v);
    const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

    return (
        <ThemeContext.Provider value={{ toggleTheme, isDark, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
