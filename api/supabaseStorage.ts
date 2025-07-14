// api/supabaseStorage.ts
import { supabase } from '@/lib/supabase';
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
	) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not authenticated');
			}

			// Generate unique filename if not provided
			const fileExt = file.uri.split('.').pop()?.toLowerCase();
			const finalFileName = fileName || `${Date.now()}.${fileExt}`;

			// Create file path
			const folderPath = folder ? `${folder}/` : '';
			const filePath = `${folderPath}${finalFileName}`;

			// Convert to blob for upload
			const response = await fetch(file.uri);
			const blob = await response.blob();

			// Upload to Supabase
			const { data, error } = await supabase.storage
				.from(SupabaseStorageService.BUCKETS[bucket])
				.upload(filePath, blob, {
					contentType: file.type || `image/${fileExt}`,
					upsert: false, // Don't overwrite existing files
				});

			if (error) throw error;

			// Get public URL
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
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Upload failed',
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
	 * Upload user profile photo
	 */
	static async uploadProfilePhoto(
		userId: string,
		file: ImagePicker.ImagePickerAsset,
	) {
		const folder = `profiles/${userId}`;
		const fileName = `avatar_${Date.now()}`;

		return this.uploadImage('PROFILES', file, folder, fileName);
	}

	/**
	 * Upload review photos
	 */
	static async uploadReviewPhotos(
		reviewId: string,
		files: ImagePicker.ImagePickerAsset[],
	) {
		const folder = `reviews/${reviewId}`;

		return this.uploadMultipleImages('REVIEWS', files, folder);
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
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
