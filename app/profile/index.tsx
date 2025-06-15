import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// Mock data - reemplazar con datos reales
const mockUserReviews = [
	{
		id: '1',
		restaurantName: 'La Taverna',
		restaurantImage:
			'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
		rating: 4.5,
		comment: 'Excelente comida y servicio. El ambiente es muy acogedor.',
		date: '2024-06-10',
		photos: [
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100',
		],
	},
	{
		id: '2',
		restaurantName: 'El Rincón',
		restaurantImage:
			'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
		rating: 5,
		comment: 'Increíble experiencia gastronómica. Volveré pronto.',
		date: '2024-06-08',
		photos: [],
	},
	{
		id: '3',
		restaurantName: 'Casa Pedro',
		restaurantImage:
			'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100',
		rating: 4,
		comment: 'Buena relación calidad-precio. Los platos están muy ricos.',
		date: '2024-06-05',
		photos: [
			'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100',
		],
	},
];

const mockUserRestaurants = [
	{
		id: '1',
		name: 'Mi Restaurante',
		image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
		address: 'Calle Principal 123',
		status: 'activo',
	},
];

const languageOptions = [
	{ code: 'es_ES', label: 'Español', flag: '🇪🇸' },
	{ code: 'ca_ES', label: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
	{ code: 'en_US', label: 'English', flag: '🇺🇸' },
	{ code: 'fr_FR', label: 'Français', flag: '🇫🇷' },
];

export default function ProfileScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { user, setLanguage } = useUserStore();

	const [showLanguageModal, setShowLanguageModal] = useState(false);

	// Mostrar solo las primeras 2 reseñas
	const displayedReviews = mockUserReviews.slice(0, 2);
	const hasMoreReviews = mockUserReviews.length > 2;

	const handleLanguageSelect = (languageCode: string) => {
		setLanguage(languageCode as any);
		setShowLanguageModal(false);
	};

	const showLanguageSelector = () => {
		const options = languageOptions.map((lang) => lang.label);

		Alert.alert(t('profile.selectLanguage'), '', [
			...languageOptions.map((lang) => ({
				text: `${lang.flag} ${lang.label}`,
				onPress: () => handleLanguageSelect(lang.code),
			})),
			{
				text: t('general.cancel'),
				style: 'cancel',
			},
		]);
	};

	const currentLanguage = languageOptions.find(
		(lang) => lang.code === user.language,
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('profile.title')}</Text>
				<TouchableOpacity
					style={styles.settingsButton}
					onPress={() => {
						/* Abrir configuración */
					}}
				>
					<Ionicons name="settings-outline" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* User Info */}
				<View style={styles.userSection}>
					<View style={styles.userInfo}>
						<Image
							source={{
								uri: user.photo || 'https://via.placeholder.com/80',
							}}
							style={styles.userAvatar}
						/>
						<View style={styles.userDetails}>
							<Text style={styles.userName}>{user.name || user.username}</Text>
							<Text style={styles.userEmail}>{user.email}</Text>
						</View>
					</View>
					<TouchableOpacity style={styles.editProfileButton}>
						<Ionicons name="pencil-outline" size={16} color={colors.primary} />
						<Text style={styles.editProfileText}>
							{t('profile.editProfile')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Language Selection */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('profile.language')}</Text>
					<TouchableOpacity
						style={styles.languageSelector}
						onPress={showLanguageSelector}
					>
						<View style={styles.languageInfo}>
							<Text style={styles.languageFlag}>{currentLanguage?.flag}</Text>
							<Text style={styles.languageText}>{currentLanguage?.label}</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.primaryLight}
						/>
					</TouchableOpacity>
				</View>

				{/* My Reviews */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>{t('profile.myReviews')}</Text>
						{hasMoreReviews && (
							<TouchableOpacity
								onPress={() => router.push('/profile/reviews')}
								style={styles.seeAllButton}
							>
								<Text style={styles.seeAllText}>
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

					{displayedReviews.length > 0 ? (
						<View style={styles.reviewsList}>
							{displayedReviews.map((review) => (
								<View key={review.id} style={styles.reviewItem}>
									<Image
										source={{ uri: review.restaurantImage }}
										style={styles.reviewRestaurantImage}
									/>
									<View style={styles.reviewContent}>
										<View style={styles.reviewHeader}>
											<Text style={styles.reviewRestaurantName}>
												{review.restaurantName}
											</Text>
											<View style={styles.reviewRating}>
												<Ionicons name="star" size={14} color="#FFD700" />
												<Text style={styles.reviewRatingText}>
													{review.rating}
												</Text>
											</View>
										</View>
										<Text style={styles.reviewComment} numberOfLines={2}>
											{review.comment}
										</Text>
										<Text style={styles.reviewDate}>{review.date}</Text>
									</View>
								</View>
							))}

							{hasMoreReviews && (
								<TouchableOpacity
									style={styles.viewAllReviewsButton}
									onPress={() => router.push('/profile/reviews')}
								>
									<Text style={styles.viewAllReviewsText}>
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

				{/* My Restaurants */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							{t('profile.myRestaurants')}
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/profile/register-restaurant')}
							style={styles.addButton}
						>
							<Ionicons name="add" size={20} color={colors.primary} />
							<Text style={styles.addButtonText}>
								{t('profile.addRestaurant')}
							</Text>
						</TouchableOpacity>
					</View>

					{mockUserRestaurants.length > 0 ? (
						<View style={styles.restaurantsList}>
							{mockUserRestaurants.map((restaurant) => (
								<TouchableOpacity
									key={restaurant.id}
									style={styles.restaurantItem}
									onPress={() => router.push(`/restaurant/${restaurant.id}`)}
								>
									<Image
										source={{ uri: restaurant.image }}
										style={styles.restaurantImage}
									/>
									<View style={styles.restaurantContent}>
										<Text style={styles.restaurantName}>{restaurant.name}</Text>
										<Text style={styles.restaurantAddress}>
											{restaurant.address}
										</Text>
										<View style={styles.restaurantStatus}>
											<View
												style={[
													styles.statusIndicator,
													{
														backgroundColor:
															restaurant.status === 'activo'
																? '#4CAF50'
																: '#FF9800',
													},
												]}
											/>
											<Text style={styles.statusText}>
												{restaurant.status === 'activo'
													? t('profile.active')
													: t('profile.pending')}
											</Text>
										</View>
									</View>
									<TouchableOpacity style={styles.manageButton}>
										<Ionicons
											name="settings-outline"
											size={20}
											color={colors.primary}
										/>
									</TouchableOpacity>
								</TouchableOpacity>
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
								{t('profile.noRestaurantsYet')}
							</Text>
							<TouchableOpacity
								style={styles.addFirstRestaurantButton}
								onPress={() => router.push('/profile/register-restaurant')}
							>
								<Ionicons name="add" size={16} color={colors.quaternary} />
								<Text style={styles.addFirstRestaurantText}>
									{t('profile.addFirstRestaurant')}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				{/* Bottom spacing */}
				<View style={{ height: 100 }} />
			</ScrollView>
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
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	headerTitle: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
	},
	settingsButton: {
		padding: 8,
	},
	content: {
		flex: 1,
	},
	userSection: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	userAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginRight: 16,
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	editProfileButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	editProfileText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 8,
	},
	section: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
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
	seeAllButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	seeAllText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginRight: 4,
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primary,
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	addButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
		marginLeft: 4,
	},
	languageSelector: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	languageInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	languageFlag: {
		fontSize: 20,
		marginRight: 12,
	},
	languageText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	reviewsList: {
		gap: 12,
	},
	reviewItem: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	reviewRestaurantImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	reviewContent: {
		flex: 1,
	},
	reviewHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	reviewRestaurantName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 1,
	},
	reviewRating: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	reviewRatingText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 2,
	},
	reviewComment: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginBottom: 4,
		lineHeight: 16,
	},
	reviewDate: {
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	viewAllReviewsButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		marginTop: 8,
	},
	viewAllReviewsText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginRight: 4,
	},
	restaurantsList: {
		gap: 12,
	},
	restaurantItem: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.borderLight,
		alignItems: 'center',
	},
	restaurantImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	restaurantContent: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 4,
	},
	restaurantAddress: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginBottom: 8,
	},
	restaurantStatus: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	manageButton: {
		padding: 8,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 32,
	},
	emptyStateText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginTop: 12,
		marginBottom: 4,
	},
	emptyStateSubtext: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
	addFirstRestaurantButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primary,
		borderRadius: 20,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginTop: 16,
	},
	addFirstRestaurantText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
		marginLeft: 8,
	},
});
