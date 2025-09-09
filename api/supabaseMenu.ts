// api/supabaseMenu.ts
import { supabase } from '@/lib/supabase';
import { Dish, DrinkInclusion, Language, MenuData } from '@/shared/types';

// Database types
interface MenuRow {
	id: string;
	restaurant_id: string;
	name: { [key: string]: string };
	days: string[];
	start_time: string;
	end_time: string;
	price: number;
	first_courses_to_share?: boolean;
	second_courses_to_share?: boolean;
	desserts_to_share?: boolean;
	includes_bread?: boolean;
	drinks?: DrinkInclusion;
	includes_coffee_and_dessert?: 'none' | 'coffee' | 'dessert' | 'both';
	minimum_people?: number;
	has_minimum_people?: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

interface DishRow {
	id: string;
	menu_id: string;
	name: { [key: string]: string };
	description: { [key: string]: string };
	extra_price: number;
	is_vegetarian: boolean;
	is_lactose_free: boolean;
	is_spicy: boolean;
	is_gluten_free: boolean;
	is_vegan: boolean;
	category: string;
}

export class SupabaseMenuService {
	/**
	 * Get user's language from user store or default
	 */
	private static getCurrentLanguage(): Language {
		try {
			const { useUserStore } = require('@/zustand/UserStore');
			const userState = useUserStore.getState();
			return userState.user.language || 'es_ES';
		} catch (error) {
			return 'es_ES';
		}
	}

	/**
	 * Get current user ID
	 */
	private static async getCurrentUserId(): Promise<string | null> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			return user?.id || null;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Helper method to get localized text
	 */
	private static getLocalizedText(
		translatedText: any,
		userLanguage: Language,
		fallbackLanguage: Language = 'es_ES',
	): string {
		if (!translatedText) return '';

		let text = translatedText[userLanguage];

		if (!text && fallbackLanguage !== userLanguage) {
			text = translatedText[fallbackLanguage];
		}

		if (!text) {
			text =
				translatedText.es_ES ||
				translatedText.en_US ||
				translatedText.ca_ES ||
				translatedText.fr_FR ||
				'';
		}

		return text;
	}

	/**
	 * Create user translated text for a field
	 */
	private static createUserTranslatedText(
		text: string,
		userLanguage: Language,
	): { [key: string]: string } {
		return { [userLanguage]: text };
	}

	/**
	 * Merge existing translations with new text
	 */
	private static mergeTranslatedText(
		existing: { [key: string]: string },
		newText: string,
		userLanguage: Language,
	): { [key: string]: string } {
		return {
			...existing,
			[userLanguage]: newText,
		};
	}

	/**
	 * Check if time ranges overlap
	 */
	private static hasTimeOverlap(
		start1: string,
		end1: string,
		start2: string,
		end2: string,
	): boolean {
		const parseTime = (time: string) => {
			const [hours, minutes] = time.split(':').map(Number);
			return hours * 60 + minutes;
		};

		const start1Minutes = parseTime(start1);
		const end1Minutes = parseTime(end1);
		const start2Minutes = parseTime(start2);
		const end2Minutes = parseTime(end2);

		return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
	}

	/**
	 * Convert MenuRow to MenuData
	 */
	private static async convertToMenuData(
		menuRow: MenuRow,
		userLanguage: Language,
		includeDishes = true,
	): Promise<MenuData> {
		let dishes: Dish[] = [];

		if (includeDishes) {
			const { data: dishesData } = await supabase
				.from('dishes')
				.select('*')
				.eq('menu_id', menuRow.id)
				.order('created_at', { ascending: true });

			if (dishesData) {
				dishes = dishesData.map((dish: DishRow) => ({
					id: dish.id,
					name: this.getLocalizedText(dish.name, userLanguage),
					description: this.getLocalizedText(dish.description, userLanguage),
					extra_price: dish.extra_price,
					is_vegetarian: dish.is_vegetarian,
					is_lactose_free: dish.is_lactose_free,
					is_spicy: dish.is_spicy,
					is_gluten_free: dish.is_gluten_free,
					is_vegan: dish.is_vegan,
					category: dish.category as any,
				}));
			}
		}

		return {
			id: menuRow.id,
			name: this.getLocalizedText(menuRow.name, userLanguage),
			days: menuRow.days,
			start_time: menuRow.start_time,
			end_time: menuRow.end_time,
			price: menuRow.price,
			dishes,
			first_courses_to_share: menuRow.first_courses_to_share,
			second_courses_to_share: menuRow.second_courses_to_share,
			desserts_to_share: menuRow.desserts_to_share,
			includes_bread: menuRow.includes_bread,
			drinks: menuRow.drinks,
			includes_coffee_and_dessert: menuRow.includes_coffee_and_dessert,
			minimum_people: menuRow.minimum_people,
			has_minimum_people: menuRow.has_minimum_people,
		};
	}

