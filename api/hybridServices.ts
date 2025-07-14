// api/hybridServices.ts
import { RestaurantTag } from '@/shared/enums';
import {
	Address,
	Cuisine,
	MenuData,
	Restaurant,
	Review,
	User,
} from '@/shared/types';
import { hybridApiClient } from './hybridClient';
import { SupabaseStorageService } from './supabaseStorage';

/**
 * Servicios híbridos que combinan Supabase con tu API actual
 * Auth y Storage van a Supabase, resto va a tu API
 */

// NOTA: AuthService ya está migrado a SupabaseAuthService

// Cuisine Service - sigue usando tu API
export class CuisineService {
	static async getAllCuisines() {
		return hybridApiClient.get<{
			success: boolean;
			data: Cuisine[];
		}>('/cuisines');
	}

	static async getCuisineById(id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: Cuisine;
		}>(`/cuisines/${id}`);
	}

	static async searchCuisines(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return hybridApiClient.get<{
			success: boolean;
			data: Cuisine[];
		}>(`/cuisines/search?${queryParams.toString()}`);
	}

	static async getCuisineStats() {
		return hybridApiClient.get<{
			success: boolean;
			data: {
				total: number;
				mostPopular: Cuisine | null;
			};
		}>('/cuisines/stats');
	}

	// Admin functions
	static async createCuisine(cuisineData: {
		name: { [key: string]: string };
		image: string;
	}) {
		return hybridApiClient.post<{
			success: boolean;
			data: Cuisine;
		}>('/cuisines', cuisineData);
	}

	static async updateCuisine(
		id: string,
		cuisineData: {
			name?: { [key: string]: string };
			image?: string;
		},
	) {
		return hybridApiClient.put<{
			success: boolean;
			data: Cuisine;
		}>(`/cuisines/${id}`, cuisineData);
	}

	static async deleteCuisine(id: string) {
		return hybridApiClient.delete<{
			success: boolean;
		}>(`/cuisines/${id}`);
	}
}

