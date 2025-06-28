// zustand/UserStore.ts (Updated)
import { AuthService, UserService } from '@/api/services';
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
	persist?: {
		clearStorage: () => void;
	};
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

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: undefinedUser,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			setUser: (user: User) => {
				set({
					user,
					isAuthenticated: !!user.id && !!user.token,
					error: null,
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
					// First check if username is available
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

				// Update locally first
				set((state) => ({
					user: { ...state.user, language },
				}));

				// If user is authenticated, update on server
				if (state.isAuthenticated) {
					try {
						await UserService.updateProfile({ language });

						// Refresh cuisines when language changes as they are localized
						// We'll import this dynamically to avoid circular dependencies
						const { useCuisineStore } = await import('@/zustand/CuisineStore');
						const { refreshCuisines } = useCuisineStore.getState();

						// Refresh cuisines for the new language
						try {
							await refreshCuisines();
						} catch (cuisineError) {
							console.error(
								'Failed to refresh cuisines after language change:',
								cuisineError,
							);
							// Don't throw error as language change was successful
						}
					} catch (error) {
						console.error('Failed to update language on server:', error);
						// Don't revert the local change as it's not critical
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
							created_at:
								response.data.user.created_at || new Date().toISOString(),
							has_password: response.data.user.has_password || true,
							google_id: response.data.user.google_id || '',
						};

						set({
							user: userData,
							isAuthenticated: true,
							isLoading: false,
							error: null,
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
							created_at:
								response.data.user.created_at || new Date().toISOString(),
							has_password: true,
							google_id: '',
						};

						set({
							user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
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

					if (response.success) {
						const userData: User = {
							...response.data.user,
							token: response.data.token,
							created_at:
								response.data.user.created_at || new Date().toISOString(),
							has_password: response.data.user.has_password || false,
							google_id: response.data.user.google_id || googleData.google_id,
						};

						set({
							user: userData,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
						return true;
					} else {
						throw new Error('Google authentication failed');
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

			logout: () => {
				set({
					user: { ...undefinedUser, language: get().user.language },
					isAuthenticated: false,
					error: null,
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

					// If token is invalid, logout
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
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
