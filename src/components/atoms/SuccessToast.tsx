import React from 'react';
import Toast, { BaseToast } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';

export const SuccessToast = (props: any) => {
    const { theme } = useTheme();
    return (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: theme.colors.success,
                borderRadius: theme.radii.md,
                backgroundColor: theme.colors.surface,
                minHeight: 60,
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.lg,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.10,
                shadowRadius: 12,
                elevation: 4,
                flexDirection: 'row',
                alignItems: 'center',
            }}
            text1Style={{ fontWeight: theme.fonts.weight.bold, color: theme.colors.success, fontSize: theme.fonts.size.md, fontFamily: theme.fonts.bold }}
            text2Style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.size.sm, fontFamily: theme.fonts.regular }}
            renderLeadingIcon={() => <Ionicons name="checkmark-circle" size={26} color={theme.colors.success} style={{ marginRight: 10 }} />}
            renderTrailingIcon={() => <Ionicons name="close" size={22} color={theme.colors.textSecondary} style={{ marginLeft: 10 }} />}
        />
    );
};

export default Toast; 