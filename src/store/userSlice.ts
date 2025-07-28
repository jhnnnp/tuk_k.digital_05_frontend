import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../services/UserDataService';

export interface UserState {
    userId: string | null;
    settings: UserSettings | null;
    appState: any;
    preferences: any;
    isLoaded: boolean;
    lastSync: string | null;
}

const initialState: UserState = {
    userId: null,
    settings: null,
    appState: null,
    preferences: null,
    isLoaded: false,
    lastSync: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        setUserSettings: (state, action: PayloadAction<UserSettings>) => {
            state.settings = action.payload;
        },
        updateUserSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
            if (state.settings) {
                state.settings = { ...state.settings, ...action.payload };
            } else {
                state.settings = action.payload as UserSettings;
            }
        },
        setAppState: (state, action: PayloadAction<any>) => {
            state.appState = action.payload;
        },
        setPreferences: (state, action: PayloadAction<any>) => {
            state.preferences = action.payload;
        },
        setLastSync: (state, action: PayloadAction<string>) => {
            state.lastSync = action.payload;
        },
        setLoaded: (state, action: PayloadAction<boolean>) => {
            state.isLoaded = action.payload;
        },
        clearUserData: (state) => {
            state.userId = null;
            state.settings = null;
            state.appState = null;
            state.preferences = null;
            state.lastSync = null;
            state.isLoaded = false;
        },
        restoreUserState: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload, isLoaded: true };
        },
    },
});

export const {
    setUserId,
    setUserSettings,
    updateUserSettings,
    setAppState,
    setPreferences,
    setLastSync,
    setLoaded,
    clearUserData,
    restoreUserState,
} = userSlice.actions;

export default userSlice.reducer; 