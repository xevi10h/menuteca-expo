// api/supabaseReview.ts
import { supabase } from '@/lib/supabase';
import { Review, Language } from '@/shared/types';
import { getLocalizedText } from '@/shared/functions/utils';
import { SupabaseStorageService } from './supabaseStorage';
import { SupabaseRestaurantService } from './supabaseRestaurant';

// Database types
interface ReviewRow {
	id: string;
	user_id: string;
	restaurant_id: string;
	rating: number;
	comment: { [key: string]: string };
	photos: string[];
	restaurant_response_message?: { [key: string]: string };
	restaurant_response_date?: string;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

export class SupabaseReviewService {
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
			const { data: { user } } = await supabase.auth.getUser();
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
	 * Convert ReviewRow to Review type
	 */
	private static async convertToReview(
		reviewRow: any,
		userLanguage: Language,
	): Promise<Review> {
		return {
			id: reviewRow.id,
			user_id: reviewRow.user_id,
			user_name: reviewRow.users?.name || 'Unknown User',
			user_avatar: reviewRow.users?.photo || '',
			restaurant_id: reviewRow.restaurant_id,
			restaurant_name: reviewRow.restaurants?.name || 'Unknown Restaurant',
			restaurant_image: reviewRow.restaurants?.main_image || '',
			rating: reviewRow.rating,
			comment: this.getLocalizedText(reviewRow.comment, userLanguage),
			photos: reviewRow.photos || [],
			restaurant_response: reviewRow.restaurant_response_message
				? {
						message: this.getLocalizedText(
							reviewRow.restaurant_response_message,
							userLanguage,
						),
						date: reviewRow.restaurant_response_date,
				  }
				: undefined,
			date: reviewRow.created_at,
			created_at: reviewRow.created_at,
			updated_at: reviewRow.updated_at,
		};
	}

	/**
	 * Create a new review with photo upload support
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
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check if restaurant exists
			const restaurantCheck = await SupabaseRestaurantService.getRestaurantById(restaurant_id);
			if (!restaurantCheck.success) {
				return {
					success: false,
					error: 'Restaurant not found',
				};
			}

			// Check if user has already reviewed this restaurant
			const { data: existingReview } = await supabase
				.from('reviews')
				.select('id')
				.eq('user_id', userId)
				.eq('restaurant_id', restaurant_id)
				.is('deleted_at', null)
				.maybeSingle();

			if (existingReview) {
				return {
					success: false,
					error: 'You have already reviewed this restaurant',
				};
			}

			let finalData = { ...reviewData };

			// Handle photo uploads
			if (reviewData.photo_files?.length) {
				const uploadResult = await SupabaseStorageService.uploadMultipleImages(
					'REVIEWS',
					reviewData.photo_files,
					'temp',
				);

				if (uploadResult.success) {
					finalData.photos = uploadResult.data?.successful.map(
						(img) => img.publicUrl,
					);
				}
			}

			const userLanguage = this.getCurrentLanguage();
			const commentTranslated = this.createUserTranslatedText(finalData.comment, userLanguage);

			const { data, error } = await supabase
				.from('reviews')
				.insert({
					user_id: userId,
					restaurant_id,
					rating: finalData.rating,
					comment: commentTranslated,
					photos: finalData.photos || [],
				})
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.single();

			if (error) {
				if (error.code === '23503') {
					if (error.message.includes('restaurant_id')) {
						return {
							success: false,
							error: 'Invalid restaurant ID',
						};
					}
					if (error.message.includes('user_id')) {
						return {
							success: false,
							error: 'Invalid user ID',
						};
					}
				}
				if (error.code === '23505') {
					return {
						success: false,
						error: 'You have already reviewed this restaurant',
					};
				}
				throw error;
			}

			// Update restaurant rating
			await SupabaseRestaurantService.updateRestaurantRating(restaurant_id);

			const review = await this.convertToReview(data, userLanguage);

			return {
				success: true,
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create review',
			};
		}
	}

	/**
	 * Get restaurant reviews with pagination
	 */
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
		try {
			const page = params?.page || 1;
			const limit = params?.limit || 20;
			const userLanguage = this.getCurrentLanguage();

			let query = supabase
				.from('reviews')
				.select(
					`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`,
					{ count: 'exact' },
				)
				.eq('restaurant_id', restaurant_id)
				.is('deleted_at', null);

			// Apply filters
			if (params?.min_rating) {
				query = query.gte('rating', params.min_rating);
			}

			if (params?.max_rating) {
				query = query.lte('rating', params.max_rating);
			}

			// Apply sorting
			const validSortFields = ['created_at', 'rating', 'updated_at'];
			const sortField = validSortFields.includes(params?.sortBy || '') ? params?.sortBy : 'created_at';
			query = query.order(sortField!, { ascending: params?.sortOrder === 'asc' });

			// Apply pagination
			const offset = (page - 1) * limit;
			query = query.range(offset, offset + limit - 1);

			const { data, error, count } = await query;

			if (error) {
				throw error;
			}

			const reviews = await Promise.all(
				(data || []).map((review: any) =>
					this.convertToReview(review, userLanguage)
				)
			);

			const totalPages = Math.ceil((count || 0) / limit);

			return {
				success: true,
				data: {
					data: reviews,
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
				error: error instanceof Error ? error.message : 'Failed to fetch restaurant reviews',
			};
		}
	}

