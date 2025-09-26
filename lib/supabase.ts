import '../polyfills/structuredClone';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState } from 'react-native';

export const supabase = createClient(
	process.env.EXPO_PUBLIC_SUPABASE_URL!,
	process.env.EXPO_PUBLIC_SUPABASE_KEY!,
	{
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
			lock: processLock,
		},
	},
);

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});

// Database types for type safety
export type Database = {
	public: {
		Tables: {
			addresses: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					street: any; // jsonb
					number: string;
					additional_information: string | null;
					postal_code: string;
					city: any; // jsonb
					country: any; // jsonb
					coordinates: any; // jsonb
					formatted_address: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					street: any;
					number: string;
					additional_information?: string | null;
					postal_code: string;
					city: any;
					country: any;
					coordinates: any;
					formatted_address?: string | null;
				};
				Update: {
					street?: any;
					number?: string;
					additional_information?: string | null;
					postal_code?: string;
					city?: any;
					country?: any;
					coordinates?: any;
					formatted_address?: string | null;
					updated_at?: string;
				};
			};
			cuisines: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					name: any; // jsonb
					image: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					name: any;
					image: string;
				};
				Update: {
					name?: any;
					image?: string;
					updated_at?: string;
				};
			};
			dishes: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					menu_id: string;
					name: any; // jsonb
					description: any; // jsonb
					extra_price: number;
					category:
						| 'appetizers'
						| 'firstCourses'
						| 'secondCourses'
						| 'mainCourses'
						| 'sides'
						| 'desserts'
						| 'drinks';
					is_vegetarian: boolean;
					is_lactose_free: boolean;
					is_spicy: boolean;
					is_gluten_free: boolean;
					is_vegan: boolean;
					is_active: boolean;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					menu_id: string;
					name: any;
					description: any;
					extra_price?: number;
					category:
						| 'appetizers'
						| 'firstCourses'
						| 'secondCourses'
						| 'mainCourses'
						| 'sides'
						| 'desserts'
						| 'drinks';
					is_vegetarian?: boolean;
					is_lactose_free?: boolean;
					is_spicy?: boolean;
					is_gluten_free?: boolean;
					is_vegan?: boolean;
					is_active?: boolean;
				};
				Update: {
					menu_id?: string;
					name?: any;
					description?: any;
					extra_price?: number;
					category?:
						| 'appetizers'
						| 'firstCourses'
						| 'secondCourses'
						| 'mainCourses'
						| 'sides'
						| 'desserts'
						| 'drinks';
					is_vegetarian?: boolean;
					is_lactose_free?: boolean;
					is_spicy?: boolean;
					is_gluten_free?: boolean;
					is_vegan?: boolean;
					is_active?: boolean;
					updated_at?: string;
				};
			};
			menus: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					restaurant_id: string;
					name: any; // jsonb
					days: string[];
					start_time: string; // time without time zone
					end_time: string; // time without time zone
					price: number;
					first_courses_to_share: boolean;
					second_courses_to_share: boolean;
					desserts_to_share: boolean;
					includes_bread: boolean;
					drinks: any; // jsonb with structure: {"beer": boolean, "wine": boolean, "water": boolean, "soft_drinks": boolean}
					includes_coffee_and_dessert:
						| 'none'
						| 'eitherOne'
						| 'coffee'
						| 'dessert'
						| 'both';
					minimum_people: number;
					has_minimum_people: boolean;
					is_active: boolean;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					restaurant_id: string;
					name: any;
					days?: string[];
					start_time: string;
					end_time: string;
					price: number;
					first_courses_to_share?: boolean;
					second_courses_to_share?: boolean;
					desserts_to_share?: boolean;
					includes_bread?: boolean;
					drinks?: any;
					includes_coffee_and_dessert?:
						| 'none'
						| 'eitherOne'
						| 'coffee'
						| 'dessert'
						| 'both';
					minimum_people?: number;
					has_minimum_people?: boolean;
					is_active?: boolean;
					deleted_at?: string | null;
				};
				Update: {
					restaurant_id?: string;
					name?: any;
					days?: string[];
					start_time?: string;
					end_time?: string;
					price?: number;
					first_courses_to_share?: boolean;
					second_courses_to_share?: boolean;
					desserts_to_share?: boolean;
					includes_bread?: boolean;
					drinks?: any;
					includes_coffee_and_dessert?:
						| 'none'
						| 'eitherOne'
						| 'coffee'
						| 'dessert'
						| 'both';
					minimum_people?: number;
					has_minimum_people?: boolean;
					is_active?: boolean;
					deleted_at?: string | null;
					updated_at?: string;
				};
			};
			password_reset_codes: {
				Row: {
					id: string;
					user_id: string;
					code_hash: string;
					expires_at: string;
					is_used: boolean | null;
					used_at: string | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					code_hash: string;
					expires_at: string;
					is_used?: boolean | null;
					used_at?: string | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					user_id?: string;
					code_hash?: string;
					expires_at?: string;
					is_used?: boolean | null;
					used_at?: string | null;
					updated_at?: string | null;
				};
			};
			profiles: {
				Row: {
					id: string; // UUID que coincide con auth.users.id
					email: string;
					username: string;
					name: string;
					photo: string | null;
					language: string;
					has_password: boolean;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id: string; // Debe ser el UUID de auth.users
					email: string;
					username: string;
					name: string;
					photo?: string | null;
					language?: string;
					has_password?: boolean;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					email?: string;
					username?: string;
					name?: string;
					photo?: string | null;
					language?: string;
					has_password?: boolean;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			restaurants: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					name: string;
					minimum_price: number;
					cuisine_id: string;
					rating: number | null;
					profile_image: string | null;
					images: string[];
					address_id: string;
					tags: string[];
					phone: string | null;
					reservation_link: string | null;
					owner_id: string;
					is_active: boolean;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					name: string;
					minimum_price: number;
					cuisine_id: string;
					rating?: number | null;
					profile_image?: string | null;
					images?: string[];
					address_id: string;
					tags?: string[];
					phone?: string | null;
					reservation_link?: string | null;
					owner_id: string;
					is_active?: boolean;
					deleted_at?: string | null;
				};
				Update: {
					name?: string;
					minimum_price?: number;
					cuisine_id?: string;
					rating?: number | null;
					profile_image?: string | null;
					images?: string[];
					address_id?: string;
					tags?: string[];
					phone?: string | null;
					reservation_link?: string | null;
					owner_id?: string;
					is_active?: boolean;
					deleted_at?: string | null;
					updated_at?: string;
				};
			};
			reviews: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					profile_id: string;
					restaurant_id: string;
					rating: number;
					comment: any; // jsonb
					photos: string[];
					restaurant_response_message: any | null; // jsonb
					restaurant_response_date: string | null;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					profile_id: string;
					restaurant_id: string;
					rating: number;
					comment: any;
					photos?: string[];
					restaurant_response_message?: any | null;
					restaurant_response_date?: string | null;
					deleted_at?: string | null;
				};
				Update: {
					profile_id?: string;
					restaurant_id?: string;
					rating?: number;
					comment?: any;
					photos?: string[];
					restaurant_response_message?: any | null;
					restaurant_response_date?: string | null;
					deleted_at?: string | null;
					updated_at?: string;
				};
			};
		};
		Functions: {
			cleanup_expired_reset_codes: {
				Args: {};
				Returns: number;
			};
			get_addresses_within_radius: {
				Args: {
					center_lat: number;
					center_lng: number;
					radius_km: number;
					max_results?: number;
				};
				Returns: Database['public']['Tables']['addresses']['Row'][];
			};
			handle_new_user: {
				Args: {};
				Returns: undefined;
			};
			handle_updated_at: {
				Args: {};
				Returns: undefined;
			};
			update_password_reset_codes_updated_at: {
				Args: {};
				Returns: undefined;
			};
			user_owns_restaurant: {
				Args: {
					restaurant_id_param: string;
				};
				Returns: boolean;
			};
			user_owns_review: {
				Args: {
					review_id_param: string;
				};
				Returns: boolean;
			};
		};
	};
};

// Helper types for better type inference
export type Tables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Row'];
export type Functions<T extends keyof Database['public']['Functions']> =
	Database['public']['Functions'][T];

// Specific table types for easier import
export type Profile = Tables<'profiles'>;
export type Restaurant = Tables<'restaurants'>;
export type Menu = Tables<'menus'>;
export type Dish = Tables<'dishes'>;
export type Review = Tables<'reviews'>;
export type Cuisine = Tables<'cuisines'>;
export type Address = Tables<'addresses'>;
export type PasswordResetCode = Tables<'password_reset_codes'>;
