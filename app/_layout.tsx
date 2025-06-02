import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ActionSheetProvider>
				<ThemeProvider
					value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
				>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen
							name="restaurant/[id]"
							options={{
								presentation: 'card',
								gestureEnabled: true,
								animation: 'slide_from_right',
							}}
						/>
						<Stack.Screen
							name="profile/register-restaurant"
							options={{
								presentation: 'modal',
								gestureEnabled: true,
								animation: 'slide_from_right',
							}}
						/>
					</Stack>
				</ThemeProvider>
			</ActionSheetProvider>
		</GestureHandlerRootView>
	);
}
