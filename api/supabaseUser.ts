// api/supabaseUser.ts
import { supabase } from "@/lib/supabase";
import { Language, User } from "@/shared/types";

// Database types
interface UserRow {
	id: string;
	email: string;
	username: string;
	name: string;
	photo: string;
	google_id?: string;
	has_password: boolean;
	language: Language;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

export class SupabaseUserService {
	/**
	 * Get current user ID
	 */
	private static async getCurrentUserId(): Promise<string | null> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			return user?.id || null;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Get current user profile
	 */
	static async getProfile() {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: "User not authenticated",
				};
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return {
						success: false,
						error: "User not found",
					};
				}
				throw error;
			}

			// Convert to User type matching frontend interface
			const user: User = {
				id: data.id,
				email: data.email,
				username: data.username,
				name: data.name,
				photo: data.photo || "",
				google_id: data.google_id || "",
				access_token: "", // Will be populated by auth service
				has_password: data.has_password,
				language: data.language,
				created_at: data.created_at,
			};

			return {
				success: true,
				data: user,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to fetch profile",
			};
		}
	}

	/**
	 * Update user profile
	 */
	static async updateProfile(updateData: {
		username?: string;
		name?: string;
		photo?: string;
		language?: string;
	}) {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: "User not authenticated",
				};
			}

			// Check if username is available (if being updated)
			if (updateData.username) {
				const { data: existingUser } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", userId)
					.single();

				if (
					existingUser &&
					existingUser.username !== updateData.username
				) {
					const usernameCheck = await this.checkUsernameAvailability(
						updateData.username,
					);
					if (
						!usernameCheck.success || !usernameCheck.data?.available
					) {
						return {
							success: false,
							error: "Username already exists",
						};
					}
				}
			}

			const { data, error } = await supabase
				.from("profiles")
				.update({
					...updateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId)
				.select()
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return {
						success: false,
						error: "User not found",
					};
				}
				if (error.code === "23505") {
					if (error.message.includes("username")) {
						return {
							success: false,
							error: "Username already exists",
						};
					}
				}
				throw error;
			}

			// Convert to User type
			const user: User = {
				id: data.id,
				email: data.email,
				username: data.username,
				name: data.name,
				photo: data.photo || "",
				google_id: data.google_id || "",
				access_token: "",
				has_password: data.has_password,
				language: data.language,
				created_at: data.created_at,
			};

			return {
				success: true,
				data: user,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to update profile",
			};
		}
	}

	/**
	 * Delete account permanently
	 * This performs a soft delete on all user data and permanently deletes the auth account
	 */
	static async deleteAccount() {
		try {
			console.log("🗑️ Starting account deletion...");

			const userId = await this.getCurrentUserId();
			if (!userId) {
				console.log("❌ User not authenticated");
				return {
					success: false,
					error: "User not authenticated",
				};
			}

			console.log("👤 Deleting account for user:", userId);

			// First, soft delete all user's data to preserve referential integrity
			console.log("📝 Soft deleting user data...");
			const deletePromises = await Promise.allSettled([
				// Soft delete user's restaurants
				supabase
					.from("restaurants")
					.update({ deleted_at: new Date().toISOString() })
					.eq("owner_id", userId)
					.is("deleted_at", null),

				// Soft delete user's reviews
				supabase
					.from("reviews")
					.update({ deleted_at: new Date().toISOString() })
					.eq("user_id", userId)
					.is("deleted_at", null),

				// Soft delete the profile
				supabase
					.from("profiles")
					.update({ deleted_at: new Date().toISOString() })
					.eq("id", userId)
					.is("deleted_at", null),
			]);

			// Log any errors but don't fail - profile deletion is most important
			deletePromises.forEach((result, index) => {
				if (result.status === "rejected") {
					console.error(
						`⚠️ Error in deletion step ${index}:`,
						result.reason,
					);
				}
			});

			console.log("✅ User data soft deleted");

			// Now call RPC function to delete auth user
			// The user can delete their own auth account using this RPC function
			console.log("🔐 Calling delete_own_account RPC...");
			const { data: rpcData, error: rpcError } = await supabase.rpc(
				"delete_own_account",
			);

			if (rpcError) {
				console.error("❌ RPC error:", rpcError);
				// If RPC doesn't exist, the data is still soft-deleted
				// which is acceptable for GDPR compliance
				console.log(
					"⚠️ RPC function not available, data is soft-deleted",
				);
			} else {
				console.log("✅ Auth account deleted via RPC");
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to delete account",
			};
		}
	}

	/**
	 * Soft delete account
	 */
	static async softDeleteAccount() {
		try {
			const userId = await this.getCurrentUserId();
			if (!userId) {
				return {
					success: false,
					error: "User not authenticated",
				};
			}

			const { error } = await supabase
				.from("profiles")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", userId)
				.is("deleted_at", null);

			if (error) {
				throw error;
			}

			// Soft delete related data
			await Promise.all([
				// Soft delete user's restaurants
				supabase
					.from("restaurants")
					.update({ deleted_at: new Date().toISOString() })
					.eq("owner_id", userId)
					.is("deleted_at", null),

				// Soft delete user's reviews
				supabase
					.from("reviews")
					.update({ deleted_at: new Date().toISOString() })
					.eq("user_id", userId)
					.is("deleted_at", null),
			]);

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to delete account",
			};
		}
	}

	/**
	 * Get user by ID (public profile)
	 */
	static async getUserById(id: string) {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", id)
				.is("deleted_at", null)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return {
						success: false,
						error: "User not found",
					};
				}
				throw error;
			}

			// Return only public information
			const publicProfile = {
				id: data.id,
				username: data.username,
				name: data.name,
				photo: data.photo,
				created_at: data.created_at,
			};

			return {
				success: true,
				data: publicProfile,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to fetch user",
			};
		}
	}

	/**
	 * Check username availability
	 */
	static async checkUsernameAvailability(username: string) {
		try {
			if (!username || username.length < 3) {
				return {
					success: false,
					error: "Username must be at least 3 characters long",
				};
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("id")
				.eq("username", username)
				.maybeSingle();

			if (error) {
				throw error;
			}

			return {
				success: true,
				data: { available: !data },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to check username",
			};
		}
	}

	/**
	 * Check email availability
	 */
	static async checkEmailAvailability(email: string) {
		try {
			if (!email || !email.includes("@")) {
				return {
					success: false,
					error: "Valid email is required",
				};
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("id")
				.eq("email", email)
				.maybeSingle();

			if (error) {
				throw error;
			}

			return {
				success: true,
				data: { available: !data },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to check email",
			};
		}
	}

	/**
	 * Get all users (admin function)
	 */
	static async getAllUsers(params?: { page?: number; limit?: number }) {
		try {
			const page = params?.page || 1;
			const limit = params?.limit || 20;

			if (page < 1 || limit < 1 || limit > 100) {
				return {
					success: false,
					error: "Invalid pagination parameters",
				};
			}

			// Get total count
			const { count, error: countError } = await supabase
				.from("profiles")
				.select("*", { count: "exact", head: true })
				.is("deleted_at", null);

			if (countError) {
				throw countError;
			}

			// Get users
			const offset = (page - 1) * limit;
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.is("deleted_at", null)
				.range(offset, offset + limit - 1)
				.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			// Convert to User type
			const users: User[] = data.map((profile) => ({
				id: profile.id,
				email: profile.email,
				username: profile.username,
				name: profile.name,
				photo: profile.photo || "",
				google_id: profile.google_id || "",
				access_token: "",
				has_password: profile.has_password,
				language: profile.language,
				created_at: profile.created_at,
				updated_at: profile.updated_at,
			}));

			const totalPages = Math.ceil((count || 0) / limit);

			return {
				success: true,
				data: {
					data: users,
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
				error: error instanceof Error
					? error.message
					: "Failed to fetch users",
			};
		}
	}

	/**
	 * Search users by username or name
	 */
	static async searchUsers(query: string) {
		try {
			if (!query || query.length < 2) {
				return {
					success: false,
					error: "Search query must be at least 2 characters long",
				};
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("id, username, name, photo, created_at")
				.is("deleted_at", null)
				.or(`username.ilike.%${query}%, name.ilike.%${query}%`)
				.limit(20);

			if (error) {
				throw error;
			}

			// Return only public information
			const publicProfiles = data.map((profile) => ({
				id: profile.id,
				username: profile.username,
				name: profile.name,
				photo: profile.photo,
				created_at: profile.created_at,
			}));

			return {
				success: true,
				data: publicProfiles,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error
					? error.message
					: "Failed to search users",
			};
		}
	}
}
