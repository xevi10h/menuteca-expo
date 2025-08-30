import { MenuService } from '@/api/index';
import { MenuData } from '@/shared/types';
import { create } from 'zustand';

interface CachedMenuData {
	menus: MenuData[];
	lastFetched: number;
}

interface MenuState {
	// Cache for restaurant menus
	cache: Map<string, CachedMenuData>;
	isLoading: boolean;
	error: string | null;

	// Actions
	fetchRestaurantMenus: (restaurant_id: string) => Promise<MenuData[]>;
	getMenusByRestaurantId: (restaurant_id: string) => MenuData[] | undefined;
	clearCache: () => void;
	removeFromCache: (restaurant_id: string) => void;
	addMenuToCache: (restaurant_id: string, menu: MenuData) => void;
	updateMenuInCache: (
		restaurant_id: string,
		menuId: string,
		updatedMenu: MenuData,
	) => void;
	removeMenuFromCache: (restaurant_id: string, menuId: string) => void;
}

// Cache duration: 10 minutes for menu data
const CACHE_DURATION = 10 * 60 * 1000;

export const useMenuStore = create<MenuState>((set, get) => ({
	cache: new Map(),
	isLoading: false,
	error: null,

	fetchRestaurantMenus: async (restaurant_id: string): Promise<MenuData[]> => {
		const state = get();
		const cachedData = state.cache.get(restaurant_id);
		const now = Date.now();

		// Check if we have valid cached data
		if (cachedData && now - cachedData.lastFetched < CACHE_DURATION) {
			return cachedData.menus;
		}

		set({ isLoading: true, error: null });

		try {
			const response = await MenuService.getRestaurantMenus(restaurant_id);

			if (response.success && response.data) {
				const newCachedData: CachedMenuData = {
					menus: response.data,
					lastFetched: now,
				};

				// Update cache
				const newCache = new Map(state.cache);
				newCache.set(restaurant_id, newCachedData);

				set({
					cache: newCache,
					isLoading: false,
					error: null,
				});

				return response.data;
			} else {
				throw new Error('Failed to fetch restaurant menus');
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			set({
				isLoading: false,
				error: errorMessage,
			});
			console.error('Error fetching restaurant menus:', error);
			return [];
		}
	},

	getMenusByRestaurantId: (restaurant_id: string): MenuData[] | undefined => {
		const state = get();
		const cachedData = state.cache.get(restaurant_id);
		const now = Date.now();

		// Return cached data if it's still valid
		if (cachedData && now - cachedData.lastFetched < CACHE_DURATION) {
			return cachedData.menus;
		}

		return undefined;
	},

	addMenuToCache: (restaurant_id: string, menu: MenuData) => {
		const state = get();
		const cachedData = state.cache.get(restaurant_id);

		if (cachedData) {
			const newMenus = [...cachedData.menus, menu];
			const newCachedData: CachedMenuData = {
				menus: newMenus,
				lastFetched: cachedData.lastFetched, // Keep original fetch time
			};

			const newCache = new Map(state.cache);
			newCache.set(restaurant_id, newCachedData);

			set({ cache: newCache });
		}
	},

	updateMenuInCache: (
		restaurant_id: string,
		menuId: string,
		updatedMenu: MenuData,
	) => {
		const state = get();
		const cachedData = state.cache.get(restaurant_id);

		if (cachedData) {
			const newMenus = cachedData.menus.map((menu) =>
				menu.id === menuId ? updatedMenu : menu,
			);

			const newCachedData: CachedMenuData = {
				menus: newMenus,
				lastFetched: cachedData.lastFetched,
			};

			const newCache = new Map(state.cache);
			newCache.set(restaurant_id, newCachedData);

			set({ cache: newCache });
		}
	},

	removeMenuFromCache: (restaurant_id: string, menuId: string) => {
		const state = get();
		const cachedData = state.cache.get(restaurant_id);

		if (cachedData) {
			const newMenus = cachedData.menus.filter((menu) => menu.id !== menuId);

			const newCachedData: CachedMenuData = {
				menus: newMenus,
				lastFetched: cachedData.lastFetched,
			};

			const newCache = new Map(state.cache);
			newCache.set(restaurant_id, newCachedData);

			set({ cache: newCache });
		}
	},

	clearCache: () => {
		set({ cache: new Map() });
	},

	removeFromCache: (restaurant_id: string) => {
		const state = get();
		const newCache = new Map(state.cache);
		newCache.delete(restaurant_id);
		set({ cache: newCache });
	},
}));
