import { RestaurantTag } from '@/shared/enums';
import { User } from '@/shared/types';
import { supabase } from '@/utils/supabase';

// Helper para transformar errores de Supabase
const handleSupabaseResponse = <T>(response: {
	data: T | null;
	error: any;
}) => {
	if (response.error) {
		console.error('Supabase error:', response.error);
		throw new Error(response.error.message || 'Database operation failed');
	}
	return {
		success: true,
		data: response.data,
	};
};

// Función helper para calcular distancia (haversine formula)
const calculateDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number => {
	const R = 6371; // Radio de la Tierra en km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

export class AuthService {
	static async login(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw new Error(error.message);
		}

		// Obtener datos del usuario de la tabla public.users
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('*')
			.eq('id', data.user.id)
			.single();

		if (userError) {
			throw new Error('Error fetching user data');
		}

		return {
			success: true,
			data: {
				user: {
					id: userData.id,
					email: userData.email,
					username: userData.username,
					name: userData.name,
					photo: userData.photo || '',
					google_id: userData.google_id || '',
					has_password: userData.has_password,
					language: userData.language,
					created_at: userData.created_at,
				} as User,
				token: data.session.access_token,
			},
		};
	}

	static async register(userData: {
		email: string;
		username: string;
		name: string;
		password: string;
		language: string;
	}) {
		// Crear usuario en auth
		const { data, error } = await supabase.auth.signUp({
			email: userData.email,
			password: userData.password,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data.user) {
			throw new Error('User creation failed');
		}

		// Crear entrada en la tabla public.users
		const { error: userError } = await supabase.from('users').insert({
			id: data.user.id,
			email: userData.email,
			username: userData.username,
			name: userData.name,
			language: userData.language,
			has_password: true,
		});

		if (userError) {
			throw new Error('Error creating user profile');
		}

		return {
			success: true,
			data: {
				user: {
					id: data.user.id,
					email: userData.email,
					username: userData.username,
					name: userData.name,
					photo: '',
					google_id: '',
					has_password: true,
					language: userData.language,
					created_at: data.user.created_at || new Date().toISOString(),
				} as User,
				token: data.session?.access_token || '',
			},
		};
	}

	static async getProfile() {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('No authenticated user');
		}

		const { data: userData, error } = await supabase
			.from('users')
			.select('*')
			.eq('id', user.id)
			.single();

		if (error) {
			throw new Error('Error fetching user profile');
		}

		return handleSupabaseResponse({
			data: userData,
			error: null,
		});
	}

	static async changePassword(currentPassword: string, newPassword: string) {
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			throw new Error(error.message);
		}

		return { success: true };
	}

	static async setPassword(newPassword: string) {
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			throw new Error(error.message);
		}

		return { success: true };
	}

	static async googleAuth(googleData: {
		google_id: string;
		email: string;
		name: string;
		photo?: string;
		language: string;
	}) {
		// Implementar Google Auth con Supabase
		// Nota: Necesitarás configurar Google OAuth en Supabase
		throw new Error('Google Auth not implemented yet');
	}

	static async refreshToken() {
		const { data, error } = await supabase.auth.refreshSession();

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			data: {
				token: data.session?.access_token || '',
			},
		};
	}

	// Password reset methods
	static async sendPasswordResetCode(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email);

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			message: 'Password reset email sent',
		};
	}

	static async verifyPasswordResetCode(email: string, code: string) {
		// Supabase maneja esto automáticamente con magic links
		// Esta función puede no ser necesaria
		return {
			success: true,
			data: { token: '' },
			message: 'Code verified',
		};
	}

	static async resetPasswordWithToken(token: string, newPassword: string) {
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			message: 'Password updated successfully',
		};
	}
}

export class CuisineService {
	static async getAllCuisines() {
		const response = await supabase.from('cuisines').select('*').order('name');

		return handleSupabaseResponse(response);
	}

	static async getCuisineById(id: string) {
		const response = await supabase
			.from('cuisines')
			.select('*')
			.eq('id', id)
			.single();

		return handleSupabaseResponse(response);
	}

	static async searchCuisines(query: string, limit?: number) {
		let queryBuilder = supabase
			.from('cuisines')
			.select('*')
			.ilike('name', `%${query}%`)
			.order('name');

		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const response = await queryBuilder;
		return handleSupabaseResponse(response);
	}

	static async getCuisineStats() {
		// Implementar stats usando funciones SQL o conteos
		const { data: total, error: totalError } = await supabase
			.from('cuisines')
			.select('*', { count: 'exact' });

		if (totalError) {
			throw new Error(totalError.message);
		}

		// Obtener la cocina más popular (ejemplo)
		const { data: mostPopular, error: popularError } = await supabase
			.from('cuisines')
			.select('*')
			.limit(1)
			.single();

		return {
			success: true,
			data: {
				total: total?.length || 0,
				mostPopular: popularError ? null : mostPopular,
			},
		};
	}

