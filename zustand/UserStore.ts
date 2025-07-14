// zustand/UserStore.ts - Versión actualizada con Supabase
import { SupabaseAuthService } from '@/api/supabaseAuth';
import { getDeviceLanguage } from '@/shared/functions/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Language, User } from '../shared/types';

interface UserState {
	user: User;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;
	setUser: (user: User) => void;
	updatePhoto: (photo: string) => void;
	updateUsername: (username: string) => Promise<boolean>;
	setDefaultUser: () => void;
	setLanguage: (language: Language) => Promise<void>;
	login: (email: string, password: string) => Promise<boolean>;
	register: (userData: {
		email: string;
		username: string;
		name: string;
		password: string;
		language: string;
	}) => Promise<boolean>;
	logout: () => void;
	refreshProfile: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<boolean>;
	googleAuth: () => Promise<boolean>;
	resetPassword: (email: string) => Promise<boolean>;
	checkUsernameAvailability: (username: string) => Promise<boolean>;
	checkEmailAvailability: (email: string) => Promise<boolean>;
	initialize: () => Promise<void>;
	clearError: () => void;
}

export const undefinedUser: User = {
	id: '',
	email: '',
	username: '',
	created_at: new Date().toISOString(),
	name: '',
	photo: '',
	google_id: '',
	token: '', // Este será el access_token de Supabase
	has_password: false,
	language: getDeviceLanguage(),
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: undefinedUser,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			isInitialized: false,

			initialize: async () => {
				const state = get();
				if (state.isInitialized) return;

				set({ isLoading: true });

				try {
					// Check for existing session
					const sessionResult = await SupabaseAuthService.getSession();

					if (sessionResult.success && sessionResult.data) {
						const { user: profile, session } = sessionResult.data;

						set({
							user: {
								...profile,
								token: session.access_token,
								has_password: true, // Los usuarios de Supabase siempre tienen password o OAuth
								google_id:
									session.user.app_metadata.provider === 'google'
										? session.user.user_metadata.sub
										: '',
							},
							isAuthenticated: true,
							isLoading: false,
							isInitialized: true,
						});

						// Setup auth state listener
						SupabaseAuthService.onAuthStateChange((event, session) => {
							if (event === 'SIGNED_OUT') {
								get().setDefaultUser();
							} else if (event === 'TOKEN_REFRESHED' && session) {
								// Update token
								set((state) => ({
									user: {
										...state.user,
										token: session.access_token,
									},
								}));
							}
						});
					} else {
						set({
							isAuthenticated: false,
							isLoading: false,
							isInitialized: true,
						});
					}
				} catch (error) {
					console.error('Error initializing user store:', error);
					set({
						isLoading: false,
						isInitialized: true,
						error: 'Failed to initialize authentication',
					});
				}
			},

			setUser: (user: User) => {
				set({
					user,
					isAuthenticated: !!user.id && !!user.token,
					error: null,
					isInitialized: true,
				});
			},

			updatePhoto: async (photo: string) => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.updateProfile({ photo });

					if (result.success) {
						set((state) => ({
							user: { ...state.user, photo },
							isLoading: false,
						}));
					} else {
						throw new Error(result.error);
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to update photo';
					set({ error: errorMessage, isLoading: false });
					throw error;
				}
			},

			updateUsername: async (username: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const state = get();

					// Verificar disponibilidad excluyendo al usuario actual
					const availabilityResult =
						await SupabaseAuthService.checkUsernameAvailabilityForUpdate(
							username,
							state.user.id,
						);

					if (!availabilityResult.success) {
						set({ error: availabilityResult.error, isLoading: false });
						return false;
					}

					if (!availabilityResult.data?.available) {
						set({ error: 'Username is already taken', isLoading: false });
						return false;
					}

					// Si está disponible, proceder con la actualización
					const result = await SupabaseAuthService.updateProfile({ username });

					if (result.success) {
						set((state) => ({
							user: { ...state.user, username },
							isLoading: false,
						}));
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to update username';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			setDefaultUser: () => {
				set({
					user: { ...undefinedUser, language: getDeviceLanguage() },
					isAuthenticated: false,
					error: null,
				});
			},

			setLanguage: async (language: Language) => {
				const state = get();

				// Update locally first
				set((state) => ({
					user: { ...state.user, language },
				}));

				// If user is authenticated, update on server
				if (state.isAuthenticated) {
					try {
						await SupabaseAuthService.updateProfile({ language });

						// Refresh cuisines for the new language
						const { useCuisineStore } = await import('@/zustand/CuisineStore');
						const { refreshCuisines } = useCuisineStore.getState();

						try {
							await refreshCuisines();
						} catch (cuisineError) {
							console.error(
								'Failed to refresh cuisines after language change:',
								cuisineError,
							);
						}
					} catch (error) {
						console.error('Failed to update language on server:', error);
					}
				}
			},

			login: async (email: string, password: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.login(email, password);
					console.log('Login result:', result);

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set({
							user: {
								...profile,
								token: session.access_token,
								has_password: true,
								google_id:
									session.user.app_metadata.provider === 'google'
										? session.user.user_metadata.sub
										: '',
							},
							isAuthenticated: true,
							isLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Login failed';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			register: async (userData): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.register(userData);

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set({
							user: {
								...profile,
								token: session?.access_token || '',
								has_password: true,
								google_id: '',
							},
							isAuthenticated: !!session,
							isLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Registration failed';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			googleAuth: async (): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.googleAuth();
					console.log('Login result:', result);

					if (result.success) {
						set({ isLoading: false });
						// El auth state change listener manejará la actualización del usuario
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Google authentication failed';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			logout: async () => {
				await SupabaseAuthService.logout();
				set({
					user: { ...undefinedUser, language: get().user.language },
					isAuthenticated: false,
					error: null,
					isInitialized: true,
				});
			},

			refreshProfile: async () => {
				const state = get();
				if (!state.isAuthenticated) return;

				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.getSession();

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set((state) => ({
							user: {
								...profile,
								token: session.access_token,
								has_password: true,
								google_id:
									session.user.app_metadata.provider === 'google'
										? session.user.user_metadata.sub
										: '',
							},
							isLoading: false,
						}));
					} else {
						throw new Error('Failed to refresh profile');
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to refresh profile';
					set({ error: errorMessage, isLoading: false });

					// If session is invalid, logout
					get().logout();
				}
			},

			changePassword: async (newPassword: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.updatePassword(newPassword);

					if (result.success) {
						set({ isLoading: false });
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to change password';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			resetPassword: async (email: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.resetPassword(email);

					if (result.success) {
						set({ isLoading: false });
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Reset failed';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			checkUsernameAvailability: async (username: string): Promise<boolean> => {
				try {
					const result = await SupabaseAuthService.checkUsernameAvailability(
						username,
					);

					if (result.success && result.data) {
						return result.data.available;
					} else {
						console.error(
							'Error checking username availability:',
							result.error,
						);
						return false;
					}
				} catch (error) {
					console.error('Error checking username availability:', error);
					return false;
				}
			},

			checkEmailAvailability: async (email: string): Promise<boolean> => {
				try {
					const result = await SupabaseAuthService.checkEmailAvailability(
						email,
					);

					if (result.success && result.data) {
						return result.data.available;
					} else {
						console.error('Error checking email availability:', result.error);
						return false;
					}
				} catch (error) {
					console.error('Error checking email availability:', error);
					return false;
				}
			},

			clearError: () => {
				set({ error: null });
			},
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error('Error rehydrating user store:', error);
					return;
				}

				if (state) {
					state.initialize();
				}
			},
		},
	),
);
