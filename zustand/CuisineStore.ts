import { apiClient } from '@/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Cuisine {
	id: string;
	name: string;
	image: string;
}

interface CuisineState {
	cuisines: Cuisine[];
	isLoading: boolean;
	error: string | null;
	lastFetched: number | null;
	fetchCuisines: () => Promise<void>;
	getCuisineById: (id: string) => Cuisine | undefined;
	clearCuisines: () => void;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

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
					const response = await apiClient.get<{
						success: boolean;
						data: Cuisine[];
					}>('/cuisines');

					if (response.success) {
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
		},
	),
);
