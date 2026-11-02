import * as SecureStore from 'expo-secure-store';

const KEY = 'recurrly_token';

export const getStoredToken = () => SecureStore.getItemAsync(KEY);

export const storeToken = (token: string) => SecureStore.setItemAsync(KEY, token);

export const clearStoredToken = () => SecureStore.deleteItemAsync(KEY);
