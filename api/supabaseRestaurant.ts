import { supabase } from '@/lib/supabase';
import { RestaurantTag } from '@/shared/enums';
import { Address, Cuisine, Language, Restaurant, Review } from '@/shared/types';
import { SupabaseStorageService } from './supabaseStorage';

// Types matching backend interface
interface RestaurantRow {
	id: string;
	name: string;
	minimum_price: number;
	cuisine_id: string;
	address_id: string;
	owner_id: string;
	rating?: number;
	main_image: string;
	profile_image?: string;
	images: string[];
	tags?: RestaurantTag[];
	phone?: string;
	reservation_link?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

interface AddressRow {
	id: string;
	street: { [key: string]: string };
	number: string;
	additional_information?: string;
	postal_code: string;
	city: { [key: string]: string };
	country: { [key: string]: string };
	coordinates: { latitude: number; longitude: number };
	formatted_address?: string;
}

interface CuisineRowData {
	id: string;
	name: { [key: string]: string };
	image: string;
}

export class SupabaseRestaurantService {
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
	 * Calculate distance between two coordinates
	 */
	private static calculateDistance(
		coord1: { latitude: number; longitude: number },
		coord2: { latitude: number; longitude: number },
	): number {
		const R = 6371; // Earth's radius in kilometers
		const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
		const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(coord1.latitude * (Math.PI / 180)) *
				Math.cos(coord2.latitude * (Math.PI / 180)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	/**
	 * Convert raw restaurant data to Restaurant type
	 */
	private static async convertToRestaurant(
		restaurantRow: any,
		userLanguage: Language,
		userCoords?: { latitude: number; longitude: number },
	): Promise<Restaurant> {
		// Convert cuisine
		const cuisine: Cuisine = {
			id: restaurantRow.cuisines.id,
			name: this.getLocalizedText(restaurantRow.cuisines.name, userLanguage),
			image: restaurantRow.cuisines.image,
		};

		// Convert address
		const address: Address = {
			street: this.getLocalizedText(
				restaurantRow.addresses.street,
				userLanguage,
			),
			number: restaurantRow.addresses.number,
			additional_information: restaurantRow.addresses.additional_information,
			postal_code: restaurantRow.addresses.postal_code,
			city: this.getLocalizedText(restaurantRow.addresses.city, userLanguage),
			country: this.getLocalizedText(
				restaurantRow.addresses.country,
				userLanguage,
			),
			coordinates: restaurantRow.addresses.coordinates,
			formatted_address: restaurantRow.addresses.formatted_address,
		};

		// Calculate distance if user coordinates provided
		let distance = 0;
		if (userCoords) {
			distance = this.calculateDistance(userCoords, address.coordinates);
		}

		return {
			id: restaurantRow.id,
			name: restaurantRow.name,
			minimum_price: restaurantRow.minimum_price,
			cuisineId: restaurantRow.cuisine_id,
			rating: restaurantRow.rating,
			main_image: restaurantRow.main_image,
			profile_image: restaurantRow.profile_image,
			images: restaurantRow.images || [],
			distance,
			address,
			tags: restaurantRow.tags || [],
			menus: [], // Will be loaded separately when needed
			phone: restaurantRow.phone,
			reservation_link: restaurantRow.reservation_link,
			is_active: restaurantRow.is_active,
			cuisine,
			reviews: [], // Will be loaded separately when needed
			created_at: restaurantRow.created_at,
			updated_at: restaurantRow.updated_at,
		};
	}

	/**
	 * Create a new restaurant
	 */
	static async createRestaurant(restaurantData: {
		name: string;
		minimum_price: number;
		cuisine_id: string;
		main_image?: string;
		profile_image?: string;
		images?: string[];
		address_id: string;
		tags?: RestaurantTag[];
		phone?: string;
		reservation_link?: string;
		// File upload support
		main_image_file?: any;
		profile_image_file?: any;
		image_files?: any[];
	}) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			let finalData = { ...restaurantData };

			// Handle image uploads
			if (restaurantData.main_image_file) {
				const uploadResult = await SupabaseStorageService.uploadImage(
					'RESTAURANTS',
					restaurantData.main_image_file,
					'temp',
				);

				if (uploadResult.success) {
					finalData.main_image = uploadResult.data?.publicUrl;
				}
			}

			if (restaurantData.profile_image_file) {
				const uploadResult = await SupabaseStorageService.uploadImage(
					'RESTAURANTS',
					restaurantData.profile_image_file,
					'temp',
				);

				if (uploadResult.success) {
					finalData.profile_image = uploadResult.data?.publicUrl;
				}
			}

			if (restaurantData.image_files?.length) {
				const uploadResult = await SupabaseStorageService.uploadMultipleImages(
					'RESTAURANTS',
					restaurantData.image_files,
					'temp',
				);

				if (uploadResult.success) {
					finalData.images = uploadResult.data?.successful.map(
						(img) => img.publicUrl,
					);
				}
			}

			// Create restaurant in database
			const { data, error } = await supabase
				.from('restaurants')
				.insert({
					name: finalData.name,
					minimum_price: finalData.minimum_price,
					cuisine_id: finalData.cuisine_id,
					address_id: finalData.address_id,
					owner_id: userId,
					main_image: finalData.main_image || '',
					profile_image: finalData.profile_image,
					images: finalData.images || [],
					tags: finalData.tags || [],
					phone: finalData.phone,
					reservation_link: finalData.reservation_link,
					is_active: true,
				})
				.select()
				.single();

			if (error) {
				if (error.code === '23503') {
					if (error.message.includes('cuisine_id')) {
						return {
							success: false,
							error: 'Invalid cuisine ID',
						};
					}
					if (error.message.includes('address_id')) {
						return {
							success: false,
							error: 'Invalid address ID',
						};
					}
					if (error.message.includes('owner_id')) {
						return {
							success: false,
							error: 'Invalid owner ID',
						};
					}
				}
				throw error;
			}

			// Convert to Restaurant type
			const userLanguage = this.getCurrentLanguage();
			const { data: fullRestaurant } = await supabase
				.from('restaurants')
				.select(
					`
					*,
					cuisines!inner(id, name, image),
					addresses!inner(id, street, number, additional_information, postal_code, city, country, coordinates, formatted_address)
				`,
				)
				.eq('id', data.id)
				.single();

			if (fullRestaurant) {
				const restaurant = await this.convertToRestaurant(
					fullRestaurant,
					userLanguage,
				);
				return {
					success: true,
					data: restaurant,
				};
			}

			return {
				success: true,
				data: data as any,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to create restaurant',
			};
		}
	}

