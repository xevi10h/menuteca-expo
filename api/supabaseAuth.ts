// api/supabaseAuth.ts
import type { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export class SupabaseAuthService {
	/**
	 * Register a new user
	 */
	static async register(userData: {
		email: string;
		username: string;
		name: string;
		password: string;
		language: string;
	}) {
		try {
			// 1. Check email availability first
			const emailCheck = await this.checkEmailAvailability(userData.email);
			if (!emailCheck.success) {
				return {
					success: false,
					error: emailCheck.error,
				};
			}
			if (!emailCheck.data?.available) {
				return {
					success: false,
					error: 'Email is already registered',
				};
			}

			// 2. Check username availability
			const usernameCheck = await this.checkUsernameAvailability(
				userData.username,
			);
			if (!usernameCheck.success) {
				return {
					success: false,
					error: usernameCheck.error,
				};
			}
			if (!usernameCheck.data?.available) {
				return {
					success: false,
					error: 'Username is already taken',
				};
			}

			// 3. Create auth user
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					data: {
						username: userData.username,
						name: userData.name,
						language: userData.language,
					},
				},
			});

			if (authError) throw authError;

			if (!authData.user) {
				throw new Error('User creation failed');
			}

			// 4. Create profile in public schema
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.insert({
					id: authData.user.id,
					email: userData.email,
					username: userData.username,
					name: userData.name,
					language: userData.language,
				})
				.select()
				.single();

			if (profileError) throw profileError;

			return {
				success: true,
				data: {
					user: profile,
					session: authData.session,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Registration failed',
			};
		}
	}

	/**
	 * Login user
	 */
	static async login(email: string, password: string) {
		try {
			console.log('Attempting login with email:', email);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			console.error('Login data:', data);

			if (error) throw error;

			// Get user profile
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user.id)
				.single();

			console.error('Profile data:', profile);

			if (profileError) throw profileError;

			return {
				success: true,
				data: {
					user: profile,
					session: data.session,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Login failed',
			};
		}
	}

	/**
	 * Google OAuth login
	 */
	static async googleAuth() {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: 'your-app://auth/callback', // Configure this in your app.json
				},
			});

			if (error) throw error;

			return {
				success: true,
				data,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Google auth failed',
			};
		}
	}

	/**
	 * Get current session
	 */
	static async getSession() {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) throw error;

			if (!session) {
				return { success: false, data: null };
			}

			// Get user profile
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', session.user.id)
				.single();

			if (profileError) throw profileError;

			return {
				success: true,
				data: {
					user: profile,
					session,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Session check failed',
			};
		}
	}

	/**
	 * Logout
	 */
	static async logout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Logout failed',
			};
		}
	}

	/**
	 * Update profile
	 */
	static async updateProfile(updates: {
		username?: string;
		name?: string;
		photo?: string;
		language?: string;
	}) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) throw new Error('Not authenticated');

			const { data, error } = await supabase
				.from('profiles')
				.update({
					...updates,
					updated_at: new Date().toISOString(),
				})
				.eq('id', user.id)
				.select()
				.single();

			if (error) throw error;

			return {
				success: true,
				data,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Update failed',
			};
		}
	}

	/**
	 * Reset password (usando magic link de Supabase)
	 */
	static async resetPassword(email: string) {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: 'your-app://auth/reset-password',
			});

			if (error) throw error;

			return {
				success: true,
				message: 'Reset link sent to your email',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Reset failed',
			};
		}
	}

	/**
	 * Update password
	 */
	static async updatePassword(newPassword: string) {
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Password update failed',
			};
		}
	}

	/**
	 * Listen to auth changes
	 */
	static onAuthStateChange(callback: (event: string, session: any) => void) {
		return supabase.auth.onAuthStateChange(callback);
	}

	/**
	 * Check if username is available
	 */
	static async checkUsernameAvailability(username: string) {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('username', username)
				.maybeSingle(); // Use maybeSingle to avoid error when no results

			if (error) {
				console.error('Error checking username availability:', error);
				return {
					success: false,
					error: error.message,
				};
			}

			// If data exists, username is taken
			const isAvailable = !data;

			return {
				success: true,
				data: { available: isAvailable },
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to check username',
			};
		}
	}

	/**
	 * Check if email is available
	 */
	static async checkEmailAvailability(email: string) {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('email', email)
				.maybeSingle(); // Use maybeSingle to avoid error when no results

			if (error) {
				console.error('Error checking email availability:', error);
				return {
					success: false,
					error: error.message,
				};
			}

			// If data exists, email is taken
			const isAvailable = !data;

			return {
				success: true,
				data: { available: isAvailable },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to check email',
			};
		}
	}

	/**
	 * Check if username is available (excluding current user)
	 */
	static async checkUsernameAvailabilityForUpdate(
		username: string,
		currentUserId: string,
	) {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('username', username)
				.neq('id', currentUserId) // Exclude current user
				.maybeSingle();

			if (error) {
				console.error('Error checking username availability:', error);
				return {
					success: false,
					error: error.message,
				};
			}

			// If data exists, username is taken by another user
			const isAvailable = !data;

			return {
				success: true,
				data: { available: isAvailable },
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to check username',
			};
		}
	}
}
