import { RestaurantService } from '@/api/services';
import { Restaurant } from '@/shared/types';
import { create } from 'zustand';

interface RestaurantFilters {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	cuisine_id?: string;
	min_price?: number;
	max_price?: number;
	min_rating?: number;
	tags?: string[];
	latitude?: number;
	longitude?: number;
	radius?: number;
	search?: string;
}

interface CachedRestaurantData {
	restaurants: Restaurant[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	filters: RestaurantFilters;
	lastFetched: number;
}

interface RestaurantState {
	// Cache for different filter combinations
	cache: Map<string, CachedRestaurantData>;
	isLoading: boolean;
	error: string | null;
	lastError: Date | null;

	// Actions
	fetchRestaurants: (filters?: RestaurantFilters) => Promise<Restaurant[]>;
	getRestaurantById: (id: string) => Restaurant | undefined;
	clearCache: () => void;
	removeFromCache: (cacheKey: string) => void;
	clearError: () => void;
}

// Helper function to create cache key from filters
const createCacheKey = (filters: RestaurantFilters = {}): string => {
	// Sort keys to ensure consistent cache keys
	const sortedEntries = Object.entries(filters)
		.filter(([_, value]) => value !== undefined && value !== null)
		.sort(([a], [b]) => a.localeCompare(b));

	return JSON.stringify(sortedEntries);
};

// Check if filters are the same
const filtersMatch = (
	filters1: RestaurantFilters,
	filters2: RestaurantFilters,
): boolean => {
	return createCacheKey(filters1) === createCacheKey(filters2);
};

// Cache duration: 5 minutes for restaurant data
const CACHE_DURATION = 5 * 60 * 1000;

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
	cache: new Map(),
	isLoading: false,
	error: null,
	lastError: null,

	fetchRestaurants: async (
		filters: RestaurantFilters = {},
	): Promise<Restaurant[]> => {
		const state = get();
		const cacheKey = createCacheKey(filters);
		const cachedData = state.cache.get(cacheKey);
		const now = Date.now();

		console.log(
			'RestaurantStore: fetchRestaurants called with filters:',
			filters,
		);
		console.log('RestaurantStore: Cache key:', cacheKey);
		console.log('RestaurantStore: Has cached data:', !!cachedData);

		// Check if we have valid cached data
		if (
			cachedData &&
			now - cachedData.lastFetched < CACHE_DURATION &&
			filtersMatch(cachedData.filters, filters)
		) {
			console.log('RestaurantStore: Using cached data');
			return cachedData.restaurants;
		}

		// Clear previous errors when starting new fetch
		set({ isLoading: true, error: null });

		try {
			console.log('RestaurantStore: Fetching from API...');
			const response = await RestaurantService.getAllRestaurants(filters);
			console.log('respnse', response);

			if (response.success) {
				console.log(
					'RestaurantStore: API success, got',
					response.data.data.length,
					'restaurants',
				);

				const newCachedData: CachedRestaurantData = {
					restaurants: response.data.data,
					pagination: response.data.pagination,
					filters,
					lastFetched: now,
				};

				// Update cache
				const newCache = new Map(state.cache);
				newCache.set(cacheKey, newCachedData);

				set({
					cache: newCache,
					isLoading: false,
					error: null,
					lastError: null,
				});

				return response.data.data;
			} else {
				throw new Error('API returned success: false');
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';

			console.error('RestaurantStore: Error fetching restaurants:', {
				error: errorMessage,
				filters,
				cacheKey,
				timestamp: new Date().toISOString(),
			});

			set({
				isLoading: false,
				error: errorMessage,
				lastError: new Date(),
			});

			// Return empty array on error to prevent app crashes
			return [];
		}
	},

	getRestaurantById: (id: string): Restaurant | undefined => {
		const state = get();

		// Search through all cached restaurant data
		for (const cachedData of state.cache.values()) {
			const restaurant = cachedData.restaurants.find((r) => r.id === id);
			if (restaurant) {
				return restaurant;
			}
		}

		return undefined;
	},

	clearCache: () => {
		console.log('RestaurantStore: Clearing all cache');
		set({ cache: new Map(), error: null });
	},

	removeFromCache: (cacheKey: string) => {
		const state = get();
		const newCache = new Map(state.cache);
		const removed = newCache.delete(cacheKey);
		console.log(
			'RestaurantStore: Removed cache key:',
			cacheKey,
			'Success:',
			removed,
		);
		set({ cache: newCache });
	},

	clearError: () => {
		set({ error: null, lastError: null });
	},
}));