	/**
	 * Get current user's reviews
	 */
	static async getMyReviews(params?: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			const page = params?.page || 1;
			const limit = params?.limit || 20;
			const userLanguage = this.getCurrentLanguage();

			let query = supabase
				.from('reviews')
				.select(
					`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`,
					{ count: 'exact' },
				)
				.eq('user_id', userId)
				.is('deleted_at', null);

			// Apply sorting
			const validSortFields = ['created_at', 'rating', 'updated_at'];
			const sortField = validSortFields.includes(params?.sortBy || '') ? params?.sortBy : 'created_at';
			query = query.order(sortField!, { ascending: params?.sortOrder === 'asc' });

			// Apply pagination
			const offset = (page - 1) * limit;
			query = query.range(offset, offset + limit - 1);

			const { data, error, count } = await query;

			if (error) {
				throw error;
			}

			const reviews = await Promise.all(
				(data || []).map((review: any) =>
					this.convertToReview(review, userLanguage)
				)
			);

			const totalPages = Math.ceil((count || 0) / limit);

			return {
				success: true,
				data: {
					data: reviews,
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
				error: error instanceof Error ? error.message : 'Failed to fetch user reviews',
			};
		}
	}

	/**
	 * Update review
	 */
	static async updateReview(
		id: string,
		updateData: {
			rating?: number;
			comment?: string;
			photos?: string[];
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

			// Check ownership
			const { data: reviewCheck, error: reviewError } = await supabase
				.from('reviews')
				.select('user_id, restaurant_id')
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (reviewError) {
				return {
					success: false,
					error: reviewError.code === 'PGRST116' ? 'Review not found' : 'Failed to verify review',
				};
			}

			if (reviewCheck.user_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to update this review',
				};
			}

			const userLanguage = this.getCurrentLanguage();
			
			// Handle comment translation update
			let finalUpdateData: any = { ...updateData };
			if (updateData.comment) {
				const { data: existingReview } = await supabase
					.from('reviews')
					.select('comment')
					.eq('id', id)
					.single();

				if (existingReview) {
					finalUpdateData.comment = this.mergeTranslatedText(
						existingReview.comment,
						updateData.comment,
						userLanguage,
					);
				} else {
					finalUpdateData.comment = this.createUserTranslatedText(
						updateData.comment,
						userLanguage,
					);
				}
			}

			const { data, error } = await supabase
				.from('reviews')
				.update({
					...finalUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Review not found',
					};
				}
				throw error;
			}

			// Update restaurant rating if rating changed
			if (updateData.rating !== undefined) {
				await SupabaseRestaurantService.updateRestaurantRating(reviewCheck.restaurant_id);
			}

			const review = await this.convertToReview(data, userLanguage);

