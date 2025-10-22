// zustand/UserStore.ts - Versión actualizada con Supabase Storage
import { SupabaseAuthService } from "@/api/supabaseAuth";
import { SupabaseStorageService } from "@/api/supabaseStorage";
import { getDeviceLanguage } from "@/shared/functions/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Language, User } from "../shared/types";

interface UserState {
	user: User;
	isAuthenticated: boolean;
	isLoading: boolean; // Only for app initialization
	isAuthOperationLoading: boolean; // For auth operations (login, register, etc.)
	error: string | null;
	isInitialized: boolean;
	setUser: (user: User) => void;
	updatePhoto: (photoAsset: ImagePicker.ImagePickerAsset) => Promise<boolean>;
	deletePhoto: () => Promise<boolean>;
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
	resetPassword: (email: string) => Promise<boolean>;
	checkUsernameAvailability: (username: string) => Promise<boolean>;
	checkEmailAvailability: (email: string) => Promise<boolean>;
	deleteAccount: () => Promise<boolean>;
	initialize: () => Promise<void>;
	clearError: () => void;
}

export const undefinedUser: User = {
	id: "",
	email: "",
	username: "",
	created_at: new Date().toISOString(),
	name: "",
	photo: "",
	google_id: "",
	access_token: "", // Este será el access_token de Supabase
	has_password: false,
	language: getDeviceLanguage(),
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: undefinedUser,
			isAuthenticated: false,
			isLoading: false,
			isAuthOperationLoading: false,
			error: null,
			isInitialized: false,

			initialize: async () => {
				const state = get();
				if (state.isInitialized) return;

				set({ isLoading: true });

				try {
					SupabaseAuthService.initializeGoogleSignIn();
					// Check for existing session
					const sessionResult = await SupabaseAuthService
						.getSession();

					if (sessionResult.success && sessionResult.data) {
						const { user: profile, session } = sessionResult.data;

						set({
							user: {
								...profile,
								access_token: session.access_token,
								has_password: true, // Los usuarios de Supabase siempre tienen password o OAuth
								google_id:
									session.user.app_metadata.provider ===
											"google"
										? session.user.user_metadata.sub
										: "",
							},
							isAuthenticated: true,
							isLoading: false,
							isInitialized: true,
						});

						// Setup auth state listener
						SupabaseAuthService.onAuthStateChange(
							(event, session) => {
								if (event === "SIGNED_OUT") {
									get().setDefaultUser();
								} else if (
									event === "TOKEN_REFRESHED" && session
								) {
									// Update token
									set((state) => ({
										user: {
											...state.user,
											access_token: session.access_token,
										},
									}));
								}
							},
						);
					} else {
						set({
							isAuthenticated: false,
							isLoading: false,
							isInitialized: true,
						});
					}
				} catch (error) {
					console.error("Error initializing user store:", error);
					set({
						isLoading: false,
						isInitialized: true,
						error: "Failed to initialize authentication",
					});
				}
			},

			setUser: (user: User) => {
				const userWithToken = {
					...user,
					access_token: user.access_token || "",
				};
				set({
					user: userWithToken,
					isAuthenticated: !!userWithToken.id &&
						!!userWithToken.access_token,
					error: null,
					isInitialized: true,
				});
			},

			updatePhoto: async (
				photoAsset: ImagePicker.ImagePickerAsset,
			): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const state = get();

					if (!state.isAuthenticated || !state.user.id) {
						throw new Error("User not authenticated");
					}

					console.log("Uploading photo asset:", photoAsset);

					// Upload to Supabase Storage
					const uploadResult = await SupabaseStorageService
						.uploadUserProfilePhoto(
							state.user.id,
							photoAsset,
						);

					console.log("Upload result:", uploadResult);

					if (!uploadResult.success) {
						throw new Error(uploadResult.error);
					}

					// Update profile in database with the new photo URL
					const updateResult = await SupabaseAuthService
						.updateProfile({
							photo: uploadResult.data!.publicUrl,
						});

					if (updateResult.success) {
						set((state) => ({
							user: {
								...state.user,
								photo: uploadResult.data!.publicUrl,
							},
							isLoading: false,
						}));
						return true;
					} else {
						// If database update fails, we should ideally clean up the uploaded file
						// but for now, we'll just throw the error
						throw new Error(updateResult.error);
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to update photo";
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			deletePhoto: async (): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const state = get();

					if (!state.isAuthenticated || !state.user.id) {
						throw new Error("User not authenticated");
					}

					// Delete from Supabase Storage
					const deleteResult = await SupabaseStorageService
						.deleteUserProfilePhoto(state.user.id);

					if (!deleteResult.success) {
						throw new Error(deleteResult.error);
					}

					// Update profile in database to remove photo URL
					const updateResult = await SupabaseAuthService
						.updateProfile({
							photo: "",
						});

					if (updateResult.success) {
						set((state) => ({
							user: {
								...state.user,
								photo: "",
							},
							isLoading: false,
						}));
						return true;
					} else {
						throw new Error(updateResult.error);
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to delete photo";
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			updateUsername: async (username: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const state = get();

					// Verificar disponibilidad excluyendo al usuario actual
					const availabilityResult = await SupabaseAuthService
						.checkUsernameAvailabilityForUpdate(
							username,
							state.user.id,
						);

					if (!availabilityResult.success) {
						set({
							error: availabilityResult.error,
							isLoading: false,
						});
						return false;
					}

					if (!availabilityResult.data?.available) {
						set({
							error: "Username is already taken",
							isLoading: false,
						});
						return false;
					}

					// Si está disponible, proceder con la actualización
					const result = await SupabaseAuthService.updateProfile({
						username,
					});

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
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to update username";
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
						const { useCuisineStore } = await import(
							"@/zustand/CuisineStore"
						);
						const { refreshCuisines } = useCuisineStore.getState();

						try {
							await refreshCuisines();
						} catch (cuisineError) {
							console.error(
								"Failed to refresh cuisines after language change:",
								cuisineError,
							);
						}
					} catch (error) {
						console.error(
							"Failed to update language on server:",
							error,
						);
					}
				}
			},

			login: async (
				email: string,
				password: string,
			): Promise<boolean> => {
				set({ isAuthOperationLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.login(
						email,
						password,
					);
					console.log("Login result:", result);

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set({
							user: {
								...profile,
								access_token: session.access_token,
								has_password: true,
								google_id:
									session.user.app_metadata.provider ===
											"google"
										? session.user.user_metadata.sub
										: "",
							},
							isAuthenticated: true,
							isAuthOperationLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						set({ error: result.error, isAuthOperationLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Login failed";
					set({ error: errorMessage, isAuthOperationLoading: false });
					return false;
				}
			},

			register: async (userData): Promise<boolean> => {
				console.log("Registering user with data:", userData);
				set({ isAuthOperationLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.register(userData);

					console.log("Registration result:", result);

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set({
							user: {
								...profile,
								access_token: session?.access_token || "",
								has_password: true,
								google_id: "",
							},
							isAuthenticated: !!session,
						isAuthOperationLoading: false,
							error: null,
							isInitialized: true,
						});
						return true;
					} else {
						set({ error: result.error, isAuthOperationLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Registration failed";
					set({ error: errorMessage, isAuthOperationLoading: false });
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

				try {
					const result = await SupabaseAuthService.getSession();

					if (result.success && result.data) {
						const { user: profile, session } = result.data;

						set((state) => ({
							user: {
								...profile,
								access_token: session.access_token,
								has_password: true,
								google_id:
									session.user.app_metadata.provider ===
											"google"
										? session.user.user_metadata.sub
										: "",
							},
						}));
					} else {
						throw new Error("Failed to refresh profile");
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to refresh profile";
					set({ error: errorMessage });

					// If session is invalid, logout
					get().logout();
				}
			},

			changePassword: async (newPassword: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.updatePassword(
						newPassword,
					);

					if (result.success) {
						set({ isLoading: false });
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to change password";
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			resetPassword: async (email: string): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const result = await SupabaseAuthService.resetPassword(
						email,
					);

					if (result.success) {
						set({ isLoading: false });
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Reset failed";
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			checkUsernameAvailability: async (
				username: string,
			): Promise<boolean> => {
				try {
					const result = await SupabaseAuthService
						.checkUsernameAvailability(
							username,
						);

					if (result.success && result.data) {
						return result.data.available;
					} else {
						console.error(
							"Error checking username availability:",
							result.error,
						);
						return false;
					}
				} catch (error) {
					console.error(
						"Error checking username availability:",
						error,
					);
					return false;
				}
			},

			checkEmailAvailability: async (email: string): Promise<boolean> => {
				try {
					console.log("Checking email availability for:", email);

					const result = await SupabaseAuthService
						.checkEmailAvailability(
							email,
						);

					console.log("Email availability result:", result);

					if (result.success && result.data) {
						return result.data.available;
					} else {
						console.error(
							"Error checking email availability:",
							result.error,
						);
						// Set error in store so UI can show it
						set({ error: result.error });
						return false;
					}
				} catch (error) {
					console.error("Error checking email availability:", error);
					const errorMessage = error instanceof Error
						? error.message
						: "Network error";
					set({ error: errorMessage });
					return false;
				}
			},

			deleteAccount: async (): Promise<boolean> => {
				set({ isLoading: true, error: null });

				try {
					const { SupabaseUserService } = await import(
						"@/api/supabaseUser"
					);
					const result = await SupabaseUserService.deleteAccount();

					if (result.success) {
						// Clear user data and logout
						await SupabaseAuthService.logout();
						set({
							user: { ...undefinedUser, language: get().user.language },
							isAuthenticated: false,
							isLoading: false,
							error: null,
						});
						return true;
					} else {
						set({ error: result.error, isLoading: false });
						return false;
					}
				} catch (error) {
					const errorMessage = error instanceof Error
						? error.message
						: "Failed to delete account";
					set({ error: errorMessage, isLoading: false });
					return false;
				}
			},

			clearError: () => {
				set({ error: null });
			},
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error("Error rehydrating user store:", error);
					return;
				}

				if (state) {
					state.initialize();
				}
			},
		},
	),
);