	static async createCuisine(cuisineData: { name: string; image: string }) {
		const response = await supabase
			.from('cuisines')
			.insert(cuisineData)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async updateCuisine(
		id: string,
		cuisineData: {
			name?: string;
			image?: string;
		},
	) {
		const response = await supabase
			.from('cuisines')
			.update(cuisineData)
			.eq('id', id)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async deleteCuisine(id: string) {
		const response = await supabase.from('cuisines').delete().eq('id', id);

		return handleSupabaseResponse(response);
	}
}

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
		let query = supabase
			.from('restaurants')
			.select(
				`
				*,
				cuisine:cuisines(id, name, image),
				address:addresses(*),
				reviews(rating)
			`,
			)
			.eq('is_active', true);

		// Aplicar filtros
		if (params?.cuisine_id) {
			query = query.eq('cuisine_id', params.cuisine_id);
		}

		if (params?.min_price) {
			query = query.gte('minimum_price', params.min_price);
		}

		if (params?.max_price) {
			query = query.lte('minimum_price', params.max_price);
		}

		if (params?.search) {
			query = query.ilike('name', `%${params.search}%`);
		}

		if (params?.tags && params.tags.length > 0) {
			query = query.overlaps('tags', params.tags);
		}

		// Paginación
		const page = params?.page || 1;
		const limit = params?.limit || 50;
		const start = (page - 1) * limit;
		const end = start + limit - 1;

		query = query.range(start, end);

		// Ordenamiento
		const sortBy = params?.sortBy || 'created_at';
		const sortOrder = params?.sortOrder || 'desc';
		query = query.order(sortBy, { ascending: sortOrder === 'asc' });

		const response = await query;

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar los datos para incluir distancias y ratings
		const processedData =
			response.data?.map((restaurant: any) => {
				// Calcular rating promedio
				let averageRating = null;
				if (restaurant.reviews && restaurant.reviews.length > 0) {
					const totalRating = restaurant.reviews.reduce(
						(sum: number, review: any) => sum + review.rating,
						0,
					);
					averageRating = totalRating / restaurant.reviews.length;
				}

				// Calcular distancia si se proporcionan coordenadas
				let distance = 0;
				if (params?.latitude && params?.longitude && restaurant.address) {
					distance = calculateDistance(
						params.latitude,
						params.longitude,
						restaurant.address.coordinates.latitude,
						restaurant.address.coordinates.longitude,
					);
				}

				return {
					...restaurant,
					rating: averageRating,
					distance,
					menus: [], // Se cargará por separado si es necesario
				};
			}) || [];

		// Filtrar por distancia si se especifica
		const finalData = params?.radius
			? processedData.filter(
					(restaurant) => restaurant.distance <= params.radius!,
			  )
			: processedData;

		return {
			success: true,
			data: {
				data: finalData,
				pagination: {
					page,
					limit,
					total: finalData.length, // En una implementación real, necesitarías hacer un count por separado
					totalPages: Math.ceil(finalData.length / limit),
					hasNext: finalData.length === limit,
					hasPrev: page > 1,
				},
			},
		};
	}

