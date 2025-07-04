// zustand/UserStore.ts - Actualizado para Supabase
import { AuthService, UserService } from '@/api/services';
import { getDeviceLanguage } from '@/shared/functions/utils';
import { supabase } from '@/utils/supabase';
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
	authListenerConfigured: boolean;
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
	changePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<boolean>;
	googleAuth: (googleData: {
		google_id: string;
		email: string;
		name: string;
		photo?: string;
		language: string;
	}) => Promise<boolean>;
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
	token: '',
	has_password: false,
	language: getDeviceLanguage(),
};

// Función separada para configurar el listener de auth
const setupAuthListener = (set: any, get: any) => {
	let isSettingUp = false;

	supabase.auth.onAuthStateChange(async (event, session) => {
		console.log('Auth state change:', event, session?.user?.id);

		// Evitar procesamiento múltiple simultáneo
		if (isSettingUp) return;

		const currentState = get();

		// Evitar actualizaciones innecesarias si ya estamos procesando
		if (currentState.isLoading) return;

		isSettingUp = true;

		try {
			if (event === 'SIGNED_OUT' || !session) {
				set({
					user: { ...undefinedUser, language: currentState.user.language },
					isAuthenticated: false,
					error: null,
				});
			} else if (
				(event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
				session?.user
			) {
				// Solo actualizar si el usuario cambió
				if (
					currentState.user.id !== session.user.id ||
					!currentState.isAuthenticated
				) {
					try {
						const response = await AuthService.getProfile();
						if (response.success) {
							const userData: User = {
								id: session.user.id,
								email: response.data.email,
								username: response.data.username,
								name: response.data.name,
								photo: response.data.photo || '',
								google_id: response.data.google_id || '',
								token: session.access_token,
								has_password: response.data.has_password,
								language: response.data.language,
								created_at: response.data.created_at,
							};

							set({
								user: userData,
								isAuthenticated: true,
								error: null,
							});
						}
					} catch (error) {
						console.error('Error updating profile after auth change:', error);
					}
				}
			}
		} finally {
			isSettingUp = false;
		}
	});
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: undefinedUser,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			isInitialized: false,
			authListenerConfigured: false,

			initialize: async () => {
				const state = get();
				if (state.isInitialized) return;

				set({ isLoading: true });

				try {
					// Verificar si hay una sesión activa en Supabase
					const {
						data: { session },
						error,
					} = await supabase.auth.getSession();

					if (error) {
						console.error('Error getting session:', error);
						set({
							user: { ...undefinedUser, language: getDeviceLanguage() },
							isAuthenticated: false,
							isLoading: false,
							isInitialized: true,
						});
						return;
					}

					if (session && session.user) {
						// Hay una sesión activa, obtener datos del usuario
						try {
							const response = await AuthService.getProfile();

							if (response.success) {
								const userData: User = {
									id: session.user.id,
									email: response.data.email,
									username: response.data.username,
									name: response.data.name,
									photo: response.data.photo || '',
									google_id: response.data.google_id || '',
									token: session.access_token,
									has_password: response.data.has_password,
									language: response.data.language,
									created_at: response.data.created_at,
								};

								set({
									user: userData,
									isAuthenticated: true,
									isLoading: false,
									isInitialized: true,
									error: null,
								});
							} else {
								// Error obteniendo el perfil, limpiar sesión
								await supabase.auth.signOut();
								set({
									user: { ...undefinedUser, language: getDeviceLanguage() },
									isAuthenticated: false,
									isLoading: false,
									isInitialized: true,
								});
							}
						} catch (error) {
							console.error('Error fetching profile:', error);
							await supabase.auth.signOut();
							set({
								user: { ...undefinedUser, language: getDeviceLanguage() },
								isAuthenticated: false,
								isLoading: false,
								isInitialized: true,
							});
						}
					} else {
						// No hay sesión activa
						set({
							user: { ...undefinedUser, language: getDeviceLanguage() },
							isAuthenticated: false,
							isLoading: false,
							isInitialized: true,
						});
					}

					// Configurar listener UNA SOLA VEZ
					if (!state.authListenerConfigured) {
						setupAuthListener(set, get);
						set({ authListenerConfigured: true });
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
					const response = await UserService.updateProfile({ photo });

					if (response.success) {
						set((state) => ({
							user: { ...state.user, photo },
							isLoading: false,
						}));
					} else {
						throw new Error('Failed to update photo');
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
					// Verificar disponibilidad
					const availability = await UserService.checkUsernameAvailability(
						username,
					);

					if (!availability.data.available) {
						set({ error: 'Username is not available', isLoading: false });
						return false;
					}

					const response = await UserService.updateProfile({ username });

					if (response.success) {
						set((state) => ({
							user: { ...state.user, username },
							isLoading: false,
						}));
						return true;
					} else {
						throw new Error('Failed to update username');
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

				// Actualizar localmente primero
				set((state) => ({
					user: { ...state.user, language },
				}));

				// Si el usuario está autenticado, actualizar en el servidor
				if (state.isAuthenticated) {
					try {
						await UserService.updateProfile({ language });

						// Refrescar cocinas cuando cambie el idioma ya que están localizadas
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
					const response = await AuthService.login(email, password);

					if (response.success) {
						const userData: User = {
							...response.data.user,
							token: response.data.token,
						};

						set({
							user: userData,
							isAuthenticated: true,
							isLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						throw new Error('Login failed');
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
					const response = await AuthService.register(userData);

					if (response.success) {
						const user: User = {
							...response.data.user,
							token: response.data.token,
						};

						set({
							user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						throw new Error('Registration failed');
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Registration failed';
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			googleAuth: async (googleData): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const response = await AuthService.googleAuth(googleData);

					// if (response.success) {
					// 	const userData: User = {
					// 		...response.data.user,
					// 		token: response.data.token,
					// 	};

					// 	set({
					// 		user: userData,
					// 		isAuthenticated: true,
					// 		isLoading: false,
					// 		error: null,
					// 		isInitialized: true,
					// 	});
					// 	return true;
					// } else {
					// 	throw new Error('Google authentication failed');
					// }

					return true;
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
				// Cerrar sesión en Supabase
				await supabase.auth.signOut();

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
					const response = await AuthService.getProfile();

					if (response.success) {
						set((state) => ({
							user: {
								...state.user,
								...response.data,
								created_at: response.data.created_at || state.user.created_at,
								has_password:
									response.data.has_password || state.user.has_password,
								google_id: response.data.google_id || state.user.google_id,
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

					// Si el token es inválido, cerrar sesión
					if (error instanceof Error && error.message.includes('token')) {
						get().logout();
					}
				}
			},

			changePassword: async (
				currentPassword: string,
				newPassword: string,
			): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const response = await AuthService.changePassword(
						currentPassword,
						newPassword,
					);

					if (response.success) {
						set({ isLoading: false });
						return true;
					} else {
						throw new Error('Failed to change password');
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

			checkUsernameAvailability: async (username: string): Promise<boolean> => {
				try {
					const response = await UserService.checkUsernameAvailability(
						username,
					);
					return response.data.available;
				} catch (error) {
					console.error('Failed to check username availability:', error);
					return false;
				}
			},

			checkEmailAvailability: async (email: string): Promise<boolean> => {
				try {
					const response = await UserService.checkEmailAvailability(email);
					return response.data.available;
				} catch (error) {
					console.error('Failed to check email availability:', error);
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
				user: {
					...state.user,
					token: '', // No persistir el token, Supabase lo maneja
				},
				isAuthenticated: false, // La autenticación se verificará en initialize
				authListenerConfigured: false, // Reset en cada app load
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error('Error rehydrating user store:', error);
					return;
				}

				// Usar setTimeout para evitar bucles de inicialización inmediata
				if (state && !state.isInitialized) {
					setTimeout(() => {
						state.initialize();
					}, 0);
				}
			},
		},
	),
);