// Restaurant Service - API + Storage híbrido
export class RestaurantService {
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
		const queryParams = new URLSearchParams();

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						queryParams.append(key, value.join(','));
					} else {
						queryParams.append(key, value.toString());
					}
				}
			});
		}

		const endpoint = `/restaurants${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		return hybridApiClient.get<{
			success: boolean;
			data: {
				data: Restaurant[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
					hasNext: boolean;
					hasPrev: boolean;
				};
			};
		}>(endpoint);
	}

	static async getRestaurantById(id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: Restaurant;
		}>(`/restaurants/${id}`);
	}

	/**
	 * Crear restaurante con upload de imágenes híbrido
	 */
	static async createRestaurant(restaurantData: {
		name: string;
		minimum_price: number;
		cuisine_id: string;
		main_image?: string; // URL si ya está subida, o se subirá
		profile_image?: string;
		images?: string[];
		address_id: string;
		tags?: RestaurantTag[];
		phone?: string;
		reservation_link?: string;
		// Nuevos campos para imágenes locales
		main_image_file?: any; // ImagePickerAsset
		profile_image_file?: any;
		image_files?: any[];
	}) {
		let finalData = { ...restaurantData };

		try {
			// 1. Subir imágenes a Supabase Storage si se proporcionan archivos
			if (restaurantData.main_image_file) {
				const uploadResult = await SupabaseStorageService.uploadImage(
					'RESTAURANTS',
					restaurantData.main_image_file,
					'temp', // Usamos carpeta temporal, luego moveremos con el ID real
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

			// 2. Crear restaurante en tu API
			const response = await hybridApiClient.post<{
				success: boolean;
				data: Restaurant;
			}>('/restaurants', {
				name: finalData.name,
				minimum_price: finalData.minimum_price,
				cuisine_id: finalData.cuisine_id,
				main_image: finalData.main_image,
				profile_image: finalData.profile_image,
				images: finalData.images || [],
				address_id: finalData.address_id,
				tags: finalData.tags,
				phone: finalData.phone,
				reservation_link: finalData.reservation_link,
			});

			// 3. TODO: Mover imágenes de carpeta temp a carpeta del restaurante
			// Esto lo harías con SupabaseStorageService.moveFile()

			return response;
		} catch (error) {
			// En caso de error, limpiar imágenes subidas
			console.error('Error creating restaurant:', error);
			throw error;
		}
	}

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
		return hybridApiClient.put<{
			success: boolean;
			data: Restaurant;
		}>(`/restaurants/${id}`, updateData);
	}

	static async deleteRestaurant(id: string) {
		return hybridApiClient.delete<{
			success: boolean;
		}>(`/restaurants/${id}`);
	}

	static async getMyRestaurants() {
		return hybridApiClient.get<{
			success: boolean;
			data: Restaurant[];
		}>('/restaurants/owner/mine');
	}

	static async searchRestaurants(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return hybridApiClient.get<{
			success: boolean;
			data: Restaurant[];
		}>(`/restaurants/search?${queryParams.toString()}`);
	}
}

// Menu Service - sigue usando tu API
export class MenuService {
	static async getRestaurantMenus(restaurant_id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: MenuData[];
		}>(`/menus/restaurant/${restaurant_id}`);
	}

	static async getMenuById(id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: MenuData;
		}>(`/menus/${id}`);
	}

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
			drinks?: {
				water: boolean;
				wine: boolean;
				soft_drinks: boolean;
				beer: boolean;
			};
			includes_coffee_and_dessert?: 'none' | 'coffee' | 'dessert' | 'both';
			minimum_people?: number;
			has_minimum_people?: boolean;
		},
	) {
		return hybridApiClient.post<{
			success: boolean;
			data: MenuData;
		}>(`/menus/restaurant/${restaurant_id}`, menuData);
	}

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
			drinks: {
				water: boolean;
				wine: boolean;
				soft_drinks: boolean;
				beer: boolean;
			};
			includes_coffee_and_dessert: 'none' | 'coffee' | 'dessert' | 'both';
			minimum_people: number;
			has_minimum_people: boolean;
			is_active: boolean;
		}>,
	) {
		return hybridApiClient.put<{
			success: boolean;
			data: MenuData;
		}>(`/menus/${id}`, updateData);
	}

	static async deleteMenu(id: string) {
		return hybridApiClient.delete<{
			success: boolean;
		}>(`/menus/${id}`);
	}
}

// Review Service - API + Storage híbrido para fotos
export class ReviewService {
	static async getRestaurantReviews(
		restaurant_id: string,
		params?: {
			page?: number;
			limit?: number;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			min_rating?: number;
			max_rating?: number;
		},
	) {
		const queryParams = new URLSearchParams();

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					queryParams.append(key, value.toString());
				}
			});
		}

		const endpoint = `/reviews/restaurant/${restaurant_id}${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		return hybridApiClient.get<{
			success: boolean;
			data: {
				data: Review[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
					hasNext: boolean;
					hasPrev: boolean;
				};
			};
		}>(endpoint);
	}

	/**
	 * Crear review con upload de fotos
	 */
	static async createReview(
		restaurant_id: string,
		reviewData: {
			rating: number;
			comment: string;
			photos?: string[];
			photo_files?: any[]; // ImagePickerAsset[]
		},
	) {
		let finalData = { ...reviewData };

		try {
			// 1. Subir fotos si se proporcionan
			if (reviewData.photo_files?.length) {
				const uploadResult = await SupabaseStorageService.uploadMultipleImages(
					'REVIEWS',
					reviewData.photo_files,
					'temp', // Temporal hasta tener el review ID
				);

				if (uploadResult.success) {
					finalData.photos = uploadResult.data?.successful.map(
						(img) => img.publicUrl,
					);
				}
			}

			// 2. Crear review en tu API
			const response = await hybridApiClient.post<{
				success: boolean;
				data: Review;
			}>(`/reviews/restaurant/${restaurant_id}`, {
				rating: finalData.rating,
				comment: finalData.comment,
				photos: finalData.photos || [],
			});

			// 3. TODO: Mover fotos a carpeta definitiva con review ID

			return response;
		} catch (error) {
			console.error('Error creating review:', error);
			throw error;
		}
	}

	static async updateReview(
		id: string,
		updateData: {
			rating?: number;
			comment?: string;
			photos?: string[];
		},
	) {
		return hybridApiClient.put<{
			success: boolean;
			data: Review;
		}>(`/reviews/${id}`, updateData);
	}

	static async deleteReview(id: string) {
		return hybridApiClient.delete<{
			success: boolean;
		}>(`/reviews/${id}`);
	}

	static async getMyReviews(params?: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}) {
		const queryParams = new URLSearchParams();

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					queryParams.append(key, value.toString());
				}
			});
		}

		const endpoint = `/reviews/user/mine${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		return hybridApiClient.get<{
			success: boolean;
			data: {
				data: Review[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
					hasNext: boolean;
					hasPrev: boolean;
				};
			};
		}>(endpoint);
	}

	static async addRestaurantResponse(reviewId: string, message: string) {
		return hybridApiClient.post<{
			success: boolean;
			data: Review;
		}>(`/reviews/${reviewId}/response`, { message });
	}
}

// User Service - Híbrido (Profile en Supabase, resto en API)
export class UserService {
	/**
	 * Update profile - ahora usa Supabase directamente
	 * Nota: Ya está manejado en SupabaseAuthService.updateProfile
	 */
	static async updateProfile(updateData: {
		username?: string;
		name?: string;
		photo?: string;
		language?: string;
	}) {
		// Este método ahora se maneja en SupabaseAuthService
		throw new Error('Use SupabaseAuthService.updateProfile instead');
	}

	static async checkUsernameAvailability(username: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: { available: boolean };
		}>(`/users/check-username/${username}`);
	}

	static async checkEmailAvailability(email: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: { available: boolean };
		}>(`/users/check-email/${email}`);
	}

	static async getUserById(id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: Partial<User>;
		}>(`/users/${id}`);
	}
}

// Address Service - sigue usando tu API
export class AddressService {
	static async createAddress(addressData: {
		street: { [key: string]: string };
		number: string;
		additional_information?: string;
		postal_code: string;
		city: { [key: string]: string };
		country: { [key: string]: string };
		coordinates: {
			latitude: number;
			longitude: number;
		};
		formatted_address?: string;
	}) {
		return hybridApiClient.post<{
			success: boolean;
			data: Address;
		}>('/addresses', addressData);
	}

	static async getAddressById(id: string) {
		return hybridApiClient.get<{
			success: boolean;
			data: Address;
		}>(`/addresses/${id}`);
	}

	static async updateAddress(
		id: string,
		updateData: Partial<{
			street: { [key: string]: string };
			number: string;
			additional_information?: string;
			postal_code: string;
			city: { [key: string]: string };
			country: { [key: string]: string };
			coordinates: {
				latitude: number;
				longitude: number;
			};
			formatted_address?: string;
		}>,
	) {
		return hybridApiClient.put<{
			success: boolean;
			data: Address;
		}>(`/addresses/${id}`, updateData);
	}

	static async searchAddresses(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return hybridApiClient.get<{
			success: boolean;
			data: Address[];
		}>(`/addresses/search?${queryParams.toString()}`);
	}

	static async getNearbyAddresses(
		latitude: number,
		longitude: number,
		radius?: number,
		limit?: number,
	) {
		const queryParams = new URLSearchParams({
			latitude: latitude.toString(),
			longitude: longitude.toString(),
		});

		if (radius) queryParams.append('radius', radius.toString());
		if (limit) queryParams.append('limit', limit.toString());

		return hybridApiClient.get<{
			success: boolean;
			data: Address[];
		}>(`/addresses/nearby?${queryParams.toString()}`);
	}
}

/**
 * Storage Service - Solo Supabase
 * Exportamos el servicio de Supabase Storage directamente
 */
export { SupabaseStorageService as StorageService };
