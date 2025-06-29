import { RestaurantTag } from '@/shared/enums';
import {
	Address,
	Cuisine,
	MenuData,
	Restaurant,
	Review,
	User,
} from '@/shared/types';
import { apiClient } from './client';

export class AuthService {
	static async login(email: string, password: string) {
		return apiClient.post<{
			success: boolean;
			data: {
				user: User;
				token: string;
			};
		}>('/auth/login', { email, password });
	}

	static async register(userData: {
		email: string;
		username: string;
		name: string;
		password: string;
		language: string;
	}) {
		return apiClient.post<{
			success: boolean;
			data: {
				user: User;
				token: string;
			};
		}>('/auth/register', userData);
	}

	static async getProfile() {
		return apiClient.get<{
			success: boolean;
			data: User;
		}>('/auth/profile');
	}

	static async changePassword(currentPassword: string, newPassword: string) {
		return apiClient.post<{
			success: boolean;
		}>('/auth/change-password', { currentPassword, newPassword });
	}

	static async setPassword(newPassword: string) {
		return apiClient.post<{
			success: boolean;
		}>('/auth/set-password', { newPassword });
	}

	static async googleAuth(googleData: {
		google_id: string;
		email: string;
		name: string;
		photo?: string;
		language: string;
	}) {
		return apiClient.post<{
			success: boolean;
			data: {
				user: User;
				token: string;
			};
		}>('/auth/google', googleData);
	}

	static async refreshToken() {
		return apiClient.post<{
			success: boolean;
			data: {
				token: string;
			};
		}>('/auth/refresh');
	}

	// Password reset flow methods
	static async sendPasswordResetCode(email: string) {
		return apiClient.post<{
			success: boolean;
			message: string;
		}>('/auth/send-reset-code', { email });
	}

	static async verifyPasswordResetCode(email: string, code: string) {
		return apiClient.post<{
			success: boolean;
			data: {
				token: string;
			};
			message: string;
		}>('/auth/verify-reset-code', { email, code });
	}

	static async resetPasswordWithToken(token: string, newPassword: string) {
		return apiClient.post<{
			success: boolean;
			message: string;
		}>('/auth/reset-password', { token, newPassword });
	}
}

// Cuisine Service
export class CuisineService {
	static async getAllCuisines() {
		return apiClient.get<{
			success: boolean;
			data: Cuisine[];
		}>('/cuisines');
	}

	static async getCuisineById(id: string) {
		return apiClient.get<{
			success: boolean;
			data: Cuisine;
		}>(`/cuisines/${id}`);
	}

	static async searchCuisines(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return apiClient.get<{
			success: boolean;
			data: Cuisine[];
		}>(`/cuisines/search?${queryParams.toString()}`);
	}

	static async getCuisineStats() {
		return apiClient.get<{
			success: boolean;
			data: {
				total: number;
				mostPopular: Cuisine | null;
			};
		}>('/cuisines/stats');
	}

	// Admin functions (require authentication)
	static async createCuisine(cuisineData: {
		name: { [key: string]: string };
		image: string;
	}) {
		return apiClient.post<{
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
		return apiClient.put<{
			success: boolean;
			data: Cuisine;
		}>(`/cuisines/${id}`, cuisineData);
	}

	static async deleteCuisine(id: string) {
		return apiClient.delete<{
			success: boolean;
		}>(`/cuisines/${id}`);
	}
}

// Restaurant Service
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
		console.log('Fetching restaurants with params:', endpoint);
		return apiClient.get<{
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
		return apiClient.get<{
			success: boolean;
			data: Restaurant;
		}>(`/restaurants/${id}`);
	}

	static async createRestaurant(restaurantData: {
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
	}) {
		return apiClient.post<{
			success: boolean;
			data: Restaurant;
		}>('/restaurants', restaurantData);
	}

