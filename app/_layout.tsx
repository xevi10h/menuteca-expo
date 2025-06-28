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
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
	});
	const [showCustomLoading, setShowCustomLoading] = useState(false);

	// Use the app initialization hook
	const { isInitialized, isLoading, error } = useAppInitialization();

	useEffect(() => {
		if (loaded) {
			// Hide native splash screen
			SplashScreen.hideAsync();
			// Show our custom loading screen
			setShowCustomLoading(true);
		}
	}, [loaded]);

	const handleLoadingComplete = () => {
		setShowCustomLoading(false);
	};

	// Don't render anything if fonts aren't loaded
	if (!loaded) {
		return null;
	}

	// Show custom loading screen during app initialization
	if (showCustomLoading && (!isInitialized || isLoading)) {
		return (
			<LoadingScreen
				onLoadingComplete={handleLoadingComplete}
				duration={isLoading ? undefined : 2000} // Show until loading completes, or 2s minimum
			/>
		);
	}

	// Show error screen if initialization failed critically
	if (error && !isInitialized) {
		console.error('Critical app initialization error:', error);
		// Still proceed to show the app - most errors aren't critical
	}

	// Main app
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
