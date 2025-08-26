// api/supabaseAuth.ts
import type { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { getDeviceLanguage } from '@/shared/functions/utils';
import { AuthResponse, User } from '@/shared/types';
import {
	GoogleSignin,
	statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { jwtDecode } from 'jwt-decode';

type Profile = Database['public']['Tables']['profiles']['Row'];

export class SupabaseAuthService {
	/**
	 * Initialize Google Sign-In configuration
	 * Call this in your app's initialization (App.tsx or index.tsx)
	 */
	static initializeGoogleSignIn() {
		GoogleSignin.configure({
			// You'll get these from your Google Cloud Console
			// webClientId should be your Supabase project's Google OAuth client ID
			webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
			iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,

			// Include any additional scopes you need
			scopes: ['email', 'profile'],
			// Ensure offline access to get refresh tokens
			offlineAccess: true,
		});
	}

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
			if (!emailCheck.success || !emailCheck.data?.available) {
				return {
					success: false,
					error: 'Email is already registered',
				};
			}

			// 2. Check username availability
			const usernameCheck = await this.checkUsernameAvailability(
				userData.username,
			);
			if (!usernameCheck.success || !usernameCheck.data?.available) {
				return {
					success: false,
					error: 'Username is already taken',
				};
			}

			// 3. Create auth user with metadata
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

			// 4. El trigger automáticamente creará el perfil en public.profiles
			// Esperamos un poco para que se ejecute el trigger
			await new Promise((resolve) => setTimeout(resolve, 100));

			// 5. Obtener el perfil creado
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', authData.user.id)
				.single();

			if (profileError) {
				console.error('Profile creation error:', profileError);
				// Si el trigger falló, crear manualmente
				const { data: manualProfile, error: manualError } = await supabase
					.from('profiles')
					.insert({
						id: authData.user.id,
						email: userData.email,
						username: userData.username,
						name: userData.name,
						language: userData.language,
						has_password: true,
					})
					.select()
					.single();

				if (manualError) throw manualError;

				return {
					success: true,
					data: {
						user: manualProfile,
						session: authData.session,
					},
				};
			}

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
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user.id)
				.single();

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
	 * Sign in with Google usando native GoogleSignin con manejo correcto del nonce
	 */
	static async signInWithGoogle(): Promise<AuthResponse<User>> {
		try {
			// Check if device supports Google Play Services
			await GoogleSignin.hasPlayServices();
			console.log('Google Play Services are available');

			console.log('Google Play Services are available');

			// Get user info and id token
			const userInfo = await GoogleSignin.signIn();

			console.log('Google user info:', userInfo);

			if (!userInfo.data?.idToken) {
				return {
					success: false,
					error: 'No ID token received from Google',
				};
			}

			// NUEVO: Extraer el nonce del ID token
			const decodedToken = jwtDecode<any>(userInfo.data.idToken);
			const nonce = decodedToken.nonce;

			console.log('Decoded token nonce:', nonce);

			// Sign in to Supabase with the ID token AND nonce
			const { data, error } = await supabase.auth.signInWithIdToken({
				provider: 'google',
				token: userInfo.data?.idToken,
				// Pasar el nonce extraído del token
				...(nonce && { nonce }),
			});

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			if (!data.user) {
				return {
					success: false,
					error: 'No user data received from Supabase',
				};
			}

			// Check if user has a profile, create one if not
			let { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user.id)
				.single();

			if (profileError && profileError.code === 'PGRST116') {
				// Profile doesn't exist, create one
				const username = this.generateUsernameFromEmail(data.user.email || '');
				const { data: newProfile, error: createError } = await supabase
					.from('profiles')
					.insert({
						id: data.user.id,
						email: data.user.email || '', // Campo requerido
						username,
						name: data.user.user_metadata?.full_name || username, // Usar 'name' no 'display_name'
						photo: data.user.user_metadata?.avatar_url, // Usar 'photo' no 'avatar_url'
						language: getDeviceLanguage(),
						has_password: false, // Es OAuth, no tiene password
					})
					.select()
					.single();

				if (createError) {
					return {
						success: false,
						error: 'Failed to create user profile',
					};
				}

				profile = newProfile;
			} else if (profileError) {
				return {
					success: false,
					error: 'Failed to fetch user profile',
				};
			}

			const user: User = {
				...profile!,
				email: data.user.email!,
				access_token: data.session?.access_token,
				language: profile!.language || getDeviceLanguage(),
			};

			return {
				success: true,
				data: user,
			};
		} catch (error: any) {
			let errorMessage = 'auth.errors.googleSignInFailed';

			console.error('Google sign in error:', error, error.message);

			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				errorMessage = 'auth.errors.googleSignInCancelled';
			} else if (error.code === statusCodes.IN_PROGRESS) {
				errorMessage = 'Google sign in is already in progress';
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				errorMessage = 'Google Play Services not available';
			} else if (
				error.message &&
				(error.message.includes('invalid_audience') ||
					error.message.includes('client ID') ||
					error.message.includes('invalid_client') ||
					error.message.includes('unauthorized_client'))
			) {
				console.error('Google Sign-In Configuration Error Details:', {
					errorMessage: error.message,
					webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
					iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
					androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
				});
				errorMessage = 'auth.errors.googleSignInConfigError';
			}

			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	/**
	 * Sign in with Apple (iOS only)
	 */
	static async signInWithApple(): Promise<AuthResponse<User>> {
		try {
			// Check if Apple Sign In is available
			const isAvailable = await AppleAuthentication.isAvailableAsync();
			if (!isAvailable) {
				return {
					success: false,
					error: 'Apple Sign In is not available on this device',
				};
			}

			// Request Apple authentication
			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			});

			if (!credential.identityToken) {
				return {
					success: false,
					error: 'No identity token received from Apple',
				};
			}

			// Sign in to Supabase with the identity token
			const { data, error } = await supabase.auth.signInWithIdToken({
				provider: 'apple',
				token: credential.identityToken,
			});

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			if (!data.user) {
				return {
					success: false,
					error: 'No user data received from Supabase',
				};
			}

			// Check if user has a profile, create one if not
			let { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user.id)
				.single();

			if (profileError && profileError.code === 'PGRST116') {
				// Profile doesn't exist, create one
				let displayName = data.user.user_metadata?.full_name;

				// Apple provides full name only on first sign in
				if (!displayName && credential.fullName) {
					displayName = `${credential.fullName.givenName || ''} ${
						credential.fullName.familyName || ''
					}`.trim();
				}

				const username = this.generateUsernameFromEmail(
					data.user.email || credential.email || '',
				);

				const { data: newProfile, error: createError } = await supabase
					.from('profiles')
					.insert({
						id: data.user.id,
						username,
						display_name: displayName || username,
					})
					.select()
					.single();

				if (createError) {
					return {
						success: false,
						error: 'Failed to create user profile',
					};
				}

				profile = newProfile;
			} else if (profileError) {
				return {
					success: false,
					error: 'Failed to fetch user profile',
				};
			}

			const user: User = {
				...profile!,
				email: data.user.email || credential.email || '',
				access_token: data.session?.access_token,
				language: profile!.language || getDeviceLanguage(),
			};

			return {
				success: true,
				data: user,
			};
		} catch (error: any) {
			if (error.code === 'ERR_REQUEST_CANCELED') {
				return {
					success: false,
					error: 'auth.errors.appleSignInCancelled',
				};
			}

			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'auth.errors.appleSignInFailed',
			};
		}
	}

	/**
	 * Helper method to generate username from email
	 */
	private static generateUsernameFromEmail(email: string): string {
		const baseUsername = email.split('@')[0].toLowerCase();
		// Remove any non-alphanumeric characters except underscore
		const cleanUsername = baseUsername.replace(/[^a-z0-9_]/g, '');
		// Add random suffix to avoid conflicts
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `${cleanUsername}${randomSuffix}`;
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

			// Get user profile from public.profiles
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

			// Update in public.profiles table
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
				.maybeSingle();

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: true,
				data: { available: !data },
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
				.maybeSingle();

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: true,
				data: { available: !data },
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
