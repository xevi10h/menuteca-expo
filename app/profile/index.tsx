import { mockUserReviews } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import ChangePasswordPopup from '@/components/profile/ChangePasswordPopup';
import ChangeUsernamePopup from '@/components/profile/ChangeUsernamePopup';
import LanguageSelectorPopup from '@/components/profile/LanguageSelectorPopup';
import UserReviewItem from '@/components/reviews/UserReviewItem';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Restaurant {
	id: string;
	name: string;
	address: string;
	profileImage?: string;
}

export default function ProfileScreen() {
	const user = useUserStore((state) => state.user);
	const updatePhoto = useUserStore((state) => state.updatePhoto);
	const setDefaultUser = useUserStore((state) => state.setDefaultUser);
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	// Popup states
	const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
	const [showChangeUsernamePopup, setShowChangeUsernamePopup] = useState(false);
	const [showLanguagePopup, setShowLanguagePopup] = useState(false);

	// Datos mock de restaurantes del usuario (máximo 10)
	const [userRestaurants] = useState<Restaurant[]>([
		{
			id: '1',
			name: 'La Taberna del Abuelo',
			address: 'Calle Mayor 123, Madrid',
			profileImage: undefined,
		},
		{
			id: '2',
			name: 'Bistro Mediterráneo',
			address: 'Avenida de la Paz 45, Barcelona',
			profileImage: undefined,
		},
	]);

	// Usar solo las primeras 2 reseñas del mock
	const userReviews = mockUserReviews.slice(0, 2);

	const handleBack = () => {
		router.back();
	};

	const handleLogout = () => {
		Alert.alert(
			'Cerrar sesión',
			'¿Estás seguro de que quieres cerrar sesión?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Cerrar sesión',
					style: 'destructive',
					onPress: () => {
						setDefaultUser();
						router.replace('/');
					},
				},
			],
		);
	};

	const handleChangePhoto = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permisos requeridos',
				'Necesitamos acceso a tu galería para cambiar la foto de perfil',
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			updatePhoto(result.assets[0].uri);
		}
	};

	const handleAddRestaurant = () => {
		if (userRestaurants.length >= 10) {
			Alert.alert(
				'Límite alcanzado',
				'Has alcanzado el límite máximo de 10 restaurantes por usuario',
			);
			return;
		}
		router.push('/profile/register-restaurant');
	};

	const handleEditRestaurant = (restaurantId: string) => {
		router.push('/profile/register-restaurant/setup/edit');
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
			return <Image source={{ uri: user.photo }} style={styles.profileImage} />;
		} else {
			const initial = user.username
				? user.username.charAt(0).toUpperCase()
				: 'U';
			return (
				<View style={styles.profileImagePlaceholder}>
					<Text style={styles.profileImageText}>{initial}</Text>
				</View>
			);
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Mi Perfil</Text>
				<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
					<Ionicons name="log-out-outline" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Profile Info Section */}
				<View style={styles.profileSection}>
					<TouchableOpacity
						onPress={handleChangePhoto}
						style={styles.profileImageContainer}
					>
						{renderProfilePhoto()}
						<View style={styles.editPhotoIcon}>
							<Ionicons name="camera" size={16} color={colors.quaternary} />
						</View>
					</TouchableOpacity>

					<View style={styles.profileInfo}>
						<Text style={styles.userName}>{user.name || user.username}</Text>
						<Text style={styles.userEmail}>{user.email}</Text>
						<Text style={styles.userSince}>
							Miembro desde{' '}
							{new Date(user.createdAt).toLocaleDateString('es-ES')}
						</Text>
					</View>
				</View>

				{/* Profile Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Configuración</Text>

					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => setShowChangePasswordPopup(true)}
					>
						<View style={styles.actionLeft}>
							<Ionicons name="key-outline" size={20} color={colors.primary} />
							<Text style={styles.actionText}>Cambiar contraseña</Text>
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
								size={20}
								color={colors.primary}
							/>
							<Text style={styles.actionText}>Cambiar nombre de usuario</Text>
						</View>
						<View style={styles.actionRight}>
							<Text style={styles.currentValueText}>@{user.username}</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
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
							<Text style={styles.actionText}>Cambiar idioma</Text>
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

				{/* Reviews Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							Mis Reseñas ({mockUserReviews.length})
						</Text>
						{mockUserReviews.length > 2 && (
							<TouchableOpacity
								onPress={handleViewAllReviews}
								style={styles.viewAllButton}
							>
								<Text style={styles.viewAllText}>
									{t('profile.viewAllReviews', {
										count: mockUserReviews.length,
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

					{userReviews.length > 0 ? (
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

				{/* Restaurants Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							Mis Restaurantes ({userRestaurants.length}/10)
						</Text>
						<TouchableOpacity
							onPress={handleAddRestaurant}
							style={styles.addButton}
						>
							<Ionicons name="add" size={20} color={colors.quaternary} />
						</TouchableOpacity>
					</View>

					{userRestaurants.map((restaurant) => (
						<TouchableOpacity
							key={restaurant.id}
							style={styles.restaurantItem}
							onPress={() => handleEditRestaurant(restaurant.id)}
						>
							<View style={styles.restaurantImageContainer}>
								{restaurant.profileImage ? (
									<Image
										source={{ uri: restaurant.profileImage }}
										style={styles.restaurantImage}
									/>
								) : (
									<View style={styles.restaurantImagePlaceholder}>
										<Text style={styles.restaurantImageText}>
											{restaurant.name.charAt(0).toUpperCase()}
										</Text>
									</View>
								)}
							</View>

							<View style={styles.restaurantInfo}>
								<Text style={styles.restaurantName}>{restaurant.name}</Text>
								<Text style={styles.restaurantAddress}>
									{restaurant.address}
								</Text>
							</View>

							<Ionicons
								name="chevron-forward"
								size={20}
								color={colors.primaryLight}
							/>
						</TouchableOpacity>
					))}

					{userRestaurants.length === 0 && (
						<View style={styles.emptyState}>
							<Ionicons
								name="restaurant-outline"
								size={48}
								color={colors.primaryLight}
							/>
							<Text style={styles.emptyStateText}>
								No tienes restaurantes registrados
							</Text>
							<Text style={styles.emptyStateSubtext}>
								Añade tu primer restaurante para comenzar
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
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
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
	profileSection: {
		alignItems: 'center',
		paddingVertical: 30,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	profileImageContainer: {
		position: 'relative',
		marginBottom: 16,
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	profileImagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileImageText: {
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
	userName: {
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
	section: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
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
		marginBottom: 16,
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
	addButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
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
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	currentValueText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	reviewsContainer: {
		gap: 12,
	},
	restaurantItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	restaurantImageContainer: {
		marginRight: 12,
	},
	restaurantImage: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	restaurantImagePlaceholder: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	restaurantImageText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 2,
	},
	restaurantAddress: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
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
});
