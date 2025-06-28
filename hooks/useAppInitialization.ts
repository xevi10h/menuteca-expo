import { useCuisineStore } from '@/zustand/CuisineStore';
import { useUserStore } from '@/zustand/UserStore';
import { useEffect, useState } from 'react';

export const useAppInitialization = () => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<string | null>(null);

	const fetchCuisines = useCuisineStore((state) => state.fetchCuisines);
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

	// Re-run profile refresh if authentication status changes
	useEffect(() => {
		if (isAuthenticated && isInitialized) {
			refreshProfile().catch(console.error);
		}
	}, [isAuthenticated, isInitialized, refreshProfile]);

	return {
		isInitialized,
		isLoading: cuisinesLoading || userLoading,
		error: initError || cuisinesError,
	};
};