	static async updateRestaurant(
		id: string,
		updated_ata: Partial<{
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
		return apiClient.put<{
			success: boolean;
			data: Restaurant;
		}>(`/restaurants/${id}`, updated_ata);
	}

	static async deleteRestaurant(id: string) {
		return apiClient.delete<{
			success: boolean;
		}>(`/restaurants/${id}`);
	}

	static async getMyRestaurants() {
		return apiClient.get<{
			success: boolean;
			data: Restaurant[];
		}>('/restaurants/owner/mine');
	}

	static async searchRestaurants(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return apiClient.get<{
			success: boolean;
			data: Restaurant[];
		}>(`/restaurants/search?${queryParams.toString()}`);
	}
}

// Menu Service
export class MenuService {
	static async getRestaurantMenus(restaurant_id: string) {
		return apiClient.get<{
			success: boolean;
			data: MenuData[];
		}>(`/menus/restaurant/${restaurant_id}`);
	}

	static async getMenuById(id: string) {
		return apiClient.get<{
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
		return apiClient.post<{
			success: boolean;
			data: MenuData;
		}>(`/menus/restaurant/${restaurant_id}`, menuData);
	}

	static async updateMenu(
		id: string,
		updated_ata: Partial<{
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
		return apiClient.put<{
			success: boolean;
			data: MenuData;
		}>(`/menus/${id}`, updated_ata);
	}

	static async deleteMenu(id: string) {
		return apiClient.delete<{
			success: boolean;
		}>(`/menus/${id}`);
	}
}

// Review Service
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

		return apiClient.get<{
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

	static async createReview(
		restaurant_id: string,
		reviewData: {
			rating: number;
			comment: string;
			photos?: string[];
		},
	) {
		return apiClient.post<{
			success: boolean;
			data: Review;
		}>(`/reviews/restaurant/${restaurant_id}`, reviewData);
	}

	static async updateReview(
		id: string,
		updated_ata: {
			rating?: number;
			comment?: string;
			photos?: string[];
		},
	) {
		return apiClient.put<{
			success: boolean;
			data: Review;
		}>(`/reviews/${id}`, updated_ata);
	}

	static async deleteReview(id: string) {
		return apiClient.delete<{
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

		return apiClient.get<{
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
		return apiClient.post<{
			success: boolean;
			data: Review;
		}>(`/reviews/${reviewId}/response`, { message });
	}
}

// User Service
export class UserService {
	static async updateProfile(updated_ata: {
		username?: string;
		name?: string;
		photo?: string;
		language?: string;
	}) {
		return apiClient.put<{
			success: boolean;
			data: User;
		}>('/users', updated_ata);
	}

	static async checkUsernameAvailability(username: string) {
		return apiClient.get<{
			success: boolean;
			data: { available: boolean };
		}>(`/users/check-username/${username}`);
	}

	static async checkEmailAvailability(email: string) {
		return apiClient.get<{
			success: boolean;
			data: { available: boolean };
		}>(`/users/check-email/${email}`);
	}

	static async getUserById(id: string) {
		return apiClient.get<{
			success: boolean;
			data: Partial<User>;
		}>(`/users/${id}`);
	}
}

// Address Service
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
		return apiClient.post<{
			success: boolean;
			data: Address;
		}>('/addresses', addressData);
	}

	static async getAddressById(id: string) {
		return apiClient.get<{
			success: boolean;
			data: Address;
		}>(`/addresses/${id}`);
	}

	static async updateAddress(
		id: string,
		updated_ata: Partial<{
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
		return apiClient.put<{
			success: boolean;
			data: Address;
		}>(`/addresses/${id}`, updated_ata);
	}

	static async searchAddresses(query: string, limit?: number) {
		const queryParams = new URLSearchParams({ q: query });
		if (limit) queryParams.append('limit', limit.toString());

		return apiClient.get<{
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

		return apiClient.get<{
			success: boolean;
			data: Address[];
		}>(`/addresses/nearby?${queryParams.toString()}`);
	}
}
