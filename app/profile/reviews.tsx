import { colors } from '@/assets/styles/colors';
import SortButton from '@/components/reviews/SortButton';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

// Mock data - todas las reseñas del usuario
const mockUserReviews = [
	{
		id: '1',
		restaurantId: 'rest1',
		restaurantName: 'La Taverna',
		restaurantImage:
			'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
		rating: 4.5,
		comment:
			'Excelente comida y servicio. El ambiente es muy acogedor y el personal muy atento.',
		date: '2024-06-10',
		photos: [
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
			'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
		],
	},
	{
		id: '2',
		restaurantId: 'rest2',
		restaurantName: 'El Rincón',
		restaurantImage:
			'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
		rating: 5,
		comment:
			'Increíble experiencia gastronómica. Cada plato fue una sorpresa para el paladar. Volveré pronto sin duda.',
		date: '2024-06-08',
		photos: [],
	},
	{
		id: '3',
		restaurantId: 'rest3',
		restaurantName: 'Casa Pedro',
		restaurantImage:
			'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100',
		rating: 4,
		comment:
			'Buena relación calidad-precio. Los platos están muy ricos y las porciones son generosas.',
		date: '2024-06-05',
		photos: [
			'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
		],
	},
	{
		id: '4',
		restaurantId: 'rest4',
		restaurantName: 'Pizzería Mario',
		restaurantImage:
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100',
		rating: 3.5,
		comment:
			'Pizza decente pero he probado mejores. El lugar está bien para una cena casual.',
		date: '2024-06-01',
		photos: [],
	},
	{
		id: '5',
		restaurantId: 'rest5',
		restaurantName: 'Sushi Zen',
		restaurantImage:
			'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100',
		rating: 4.8,
		comment:
			'El mejor sushi de la ciudad. Fresco, sabroso y presentación impecable. Personal muy profesional.',
		date: '2024-05-28',
		photos: [
			'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=300',
			'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300',
			'https://images.unsplash.com/photo-1582270917217-0b4b1d3df4bc?w=300',
		],
	},
	{
		id: '6',
		restaurantId: 'rest6',
		restaurantName: 'Café Central',
		restaurantImage:
			'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100',
		rating: 4.2,
		comment:
			'Perfecto para un desayuno o brunch. El café es excelente y los pasteles están deliciosos.',
		date: '2024-05-25',
		photos: [
			'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
		],
	},
	{
		id: '7',
		restaurantId: 'rest7',
		restaurantName: 'Tapas García',
		restaurantImage:
			'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100',
		rating: 3.8,
		comment:
			'Buenas tapas tradicionales. Ambiente auténtico español. Las bravas están muy buenas.',
		date: '2024-05-20',
		photos: [],
	},
	{
		id: '8',
		restaurantId: 'rest8',
		restaurantName: 'Burger House',
		restaurantImage:
			'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100',
		rating: 3.2,
		comment:
			'Hamburguesas grandes pero un poco secas. Las patatas están bien. Servicio lento.',
		date: '2024-05-15',
		photos: [
			'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
		],
	},
];

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function UserReviewsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [currentSort, setCurrentSort] = useState<SortOption>('newest');
	const [reviews, setReviews] = useState(mockUserReviews);

	// Ordenar reseñas
	const sortedReviews = React.useMemo(() => {
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

	const handleBack = () => {
		router.back();
	};

	const handleRestaurantPress = (restaurantId: string) => {
		router.push(`/restaurant/${restaurantId}`);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const diffTime = Math.abs(today.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return t('reviews.today');
		if (diffDays === 2) return t('reviews.yesterday');
		if (diffDays <= 7) return t('reviews.daysAgo', { count: diffDays - 1 });
		if (diffDays <= 30)
			return t('reviews.weeksAgo', { count: Math.ceil((diffDays - 1) / 7) });
		return t('reviews.monthsAgo', { count: Math.ceil((diffDays - 1) / 30) });
	};

	const renderReviewItem = ({
		item,
	}: {
		item: (typeof mockUserReviews)[0];
	}) => (
		<TouchableOpacity
			style={styles.reviewItem}
			onPress={() => handleRestaurantPress(item.restaurantId)}
		>
			<View style={styles.reviewHeader}>
				<Image
					source={{ uri: item.restaurantImage }}
					style={styles.restaurantImage}
				/>
				<View style={styles.restaurantInfo}>
					<Text style={styles.restaurantName}>{item.restaurantName}</Text>
					<View style={styles.ratingContainer}>
						{Array.from({ length: 5 }).map((_, index) => (
							<Ionicons
								key={index}
								name={
									index < Math.floor(item.rating)
										? 'star'
										: index < item.rating
										? 'star-half'
										: 'star-outline'
								}
								size={16}
								color="#FFD700"
							/>
						))}
						<Text style={styles.ratingText}>{item.rating}</Text>
					</View>
				</View>
				<Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
			</View>

			<Text style={styles.reviewComment}>{item.comment}</Text>

			{item.photos.length > 0 && (
				<View style={styles.photosContainer}>
					{item.photos.slice(0, 3).map((photo, index) => (
						<Image
							key={index}
							source={{ uri: photo }}
							style={styles.reviewPhoto}
						/>
					))}
					{item.photos.length > 3 && (
						<View style={styles.morePhotosOverlay}>
							<Text style={styles.morePhotosText}>
								+{item.photos.length - 3}
							</Text>
						</View>
					)}
				</View>
			)}
		</TouchableOpacity>
	);

	const renderHeader = () => (
		<View style={styles.headerContent}>
			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{reviews.length}</Text>
					<Text style={styles.statLabel}>
						{t('reviews.totalReviews', {
							count: reviews.length,
						})}
					</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{(
							reviews.reduce((sum, review) => sum + review.rating, 0) /
							reviews.length
						).toFixed(1)}
					</Text>
					<Text style={styles.statLabel}>{t('profile.averageRating')}</Text>
				</View>
			</View>

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
		</View>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Ionicons
				name="chatbubble-outline"
				size={64}
				color={colors.primaryLight}
			/>
			<Text style={styles.emptyStateTitle}>{t('profile.noReviewsYet')}</Text>
			<Text style={styles.emptyStateSubtitle}>
				{t('profile.startReviewing')}
			</Text>
		</View>
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('profile.myReviews')}</Text>
				<View style={styles.headerSpacer} />
			</View>

			{/* Content */}
			{reviews.length > 0 ? (
				<FlatList
					data={sortedReviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					ListHeaderComponent={renderHeader}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
				/>
			) : (
				renderEmptyState()
			)}
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
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	headerTitle: {
		flex: 1,
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	headerSpacer: {
		width: 40,
	},
	headerContent: {
		borderBottomColor: colors.primaryLight,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
	},
	statLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 4,
	},
	sortContainer: {
		marginBottom: 8,
	},
	sortLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 12,
	},
	sortButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	sortButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
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
		marginLeft: 4,
	},
	sortButtonTextActive: {
		color: colors.quaternary,
	},
	listContent: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	reviewItem: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	reviewHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	restaurantImage: {
		width: 50,
		height: 50,
		borderRadius: 8,
		marginRight: 12,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 4,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	ratingText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 6,
	},
	reviewDate: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	reviewComment: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		lineHeight: 20,
		marginBottom: 12,
	},
	photosContainer: {
		flexDirection: 'row',
		gap: 8,
		position: 'relative',
	},
	reviewPhoto: {
		width: 60,
		height: 60,
		borderRadius: 8,
	},
	morePhotosOverlay: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 60,
		height: 60,
		borderRadius: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	morePhotosText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	separator: {
		height: 12,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	emptyStateTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyStateSubtitle: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
	},
});
