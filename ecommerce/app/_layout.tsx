// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from '../src/features/Store';



export default function RootLayout() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken || '');
            setLoading(false);
        };
        checkToken();
    }, []);


    if (loading) return null;
console.log(token);

    return (
        <Provider store={store}>
            <Stack screenOptions={{ headerShown: false }}>
                {token ? (
                    <Stack.Screen name="(drawer)" />
                ) : (
                    <>
                        <Stack.Screen name="Login" />
                        <Stack.Screen name="Register" />
                    </>
                )}
            </Stack>
        </Provider>
    );
}