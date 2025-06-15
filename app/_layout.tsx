// app/_layout.tsx (actualización)
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoadingScreen from '@/components/LoadingScreen';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
	});
	const [isLoadingComplete, setIsLoadingComplete] = useState(false);
	const [showCustomLoading, setShowCustomLoading] = useState(false);

	useEffect(() => {
		if (loaded) {
			// Ocultar el splash screen nativo de Expo
			SplashScreen.hideAsync();
			// Mostrar nuestro loading screen personalizado
			setShowCustomLoading(true);
		}
	}, [loaded]);

	const handleLoadingComplete = () => {
		setIsLoadingComplete(true);
		setShowCustomLoading(false);
	};

	// Si las fuentes no están cargadas, no mostrar nada (splash screen nativo se mantiene)
	if (!loaded) {
		return null;
	}

	// Mostrar loading screen personalizado
	if (showCustomLoading && !isLoadingComplete) {
		return (
			<LoadingScreen
				onLoadingComplete={handleLoadingComplete}
				duration={3000} // 3 segundos de loading
			/>
		);
	}

	// App principal
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ActionSheetProvider>
				<ThemeProvider
					value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
				>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
					</Stack>
				</ThemeProvider>
			</ActionSheetProvider>
		</GestureHandlerRootView>
	);
}
