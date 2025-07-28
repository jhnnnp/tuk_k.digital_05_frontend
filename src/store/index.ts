import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './userSlice';

// 루트 리듀서
const rootReducer = combineReducers({
    user: userReducer,
    // 다른 리듀서들 추가 가능
});

// 사용자별 persist 설정 생성 함수
export const createUserPersistConfig = (userId: string) => ({
    key: `user_${userId}_root`,
    storage: AsyncStorage,
    whitelist: ['user'], // user 상태만 저장
    blacklist: [], // 저장하지 않을 상태들
});

// 기본 persist 설정 (사용자 ID가 없을 때)
const defaultPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['user'],
    blacklist: [],
};

// 동적 persist 리듀서 생성
const createPersistedReducer = (userId?: string) => {
    const persistConfig = userId ? createUserPersistConfig(userId) : defaultPersistConfig;
    return persistReducer(persistConfig, rootReducer);
};

// 사용자별 스토어 생성 함수
export const createUserStore = (userId?: string) => {
    const persistedReducer = createPersistedReducer(userId);

    const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }),
    });

    const persistor = persistStore(store);

    return { store, persistor };
};

// 기본 스토어 (앱 초기화 시 사용)
const { store, persistor } = createUserStore();

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 