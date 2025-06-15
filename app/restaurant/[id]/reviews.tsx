import { colors } from '@/assets/styles/colors';
import AddReviewModal from '@/components/AddReviewModal';
import StarRating from '@/components/StarRating';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tipos para el ordenamiento
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

// Mock data for reviews - replace with actual API call
const mockReviews: Review[] = [
	{
		id: '1',
		userId: 'user1',
		userName: 'María García',
		userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
		rating: 5,
		comment:
			'Increíble experiencia! La comida estaba deliciosa y el servicio fue excepcional. Definitivamente volveré pronto.',
		date: '2024-12-10',
		photos: [
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
			'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
		],
		restaurantResponse: {
			message:
				'¡Muchas gracias por tu comentario María! Nos alegra mucho saber que disfrutaste de tu experiencia con nosotros.',
			date: '2024-12-11',
		},
	},
	{
		id: '2',
		userId: 'user2',
		userName: 'Carlos Rodríguez',
		userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
		rating: 4.5,
		comment:
			'Muy buen restaurante, la comida está muy rica aunque tuvimos que esperar un poco. El ambiente es acogedor.',
		date: '2024-12-08',
		photos: [
			'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300',
		],
	},
	{
		id: '3',
		userId: 'user3',
		userName: 'Ana Martínez',
		userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
		rating: 4.8,
		comment:
			'Perfecta cena de aniversario. El personal fue muy atento y la decoración es preciosa. Los postres son espectaculares.',
		date: '2024-12-05',
		photos: [],
	},
	{
		id: '4',
		userId: 'user4',
		userName: 'David López',
		userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
		rating: 2.5,
		comment:
			'La comida está bien pero esperaba más por el precio. El servicio podría mejorar un poco.',
		date: '2024-12-03',
		photos: [],
		restaurantResponse: {
			message:
				'Gracias por tu feedback David. Tomamos nota de tus comentarios para seguir mejorando nuestro servicio.',
			date: '2024-12-04',
		},
	},
	{
		id: '5',
		userId: 'user5',
		userName: 'Laura Fernández',
		userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
		rating: 4.2,
		comment:
			'Una experiencia gastronómica increíble. Cada plato fue una sorpresa para el paladar. Altamente recomendado para una ocasión especial.',
		date: '2024-11-28',
		photos: [
			'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300',
			'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=300',
			'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300',
		],
	},
	{
		id: '6',
		userId: 'user6',
		userName: 'Roberto Silva',
		userAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
		rating: 1.5,
		comment:
			'Muy decepcionante. La comida llegó fría y el servicio fue muy lento. No recomiendo este lugar.',
		date: '2024-11-25',
		photos: [],
	},
];

interface ReviewPhotosProps {
	photos: string[];
}