	static async getRestaurantById(id: string) {
		const response = await supabase
			.from('restaurants')
			.select(
				`
				*,
				cuisine:cuisines(id, name, image),
				address:addresses(*),
				reviews(
					id,
					rating,
					comment,
					photos,
					restaurant_response,
					created_at,
					users(id, name, photo)
				)
			`,
			)
			.eq('id', id)
			.single();

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos del restaurante
		const restaurant = response.data;
		let averageRating = null;

		if (restaurant.reviews && restaurant.reviews.length > 0) {
			const totalRating = restaurant.reviews.reduce(
				(sum: number, review: any) => sum + review.rating,
				0,
			);
			averageRating = totalRating / restaurant.reviews.length;
		}

		const processedRestaurant = {
			...restaurant,
			rating: averageRating,
			distance: 0, // Se puede calcular si se necesita
			menus: [], // Se cargará por separado
		};

		return handleSupabaseResponse({
			data: processedRestaurant,
			error: null,
		});
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
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		const response = await supabase
			.from('restaurants')
			.insert({
				...restaurantData,
				user_id: user.id,
			})
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async updateRestaurant(
		id: string,
		updatedData: Partial<{
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
		const response = await supabase
			.from('restaurants')
			.update(updatedData)
			.eq('id', id)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async deleteRestaurant(id: string) {
		const response = await supabase.from('restaurants').delete().eq('id', id);

		return handleSupabaseResponse(response);
	}

	static async getMyRestaurants() {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		const response = await supabase
			.from('restaurants')
			.select(
				`
				*,
				cuisine:cuisines(id, name, image),
				address:addresses(*)
			`,
			)
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		return handleSupabaseResponse(response);
	}

	static async searchRestaurants(query: string, limit?: number) {
		let queryBuilder = supabase
			.from('restaurants')
			.select(
				`
				*,
				cuisine:cuisines(id, name, image),
				address:addresses(*)
			`,
			)
			.eq('is_active', true)
			.ilike('name', `%${query}%`)
			.order('name');

		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const response = await queryBuilder;
		return handleSupabaseResponse(response);
	}
}

export class MenuService {
	static async getRestaurantMenus(restaurant_id: string) {
		const response = await supabase
			.from('menus')
			.select(
				`
				*,
				dishes(*)
			`,
			)
			.eq('restaurant_id', restaurant_id)
			.eq('is_active', true)
			.order('created_at');

		return handleSupabaseResponse(response);
	}

	static async getMenuById(id: string) {
		const response = await supabase
			.from('menus')
			.select(
				`
				*,
				dishes(*)
			`,
			)
			.eq('id', id)
			.single();

		return handleSupabaseResponse(response);
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
		const response = await supabase
			.from('menus')
			.insert({
				...menuData,
				restaurant_id,
			})
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async updateMenu(
		id: string,
		updatedData: Partial<{
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
		const response = await supabase
			.from('menus')
			.update(updatedData)
			.eq('id', id)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async deleteMenu(id: string) {
		const response = await supabase.from('menus').delete().eq('id', id);

		return handleSupabaseResponse(response);
	}
}

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
		let query = supabase
			.from('reviews')
			.select(
				`
				*,
				users(id, name, photo)
			`,
			)
			.eq('restaurant_id', restaurant_id);

		// Aplicar filtros
		if (params?.min_rating) {
			query = query.gte('rating', params.min_rating);
		}

		if (params?.max_rating) {
			query = query.lte('rating', params.max_rating);
		}

		// Paginación
		const page = params?.page || 1;
		const limit = params?.limit || 10;
		const start = (page - 1) * limit;
		const end = start + limit - 1;

		query = query.range(start, end);

		// Ordenamiento
		const sortBy = params?.sortBy || 'created_at';
		const sortOrder = params?.sortOrder || 'desc';
		query = query.order(sortBy, { ascending: sortOrder === 'asc' });

		const response = await query;

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos para el formato esperado
		const processedData =
			response.data?.map((review: any) => ({
				...review,
				user_name: review.users?.name || 'Unknown User',
				user_avatar: review.users?.photo || '',
				date: review.created_at,
			})) || [];

		return {
			success: true,
			data: {
				data: processedData,
				pagination: {
					page,
					limit,
					total: processedData.length, // En una implementación real, harías un count por separado
					totalPages: Math.ceil(processedData.length / limit),
					hasNext: processedData.length === limit,
					hasPrev: page > 1,
				},
			},
		};
	}

	static async createReview(
		restaurant_id: string,
		reviewData: {
			rating: number;
			comment: string;
			photos?: string[];
		},
	) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		const response = await supabase
			.from('reviews')
			.insert({
				...reviewData,
				restaurant_id,
				user_id: user.id,
			})
			.select(
				`
				*,
				users(id, name, photo)
			`,
			)
			.single();

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos para el formato esperado
		const processedReview = {
			...response.data,
			user_name: response.data.users?.name || 'Unknown User',
			user_avatar: response.data.users?.photo || '',
			date: response.data.created_at,
		};

		return handleSupabaseResponse({
			data: processedReview,
			error: null,
		});
	}

	static async updateReview(
		id: string,
		updatedData: {
			rating?: number;
			comment?: string;
			photos?: string[];
		},
	) {
		const response = await supabase
			.from('reviews')
			.update(updatedData)
			.eq('id', id)
			.select(
				`
				*,
				users(id, name, photo)
			`,
			)
			.single();

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos para el formato esperado
		const processedReview = {
			...response.data,
			user_name: response.data.users?.name || 'Unknown User',
			user_avatar: response.data.users?.photo || '',
			date: response.data.created_at,
		};

		return handleSupabaseResponse({
			data: processedReview,
			error: null,
		});
	}

	static async deleteReview(id: string) {
		const response = await supabase.from('reviews').delete().eq('id', id);

		return handleSupabaseResponse(response);
	}

	static async getMyReviews(params?: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		let query = supabase
			.from('reviews')
			.select(
				`
				*,
				restaurants(id, name, main_image)
			`,
			)
			.eq('user_id', user.id);

		// Paginación
		const page = params?.page || 1;
		const limit = params?.limit || 10;
		const start = (page - 1) * limit;
		const end = start + limit - 1;

		query = query.range(start, end);

		// Ordenamiento
		const sortBy = params?.sortBy || 'created_at';
		const sortOrder = params?.sortOrder || 'desc';
		query = query.order(sortBy, { ascending: sortOrder === 'asc' });

		const response = await query;

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos para el formato esperado
		const processedData =
			response.data?.map((review: any) => ({
				...review,
				restaurant_name: review.restaurants?.name || 'Unknown Restaurant',
				restaurant_image: review.restaurants?.main_image || '',
				date: review.created_at,
			})) || [];

		return {
			success: true,
			data: {
				data: processedData,
				pagination: {
					page,
					limit,
					total: processedData.length,
					totalPages: Math.ceil(processedData.length / limit),
					hasNext: processedData.length === limit,
					hasPrev: page > 1,
				},
			},
		};
	}

	static async addRestaurantResponse(reviewId: string, message: string) {
		const response = await supabase
			.from('reviews')
			.update({
				restaurant_response: {
					message,
					date: new Date().toISOString(),
				},
			})
			.eq('id', reviewId)
			.select(
				`
				*,
				users(id, name, photo)
			`,
			)
			.single();

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Procesar datos para el formato esperado
		const processedReview = {
			...response.data,
			user_name: response.data.users?.name || 'Unknown User',
			user_avatar: response.data.users?.photo || '',
			date: response.data.created_at,
		};

		return handleSupabaseResponse({
			data: processedReview,
			error: null,
		});
	}
}

export class UserService {
	static async updateProfile(updatedData: {
		username?: string;
		name?: string;
		photo?: string;
		language?: string;
	}) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		const response = await supabase
			.from('users')
			.update(updatedData)
			.eq('id', user.id)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async checkUsernameAvailability(username: string) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		const response = await supabase
			.from('users')
			.select('id')
			.eq('username', username)
			.neq('id', user?.id || '') // Excluir el usuario actual si está logueado
			.single();

		return {
			success: true,
			data: { available: !response.data },
		};
	}

	static async checkEmailAvailability(email: string) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		const response = await supabase
			.from('users')
			.select('id')
			.eq('email', email)
			.neq('id', user?.id || '') // Excluir el usuario actual si está logueado
			.single();

		return {
			success: true,
			data: { available: !response.data },
		};
	}

	static async getUserById(id: string) {
		const response = await supabase
			.from('users')
			.select('id, username, name, photo, created_at')
			.eq('id', id)
			.single();

		return handleSupabaseResponse(response);
	}
}

export class AddressService {
	static async createAddress(addressData: {
		street: string;
		number: string;
		additional_information?: string;
		postal_code: string;
		city: string;
		country: string;
		coordinates: {
			latitude: number;
			longitude: number;
		};
		formatted_address?: string;
	}) {
		const response = await supabase
			.from('addresses')
			.insert(addressData)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async getAddressById(id: string) {
		const response = await supabase
			.from('addresses')
			.select('*')
			.eq('id', id)
			.single();

		return handleSupabaseResponse(response);
	}

	static async updateAddress(
		id: string,
		updatedData: Partial<{
			street: string;
			number: string;
			additional_information?: string;
			postal_code: string;
			city: string;
			country: string;
			coordinates: {
				latitude: number;
				longitude: number;
			};
			formatted_address?: string;
		}>,
	) {
		const response = await supabase
			.from('addresses')
			.update(updatedData)
			.eq('id', id)
			.select()
			.single();

		return handleSupabaseResponse(response);
	}

	static async searchAddresses(query: string, limit?: number) {
		let queryBuilder = supabase
			.from('addresses')
			.select('*')
			.or(
				`street.ilike.%${query}%,city.ilike.%${query}%,formatted_address.ilike.%${query}%`,
			);

		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const response = await queryBuilder;
		return handleSupabaseResponse(response);
	}

	static async getNearbyAddresses(
		latitude: number,
		longitude: number,
		radius?: number,
		limit?: number,
	) {
		// Para consultas de proximidad geográfica, necesitarías usar funciones PostGIS
		// Por ahora, implementamos una versión básica
		let queryBuilder = supabase.from('addresses').select('*');

		if (limit) {
			queryBuilder = queryBuilder.limit(limit);
		}

		const response = await queryBuilder;

		if (response.error) {
			throw new Error(response.error.message);
		}

		// Filtrar por distancia en el cliente (no es eficiente para grandes datasets)
		let filteredData = response.data;

		if (radius) {
			filteredData =
				response.data?.filter((address: any) => {
					const distance = calculateDistance(
						latitude,
						longitude,
						address.coordinates.latitude,
						address.coordinates.longitude,
					);
					return distance <= radius;
				}) || [];
		}

		return {
			success: true,
			data: filteredData,
		};
	}
}
