import { MenuService } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { Language, MenuData } from '@/shared/types';
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

	// Centralized menu and dish management
	createMenuWithDishes: (
		restaurant_id: string,
		menuData: MenuData,
	) => Promise<{ success: boolean; data?: MenuData; error?: string }>;
	updateMenuWithDishes: (
		restaurant_id: string,
		menuData: MenuData,
	) => Promise<{ success: boolean; data?: MenuData; error?: string }>;
	deleteMenuCompletely: (
		restaurant_id: string,
		menuId: string,
	) => Promise<{ success: boolean; error?: string }>;
}

// Cache duration: 10 minutes for menu data
const CACHE_DURATION = 10 * 60 * 1000;

// Helper functions
const getCurrentLanguage = (): Language => {
	try {
		const { useUserStore } = require('@/zustand/UserStore');
		const userState = useUserStore.getState();
		return userState.user.language || 'es_ES';
	} catch (error) {
		return 'es_ES';
	}
};

const getCurrentUserId = async (): Promise<string | null> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		return user?.id || null;
	} catch (error) {
		return null;
	}
};

const createUserTranslatedText = (
	text: string,
	userLanguage: Language,
): { [key: string]: string } => {
	return { [userLanguage]: text };
};

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

	createMenuWithDishes: async (restaurant_id: string, menuData: MenuData) => {
		set({ isLoading: true, error: null });

		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return { success: false, error: 'User not authenticated' };
			}

			// Check restaurant ownership
			const { data: restaurant, error: restaurantError } = await supabase
				.from('restaurants')
				.select('owner_id')
				.eq('id', restaurant_id)
				.is('deleted_at', null)
				.single();

			if (restaurantError) {
				return {
					success: false,
					error:
						restaurantError.code === 'PGRST116'
							? 'Restaurant not found'
							: 'Failed to verify restaurant',
				};
			}

			if (restaurant.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to create menus for this restaurant',
				};
			}

			const userLanguage = getCurrentLanguage();
			const nameTranslated = createUserTranslatedText(
				menuData.name,
				userLanguage,
			);

			// Create menu first
			const { data: menuResult, error: menuError } = await supabase
				.from('menus')
				.insert({
					restaurant_id,
					name: nameTranslated,
					days: menuData.days,
					start_time: menuData.start_time,
					end_time: menuData.end_time,
					price: menuData.price,
					first_courses_to_share: menuData.first_courses_to_share ?? false,
					second_courses_to_share: menuData.second_courses_to_share ?? false,
					desserts_to_share: menuData.desserts_to_share ?? false,
					includes_bread: menuData.includes_bread ?? false,
					drinks: menuData.drinks || {
						water: false,
						wine: false,
						soft_drinks: false,
						beer: false,
					},
					includes_coffee_and_dessert:
						menuData.includes_coffee_and_dessert || 'none',
					minimum_people: menuData.minimum_people || 1,
					has_minimum_people: menuData.has_minimum_people ?? false,
					is_active: true,
				})
				.select()
				.single();

			if (menuError) {
				throw menuError;
			}

			const menuId = menuResult.id;

			// Create dishes if they exist
			if (menuData.dishes && menuData.dishes.length > 0) {
				const dishesData = menuData.dishes.map((dish) => ({
					menu_id: menuId,
					name: createUserTranslatedText(dish.name, userLanguage),
					description: createUserTranslatedText(
						dish.description || '',
						userLanguage,
					),
					extra_price: dish.extra_price || 0,
					category: dish.category,
					is_vegetarian: dish.is_vegetarian ?? false,
					is_lactose_free: dish.is_lactose_free ?? false,
					is_spicy: dish.is_spicy ?? false,
					is_gluten_free: dish.is_gluten_free ?? false,
					is_vegan: dish.is_vegan ?? false,
					is_active: true,
				}));

				const { error: dishError } = await supabase
					.from('dishes')
					.insert(dishesData);

				if (dishError) {
					// If dish creation fails, delete the menu to maintain consistency
					await supabase.from('menus').delete().eq('id', menuId);
					throw dishError;
				}
			}

			// Fetch the complete menu with dishes
			const completeMenuResponse = await MenuService.getMenuById(menuId);
			if (!completeMenuResponse.success || !completeMenuResponse.data) {
				return {
					success: false,
					error: 'Menu created but failed to fetch complete data',
				};
			}

			const createdMenu = completeMenuResponse.data;

			// Update cache
			get().addMenuToCache(restaurant_id, createdMenu);

			set({ isLoading: false, error: null });
			return { success: true, data: createdMenu };
		} catch (error) {
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to create menu',
			});
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create menu',
			};
		}
	},

	updateMenuWithDishes: async (restaurant_id: string, menuData: MenuData) => {
		set({ isLoading: true, error: null });

		try {
			if (!menuData.id) {
				return { success: false, error: 'Menu ID is required for update' };
			}

			const userId = await getCurrentUserId();
			if (!userId) {
				return { success: false, error: 'User not authenticated' };
			}

			// Check ownership through menu -> restaurant
			const { data: menuWithRestaurant, error: menuError } = await supabase
				.from('menus')
				.select(
					`
					*,
					restaurants!inner(owner_id)
				`,
				)
				.eq('id', menuData.id)
				.is('deleted_at', null)
				.single();

			if (menuError) {
				return {
					success: false,
					error:
						menuError.code === 'PGRST116'
							? 'Menu not found'
							: 'Failed to verify menu',
				};
			}

			if ((menuWithRestaurant as any).restaurants.owner_id !== userId) {
				return { success: false, error: 'Not authorized to update this menu' };
			}

			const userLanguage = getCurrentLanguage();
			const existingMenu = menuWithRestaurant as any;

			// Merge name translation with existing translations
			const finalName = {
				...existingMenu.name,
				[userLanguage]: menuData.name,
			};

			// Update menu
			const { data: updatedMenuResult, error: updateMenuError } = await supabase
				.from('menus')
				.update({
					name: finalName,
					days: menuData.days,
					start_time: menuData.start_time,
					end_time: menuData.end_time,
					price: menuData.price,
					first_courses_to_share: menuData.first_courses_to_share ?? false,
					second_courses_to_share: menuData.second_courses_to_share ?? false,
					desserts_to_share: menuData.desserts_to_share ?? false,
					includes_bread: menuData.includes_bread ?? false,
					drinks: menuData.drinks || {
						water: false,
						wine: false,
						soft_drinks: false,
						beer: false,
					},
					includes_coffee_and_dessert:
						menuData.includes_coffee_and_dessert || 'none',
					minimum_people: menuData.minimum_people || 1,
					has_minimum_people: menuData.has_minimum_people ?? false,
					updated_at: new Date().toISOString(),
				})
				.eq('id', menuData.id)
				.select()
				.single();

			if (updateMenuError) {
				throw updateMenuError;
			}

			// Delete existing dishes for this menu
			await supabase.from('dishes').delete().eq('menu_id', menuData.id);

			// Create new dishes if they exist
			if (menuData.dishes && menuData.dishes.length > 0) {
				const dishesData = menuData.dishes.map((dish) => ({
					menu_id: menuData.id,
					name: createUserTranslatedText(dish.name, userLanguage),
					description: createUserTranslatedText(
						dish.description || '',
						userLanguage,
					),
					extra_price: dish.extra_price || 0,
					category: dish.category,
					is_vegetarian: dish.is_vegetarian ?? false,
					is_lactose_free: dish.is_lactose_free ?? false,
					is_spicy: dish.is_spicy ?? false,
					is_gluten_free: dish.is_gluten_free ?? false,
					is_vegan: dish.is_vegan ?? false,
					is_active: true,
				}));

				const { error: dishError } = await supabase
					.from('dishes')
					.insert(dishesData);

				if (dishError) {
					throw dishError;
				}
			}

			// Fetch the complete updated menu with dishes
			const completeMenuResponse = await MenuService.getMenuById(menuData.id);
			if (!completeMenuResponse.success || !completeMenuResponse.data) {
				return {
					success: false,
					error: 'Menu updated but failed to fetch complete data',
				};
			}

			const updatedMenu = completeMenuResponse.data;

			// Update cache
			get().updateMenuInCache(restaurant_id, menuData.id, updatedMenu);

			set({ isLoading: false, error: null });
			return { success: true, data: updatedMenu };
		} catch (error) {
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to update menu',
			});
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update menu',
			};
		}
	},

	deleteMenuCompletely: async (restaurant_id: string, menuId: string) => {
		set({ isLoading: true, error: null });

		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return { success: false, error: 'User not authenticated' };
			}

			// Check ownership through menu -> restaurant
			const { data: menuWithRestaurant, error: menuError } = await supabase
				.from('menus')
				.select(
					`
					*,
					restaurants!inner(owner_id)
				`,
				)
				.eq('id', menuId)
				.is('deleted_at', null)
				.single();

			if (menuError) {
				return {
					success: false,
					error:
						menuError.code === 'PGRST116'
							? 'Menu not found'
							: 'Failed to verify menu',
				};
			}

			if ((menuWithRestaurant as any).restaurants.owner_id !== userId) {
				return { success: false, error: 'Not authorized to delete this menu' };
			}

			// Delete dishes first (cascade will handle this, but being explicit)
			await supabase.from('dishes').delete().eq('menu_id', menuId);

			// Delete menu
			const { error: deleteError } = await supabase
				.from('menus')
				.delete()
				.eq('id', menuId);

			if (deleteError) {
				throw deleteError;
			}

			// Remove from cache
			get().removeMenuFromCache(restaurant_id, menuId);

			set({ isLoading: false, error: null });
			return { success: true };
		} catch (error) {
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to delete menu',
			});
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete menu',
			};
		}
	},
}));
