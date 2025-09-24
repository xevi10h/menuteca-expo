// api/supabaseStorage.ts
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export class SupabaseStorageService {
	// Buckets para diferentes tipos de archivos
	static BUCKETS = {
		RESTAURANTS: 'restaurants',
		PROFILES: 'profiles',
		REVIEWS: 'reviews',
	} as const;

	/**
	 * Upload image from ImagePicker result
	 */
	static async uploadImage(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		file: ImagePicker.ImagePickerAsset,
		folder?: string,
		fileName?: string,
		upsert: boolean = false,
	) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error('User not authenticated');
			}

			const fileExt = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
			const finalFileName = fileName || `${Date.now()}.${fileExt}`;
			const folderPath = folder ? `${folder}/` : '';
			const filePath = `${folderPath}${finalFileName}`;

			let base64: string;

			// ✅ Mejorar el manejo de base64
			if (file.base64) {
				base64 = file.base64;
			} else {
				// Fallback usando FileSystem
				base64 = await FileSystem.readAsStringAsync(file.uri, {
					encoding: FileSystem.EncodingType.Base64,
				});
			}

			const arrayBuffer = decode(base64);

			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.upload(filePath, arrayBuffer, {
					contentType: file.mimeType || `image/${fileExt}`,
					upsert,
				});

			if (error) {
				console.error('Supabase storage error:', error); // ✅ Agregar más logging
				throw error;
			}

			const {
				data: { publicUrl },
			} = supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.getPublicUrl(data.path);

			return {
				success: true,
				data: {
					path: data.path,
					fullPath: data.fullPath,
					publicUrl,
				},
			};
		} catch (error) {
			console.error('Upload error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Upload failed',
			};
		}
	}

	/**
	 * Upload user profile photo with specific structure: /<userid>/main
	 * This allows overwriting and ensures proper folder structure
	 */
	static async uploadUserProfilePhoto(
		userId: string,
		file: ImagePicker.ImagePickerAsset,
	) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not authenticated');
			}

			// Verify that the user can only upload their own photo
			if (user.id !== userId) {
				throw new Error(
					'Unauthorized: You can only update your own profile photo',
				);
			}

			// Verify that the file has base64 data
			if (!file.base64) {
				throw new Error(
					'Base64 data is required for file upload. Make sure to set base64: true in ImagePicker options.',
				);
			}

			const fileExt = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
			const folder = userId;
			const fileName = `main.${fileExt}`;
			const filePath = `${folder}/${fileName}`;

			const arrayBuffer = decode(file.base64);

			// Upload to Supabase Storage with upsert to overwrite existing file
			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS.PROFILES)
				.upload(filePath, arrayBuffer, {
					contentType: file.mimeType || `image/${fileExt}`,
					upsert: true,
				});

			if (error) throw error;

			// Get public URL
			const {
				data: { publicUrl },
			} = supabase.storage
				.from(SupabaseStorageService.BUCKETS.PROFILES)
				.getPublicUrl(data.path);

			console.log('Upload result:', {
				success: true,
				data: {
					path: data.path,
					fullPath: data.fullPath,
					publicUrl,
				},
			});

			return {
				success: true,
				data: {
					path: data.path,
					fullPath: data.fullPath,
					publicUrl,
				},
			};
		} catch (error) {
			console.error('Profile photo upload error:', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Profile photo upload failed',
			};
		}
	}

	/**
	 * Delete user profile photo
	 */
	static async deleteUserProfilePhoto(userId: string) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not authenticated');
			}

			// Verify that the user can only delete their own photo
			if (user.id !== userId) {
				throw new Error(
					'Unauthorized: You can only delete your own profile photo',
				);
			}

			// List files in user's profile folder to find the main image
			const { data: files, error: listError } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS.PROFILES)
				.list(userId, {
					limit: 10,
					sortBy: { column: 'name', order: 'asc' },
				});

			if (listError) throw listError;

			// Find main profile image (could be main.jpg, main.png, etc.)
			const mainFile = files?.find((file) => file.name.startsWith('main.'));

			if (!mainFile) {
				return {
					success: false,
					error: 'No profile photo found to delete',
				};
			}

			const filePath = `${userId}/${mainFile.name}`;

			// Delete the file
			const { error: deleteError } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS.PROFILES)
				.remove([filePath]);

			if (deleteError) throw deleteError;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete profile photo',
			};
		}
	}

	/**
	 * Upload multiple images
	 */
	static async uploadMultipleImages(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		files: ImagePicker.ImagePickerAsset[],
		folder?: string,
	) {
		try {
			const uploads = await Promise.allSettled(
				files.map((file, index) =>
					this.uploadImage(
						bucket,
						file,
						folder,
						`image_${index}_${Date.now()}`,
					),
				),
			);

			const successful = uploads
				.filter(
					(result): result is PromiseFulfilledResult<any> =>
						result.status === 'fulfilled' && result.value.success,
				)
				.map((result) => result.value.data);

			const failed = uploads.filter(
				(result): result is PromiseRejectedResult =>
					result.status === 'rejected' ||
					(result.status === 'fulfilled' && !result.value.success),
			);

			return {
				success: true,
				data: {
					successful,
					failed: failed.length,
					total: files.length,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Batch upload failed',
			};
		}
	}

	/**
	 * Upload restaurant main image
	 */
	static async uploadRestaurantImage(
		restaurantId: string,
		file: ImagePicker.ImagePickerAsset,
		type: 'main' | 'profile' | 'gallery' = 'main',
	) {
		const folder = `restaurants/${restaurantId}`;
		const fileName = `${type}_${Date.now()}`;

		return this.uploadImage('RESTAURANTS', file, folder, fileName);
	}

	/**
	 * Upload user profile photo (DEPRECATED - use uploadUserProfilePhoto instead)
	 * Keeping this for backward compatibility
	 */
	static async uploadProfilePhoto(
		userId: string,
		file: ImagePicker.ImagePickerAsset,
	) {
		return this.uploadUserProfilePhoto(userId, file);
	}

	/**
	 * Upload review photos with proper folder structure: userId/reviews/restaurantId
	 */
	static async uploadReviewPhotos(
		userId: string,
		restaurantId: string,
		files: ImagePicker.ImagePickerAsset[],
	) {
		try {
			const folder = `${userId}/reviews/${restaurantId}`;
			console.log('Uploading review photos to folder:', folder);

			const uploadResult = await this.uploadMultipleImages(
				'REVIEWS',
				files,
				folder,
			);

			console.log('Review photos upload result:', uploadResult);
			return uploadResult;
		} catch (error) {
			console.error('Review photos upload error:', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to upload review photos',
			};
		}
	}

	/**
	 * Delete file
	 */
	static async deleteFile(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		filePath: string,
	) {
		try {
			const { error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.remove([filePath]);

			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Delete failed',
			};
		}
	}

	/**
	 * Delete multiple files
	 */
	static async deleteFiles(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		filePaths: string[],
	) {
		try {
			const { error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.remove(filePaths);

			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Batch delete failed',
			};
		}
	}

	/**
	 * Get signed URL for temporary access
	 */
	static async getSignedUrl(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		filePath: string,
		expiresIn: number = 3600, // 1 hour by default
	) {
		try {
			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.createSignedUrl(filePath, expiresIn);

			if (error) throw error;

			return {
				success: true,
				data: {
					signedUrl: data.signedUrl,
					expiresAt: new Date(Date.now() + expiresIn * 1000),
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to create signed URL',
			};
		}
	}

	/**
	 * List files in a folder
	 */
	static async listFiles(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		folder?: string,
		limit: number = 100,
	) {
		try {
			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.list(folder, {
					limit,
					sortBy: { column: 'created_at', order: 'desc' },
				});

			if (error) throw error;

			return {
				success: true,
				data,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to list files',
			};
		}
	}

	/**
	 * Get file info
	 */
	static async getFileInfo(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		filePath: string,
	) {
		try {
			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.list('', {
					search: filePath.split('/').pop(),
				});

			if (error) throw error;

			const file = data.find((f) => f.name === filePath.split('/').pop());

			if (!file) {
				throw new Error('File not found');
			}

			return {
				success: true,
				data: file,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to get file info',
			};
		}
	}

	/**
	 * Move file to new location
	 */
	static async moveFile(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		fromPath: string,
		toPath: string,
	) {
		try {
			const { error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.move(fromPath, toPath);

			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to move file',
			};
		}
	}

	/**
	 * Copy file to new location
	 */
	static async copyFile(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		fromPath: string,
		toPath: string,
	) {
		try {
			const { error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.copy(fromPath, toPath);

			if (error) throw error;

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to copy file',
			};
		}
	}

	/**
	 * Get public URL for a file
	 */
	static getPublicUrl(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		filePath: string,
	) {
		const { data } = supabase.storage
			.from(SupabaseStorageService.BUCKETS[bucket])
			.getPublicUrl(filePath);

		return data.publicUrl;
	}

	/**
	 * Helper: Pick and upload image
	 */
	static async pickAndUploadImage(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		folder?: string,
		allowsMultipleSelection: boolean = false,
	) {
		try {
			// Request permissions
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (permissionResult.granted === false) {
				throw new Error('Permission to access camera roll is required!');
			}

			// Pick image
			const pickerResult = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: !allowsMultipleSelection,
				aspect: allowsMultipleSelection ? undefined : [4, 3],
				quality: 0.8,
				allowsMultipleSelection,
			});

			if (pickerResult.canceled) {
				return { success: false, error: 'User cancelled' };
			}

			// Upload image(s)
			if (allowsMultipleSelection && pickerResult.assets.length > 1) {
				return this.uploadMultipleImages(bucket, pickerResult.assets, folder);
			} else {
				return this.uploadImage(bucket, pickerResult.assets[0], folder);
			}
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to pick and upload image',
			};
		}
	}

	/**
	 * Helper: Take photo and upload
	 */
	static async takePhotoAndUpload(
		bucket: keyof typeof SupabaseStorageService.BUCKETS,
		folder?: string,
	) {
		try {
			// Request permissions
			const permissionResult =
				await ImagePicker.requestCameraPermissionsAsync();

			if (permissionResult.granted === false) {
				throw new Error('Permission to access camera is required!');
			}

			// Take photo
			const pickerResult = await ImagePicker.launchCameraAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});

			if (pickerResult.canceled) {
				return { success: false, error: 'User cancelled' };
			}

			// Upload photo
			return this.uploadImage(bucket, pickerResult.assets[0], folder);
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to take and upload photo',
			};
		}
	}
}