	/**
	 * Get all restaurants with filters and pagination
	 */
	static async getAllRestaurants(params?: {
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
	}) {
		try {
			const page = params?.page || 1;
			const limit = params?.limit || 20;
			const userLanguage = this.getCurrentLanguage();

			let query = supabase
				.from('restaurants')
				.select(
					`
					*,
					cuisines!inner(id, name, image),
					addresses!inner(id, street, number, additional_information, postal_code, city, country, coordinates, formatted_address)
				`,
					{ count: 'exact' },
				)
				.eq('is_active', true)
				.is('deleted_at', null);

			// Apply filters
			if (params?.cuisine_id) {
				query = query.eq('cuisine_id', params.cuisine_id);
			}

			if (params?.min_price) {
				query = query.gte('minimum_price', params.min_price);
			}

			if (params?.max_price) {
				query = query.lte('minimum_price', params.max_price);
			}

			if (params?.min_rating) {
				query = query.gte('rating', params.min_rating);
			}

			if (params?.tags && params.tags.length > 0) {
				query = query.contains('tags', params.tags);
			}

			if (params?.search) {
				query = query.ilike('name', `%${params.search}%`);
			}

			// Apply sorting
			const validSortFields = ['created_at', 'rating', 'minimum_price', 'name'];
			const sortField = validSortFields.includes(params?.sortBy || '')
				? params?.sortBy
				: 'created_at';
			query = query.order(sortField!, {
				ascending: params?.sortOrder === 'asc',
			});

			// Apply pagination
			const offset = (page - 1) * limit;
			query = query.range(offset, offset + limit - 1);

			const { data, error, count } = await query;

			if (error) {
				throw error;
			}

			// Convert to Restaurant type with distance calculation
			const userCoords =
				params?.latitude && params?.longitude
					? { latitude: params.latitude, longitude: params.longitude }
					: undefined;

			let restaurants = await Promise.all(
				(data || []).map((restaurant: any) =>
					this.convertToRestaurant(restaurant, userLanguage, userCoords),
				),
			);

			// Filter by distance if radius provided
			if (params?.radius && userCoords) {
				restaurants = restaurants.filter(
					(restaurant) => restaurant.distance <= params.radius!,
				);
			}

			const totalPages = Math.ceil((count || 0) / limit);

			return {
				success: true,
				data: {
					data: restaurants,
					pagination: {
						page,
						limit,
						total: count || 0,
						totalPages,
						hasNext: page < totalPages,
						hasPrev: page > 1,
					},
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch restaurants',
			};
		}
	}

	/**
	 * Get restaurant by ID with full details
	 */
	static async getRestaurantById(id: string) {
		try {
			const userLanguage = this.getCurrentLanguage();

			// Get restaurant with related data
			const { data, error } = await supabase
				.from('restaurants')
				.select(
					`
					*,
					cuisines!inner(id, name, image),
					addresses!inner(id, street, number, additional_information, postal_code, city, country, coordinates, formatted_address)
				`,
				)
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Restaurant not found',
					};
				}
				throw error;
			}

