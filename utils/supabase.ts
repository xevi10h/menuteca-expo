// lib/supabase.ts - Versión final con configuración de entorno
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

// Configuración de Supabase
// Opción 1: Variables de entorno hardcodeadas (para desarrollo rápido)
const supabaseUrl = 'https://xuoyhbavkonivkplomjy.supabase.co';
const supabaseAnonKey = 'sb_publishable_eTEgSE_cZreA0g56apPzZQ_dcXagtXT';

// Opción 2: Usando Constants de Expo (recomendado para producción)
// import Constants from 'expo-constants';
// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://xuoyhbavkonivkplomjy.supabase.co';
// const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'tu-clave-de-fallback';

// Verificar que las credenciales están configuradas
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Supabase URL and Anon Key are required. Please check your configuration.',
	);
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
	// Configuración adicional para debugging (remover en producción)
	global: {
		headers: {
			'x-client-info': 'menuteca-app@1.0.0',
		},
	},
});

// Configurar el refresh automático de sesión
AppState.addEventListener('change', (state) => {
	if (state === 'active') {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});

// Helper para logging de debugging (remover en producción)
export const enableSupabaseLogging = (enabled: boolean = false) => {
	if (enabled && __DEV__) {
		// Log auth state changes
		supabase.auth.onAuthStateChange((event, session) => {
			console.log('🔐 Supabase Auth Event:', event);
			console.log('👤 Session User ID:', session?.user?.id);
			console.log(
				'⏰ Token Expires:',
				session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A',
			);
		});
	}
};

// Funciones helper para testing de conexión
export const testSupabaseConnection = async (): Promise<boolean> => {
	try {
		const { data, error } = await supabase
			.from('cuisines')
			.select('count', { count: 'exact' })
			.limit(1);

		if (error) {
			console.error('Supabase connection test failed:', error.message);
			return false;
		}

		console.log('✅ Supabase connection successful');
		return true;
	} catch (error) {
		console.error('❌ Supabase connection error:', error);
		return false;
	}
};

// Tipos de base de datos generados por Supabase CLI
// Ejecuta: supabase gen types typescript --project-id xuoyhbavkonivkplomjy > types/database.types.ts
export type Database = {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					username: string;
					name: string;
					photo: string | null;
					google_id: string | null;
					has_password: boolean;
					language: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					username: string;
					name: string;
					photo?: string | null;
					google_id?: string | null;
					has_password?: boolean;
					language?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					username?: string;
					name?: string;
					photo?: string | null;
					google_id?: string | null;
					has_password?: boolean;
					language?: string;
					updated_at?: string;
				};
			};
			cuisines: {
				Row: {
					id: string;
					name: string;
					image: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					image: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					image?: string;
				};
			};
			restaurants: {
				Row: {
					id: string;
					name: string;
					minimum_price: number;
					cuisine_id: string;
					main_image: string;
					profile_image: string | null;
					images: string[];
					address_id: string;
					tags: string[] | null;
					phone: string | null;
					reservation_link: string | null;
					is_active: boolean;
					user_id: string;
					rating: number | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					minimum_price: number;
					cuisine_id: string;
					main_image: string;
					profile_image?: string | null;
					images?: string[];
					address_id: string;
					tags?: string[] | null;
					phone?: string | null;
					reservation_link?: string | null;
					is_active?: boolean;
					user_id: string;
					rating?: number | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					minimum_price?: number;
					cuisine_id?: string;
					main_image?: string;
					profile_image?: string | null;
					images?: string[];
					address_id?: string;
					tags?: string[] | null;
					phone?: string | null;
					reservation_link?: string | null;
					is_active?: boolean;
					user_id?: string;
					rating?: number | null;
					updated_at?: string;
				};
			};
			addresses: {
				Row: {
					id: string;
					street: string;
					number: string;
					additional_information: string | null;
					postal_code: string;
					city: string;
					country: string;
					coordinates: {
						latitude: number;
						longitude: number;
					};
					formatted_address: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					street: string;
					number: string;
					additional_information?: string | null;
					postal_code: string;
					city: string;
					country: string;
					coordinates: {
						latitude: number;
						longitude: number;
					};
					formatted_address?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					street?: string;
					number?: string;
					additional_information?: string | null;
					postal_code?: string;
					city?: string;
					country?: string;
					coordinates?: {
						latitude: number;
						longitude: number;
					};
					formatted_address?: string | null;
				};
			};
			menus: {
				Row: {
					id: string;
					name: string;
					days: string[];
					start_time: string;
					end_time: string;
					price: number;
					restaurant_id: string;
					first_courses_to_share: boolean | null;
					second_courses_to_share: boolean | null;
					desserts_to_share: boolean | null;
					includes_bread: boolean | null;
					drinks: {
						water: boolean;
						wine: boolean;
						soft_drinks: boolean;
						beer: boolean;
					} | null;
					includes_coffee_and_dessert: string | null;
					minimum_people: number | null;
					has_minimum_people: boolean | null;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					days: string[];
					start_time: string;
					end_time: string;
					price: number;
					restaurant_id: string;
					first_courses_to_share?: boolean | null;
					second_courses_to_share?: boolean | null;
					desserts_to_share?: boolean | null;
					includes_bread?: boolean | null;
					drinks?: {
						water: boolean;
						wine: boolean;
						soft_drinks: boolean;
						beer: boolean;
					} | null;
					includes_coffee_and_dessert?: string | null;
					minimum_people?: number | null;
					has_minimum_people?: boolean | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					days?: string[];
					start_time?: string;
					end_time?: string;
					price?: number;
					restaurant_id?: string;
					first_courses_to_share?: boolean | null;
					second_courses_to_share?: boolean | null;
					desserts_to_share?: boolean | null;
					includes_bread?: boolean | null;
					drinks?: {
						water: boolean;
						wine: boolean;
						soft_drinks: boolean;
						beer: boolean;
					} | null;
					includes_coffee_and_dessert?: string | null;
					minimum_people?: number | null;
					has_minimum_people?: boolean | null;
					is_active?: boolean;
					updated_at?: string;
				};
			};
			dishes: {
				Row: {
					id: string;
					name: string;
					description: string;
					extra_price: number;
					is_vegetarian: boolean;
					is_lactose_free: boolean;
					is_spicy: boolean;
					is_gluten_free: boolean;
					is_vegan: boolean;
					category: string;
					menu_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description: string;
					extra_price?: number;
					is_vegetarian?: boolean;
					is_lactose_free?: boolean;
					is_spicy?: boolean;
					is_gluten_free?: boolean;
					is_vegan?: boolean;
					category: string;
					menu_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string;
					extra_price?: number;
					is_vegetarian?: boolean;
					is_lactose_free?: boolean;
					is_spicy?: boolean;
					is_gluten_free?: boolean;
					is_vegan?: boolean;
					category?: string;
					menu_id?: string;
				};
			};
			reviews: {
				Row: {
					id: string;
					user_id: string;
					restaurant_id: string;
					rating: number;
					comment: string;
					photos: string[] | null;
					restaurant_response: {
						message: string;
						date: string;
					} | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					restaurant_id: string;
					rating: number;
					comment: string;
					photos?: string[] | null;
					restaurant_response?: {
						message: string;
						date: string;
					} | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					restaurant_id?: string;
					rating?: number;
					comment?: string;
					photos?: string[] | null;
					restaurant_response?: {
						message: string;
						date: string;
					} | null;
					updated_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
};

// Para debugging en desarrollo
if (__DEV__) {
	enableSupabaseLogging(true);
}

export default supabase;
