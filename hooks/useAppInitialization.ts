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

				// Always fetch cuisines on app start
				await fetchCuisines();

				// If user is authenticated, refresh their profile
				if (isAuthenticated) {
					await refreshProfile();
				}

				setIsInitialized(true);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to initialize app';
				setInitError(errorMessage);
				console.error('App initialization error:', error);

				// Even if there's an error, mark as initialized so the app can continue
				setIsInitialized(true);
			}
		};

		initializeApp();
	}, []); // Only run once on app start

	// Re-run profile refresh and cuisines refresh if authentication status changes
	useEffect(() => {
		if (isAuthenticated && isInitialized) {
			const refreshUserData = async () => {
				try {
					// Refresh both profile and cuisines when user logs in
					// Cuisines might change based on user's region/language
					await Promise.all([
						refreshProfile(),
						refreshCuisines(), // Refresh cuisines for the user's region
					]);
				} catch (error) {
					console.error('Error refreshing user data:', error);
				}
			};

			refreshUserData();
		}
	}, [isAuthenticated, isInitialized, refreshProfile, refreshCuisines]);

	return {
		isInitialized,
		isLoading: cuisinesLoading || userLoading,
		error: initError || cuisinesError,
	};
};