			// Get recent reviews (first 5)
			const { data: reviewsData, error: reviewsError } = await supabase
				.from('reviews')
				.select(
					`
					*,
					users:user_id (id, username, name, photo)
				`,
				)
				.eq('restaurant_id', id)
				.is('deleted_at', null)
				.order('created_at', { ascending: false })
				.limit(5);

			let reviews: Review[] = [];
			if (!reviewsError && reviewsData) {
				reviews = reviewsData.map((review: any) => ({
					id: review.id,
					user_id: review.user_id,
					user_name: review.users.name,
					user_avatar: review.users.photo,
					restaurant_id: review.restaurant_id,
					restaurant_name: data.name,
					restaurant_image: data.main_image,
					rating: review.rating,
					comment: this.getLocalizedText(review.comment, userLanguage),
					photos: review.photos || [],
					restaurant_response: review.restaurant_response_message
						? {
								message: this.getLocalizedText(
									review.restaurant_response_message,
									userLanguage,
								),
								date: review.restaurant_response_date,
						  }
						: undefined,
					date: review.created_at,
					created_at: review.created_at,
					updated_at: review.updated_at,
				}));
			}

			// Convert to Restaurant type
			const restaurant = await this.convertToRestaurant(data, userLanguage);
			restaurant.reviews = reviews;

			// TODO: Load menus when MenuService is migrated
			restaurant.menus = [];

