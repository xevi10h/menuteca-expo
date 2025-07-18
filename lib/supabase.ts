import '../polyfills/structuredClone';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

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
					language: string;
					has_password?: boolean;
				};
				Update: {
					username?: string;
					name?: string;
					photo?: string | null;
					language?: string;
					updated_at?: string;
				};
			};
			// ... resto de tus tablas
		};
	};
};
