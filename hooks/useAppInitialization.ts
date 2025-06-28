import { useCuisineStore } from '@/zustand/CuisineStore';
import { useUserStore } from '@/zustand/UserStore';
import { useEffect, useState } from 'react';

export const useAppInitialization = () => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<string | null>(null);

	const fetchCuisines = useCuisineStore((state) => state.fetchCuisines);
	const refreshCuisines = useCuisineStore((state) => state.refreshCuisines);
	const cuisinesLoading = useCuisineStore((state) => state.isLoading);
	const cuisinesError = useCuisineStore((state) => state.error);

	const refreshProfile = useUserStore((state) => state.refreshProfile);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const userLoading = useUserStore((state) => state.isLoading);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				setInitError(null);

				// Always try to fetch cuisines on app start, but don't fail if it doesn't work
				try {
					await fetchCuisines();
				} catch (cuisineError) {
					console.warn('Failed to fetch cuisines on app start:', cuisineError);
					// Don't throw - cuisines can be loaded later when needed
				}

				// If user is authenticated, try to refresh their profile
				if (isAuthenticated) {
					try {
						await refreshProfile();
					} catch (profileError) {
						console.warn(
							'Failed to refresh profile on app start:',
							profileError,
						);
						// Don't throw - user can still use the app with cached data
					}
				}

				setIsInitialized(true);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to initialize app';
				setInitError(errorMessage);
				console.error('App initialization error:', error);

				// Always mark as initialized so the app can continue
				setIsInitialized(true);
			}
		};

		// Add a small delay to ensure stores are properly hydrated
		const timer = setTimeout(initializeApp, 100);

		return () => clearTimeout(timer);
	}, []); // Only run once on app start

	// Re-run profile refresh and cuisines refresh if authentication status changes
	useEffect(() => {
		if (isAuthenticated && isInitialized) {
			const refreshUserData = async () => {
				try {
					// Refresh both profile and cuisines when user logs in
					const promises = [refreshProfile()];

					// Only refresh cuisines if they're not already loaded or have errors
					if (cuisinesError || !cuisinesLoading) {
						promises.push(refreshCuisines());
					}

					await Promise.allSettled(promises); // Use allSettled to not fail if one fails
				} catch (error) {
					console.warn('Error refreshing user data:', error);
					// Don't throw - not critical for app functionality
				}
			};

			refreshUserData();
		}
	}, [
		isAuthenticated,
		isInitialized,
		refreshProfile,
		refreshCuisines,
		cuisinesError,
		cuisinesLoading,
	]);

	return {
		isInitialized,
		isLoading: cuisinesLoading || userLoading,
		error: initError, // Don't show cuisine errors as app-blocking
	};
};