			return {
				success: true,
				data: restaurant,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to fetch restaurant',
			};
		}
	}

	/**
	 * Update restaurant
	 */
	static async updateRestaurant(
		id: string,
		updateData: Partial<{
			name: string;
			minimum_price: number;
			cuisine_id: string;
			main_image: string;
			profile_image?: string;
			images: string[];
			address_id: string;
			tags?: RestaurantTag[];
			phone?: string;
			reservation_link?: string;
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

			// Check ownership
			const restaurant = await this.getRestaurantRawById(id);
			if (!restaurant) {
				return {
					success: false,
					error: 'Restaurant not found',
				};
			}

			if (restaurant.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to update this restaurant',
				};
			}

			const { data, error } = await supabase
				.from('restaurants')
				.update(updateData)
				.eq('id', id)
				.select()
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Restaurant not found',
					};
				}
				if (error.code === '23503') {
					if (error.message.includes('cuisine_id')) {
						return {
							success: false,
							error: 'Invalid cuisine ID',
						};
					}
					if (error.message.includes('address_id')) {
						return {
							success: false,
							error: 'Invalid address ID',
						};
					}
				}
				throw error;
			}

			return {
				success: true,
				data: data as RestaurantRow,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to update restaurant',
			};
		}
	}

	/**
	 * Delete restaurant permanently
	 */
	static async deleteRestaurant(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check ownership
			const restaurant = await this.getRestaurantRawById(id);
			if (!restaurant) {
				return {
					success: false,
					error: 'Restaurant not found',
				};
			}

			if (restaurant.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to delete this restaurant',
				};
			}

			// Get all menu IDs for this restaurant
			const { data: menus, error: menusError } = await supabase
				.from('menus')
				.select('id')
				.eq('restaurant_id', id);

			if (menusError) {
				throw new Error('Failed to fetch restaurant menus for deletion');
			}

			const menuIds = menus?.map((menu) => menu.id) || [];

			// Delete related data in the correct order
			await Promise.all([
				// Delete reviews
				supabase.from('reviews').delete().eq('restaurant_id', id),

				// Delete dishes (only if there are menus)
				...(menuIds.length > 0
					? [supabase.from('dishes').delete().in('menu_id', menuIds)]
					: []),

				// Delete menus
				supabase.from('menus').delete().eq('restaurant_id', id),
			]);

			// Finally, delete the restaurant
			const { error } = await supabase
				.from('restaurants')
				.delete()
				.eq('id', id);

			if (error) {
				throw error;
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete restaurant',
			};
		}
	}

	/**
	 * Soft delete restaurant
	 */
	static async softDeleteRestaurant(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check ownership
			const restaurant = await this.getRestaurantRawById(id);
			if (!restaurant) {
				return {
					success: false,
					error: 'Restaurant not found',
				};
			}

			if (restaurant.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to delete this restaurant',
				};
			}

			const { error } = await supabase
				.from('restaurants')
				.update({ deleted_at: new Date().toISOString() })
				.eq('id', id)
				.is('deleted_at', null);

			if (error) {
				throw error;
			}

			// Soft delete related menus and reviews
			await Promise.all([
				supabase
					.from('menus')
					.update({ deleted_at: new Date().toISOString() })
					.eq('restaurant_id', id)
					.is('deleted_at', null),

				supabase
					.from('reviews')
					.update({ deleted_at: new Date().toISOString() })
					.eq('restaurant_id', id)
					.is('deleted_at', null),
			]);

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete restaurant',
			};
		}
	}

	/**
	 * Get restaurants by owner
	 */
	static async getMyRestaurants() {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('restaurants')
				.select(
					`
					*,
					cuisines!inner(id, name, image),
					addresses!inner(id, street, number, additional_information, postal_code, city, country, coordinates, formatted_address)
				`,
				)
				.eq('owner_id', userId)
				.is('deleted_at', null)
				.order('created_at', { ascending: false });

			if (error) {
				throw error;
			}

			const restaurants = await Promise.all(
				(data || []).map(async (restaurant: any) => {
					const convertedRestaurant = await this.convertToRestaurant(
						restaurant,
						userLanguage,
					);
					// TODO: Load menus when MenuService is migrated
					convertedRestaurant.menus = [];
					return convertedRestaurant;
				}),
			);

			return {
				success: true,
				data: restaurants,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch user restaurants',
			};
		}
	}

	/**
	 * Search restaurants
	 */
	static async searchRestaurants(query: string, limit?: number) {
		try {
			if (!query || query.length < 2) {
				return {
					success: false,
					error: 'Search query must be at least 2 characters long',
				};
			}

			const searchLimit = limit || 20;
			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('restaurants')
				.select(
					`
					*,
					cuisines!inner(id, name, image),
					addresses!inner(id, street, number, additional_information, postal_code, city, country, coordinates, formatted_address)
				`,
				)
				.eq('is_active', true)
				.is('deleted_at', null)
				.or(`name.ilike.%${query}%, cuisines.name->>es_ES.ilike.%${query}%`)
				.limit(searchLimit);

			if (error) {
				throw error;
			}

			const restaurants = await Promise.all(
				(data || []).map((restaurant: any) =>
					this.convertToRestaurant(restaurant, userLanguage),
				),
			);

			return {
				success: true,
				data: restaurants,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to search restaurants',
			};
		}
	}

	/**
	 * Update restaurant rating based on reviews (internal method)
	 */
	static async updateRestaurantRating(restaurantId: string) {
		try {
			const { data, error } = await supabase
				.from('reviews')
				.select('rating')
				.eq('restaurant_id', restaurantId)
				.is('deleted_at', null);

			if (error) {
				throw error;
			}

			let averageRating = null;
			if (data && data.length > 0) {
				const totalRating = data.reduce(
					(sum, review) => sum + review.rating,
					0,
				);
				averageRating = Math.round((totalRating / data.length) * 10) / 10;
			}

			const { error: updateError } = await supabase
				.from('restaurants')
				.update({ rating: averageRating })
				.eq('id', restaurantId);

			if (updateError) {
				throw updateError;
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to update restaurant rating',
			};
		}
	}

	/**
	 * Get raw restaurant data (helper method)
	 */
	private static async getRestaurantRawById(
		restaurantId: string,
	): Promise<RestaurantRow | null> {
		const { data, error } = await supabase
			.from('restaurants')
			.select('*')
			.eq('id', restaurantId)
			.is('deleted_at', null)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data as RestaurantRow;
	}
}
