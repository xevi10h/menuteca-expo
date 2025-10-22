import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoadingScreen from '@/components/LoadingScreen';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/zustand/UserStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();
	const [loaded] = useFonts({
		Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
	});
	const [showCustomLoading, setShowCustomLoading] = useState(false);

	// Check if we're on a web marketing page (skip loading screen and initialization for those)
	const isWebMarketingPage =
		typeof window !== 'undefined' &&
		typeof window.location !== 'undefined' &&
		(window.location.pathname?.includes('/product') ||
			window.location.pathname?.includes('/support') ||
			window.location.pathname?.includes('/privacy'));

	// Use the app initialization hook (skip for marketing pages)
	const { isInitialized, isLoading, error} = isWebMarketingPage
		? { isInitialized: true, isLoading: false, error: null }
		: useAppInitialization();

	// Authentication state (skip for marketing pages)
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const userLoading = isWebMarketingPage
		? false
		: useUserStore((state) => state.isLoading);

	// Handle deep linking
	useEffect(() => {
		const handleDeepLink = ({ url }: { url: string }) => {
			console.log('🔗 Deep link received:', url);

			const { hostname, path, queryParams } = Linking.parse(url);

			// Handle restaurant deep links: https://menutecaapp.com/restaurant/{id}
			if (path && path.includes('restaurant/')) {
				const restaurantId = path.split('restaurant/')[1]?.split('/')[0];
				if (restaurantId) {
					console.log('🍽️ Navigating to restaurant:', restaurantId);
					router.push(`/restaurant/${restaurantId}`);
				}
			}
		};

		// Get initial URL (if app was opened from a deep link)
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink({ url });
			}
		});

		// Listen for deep links while app is open
		const subscription = Linking.addEventListener('url', handleDeepLink);

		return () => {
			subscription.remove();
		};
	}, [router]);

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

	// Show custom loading screen during app initialization or user loading (but not for web marketing pages)
	if (
		!isWebMarketingPage &&
		showCustomLoading &&
		(!isInitialized || isLoading || userLoading)
	) {
		return (
			<LoadingScreen
				onLoadingComplete={handleLoadingComplete}
				duration={isLoading || userLoading ? undefined : 2000} // Show until loading completes, or 2s minimum
			/>
		);
	}

	// Show error screen if initialization failed critically
	if (error && !isInitialized) {
		console.error('Critical app initialization error:', error);
		// Still proceed to show the app - most errors aren't critical
	}

	// Main app navigation
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ActionSheetProvider>
				<ThemeProvider
					value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
				>
					{/* FIXED: Solo Stack.Screen components como hijos directos del Stack */}
					<Stack screenOptions={{ headerShown: false }}>
						{/* Index always available - handles auth redirect internally */}
						<Stack.Screen name="index" />

						{/* Auth stack - always available for login/logout */}
						<Stack.Screen name="auth" />

						{/* Profile stack - available for authenticated users */}
						<Stack.Screen name="profile" />

						{/* Restaurant stack - available for all users */}
						<Stack.Screen name="restaurant" />

						{/* Web marketing pages - available for all users */}
						<Stack.Screen name="[locale]" />
					</Stack>
				</ThemeProvider>
			</ActionSheetProvider>
		</GestureHandlerRootView>
	);
}
