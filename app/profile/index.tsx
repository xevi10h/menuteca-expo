import { RestaurantService, ReviewService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import ChangePasswordPopup from '@/components/profile/ChangePasswordPopup';
import ChangeUsernamePopup from '@/components/profile/ChangeUsernamePopup';
import LanguageSelectorPopup from '@/components/profile/LanguageSelectorPopup';
import UserRestaurantPill from '@/components/profile/UserRestaurantPill';
import UserReviewItem from '@/components/reviews/UserReviewItem';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant, Review } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
	const user = useUserStore((state) => state.user);
	const updatePhoto = useUserStore((state) => state.updatePhoto);
	const deletePhoto = useUserStore((state) => state.deletePhoto);
	const logout = useUserStore((state) => state.logout);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const userLoading = useUserStore((state) => state.isLoading);
	const userError = useUserStore((state) => state.error);
	const refreshProfile = useUserStore((state) => state.refreshProfile);

	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	// Popup states
	const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
	const [showChangeUsernamePopup, setShowChangeUsernamePopup] = useState(false);
	const [showLanguagePopup, setShowLanguagePopup] = useState(false);

	// Local states for restaurants and reviews
	const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
	const [userReviews, setUserReviews] = useState<Review[]>([]);
	const [totalReviews, setTotalReviews] = useState(0);
	const [restaurantsLoading, setRestaurantsLoading] = useState(false);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Load user data on component mount
	useEffect(() => {
		if (isAuthenticated) {
			loadUserData();
		}
	}, [isAuthenticated]);

	// Refresh restaurants when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			if (isAuthenticated) {
				loadUserRestaurants();
			}
		}, [isAuthenticated]),
	);

	// Redirect to auth if not authenticated
	if (!userLoading && !isAuthenticated) {
		return <Redirect href="/auth" />;
	}

	const loadUserData = async () => {
		await Promise.all([loadUserRestaurants(), loadUserReviews()]);
	};

	const loadUserRestaurants = async () => {
		if (!isAuthenticated) return;

		setRestaurantsLoading(true);
		try {
			const response = await RestaurantService.getMyRestaurants();
			if (response.success && response.data) {
				setUserRestaurants(response.data);
			}
		} catch (error) {
			console.error('Error loading user restaurants:', error);
		} finally {
			setRestaurantsLoading(false);
		}
	};

	const loadUserReviews = async () => {
		if (!isAuthenticated) return;

		setReviewsLoading(true);
		try {
			const response = await ReviewService.getMyReviews({ limit: 2 });
			if (response.success && response.data) {
				setUserReviews(response.data.data);
				setTotalReviews(response.data.pagination?.total || response.data.data.length);
			}
		} catch (error) {
			console.error('Error loading user reviews:', error);
		} finally {
			setReviewsLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshProfile();
			await loadUserData();
		} catch (error) {
			console.error('Error refreshing profile:', error);
		} finally {
			setRefreshing(false);
		}
	};

	const handleBack = () => {
		router.back();
	};

	const handleManageMenus = () => {
		router.push('/profile/menu-management');
	};

	const handleLogout = () => {
		Alert.alert(t('profile.logout'), t('profile.confirmLogout'), [
			{ text: t('general.cancel'), style: 'cancel' },
			{
				text: t('profile.logout'),
				style: 'destructive',
				onPress: () => {
					logout();
					// Navigation will be handled automatically by the redirect in this component
					router.replace('/auth');
				},
			},
		]);
	};

	const showPhotoOptions = () => {
		const options: {
			text: string;
			onPress?: () => void;
			style?: 'default' | 'cancel' | 'destructive';
		}[] = [
			{
				text: t('profile.takePhoto'),
				onPress: () => handleTakePhoto(),
			},
			{
				text: t('profile.chooseFromGallery'),
				onPress: () => handleChooseFromGallery(),
			},
		];

		// Add delete option if user has a photo
		if (user.photo) {
			options.push({
				text: t('profile.removePhoto'),
				onPress: () => handleDeletePhoto(),
				style: 'destructive' as const,
			});
		}

		options.push({
			text: t('general.cancel'),
			style: 'cancel' as const,
		});

		Alert.alert(
			t('profile.changePhoto'),
			t('profile.choosePhotoOption'),
			options as any,
		);
	};

	const handleTakePhoto = async () => {
		try {
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert(
					t('profile.permissionsRequired'),
					t('profile.cameraAccessMessage'),
				);
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				const success = await updatePhoto(result.assets[0]);
				if (!success) {
					Alert.alert(t('validation.error'), t('profile.photoUpdateError'));
				}
			}
		} catch (error) {
			Alert.alert(t('validation.error'), t('profile.photoUpdateError'));
		}
	};

	const handleChooseFromGallery = async () => {
		try {
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert(
					t('profile.permissionsRequired'),
					t('profile.photoAccessMessage'),
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
				base64: true,
			});

			if (!result.canceled && result.assets[0]) {
				const success = await updatePhoto(result.assets[0]);
				if (!success) {
					Alert.alert(t('validation.error'), t('profile.photoUpdateError'));
				}
			}
		} catch (error) {
			Alert.alert(t('validation.error'), t('profile.photoUpdateError'));
		}
	};

	const handleDeletePhoto = () => {
		Alert.alert(t('profile.removePhoto'), t('profile.confirmRemovePhoto'), [
			{ text: t('general.cancel'), style: 'cancel' },
			{
				text: t('profile.removePhoto'),
				style: 'destructive',
				onPress: async () => {
					const success = await deletePhoto();
					if (!success) {
						Alert.alert(t('validation.error'), t('profile.photoDeleteError'));
					}
				},
			},
		]);
	};

	const handleAddRestaurant = () => {
		if (userRestaurants.length >= 10) {
			Alert.alert(
				t('profile.limitReached'),
				t('profile.maxRestaurantsReached', { count: 10 }),
			);
			return;
		}
		router.push('/profile/register-restaurant');
	};

	const handleViewAllReviews = () => {
		router.push('/profile/reviews');
	};

	const getCurrentLanguageLabel = () => {
		const languageLabels = {
			en_US: 'English',
			es_ES: 'Español',
			ca_ES: 'Català',
			fr_FR: 'Français',
		};
		return languageLabels[user.language] || 'Español';
	};

	const renderProfilePhoto = () => {
		if (user.photo) {
			return (
				<Image source={{ uri: user.photo }} style={styles.profile_image} />
			);
		} else {
			const initial = user.username
				? user.username.charAt(0).toUpperCase()
				: 'U';
			return (
				<View style={styles.profile_imagePlaceholder}>
					<Text style={styles.profile_imageText}>{initial}</Text>
				</View>
			);
		}
	};

	// Show loading if user is still loading
	if (userLoading) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={styles.loadingText}>Loading profile...</Text>
				</View>
			</View>
		);
	}

	// This should not happen due to the redirect above, but just in case
	if (!isAuthenticated) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.notAuthenticatedContainer}>
					<Text style={styles.notAuthenticatedText}>
						{t('profile.notAuthenticated')}
					</Text>
					<TouchableOpacity
						style={styles.loginButton}
						onPress={() => router.push('/auth/login')}
					>
						<Text style={styles.loginButtonText}>{t('auth.login')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('profile.myProfile')}</Text>
				<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
					<Ionicons name="log-out-outline" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={[colors.primary]}
						tintColor={colors.primary}
					/>
				}
			>
				{/* Profile Info Section */}
				<View style={styles.profileSection}>
					<TouchableOpacity
						onPress={showPhotoOptions}
						style={styles.profile_imageContainer}
						disabled={userLoading}
					>
						{renderProfilePhoto()}
						<View style={styles.editPhotoIcon}>
							{userLoading ? (
								<ActivityIndicator size="small" color={colors.quaternary} />
							) : (
								<Ionicons name="camera" size={16} color={colors.quaternary} />
							)}
						</View>
					</TouchableOpacity>

					<View style={styles.profileInfo}>
						<Text style={styles.user_name}>{user.name || user.username}</Text>
						<Text style={styles.userEmail}>{user.email}</Text>
						<Text style={styles.userSince}>
							{t('profile.memberSince')}{' '}
							{new Date(user.created_at).toLocaleDateString('es-ES')}
						</Text>
					</View>

					{/* Show error if any */}
					{userError && (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>{userError}</Text>
						</View>
					)}
				</View>

				{/* Profile Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

					<TouchableOpacity
						style={[
							styles.actionItem,
							{
								marginTop: 10,
							},
						]}
						onPress={() => setShowChangePasswordPopup(true)}
					>
						<View style={styles.actionLeft}>
							<Ionicons name="key-outline" size={18} color={colors.primary} />
							<Text style={styles.actionText}>{t('changePassword.title')}</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.primaryLight}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => setShowChangeUsernamePopup(true)}
					>
						<View style={styles.actionLeft}>
							<Ionicons
								name="person-outline"
								size={18}
								color={colors.primary}
							/>
							<Text style={styles.actionText}>
								{t('profile.changeUsername')}
							</Text>
						</View>
						<View style={styles.actionRight}>
							<Text style={styles.currentValueText}>@{user.username}</Text>
							<Ionicons
								name="chevron-forward"
								size={18}
								color={colors.primaryLight}
							/>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => setShowLanguagePopup(true)}
					>
						<View style={styles.actionLeft}>
							<Ionicons
								name="language-outline"
								size={20}
								color={colors.primary}
							/>
							<Text style={styles.actionText}>
								{t('profile.changeLanguage')}
							</Text>
						</View>
						<View style={styles.actionRight}>
							<Text style={styles.currentValueText}>
								{getCurrentLanguageLabel()}
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={colors.primaryLight}
							/>
						</View>
					</TouchableOpacity>
				</View>

				{/* Restaurants Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							{t('profile.myRestaurants')} ({userRestaurants.length}/10)
						</Text>
						<View style={styles.restaurantActions}>
							{/* Botón de añadir restaurante */}
							<TouchableOpacity
								onPress={handleAddRestaurant}
								style={styles.addButton}
							>
								<Ionicons name="add" size={20} color={colors.primary} />
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleManageMenus}
								style={styles.manageMenusButton}
							>
								<Ionicons name="list" size={20} color={colors.quaternary} />
							</TouchableOpacity>
						</View>
					</View>

					{restaurantsLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color={colors.primary} />
						</View>
					) : userRestaurants.length > 0 ? (
						<View style={styles.restaurantsContainer}>
							{userRestaurants.map((restaurant) => (
								<UserRestaurantPill
									key={restaurant.id}
									restaurant={restaurant}
								/>
							))}
						</View>
					) : (
						<View style={styles.emptyState}>
							<Ionicons
								name="restaurant-outline"
								size={48}
								color={colors.primaryLight}
							/>
							<Text style={styles.emptyStateText}>
								{t('profile.noRestaurantsRegistered')}
							</Text>
							<Text style={styles.emptyStateSubtext}>
								{t('profile.addFirstRestaurant')}
							</Text>
						</View>
					)}
				</View>

				{/* Reviews Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>{t('profile.myReviews')}</Text>
						{totalReviews > 0 && (
							<TouchableOpacity
								onPress={handleViewAllReviews}
								style={styles.viewAllButton}
							>
								<Text style={styles.viewAllText}>
									{t('profile.viewAllReviews', {
										count: totalReviews,
									})}
								</Text>
								<Ionicons
									name="chevron-forward"
									size={16}
									color={colors.primary}
								/>
							</TouchableOpacity>
						)}
					</View>

					{reviewsLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color={colors.primary} />
						</View>
					) : userReviews.length > 0 ? (
						<View style={styles.reviewsContainer}>
							{userReviews.map((review) => (
								<UserReviewItem
									key={review.id}
									review={review}
									showRestaurantInfo={true}
								/>
							))}
						</View>
					) : (
						<View style={styles.emptyState}>
							<Ionicons
								name="chatbubble-outline"
								size={48}
								color={colors.primaryLight}
							/>
							<Text style={styles.emptyStateText}>
								{t('profile.noReviewsYet')}
							</Text>
							<Text style={styles.emptyStateSubtext}>
								{t('profile.startReviewing')}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>

			{/* Popups */}
			<ChangePasswordPopup
				visible={showChangePasswordPopup}
				onClose={() => setShowChangePasswordPopup(false)}
			/>

			<ChangeUsernamePopup
				visible={showChangeUsernamePopup}
				onClose={() => setShowChangeUsernamePopup(false)}
			/>

			<LanguageSelectorPopup
				visible={showLanguagePopup}
				onClose={() => setShowLanguagePopup(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	logoutButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 40,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	profileSection: {
		alignItems: 'center',
		paddingVertical: 30,
		paddingHorizontal: 20,
	},
	profile_imageContainer: {
		position: 'relative',
		marginBottom: 16,
	},
	profile_image: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	profile_imagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profile_imageText: {
		fontSize: 32,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	editPhotoIcon: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: colors.secondary,
	},
	profileInfo: {
		alignItems: 'center',
	},
	user_name: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginBottom: 4,
	},
	userSince: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	errorContainer: {
		marginTop: 10,
		padding: 10,
		backgroundColor: '#FFEBEE',
		borderRadius: 8,
	},
	errorText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: '#D32F2F',
		textAlign: 'center',
	},
	section: {
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	viewAllButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	viewAllText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	restaurantActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	manageMenusButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.primary,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
		elevation: 3,
	},
	addButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primary,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	actionItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	actionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	actionRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	actionText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	currentValueText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	restaurantsContainer: {
		gap: 0,
	},
	reviewsContainer: {
		gap: 12,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	emptyStateText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateSubtext: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
	notAuthenticatedContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	notAuthenticatedText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	loginButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	loginButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
