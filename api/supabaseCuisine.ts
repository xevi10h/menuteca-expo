// api/supabaseCuisine.ts
import { supabase } from '@/lib/supabase';
import { Cuisine, CuisineRow, Language } from '@/shared/types';
import { getLocalizedText } from '@/shared/functions/utils';

export class SupabaseCuisineService {
	/**
	 * Get user's language from user store or default
	 */
	private static getCurrentLanguage(): Language {
		try {
			// Dynamically import to avoid circular dependency
			const { useUserStore } = require('@/zustand/UserStore');
			const userState = useUserStore.getState();
			return userState.user.language || 'es_ES';
		} catch (error) {
			return 'es_ES'; // Default fallback
		}
	}

	/**
	 * Convert database cuisine row to localized cuisine
	 */
	private static localizeCuisine(
		cuisine: CuisineRow,
		language: Language,
	): Cuisine {
		return {
			id: cuisine.id,
			name: getLocalizedText(cuisine.name, language),
			image: cuisine.image,
		};
	}

	static async getAllCuisines() {
		try {
			const { data, error } = await supabase
				.from('cuisines')
				.select('*')
				.order('created_at', { ascending: true });

			if (error) throw error;

			const language = this.getCurrentLanguage();
			const localizedCuisines = (data as CuisineRow[]).map((cuisine) =>
				this.localizeCuisine(cuisine, language),
			);

			return {
				success: true,
				data: localizedCuisines,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch cuisines',
			};
		}
	}

	static async getCuisineById(id: string) {
		try {
			const { data, error } = await supabase
				.from('cuisines')
				.select('*')
				.eq('id', id)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Cuisine not found',
					};
				}
				throw error;
			}

			const language = this.getCurrentLanguage();
			const localizedCuisine = this.localizeCuisine(data as CuisineRow, language);

			return {
				success: true,
				data: localizedCuisine,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch cuisine',
			};
		}
	}

	static async searchCuisines(query: string, limit?: number) {
		try {
			// Get all cuisines since we need to search in localized text
			const { data, error } = await supabase
				.from('cuisines')
				.select('*')
				.order('created_at', { ascending: true });

			if (error) throw error;

			const language = this.getCurrentLanguage();
			const searchTerm = query.toLowerCase();

			// Filter cuisines by searching in localized name
			let filteredCuisines = (data as CuisineRow[]).filter((cuisine) => {
				const localizedName = getLocalizedText(cuisine.name, language).toLowerCase();
				return localizedName.includes(searchTerm);
			});

			// Apply limit if specified
			if (limit && limit > 0) {
				filteredCuisines = filteredCuisines.slice(0, limit);
			}

			const localizedResults = filteredCuisines.map((cuisine) =>
				this.localizeCuisine(cuisine, language),
			);

			return {
				success: true,
				data: localizedResults,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to search cuisines',
			};
		}
	}

	static async getCuisineStats() {
		try {
			// Get total count
			const { count, error: countError } = await supabase
				.from('cuisines')
				.select('*', { count: 'exact', head: true });

			if (countError) throw countError;

			// Get most popular cuisine (most restaurants)
			const { data: cuisinesWithCounts, error: popularError } = await supabase
				.from('cuisines')
				.select(`
					*,
					restaurants!inner(id)
				`);

			if (popularError) throw popularError;

			let mostPopular: Cuisine | null = null;
			
			if (cuisinesWithCounts && cuisinesWithCounts.length > 0) {
				// Count restaurants for each cuisine and find the most popular
				const cuisinesWithRestaurantCount = cuisinesWithCounts.map((cuisine: any) => ({
					...cuisine,
					restaurant_count: cuisine.restaurants?.length || 0,
				}));

				// Sort by restaurant count descending
				cuisinesWithRestaurantCount.sort((a, b) => b.restaurant_count - a.restaurant_count);

				const topCuisine = cuisinesWithRestaurantCount[0];
				if (topCuisine && topCuisine.restaurant_count > 0) {
					const language = this.getCurrentLanguage();
					mostPopular = this.localizeCuisine(topCuisine as CuisineRow, language);
				}
			}

			return {
				success: true,
				data: {
					total: count || 0,
					mostPopular,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to get cuisine stats',
			};
		}
	}

	// Admin functions
	static async createCuisine(cuisineData: {
		name: { [key: string]: string };
		image: string;
	}) {
		try {
			const { data, error } = await supabase
				.from('cuisines')
				.insert(cuisineData)
				.select()
				.single();

			if (error) throw error;

			const language = this.getCurrentLanguage();
			const localizedCuisine = this.localizeCuisine(data as CuisineRow, language);

			return {
				success: true,
				data: localizedCuisine,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create cuisine',
			};
		}
	}

	static async updateCuisine(
		id: string,
		cuisineData: {
			name?: { [key: string]: string };
			image?: string;
		},
	) {
		try {
			const updateData = {
				...cuisineData,
				updated_at: new Date().toISOString(),
			};

			const { data, error } = await supabase
				.from('cuisines')
				.update(updateData)
				.eq('id', id)
				.select()
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Cuisine not found',
					};
				}
				throw error;
			}

			const language = this.getCurrentLanguage();
			const localizedCuisine = this.localizeCuisine(data as CuisineRow, language);

			return {
				success: true,
				data: localizedCuisine,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update cuisine',
			};
		}
	}

	static async deleteCuisine(id: string) {
		try {
			// Check if cuisine is being used by any restaurants
			const { data: restaurants, error: checkError } = await supabase
				.from('restaurants')
				.select('id')
				.eq('cuisine_id', id)
				.limit(1);

			if (checkError) throw checkError;

			if (restaurants && restaurants.length > 0) {
				return {
					success: false,
					error: 'Cannot delete cuisine that is being used by restaurants',
				};
			}

			const { error } = await supabase
				.from('cuisines')
				.delete()
				.eq('id', id);

			if (error) throw error;

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete cuisine',
			};
		}
	}
}