	/**
	 * Create a new menu
	 */
	static async createMenu(
		restaurant_id: string,
		menuData: {
			name: string;
			days: string[];
			start_time: string;
			end_time: string;
			price: number;
			first_courses_to_share?: boolean;
			second_courses_to_share?: boolean;
			desserts_to_share?: boolean;
			includes_bread?: boolean;
			drinks?: DrinkInclusion;
			includes_coffee_and_dessert?: 'none' | 'coffee' | 'dessert' | 'both';
			minimum_people?: number;
			has_minimum_people?: boolean;
		},
	) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
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

			const userLanguage = this.getCurrentLanguage();
			const nameTranslated = this.createUserTranslatedText(
				menuData.name,
				userLanguage,
			);

			// Ensure drinks has all boolean values
			const drinks: DrinkInclusion = {
				water: menuData.drinks?.water ?? false,
				wine: menuData.drinks?.wine ?? false,
				soft_drinks: menuData.drinks?.soft_drinks ?? false,
				beer: menuData.drinks?.beer ?? false,
			};

			const { data, error } = await supabase
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
					drinks,
					includes_coffee_and_dessert:
						menuData.includes_coffee_and_dessert || 'none',
					minimum_people: menuData.minimum_people,
					has_minimum_people: menuData.has_minimum_people ?? false,
					is_active: true,
				})
				.select()
				.single();

			if (error) {
				if (error.code === '23503') {
					return {
						success: false,
						error: 'Invalid restaurant ID',
					};
				}
				throw error;
			}

			const menuResult = await this.convertToMenuData(
				data as MenuRow,
				userLanguage,
				false,
			);

			return {
				success: true,
				data: menuResult,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create menu',
			};
		}
	}

	/**
	 * Get restaurant menus
	 */
	static async getRestaurantMenus(restaurant_id: string) {
		try {
			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('menus')
				.select('*')
				.eq('restaurant_id', restaurant_id)
				.eq('is_active', true)
				.is('deleted_at', null)
				.order('created_at', { ascending: true });

			if (error) {
				throw error;
			}

			const menus = await Promise.all(
				(data || []).map((menu: MenuRow) =>
					this.convertToMenuData(menu, userLanguage, true),
				),
			);

			return {
				success: true,
				data: menus,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch menus',
			};
		}
	}

	/**
	 * Get menu by ID
	 */
	static async getMenuById(id: string) {
		try {
			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('menus')
				.select('*')
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Menu not found',
					};
				}
				throw error;
			}

			const menu = await this.convertToMenuData(
				data as MenuRow,
				userLanguage,
				true,
			);

			return {
				success: true,
				data: menu,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch menu',
			};
		}
	}

	/**
	 * Update menu
	 */
	static async updateMenu(
		id: string,
		updateData: Partial<{
			name: string;
			days: string[];
			start_time: string;
			end_time: string;
			price: number;
			first_courses_to_share: boolean;
			second_courses_to_share: boolean;
			desserts_to_share: boolean;
			includes_bread: boolean;
			drinks: DrinkInclusion;
			includes_coffee_and_dessert: 'none' | 'coffee' | 'dessert' | 'both';
			minimum_people: number;
			has_minimum_people: boolean;
			is_active: boolean;
		}>,
	) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
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
				.eq('id', id)
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
				return {
					success: false,
					error: 'Not authorized to update this menu',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			// Handle name translation update
			let finalName: { [key: string]: string } | undefined = undefined;
			if (updateData.name) {
				const existingMenu = menuWithRestaurant as MenuRow;
				finalName = this.mergeTranslatedText(
					existingMenu.name,
					updateData.name,
					userLanguage,
				);
			}

			// Ensure drinks has all boolean values
			let finalDrinks = updateData.drinks;
			if (updateData.drinks) {
				finalDrinks = {
					water: updateData.drinks.water ?? false,
					wine: updateData.drinks.wine ?? false,
					soft_drinks: updateData.drinks.soft_drinks ?? false,
					beer: updateData.drinks.beer ?? false,
				};
			}

			const { data, error } = await supabase
				.from('menus')
				.update({
					...updateData,
					name: finalName,
					drinks: finalDrinks,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)
				.select()
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Menu not found',
					};
				}
				throw error;
			}

			const menu = await this.convertToMenuData(
				data as MenuRow,
				userLanguage,
				false,
			);

			return {
				success: true,
				data: menu,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update menu',
			};
		}
	}

	/**
	 * Delete menu permanently
	 */
	static async deleteMenu(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
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
				.eq('id', id)
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
				return {
					success: false,
					error: 'Not authorized to delete this menu',
				};
			}

			// First delete all dishes in this menu
			await supabase.from('dishes').delete().eq('menu_id', id);

			// Then delete the menu
			const { error } = await supabase.from('menus').delete().eq('id', id);

			if (error) {
				throw error;
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete menu',
			};
		}
	}

	/**
	 * Soft delete menu
	 */
	static async softDeleteMenu(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
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
				.eq('id', id)
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
				return {
					success: false,
					error: 'Not authorized to delete this menu',
				};
			}

			const { error } = await supabase
				.from('menus')
				.update({ deleted_at: new Date().toISOString() })
				.eq('id', id)
				.is('deleted_at', null);

			if (error) {
				throw error;
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete menu',
			};
		}
	}

	/**
	 * Get available menus for a specific day and time
	 */
	static async getAvailableMenus(
		restaurantId: string,
		day: string,
		time: string,
	) {
		try {
			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('menus')
				.select('*')
				.eq('restaurant_id', restaurantId)
				.eq('is_active', true)
				.is('deleted_at', null)
				.contains('days', [day]);

			if (error) {
				throw error;
			}

			// Filter by time overlap
			const availableMenus = (data || []).filter((menu: MenuRow) => {
				return this.hasTimeOverlap(menu.start_time, menu.end_time, time, time);
			});

			const menus = await Promise.all(
				availableMenus.map((menu: MenuRow) =>
					this.convertToMenuData(menu, userLanguage, true),
				),
			);

			return {
				success: true,
				data: menus,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch available menus',
			};
		}
	}

	/**
	 * Search menus
	 */
	static async searchMenus(query: string, restaurantId?: string) {
		try {
			const userLanguage = this.getCurrentLanguage();

			let dbQuery = supabase
				.from('menus')
				.select('*')
				.eq('is_active', true)
				.is('deleted_at', null);

			if (restaurantId) {
				dbQuery = dbQuery.eq('restaurant_id', restaurantId);
			}

			const { data, error } = await dbQuery;

			if (error) {
				throw error;
			}

			const searchTerm = query.toLowerCase();

			// Filter menus by name in user's language
			const filteredMenus = (data || []).filter((menu: MenuRow) => {
				const localizedName = this.getLocalizedText(
					menu.name,
					userLanguage,
				).toLowerCase();
				return localizedName.includes(searchTerm);
			});

			const menus = await Promise.all(
				filteredMenus.map((menu: MenuRow) =>
					this.convertToMenuData(menu, userLanguage, true),
				),
			);

			return {
				success: true,
				data: menus,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to search menus',
			};
		}
	}

	/**
	 * Get menu statistics
	 */
	static async getMenuStats(restaurantId?: string) {
		try {
			let query = supabase.from('menus').select('*');

			if (restaurantId) {
				query = query.eq('restaurant_id', restaurantId).is('deleted_at', null);
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			const total = data?.length || 0;
			const active =
				data?.filter((menu: MenuRow) => menu.is_active).length || 0;

			const byDay: Record<string, number> = {
				monday: 0,
				tuesday: 0,
				wednesday: 0,
				thursday: 0,
				friday: 0,
				saturday: 0,
				sunday: 0,
			};

			data?.forEach((menu: MenuRow) => {
				menu.days.forEach((day: string) => {
					if (byDay[day] !== undefined) {
						byDay[day]++;
					}
				});
			});

			return {
				success: true,
				data: {
					total,
					active,
					byDay,
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to get menu statistics',
			};
		}
	}

	/**
	 * Get raw menu by ID (internal helper)
	 */
	static async getRawMenuById(menuId: string): Promise<MenuRow | null> {
		const { data, error } = await supabase
			.from('menus')
			.select('*')
			.eq('id', menuId)
			.is('deleted_at', null)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data as MenuRow;
	}
}
