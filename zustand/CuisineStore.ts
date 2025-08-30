import { CuisineService } from '@/api/index';
import { Cuisine } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CuisineState {
	cuisines: Cuisine[];
	isLoading: boolean;
	error: string | null;
	lastFetched: number | null;
	fetchCuisines: () => Promise<void>;
	getCuisineById: (id: string) => Cuisine | undefined;
	clearCuisines: () => void;
	searchCuisines: (query: string) => Promise<Cuisine[]>;
	refreshCuisines: () => Promise<void>;
}

// Cache duration: 1 hour (las traducciones no cambian frecuentemente)
const CACHE_DURATION = 60 * 60 * 1000;

export const useCuisineStore = create<CuisineState>()(
	persist(
		(set, get) => ({
			cuisines: [],
			isLoading: false,
			error: null,
			lastFetched: null,

			fetchCuisines: async () => {
				const state = get();
				const now = Date.now();

				// Check if we have cached data that's still valid
				if (
					state.cuisines.length > 0 &&
					state.lastFetched &&
					now - state.lastFetched < CACHE_DURATION
				) {
					return; // Use cached data
				}

				set({ isLoading: true, error: null });

				try {
					const response = await CuisineService.getAllCuisines();

					if (response.success) {
						// FIXED: Los datos ya vienen traducidos del backend según el token del usuario
						// No necesitamos procesar traducciones aquí
						set({
							cuisines: response.data,
							isLoading: false,
							error: null,
							lastFetched: now,
						});
					} else {
						throw new Error('Failed to fetch cuisines');
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Unknown error';
					set({
						isLoading: false,
						error: errorMessage,
					});
					console.error('Error fetching cuisines:', error);
				}
			},

			refreshCuisines: async () => {
				// IMPORTANT: Clear cache and force refresh
				// Esto es útil cuando cambia el idioma del usuario
				set({ isLoading: true, error: null, lastFetched: null });

				try {
					const response = await CuisineService.getAllCuisines();

					if (response.success) {
						const now = Date.now();
						set({
							cuisines: response.data,
							isLoading: false,
							error: null,
							lastFetched: now,
						});
					} else {
						throw new Error('Failed to refresh cuisines');
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Unknown error';
					set({
						isLoading: false,
						error: errorMessage,
					});
					console.error('Error refreshing cuisines:', error);
				}
			},

			searchCuisines: async (query: string): Promise<Cuisine[]> => {
				try {
					const response = await CuisineService.searchCuisines(query);

					if (response.success && response.data) {
						return response.data;
					} else {
						throw new Error('Failed to search cuisines');
					}
				} catch (error) {
					console.error('Error searching cuisines:', error);
					// Return filtered local results as fallback
					const state = get();
					return state.cuisines.filter((cuisine) =>
						cuisine.name.toLowerCase().includes(query.toLowerCase()),
					);
				}
			},

			getCuisineById: (id: string) => {
				const state = get();
				return state.cuisines.find((cuisine) => cuisine.id === id);
			},

			clearCuisines: () => {
				set({
					cuisines: [],
					isLoading: false,
					error: null,
					lastFetched: null,
				});
			},
		}),
		{
			name: 'cuisine-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				cuisines: state.cuisines,
				lastFetched: state.lastFetched,
			}),
			// FIXED: Versioning para limpiar cache cuando cambien las traducciones
			version: 1,
		},
	),
);