const ReviewPhotos: React.FC<ReviewPhotosProps> = ({ photos }) => {
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

	if (photos.length === 0) return null;

	const renderPhoto = (photo: string, index: number) => {
		const isLastItem = index === 2 && photos.length > 3;
		const remainingCount = photos.length - 3;

		return (
			<TouchableOpacity
				key={index}
				style={styles.reviewPhoto}
				onPress={() => setSelectedPhoto(photo)}
			>
				<Image source={{ uri: photo }} style={styles.reviewPhotoImage} />
				{isLastItem && remainingCount > 0 && (
					<View style={styles.photoOverlay}>
						<Text style={styles.photoOverlayText}>+{remainingCount}</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.reviewPhotosContainer}>
			{photos.slice(0, 3).map(renderPhoto)}
		</View>
	);
};

interface SortButtonProps {
	label: string;
	isActive: boolean;
	onPress: () => void;
	icon?: keyof typeof Ionicons.glyphMap;
}

const SortButton: React.FC<SortButtonProps> = ({
	label,
	isActive,
	onPress,
	icon,
}) => (
	<TouchableOpacity
		style={[styles.sortButton, isActive && styles.sortButtonActive]}
		onPress={onPress}
	>
		{icon && (
			<Ionicons
				name={icon}
				size={14}
				color={isActive ? colors.quaternary : colors.primary}
			/>
		)}
		<Text
			style={[styles.sortButtonText, isActive && styles.sortButtonTextActive]}
		>
			{label}
		</Text>
	</TouchableOpacity>
);

interface ReviewItemProps {
	review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
	const { t } = useTranslation();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<View style={styles.reviewItem}>
			{/* User Header */}
			<View style={styles.reviewHeader}>
				<View style={styles.userInfo}>
					<Image
						source={{ uri: review.userAvatar }}
						style={styles.userAvatar}
					/>
					<View style={styles.userDetails}>
						<Text style={styles.userName}>{review.userName}</Text>
						<Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
					</View>
				</View>
				<View style={styles.ratingContainer}>
					<StarRating
						rating={review.rating}
						size={16}
						color={colors.primary}
						emptyColor={colors.primaryLight}
					/>
					<Text style={styles.ratingNumber}>{review.rating}</Text>
				</View>
			</View>

			{/* Review Content */}
			<Text style={styles.reviewComment}>{review.comment}</Text>

			{/* Review Photos */}
			<ReviewPhotos photos={review.photos} />

			{/* Restaurant Response */}
			{review.restaurantResponse && (
				<View style={styles.restaurantResponse}>
					<View style={styles.responseHeader}>
						<Ionicons name="storefront" size={16} color={colors.primary} />
						<Text style={styles.responseLabel}>
							{t('reviews.restaurantResponse')}
						</Text>
						<Text style={styles.responseDate}>
							{formatDate(review.restaurantResponse.date)}
						</Text>
					</View>
					<Text style={styles.responseMessage}>
						{review.restaurantResponse.message}
					</Text>
				</View>
			)}
		</View>
	);
};

export default function ReviewsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();

	const [reviews, setReviews] = useState<Review[]>(mockReviews);
	const [showAddReviewModal, setShowAddReviewModal] = useState(false);
	const [currentSort, setCurrentSort] = useState<SortOption>('newest');

	// Calculate average rating
	const averageRating = useMemo(() => {
		if (reviews.length === 0) return 0;
		return (
			reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		);
	}, [reviews]);

	// Calculate rating distribution
	const ratingDistribution = useMemo(() => {
		return [5, 4, 3, 2, 1].map((rating) => {
			const count = reviews.filter(
				(review) => Math.floor(review.rating) === rating,
			).length;
			const percentage =
				reviews.length > 0 ? (count / reviews.length) * 100 : 0;
			return { rating, count, percentage };
		});
	}, [reviews]);

	// Sort reviews based on current sort option
	const sortedReviews = useMemo(() => {
		const reviewsCopy = [...reviews];

		switch (currentSort) {
			case 'newest':
				return reviewsCopy.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
			case 'oldest':
				return reviewsCopy.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				);
			case 'highest':
				return reviewsCopy.sort((a, b) => b.rating - a.rating);
			case 'lowest':
				return reviewsCopy.sort((a, b) => a.rating - b.rating);
			default:
				return reviewsCopy;
		}
	}, [reviews, currentSort]);

	const handleBack = () => {
		router.back();
	};

	const handleAddReview = (newReview: Omit<Review, 'id' | 'date'>) => {
		const review: Review = {
			...newReview,
			id: Date.now().toString(),
			date: new Date().toISOString().split('T')[0],
		};

		setReviews((prev) => [review, ...prev]);
		setShowAddReviewModal(false);
	};

	const renderReviewItem = ({ item }: { item: Review }) => (
		<ReviewItem review={item} />
	);

	const getSortOptions = (): {
		option: SortOption;
		label: string;
		icon?: keyof typeof Ionicons.glyphMap;
	}[] => [
		{ option: 'newest', label: t('reviews.newest'), icon: 'time-outline' },
		{
			option: 'highest',
			label: t('reviews.highest'),
			icon: 'trending-up-outline',
		},
		{
			option: 'lowest',
			label: t('reviews.lowest'),
			icon: 'trending-down-outline',
		},
		{ option: 'oldest', label: t('reviews.oldest'), icon: 'hourglass-outline' },
	];

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('reviews.title')}</Text>
				<TouchableOpacity
					onPress={() => setShowAddReviewModal(true)}
					style={styles.addReviewButton}
				>
					<Ionicons name="add" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Reviews Summary */}
			<View style={styles.summaryContainer}>
				<View style={styles.summaryHeader}>
					<View style={styles.averageRating}>
						<Text style={styles.averageRatingNumber}>
							{averageRating.toFixed(1)}
						</Text>
						<View style={styles.starsAndCount}>
							<StarRating
								rating={averageRating}
								size={20}
								color={colors.primary}
								emptyColor={colors.primaryLight}
							/>
							<Text style={styles.totalReviews}>
								{t('reviews.totalReviews', { count: reviews.length })}
							</Text>
						</View>
					</View>
				</View>

				{/* Rating Distribution */}
				<View style={styles.ratingDistribution}>
					{ratingDistribution.map(({ rating, count, percentage }) => (
						<View key={rating} style={styles.ratingRow}>
							<Text style={styles.ratingLabel}>{rating}</Text>
							<Ionicons name="star" size={12} color="#FFD700" />
							<View style={styles.ratingBar}>
								<View
									style={[styles.ratingBarFill, { width: `${percentage}%` }]}
								/>
							</View>
							<Text style={styles.ratingCount}>({count})</Text>
						</View>
					))}
				</View>

				{/* Write Review Button */}
				<TouchableOpacity
					style={styles.writeReviewButton}
					onPress={() => setShowAddReviewModal(true)}
				>
					<Ionicons name="create-outline" size={16} color={colors.quaternary} />
					<Text style={styles.writeReviewText}>{t('reviews.writeReview')}</Text>
				</TouchableOpacity>
			</View>

			{/* Sort Options */}
			<View style={styles.sortContainer}>
				<Text style={styles.sortLabel}>{t('filters.sortBy')}:</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.sortButtons}
				>
					{getSortOptions().map(({ option, label, icon }) => (
						<SortButton
							key={option}
							label={label}
							isActive={currentSort === option}
							onPress={() => setCurrentSort(option)}
							icon={icon}
						/>
					))}
				</ScrollView>
			</View>

			{/* Reviews List */}
			{reviews.length > 0 ? (
				<FlatList
					data={sortedReviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.reviewsList}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
				/>
			) : (
				<View style={styles.emptyState}>
					<Ionicons
						name="chatbubble-outline"
						size={64}
						color={colors.primaryLight}
					/>
					<Text style={styles.emptyStateTitle}>{t('reviews.noReviews')}</Text>
					<Text style={styles.emptyStateSubtitle}>{t('reviews.beFirst')}</Text>
					<TouchableOpacity
						style={styles.firstReviewButton}
						onPress={() => setShowAddReviewModal(true)}
					>
						<Ionicons
							name="create-outline"
							size={16}
							color={colors.quaternary}
						/>
						<Text style={styles.firstReviewButtonText}>
							{t('reviews.writeReview')}
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Add Review Modal */}
			<AddReviewModal
				visible={showAddReviewModal}
				onClose={() => setShowAddReviewModal(false)}
				onSubmit={handleAddReview}
				restaurantId={id || ''}
				restaurantName="Restaurante Ejemplo"
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
		borderBottomColor: '#E5E5E5',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	addReviewButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: colors.quaternary,
	},
	summaryContainer: {
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		marginVertical: 16,
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	summaryHeader: {
		alignItems: 'center',
		marginBottom: 20,
	},
	averageRating: {
		alignItems: 'center',
	},
	averageRatingNumber: {
		fontSize: 48,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
	},
	starsAndCount: {
		alignItems: 'center',
	},
	totalReviews: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 8,
	},
	ratingDistribution: {
		gap: 8,
		marginBottom: 20,
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	ratingLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		width: 10,
	},
	ratingBar: {
		flex: 1,
		height: 8,
		backgroundColor: colors.secondary,
		borderRadius: 4,
		overflow: 'hidden',
	},
	ratingBarFill: {
		height: '100%',
		backgroundColor: '#FFD700',
		borderRadius: 4,
	},
	ratingCount: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		width: 30,
		textAlign: 'right',
	},
	writeReviewButton: {
		backgroundColor: colors.primary,
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	writeReviewText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	sortContainer: {
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	sortLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 12,
	},
	sortButtons: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	sortButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		marginRight: 10,
	},
	sortButtonActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	sortButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	sortButtonTextActive: {
		color: colors.quaternary,
	},
	reviewsList: {
		paddingBottom: 20,
	},
	reviewItem: {
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	reviewHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	userAvatar: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		marginRight: 12,
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 2,
	},
	reviewDate: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	ratingNumber: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	reviewComment: {
		fontSize: 15,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		lineHeight: 22,
		marginBottom: 15,
	},
	reviewPhotosContainer: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 15,
	},
	reviewPhoto: {
		position: 'relative',
	},
	reviewPhotoImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	photoOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	photoOverlayText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	restaurantResponse: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		padding: 15,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	responseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	responseLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 1,
	},
	responseDate: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	responseMessage: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		lineHeight: 20,
	},
	separator: {
		height: 15,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateSubtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
	},
	firstReviewButton: {
		backgroundColor: colors.primary,
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	firstReviewButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
