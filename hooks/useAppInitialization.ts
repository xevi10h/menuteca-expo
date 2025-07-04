import { supabase } from '@/utils/supabase';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useUserStore } from '@/zustand/UserStore';
import { useCallback, useEffect, useState } from 'react';

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

	// User store - seleccionar individualmente para Zustand v5
	const userInitialize = useUserStore((state) => state.initialize);
	const userIsInitialized = useUserStore((state) => state.isInitialized);
	const userIsLoading = useUserStore((state) => state.isLoading);
	const userError = useUserStore((state) => state.error);

	// Cuisine store - seleccionar individualmente para Zustand v5
	const fetchCuisines = useCuisineStore((state) => state.fetchCuisines);
	const cuisineError = useCuisineStore((state) => state.error);
	const cuisineLoading = useCuisineStore((state) => state.isLoading);

	// Memoizar la función de inicialización
	const initializeApp = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			console.log('Starting app initialization...');

			// Verificar la conexión con Supabase
			try {
				const { data, error } = await supabase
					.from('cuisines')
					.select('count', { count: 'exact' })
					.limit(1);
				if (error) {
					console.warn('Supabase connection test failed:', error.message);
				} else {
					console.log('Supabase connection successful');
				}
			} catch (error) {
				console.warn('Supabase connection test error:', error);
			}

			// Inicializar autenticación de usuario primero
			console.log('Initializing user authentication...');
			await userInitialize();

			// Cargar cocinas (necesarias independientemente del estado de autenticación)
			console.log('Loading cuisines...');
			try {
				await fetchCuisines();
				console.log('Cuisines loaded successfully');
			} catch (cuisineError) {
				console.warn(
					'Failed to load cuisines, but continuing app initialization:',
					cuisineError,
				);
				// No fallar toda la inicialización si las cocinas fallan
			}

			// La app ahora está inicializada
			console.log('App initialization completed successfully');
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
	}, [userInitialize, fetchCuisines]);

	// Efecto principal de inicialización - solo ejecutar una vez
	useEffect(() => {
		let mounted = true;

		if (!state.isInitialized && !state.isLoading) {
			initializeApp().then(() => {
				if (!mounted) return;
				console.log('App initialization effect completed');
			});
		}

		return () => {
			mounted = false;
		};
	}, []); // Array de dependencias vacío para ejecutar solo una vez

	// Actualizar estado de carga basado en el estado de carga del usuario
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

	// Log para debugging - solo en development
	useEffect(() => {
		if (__DEV__) {
			console.log('App initialization state:', {
				isInitialized: state.isInitialized,
				isLoading: state.isLoading,
				error: state.error,
				userIsInitialized,
				userIsLoading,
				userError,
				cuisineLoading,
				cuisineError,
			});
		}
	}, [
		state,
		userIsInitialized,
		userIsLoading,
		userError,
		cuisineLoading,
		cuisineError,
	]);

	return state;
};
