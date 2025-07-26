import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    async set(key: string, value: string) {
        await AsyncStorage.setItem(key, value);
    },
    async get(key: string) {
        return AsyncStorage.getItem(key);
    },
    async remove(key: string) {
        await AsyncStorage.removeItem(key);
    }
}; 