			return {
				success: true,
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update review',
			};
		}
	}

	/**
	 * Delete review permanently
	 */
	static async deleteReview(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check ownership and get restaurant_id for rating update
			const { data: reviewCheck, error: reviewError } = await supabase
				.from('reviews')
				.select('user_id, restaurant_id')
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (reviewError) {
				return {
					success: false,
					error: reviewError.code === 'PGRST116' ? 'Review not found' : 'Failed to verify review',
				};
			}

			if (reviewCheck.user_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to delete this review',
				};
			}

			const { error } = await supabase
				.from('reviews')
				.delete()
				.eq('id', id);

			if (error) {
				throw error;
			}

			// Update restaurant rating
			await SupabaseRestaurantService.updateRestaurantRating(reviewCheck.restaurant_id);

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete review',
			};
		}
	}

	/**
	 * Soft delete review
	 */
	static async softDeleteReview(id: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check ownership and get restaurant_id for rating update
			const { data: reviewCheck, error: reviewError } = await supabase
				.from('reviews')
				.select('user_id, restaurant_id')
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (reviewError) {
				return {
					success: false,
					error: reviewError.code === 'PGRST116' ? 'Review not found' : 'Failed to verify review',
				};
			}

			if (reviewCheck.user_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to delete this review',
				};
			}

			const { error } = await supabase
				.from('reviews')
				.update({ deleted_at: new Date().toISOString() })
				.eq('id', id)
				.is('deleted_at', null);

			if (error) {
				throw error;
			}

			// Update restaurant rating
			await SupabaseRestaurantService.updateRestaurantRating(reviewCheck.restaurant_id);

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete review',
			};
		}
	}

	/**
	 * Add restaurant response to review
	 */
	static async addRestaurantResponse(reviewId: string, message: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check if review exists and verify restaurant ownership
			const { data: reviewWithRestaurant, error: reviewError } = await supabase
				.from('reviews')
				.select(`
					*,
					restaurants!inner(owner_id)
				`)
				.eq('id', reviewId)
				.is('deleted_at', null)
				.single();

			if (reviewError) {
				return {
					success: false,
					error: reviewError.code === 'PGRST116' ? 'Review not found' : 'Failed to verify review',
				};
			}

			if ((reviewWithRestaurant as any).restaurants.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to respond to this review',
				};
			}

			const userLanguage = this.getCurrentLanguage();
			const responseTranslated = this.createUserTranslatedText(message, userLanguage);

			const { data, error } = await supabase
				.from('reviews')
				.update({
					restaurant_response_message: responseTranslated,
					restaurant_response_date: new Date().toISOString(),
				})
				.eq('id', reviewId)
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Review not found',
					};
				}
				throw error;
			}

			const review = await this.convertToReview(data, userLanguage);

			return {
				success: true,
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to add restaurant response',
			};
		}
	}

	/**
	 * Remove restaurant response
	 */
	static async removeRestaurantResponse(reviewId: string) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			// Check if review exists and verify restaurant ownership
			const { data: reviewWithRestaurant, error: reviewError } = await supabase
				.from('reviews')
				.select(`
					*,
					restaurants!inner(owner_id)
				`)
				.eq('id', reviewId)
				.is('deleted_at', null)
				.single();

			if (reviewError) {
				return {
					success: false,
					error: reviewError.code === 'PGRST116' ? 'Review not found' : 'Failed to verify review',
				};
			}

			if ((reviewWithRestaurant as any).restaurants.owner_id !== userId) {
				return {
					success: false,
					error: 'Not authorized to modify responses for this review',
				};
			}

			const { data, error } = await supabase
				.from('reviews')
				.update({
					restaurant_response_message: null,
					restaurant_response_date: null,
				})
				.eq('id', reviewId)
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Review not found',
					};
				}
				throw error;
			}

			const userLanguage = this.getCurrentLanguage();
			const review = await this.convertToReview(data, userLanguage);

			return {
				success: true,
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to remove restaurant response',
			};
		}
	}

	/**
	 * Get review by ID
	 */
	static async getReviewById(id: string) {
		try {
			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('reviews')
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.eq('id', id)
				.is('deleted_at', null)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Review not found',
					};
				}
				throw error;
			}

			const review = await this.convertToReview(data, userLanguage);

			return {
				success: true,
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch review',
			};
		}
	}

	/**
	 * Get review statistics for a restaurant
	 */
	static async getReviewStats(restaurantId: string) {
		try {
			const { data, error } = await supabase
				.from('reviews')
				.select('rating, created_at, restaurant_response_message')
				.eq('restaurant_id', restaurantId)
				.is('deleted_at', null);

			if (error) {
				throw error;
			}

			const total = data?.length || 0;

			if (total === 0) {
				return {
					success: true,
					data: {
						total: 0,
						averageRating: 0,
						ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
						recentReviews: 0,
						responseRate: 0,
					},
				};
			}

			// Calculate average rating
			const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
			const averageRating = Math.round((totalRating / total) * 10) / 10;

			// Calculate rating distribution
			const ratingDistribution: Record<string, number> = {
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
			};
			data.forEach((review) => {
				const ratingKey = Math.floor(review.rating).toString();
				if (ratingDistribution[ratingKey] !== undefined) {
					ratingDistribution[ratingKey]++;
				}
			});

			// Calculate recent reviews (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const recentReviews = data.filter(
				(review) => new Date(review.created_at) > thirtyDaysAgo,
			).length;

			// Calculate response rate
			const reviewsWithResponse = data.filter(
				(review) => review.restaurant_response_message,
			).length;
			const responseRate = Math.round((reviewsWithResponse / total) * 100);

			return {
				success: true,
				data: {
					total,
					averageRating,
					ratingDistribution,
					recentReviews,
					responseRate,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to get review statistics',
			};
		}
	}

	/**
	 * Search reviews by comment content
	 */
	static async searchReviews(
		query: string,
		filters?: {
			restaurant_id?: string;
			min_rating?: number;
			max_rating?: number;
		},
	) {
		try {
			if (!query || query.length < 2) {
				return {
					success: false,
					error: 'Search query must be at least 2 characters long',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			let dbQuery = supabase.from('reviews').select(`
				*,
				users:user_id (id, username, name, photo),
				restaurants:restaurant_id (id, name, main_image)
			`).is('deleted_at', null);

			// Apply filters
			if (filters?.restaurant_id) {
				dbQuery = dbQuery.eq('restaurant_id', filters.restaurant_id);
			}

			if (filters?.min_rating) {
				dbQuery = dbQuery.gte('rating', filters.min_rating);
			}

			if (filters?.max_rating) {
				dbQuery = dbQuery.lte('rating', filters.max_rating);
			}

			const { data, error } = await dbQuery.order('created_at', {
				ascending: false,
			});

			if (error) {
				throw error;
			}

			const searchTerm = query.toLowerCase();

			// Filter reviews by comment content in user's language
			const filteredReviews = (data || []).filter((review: any) => {
				const localizedComment = this.getLocalizedText(
					review.comment,
					userLanguage,
				).toLowerCase();
				return localizedComment.includes(searchTerm);
			});

			const reviews = await Promise.all(
				filteredReviews.map((review: any) =>
					this.convertToReview(review, userLanguage)
				)
			);

			return {
				success: true,
				data: reviews,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to search reviews',
			};
		}
	}

	/**
	 * Get recent reviews (last 30 days)
	 */
	static async getRecentReviews(limit?: number) {
		try {
			const searchLimit = limit || 10;
			
			if (searchLimit < 1 || searchLimit > 50) {
				return {
					success: false,
					error: 'Limit must be between 1 and 50',
				};
			}

			const userLanguage = this.getCurrentLanguage();
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const { data, error } = await supabase
				.from('reviews')
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.is('deleted_at', null)
				.gte('created_at', thirtyDaysAgo.toISOString())
				.order('created_at', { ascending: false })
				.limit(searchLimit);

			if (error) {
				throw error;
			}

			const reviews = await Promise.all(
				(data || []).map((review: any) =>
					this.convertToReview(review, userLanguage)
				)
			);

			return {
				success: true,
				data: reviews,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch recent reviews',
			};
		}
	}

	/**
	 * Get top rated reviews
	 */
	static async getTopRatedReviews(limit?: number, min_rating?: number) {
		try {
			const searchLimit = limit || 10;
			const minRating = min_rating || 4.0;
			
			if (searchLimit < 1 || searchLimit > 50) {
				return {
					success: false,
					error: 'Limit must be between 1 and 50',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			const { data, error } = await supabase
				.from('reviews')
				.select(`
					*,
					users:user_id (id, username, name, photo),
					restaurants:restaurant_id (id, name, main_image)
				`)
				.is('deleted_at', null)
				.gte('rating', minRating)
				.order('rating', { ascending: false })
				.order('created_at', { ascending: false })
				.limit(searchLimit);

			if (error) {
				throw error;
			}

			const reviews = await Promise.all(
				(data || []).map((review: any) =>
					this.convertToReview(review, userLanguage)
				)
			);

			return {
				success: true,
				data: reviews,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch top rated reviews',
			};
		}
	}

	/**
	 * Check if user has reviewed a restaurant
	 */
	static async getUserReviewForRestaurant(
		restaurant_id: string,
	) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: 'User not authenticated',
				};
			}

			const { data, error } = await supabase
				.from('reviews')
				.select('*')
				.eq('user_id', userId)
				.eq('restaurant_id', restaurant_id)
				.is('deleted_at', null)
				.maybeSingle();

			if (error && error.code !== 'PGRST116') {
				throw error;
			}

			return {
				success: true,
				data: data || null,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to check user review',
			};
		}
	}
}