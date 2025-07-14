import { RestaurantService } from '@/api/hybridServices';
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
	retryCount: number;
	maxRetries: number;
	retryDelay: number;
	isRateLimited: boolean;
	rateLimitResetTime: Date | null;

	// Actions
	fetchRestaurants: (filters?: RestaurantFilters) => Promise<Restaurant[]>;
	getRestaurantById: (id: string) => Restaurant | undefined;
	clearCache: () => void;
	removeFromCache: (cacheKey: string) => void;
	clearError: () => void;
	resetRetryCount: () => void;
}

// Helper function to create cache key from filters
const createCacheKey = (filters: RestaurantFilters = {}): string => {
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

// Rate limit reset duration: 1 minute
const RATE_LIMIT_RESET_DURATION = 60 * 1000;

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
	cache: new Map(),
	isLoading: false,
	error: null,
	lastError: null,
	retryCount: 0,
	maxRetries: 3,
	retryDelay: 1000, // Start with 1 second
	isRateLimited: false,
	rateLimitResetTime: null,

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

		// Check if we're rate limited
		if (state.isRateLimited && state.rateLimitResetTime) {
			if (new Date() < state.rateLimitResetTime) {
				console.log(
					'RestaurantStore: Still rate limited, returning cached data or empty array',
				);
				return cachedData?.restaurants || [];
			} else {
				// Reset rate limit
				set({ isRateLimited: false, rateLimitResetTime: null });
			}
		}

		// Check if we have valid cached data
		if (
			cachedData &&
			now - cachedData.lastFetched < CACHE_DURATION &&
			filtersMatch(cachedData.filters, filters)
		) {
			console.log('RestaurantStore: Using cached data');
			return cachedData.restaurants;
		}

		// Don't fetch if we're already loading this exact query
		if (state.isLoading) {
			console.log(
				'RestaurantStore: Already loading, returning cached data or empty array',
			);
			return cachedData?.restaurants || [];
		}

		// Clear previous errors when starting new fetch
		set({ isLoading: true, error: null });

		try {
			console.log('RestaurantStore: Fetching from API...');
			const response = await RestaurantService.getAllRestaurants(filters);

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
					retryCount: 0, // Reset retry count on success
					retryDelay: 1000, // Reset retry delay
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
				retryCount: state.retryCount,
			});

			// Check if it's a rate limit error
			if (errorMessage.toLowerCase().includes('too many requests')) {
				const resetTime = new Date(Date.now() + RATE_LIMIT_RESET_DURATION);
				set({
					isLoading: false,
					error: 'Rate limited. Please wait before trying again.',
					lastError: new Date(),
					isRateLimited: true,
					rateLimitResetTime: resetTime,
				});

				console.log(
					'RestaurantStore: Rate limited until',
					resetTime.toISOString(),
				);

				// Return cached data if available
				return cachedData?.restaurants || [];
			}

			// Implement exponential backoff for other errors
			if (state.retryCount < state.maxRetries) {
				const nextRetryDelay = state.retryDelay * 2; // Exponential backoff

				set({
					isLoading: false,
					error: errorMessage,
					lastError: new Date(),
					retryCount: state.retryCount + 1,
					retryDelay: nextRetryDelay,
				});

				console.log(
					`RestaurantStore: Will retry in ${nextRetryDelay}ms (attempt ${
						state.retryCount + 1
					}/${state.maxRetries})`,
				);

				// Don't automatically retry - let the component decide
				return cachedData?.restaurants || [];
			} else {
				// Max retries reached
				set({
					isLoading: false,
					error: `Failed after ${state.maxRetries} attempts: ${errorMessage}`,
					lastError: new Date(),
				});

				return cachedData?.restaurants || [];
			}
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
		set({
			cache: new Map(),
			error: null,
			retryCount: 0,
			retryDelay: 1000,
			isRateLimited: false,
			rateLimitResetTime: null,
		});
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

	resetRetryCount: () => {
		set({ retryCount: 0, retryDelay: 1000 });
	},
}));
