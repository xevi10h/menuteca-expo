import { colors } from '@/assets/styles/colors';
import AddReviewModal from '@/components/AddReviewModal';
import PhotoGalleryModal from '@/components/PhotoGalleryModal';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant, Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Dimensions,
	Image,
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { renderTagIcon } from '../restaurantCreation/TagsSelectionModal';

const width = Dimensions.get('window').width;

interface InformationProps {
	restaurant: Restaurant;
	onMapPress: () => void;
	dontShowReviews?: boolean;
	isOwnRestaurant?: boolean;
	userReview?: any;
	checkingUserReview?: boolean;
}

const Information: React.FC<InformationProps> = ({
	restaurant,
	onMapPress,
	dontShowReviews,
	isOwnRestaurant = false,
	userReview,
	checkingUserReview = false,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const progressValue = useSharedValue<number>(0);
	const [showAddReviewModal, setShowAddReviewModal] = useState(false);
	const [showPhotoGallery, setShowPhotoGallery] = useState(false);
	const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

	const handleCallRestaurant = (phone: string) => {
		if (phone) {
			Linking.openURL(`tel:${phone}`);
		}
	};

	const handleMakeReservation = (reservation_link: string) => {
		if (reservation_link) {
			Linking.openURL(reservation_link);
		}
	};

	const handleViewReviews = () => {
		router.push(
			`/restaurant/${restaurant.id}/reviews?isOwnRestaurant=${isOwnRestaurant}`,
		);
	};

	const handleAddReview = (newReview: Omit<Review, 'id' | 'date'>) => {
		// En una app real, aquí enviarías la review a tu backend
		console.log('New review added:', newReview);
		setShowAddReviewModal(false);
		// Opcionalmente podrías navegar a la pantalla de reviews después de enviar
		// router.push(`/restaurant/${restaurant.id}/reviews`);
	};

	const handlePhotoPress = (index: number) => {
		setSelectedPhotoIndex(index);
		setShowPhotoGallery(true);
	};

	return (
		<>
			{/* Contact Information */}
			{(restaurant.phone || restaurant.reservation_link) && (
				<View style={styles.contactContainer}>
					{restaurant.phone && (
						<TouchableOpacity
							style={styles.contactButton}
							onPress={() => handleCallRestaurant(restaurant.phone!)}
						>
							<Ionicons name="call" size={14} color={colors.quaternary} />
							<Text style={styles.contactText}>
								{t('restaurant.callRestaurant')}
							</Text>
						</TouchableOpacity>
					)}

					{restaurant.reservation_link && (
						<TouchableOpacity
							style={styles.contactButton}
							onPress={() =>
								handleMakeReservation(restaurant.reservation_link!)
							}
						>
							<Ionicons name="calendar" size={14} color={colors.quaternary} />
							<Text style={styles.contactText}>
								{t('restaurant.makeReservation')}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			{/* Tags */}
			{restaurant.tags && restaurant.tags.length > 0 && (
				<View style={styles.tagsContainer}>
					{restaurant.tags.map((tag) => {
						return (
							<View key={tag} style={styles.tag}>
								{renderTagIcon(tag, colors.quaternary, 14)}
								<Text style={styles.tagText}>{t(`restaurantTags.${tag}`)}</Text>
							</View>
						);
					})}
				</View>
			)}

			{/* Address container */}
			{restaurant.address && (
				<>
					<TouchableOpacity
						style={styles.addressContainer}
						onPress={onMapPress}
					>
						<Ionicons
							name="location-outline"
							size={16}
							color={colors.primary}
						/>
						<Text style={styles.addressText}>
							{restaurant.address.formatted_address}
						</Text>
					</TouchableOpacity>

					{/* Map */}
					<TouchableOpacity onPress={onMapPress}>
						<View style={styles.mapContainer}>
							<MapView
								style={styles.map}
								initialRegion={{
									latitude: restaurant.address.coordinates.latitude,
									longitude: restaurant.address.coordinates.longitude,
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
								scrollEnabled={false}
								zoomEnabled={false}
								pitchEnabled={false}
								rotateEnabled={false}
							>
								<Marker
									coordinate={{
										latitude: restaurant.address.coordinates.latitude,
										longitude: restaurant.address.coordinates.longitude,
									}}
									title={restaurant.name}
									description={restaurant.address.formatted_address}
								/>
							</MapView>
							<View style={styles.mapOverlay}>
								<Ionicons
									name="navigate-outline"
									size={24}
									color={colors.quaternary}
								/>
							</View>
						</View>
					</TouchableOpacity>
				</>
			)}

			{/* Photos Section */}
			<View style={styles.photosSection}>
				<Text style={styles.sectionTitle}>{t('restaurant.photos')}</Text>
				<Carousel
					loop
					style={styles.carousel}
					width={width - 40}
					height={200}
					scrollAnimationDuration={500}
					data={restaurant.images}
					onProgressChange={progressValue}
					renderItem={({ index }) => (
						<TouchableOpacity
							style={styles.imagesContainer}
							onPress={() => handlePhotoPress(index)}
							activeOpacity={0.9}
						>
							<Image
								source={{
									uri: restaurant?.images[index],
								}}
								resizeMode="cover"
								style={styles.image}
							/>
						</TouchableOpacity>
					)}
				/>

				<Pagination.Basic
					progress={progressValue}
					data={restaurant.images}
					dotStyle={styles.paginationDot}
					activeDotStyle={styles.paginationActiveDot}
					containerStyle={styles.paginationContainer}
					horizontal
				/>
			</View>

			{/* Reviews Section */}
			{!dontShowReviews && (
				<View>
					<View style={styles.reviewContainer}>
						<Text style={styles.sectionTitle}>{t('restaurant.reviews')}</Text>
						{!isOwnRestaurant && userReview && (
							<View style={styles.reviewedBadge}>
								<Ionicons
									name="checkmark-circle"
									size={16}
									color={colors.quaternary}
								/>
								<Text style={styles.reviewedText}>{t('reviews.reviewed')}</Text>
							</View>
						)}
					</View>
					<TouchableOpacity
						style={styles.ratingContainer}
						onPress={handleViewReviews}
					>
						<View style={styles.ratingInfo}>
							{restaurant.rating ? (
								<>
									<Text style={styles.ratingText}>{restaurant.rating} / 5</Text>
									<Ionicons name="star" size={20} color={colors.primary} />
								</>
							) : (
								<Text style={styles.ratingText}>
									{t('restaurant.noRating')}
								</Text>
							)}
						</View>
						<View style={styles.viewReviewsButton}>
							<Text style={styles.viewReviewsText}>
								{t('restaurantDetail.viewAllReviews')}
							</Text>
							{/* Mostrar número de opiniones */}
							<Text style={styles.reviewsCount}>
								({restaurant?.reviews?.length})
							</Text>
							<Ionicons
								name="chevron-forward"
								size={16}
								color={colors.primary}
							/>
						</View>
					</TouchableOpacity>

					{/* Si es el restaurante del usuario, no mostrar botón para escribir reseña */}

					{!isOwnRestaurant && !userReview && !checkingUserReview && (
						<TouchableOpacity
							style={styles.writeReviewButton}
							onPress={() => setShowAddReviewModal(true)}
						>
							<Ionicons
								name="create-outline"
								size={16}
								color={colors.quaternary}
							/>
							<Text style={styles.writeReviewButtonText}>
								{t('restaurantDetail.writeReview')}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			{/* Add Review Modal */}
			<AddReviewModal
				visible={showAddReviewModal}
				onClose={() => setShowAddReviewModal(false)}
				onSubmit={handleAddReview}
				restaurant_id={restaurant.id}
				restaurant_name={restaurant.name}
			/>

			{/* Photo Gallery Modal */}
			<PhotoGalleryModal
				visible={showPhotoGallery}
				photos={restaurant.images}
				initialIndex={selectedPhotoIndex}
				onClose={() => setShowPhotoGallery(false)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	contactContainer: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 20,
		flexWrap: 'wrap',
	},
	contactButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 25,
		gap: 8,
		flex: 1,
		justifyContent: 'center',
	},
	contactText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
	},
	tag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: colors.primaryLight,
		borderRadius: 15,
		marginRight: 8,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	tagText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	addressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	addressText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 8,
	},
	mapContainer: {
		height: 150,
		borderRadius: 15,
		marginBottom: 30,
		overflow: 'hidden',
		position: 'relative',
	},
	map: {
		width: '100%',
		height: '100%',
	},
	mapOverlay: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		borderRadius: 20,
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	photosSection: {
		marginBottom: 30,
	},
	carousel: {
		borderRadius: 24,
	},
	imagesContainer: {
		height: 200,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	image: {
		width: '100%',
		height: '100%',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	paginationContainer: {
		gap: 8,
		marginTop: -15,
		justifyContent: 'center',
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.secondary,
	},
	paginationActiveDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primary,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 15,
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: 10,
	},
	ratingInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	ratingText: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginRight: 8,
	},
	viewReviewsButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	viewReviewsText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	reviewsCount: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	writeReviewButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
		paddingVertical: 12,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 15,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	writeReviewButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	reviewContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		flex: 1,
		marginBottom: 20,
		justifyContent: 'space-between',
	},
	reviewedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		gap: 4,
	},
	reviewedText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});

export default Information;
