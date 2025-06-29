import { useCuisineStore } from '@/zustand/CuisineStore';
import { useUserStore } from '@/zustand/UserStore';
import { useEffect, useState } from 'react';

interface AppInitializationState {
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
}

export const useAppInitialization = (): AppInitializationState => {
	const [state, setState] = useState<AppInitializationState>({
		isInitialized: false,
		isLoading: true,
		error: null,
	});

	// User store
	const userInitialize = useUserStore((state) => state.initialize);
	const userIsInitialized = useUserStore((state) => state.isInitialized);
	const userIsLoading = useUserStore((state) => state.isLoading);
	const userError = useUserStore((state) => state.error);

	// Cuisine store
	const fetchCuisines = useCuisineStore((state) => state.fetchCuisines);
	const cuisineError = useCuisineStore((state) => state.error);
	const cuisineLoading = useCuisineStore((state) => state.isLoading);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));

				// Initialize user authentication first
				await userInitialize();

				// Load cuisines (these are needed regardless of auth status)
				try {
					await fetchCuisines();
				} catch (cuisineError) {
					console.warn(
						'Failed to load cuisines, but continuing app initialization:',
						cuisineError,
					);
					// Don't fail the entire initialization if cuisines fail to load
				}

				// App is now initialized
				setState({
					isInitialized: true,
					isLoading: false,
					error: null,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'App initialization failed';
				console.error('App initialization error:', error);

				setState({
					isInitialized: false,
					isLoading: false,
					error: errorMessage,
				});
			}
		};

		initializeApp();
	}, [userInitialize, fetchCuisines]);

	// Update loading state based on user loading state
	useEffect(() => {
		if (userIsInitialized && !cuisineLoading) {
			setState((prev) => ({
				...prev,
				isLoading: userIsLoading,
				error: userError || cuisineError || prev.error,
			}));
		}
	}, [
		userIsInitialized,
		userIsLoading,
		userError,
		cuisineLoading,
		cuisineError,
	]);

	return state;
};
