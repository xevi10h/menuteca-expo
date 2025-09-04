import { ReviewService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import AddReviewModal from '@/components/AddReviewModal';
import LoadingScreen from '@/components/LoadingScreen';
import ReviewItem from '@/components/reviews/ReviewItem';
import ReviewsSummary from '@/components/reviews/ReviewsSummary';
import SortButton from '@/components/reviews/SortButton';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	FlatList,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, {
	useAnimatedScrollHandler,
	useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tipos para el ordenamiento
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function ReviewsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { id, isOwnRestaurant } = useLocalSearchParams<{
		id: string;
		isOwnRestaurant?: string;
	}>();

	const isOwn = isOwnRestaurant === 'true';

	const insets = useSafeAreaInsets();

	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [showAddReviewModal, setShowAddReviewModal] = useState(false);
	const [currentSort, setCurrentSort] = useState<SortOption>('newest');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [restaurantName, setRestaurantName] = useState('');

	// Animated scroll value
	const scrollY = useSharedValue(0);
	const flatListRef = useRef<FlatList>(null);

	// Load reviews data
	useEffect(() => {
		if (id) {
			loadReviews(1);
		}
	}, [id, currentSort]);

	const loadReviews = async (pageNumber = 1, isRefresh = false) => {
		if (!id) return;

		try {
			if (isRefresh) {
				setRefreshing(true);
			} else if (pageNumber === 1) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			const response = await ReviewService.getRestaurantReviews(id, {
				page: pageNumber,
				limit: 10,
				sortBy: getSortByField(currentSort),
				sortOrder: getSortOrder(currentSort),
			});

			if (response.success && response.data) {
				const newReviews = response.data.data;

				if (pageNumber === 1 || isRefresh) {
					setReviews(newReviews);
				} else {
					setReviews((prev) => [...prev, ...newReviews]);
				}

				setHasMore(response.data.pagination.hasNext);
				setPage(pageNumber);
			}
		} catch (error) {
			console.error('Error loading reviews:', error);
			Alert.alert(t('validation.error'), t('reviews.errorLoading'));
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	};

	// Helper functions for sorting
	const getSortByField = (sort: SortOption): string => {
		switch (sort) {
			case 'newest':
			case 'oldest':
				return 'created_at';
			case 'highest':
			case 'lowest':
				return 'rating';
			default:
				return 'created_at';
		}
	};

	const getSortOrder = (sort: SortOption): 'asc' | 'desc' => {
		switch (sort) {
			case 'newest':
			case 'highest':
				return 'desc';
			case 'oldest':
			case 'lowest':
				return 'asc';
			default:
				return 'desc';
		}
	};

	// Calculate average rating
	const averageRating = useMemo(() => {
		if (reviews.length === 0) return 0;
		return (
			reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		);
	}, [reviews]);

	// Sort reviews based on current sort option (backup in case API doesn't support sorting)
	const sortedReviews = useMemo(() => {
		const reviewsCopy = [...reviews];

		switch (currentSort) {
			case 'newest':
				return reviewsCopy.sort(
					(a, b) =>
						new Date(b.date || b.created_at).getTime() -
						new Date(a.date || a.created_at).getTime(),
				);
			case 'oldest':
				return reviewsCopy.sort(
					(a, b) =>
						new Date(a.date || a.created_at).getTime() -
						new Date(b.date || b.created_at).getTime(),
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

	const handleRefresh = () => {
		setPage(1);
		setHasMore(true);
		loadReviews(1, true);
	};

	const handleLoadMore = () => {
		if (hasMore && !loadingMore && !loading) {
			loadReviews(page + 1);
		}
	};

	const handleSortChange = (sort: SortOption) => {
		if (sort !== currentSort) {
			setCurrentSort(sort);
			setPage(1);
			setHasMore(true);
		}
	};

	const handleAddReview = async (
		newReview: Omit<Review, 'id' | 'date' | 'created_at'>,
	) => {
		if (!id) return;

		try {
			const response = await ReviewService.createReview(id, {
				rating: newReview.rating,
				comment: newReview.comment,
				photos: newReview.photos,
			});

			if (response.success && response.data) {
				// Add new review to the beginning of the list
				setReviews((prev) => [response.data, ...prev]);
				setShowAddReviewModal(false);

				// Show success message
				Alert.alert(t('validation.success'), t('reviews.reviewAdded'));
			}
		} catch (error) {
			console.error('Error adding review:', error);
			Alert.alert(t('validation.error'), t('reviews.errorAdding'));
		}
	};

	const handleWriteReview = () => {
		setShowAddReviewModal(true);
	};

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

	// Animated scroll handler
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollY.value = event.contentOffset.y;
		},
	});

	const renderReviewItem = ({ item }: { item: Review }) => (
		<ReviewItem review={item} />
	);

	const renderSeparator = () => <View style={styles.separator} />;

	const renderFooter = () => {
		if (!loadingMore) return null;
		return (
			<View style={styles.loadingFooter}>
				<Text style={styles.loadingText}>{t('general.loading')}</Text>
			</View>
		);
	};

	const renderHeader = () => (
		<View>
			{/* Reviews Summary */}
			<ReviewsSummary
				reviews={reviews}
				averageRating={averageRating}
				onWriteReview={!isOwn ? handleWriteReview : () => {}}
				scrollY={scrollY}
			/>

			{/* Compact Summary (shown when scrolling) */}
			<ReviewsSummary
				reviews={reviews}
				averageRating={averageRating}
				onWriteReview={!isOwn ? handleWriteReview : () => {}}
				scrollY={scrollY}
				isCompact={true}
			/>

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
							onPress={() => handleSortChange(option)}
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
			<Text style={styles.emptyStateTitle}>{t('reviews.noReviews')}</Text>
			<Text style={styles.emptyStateSubtitle}>{t('reviews.beFirst')}</Text>
			{!isOwn && (
				<TouchableOpacity
					style={styles.firstReviewButton}
					onPress={() => setShowAddReviewModal(true)}
				>
					<Ionicons name="create-outline" size={16} color={colors.quaternary} />
					<Text style={styles.firstReviewButtonText}>
						{t('reviews.writeReview')}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	// Show loading screen on initial load
	if (loading && reviews.length === 0) {
		return <LoadingScreen />;
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('reviews.title')}</Text>
				{!isOwn && (
					<TouchableOpacity
						onPress={() => setShowAddReviewModal(true)}
						style={styles.addReviewButton}
					>
						<Ionicons name="add" size={24} color={colors.primary} />
					</TouchableOpacity>
				)}
			</View>

			{/* Reviews List */}
			{reviews.length > 0 ? (
				<Animated.FlatList
					ref={flatListRef}
					data={sortedReviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					ListHeaderComponent={renderHeader}
					ListFooterComponent={renderFooter}
					ItemSeparatorComponent={renderSeparator}
					onScroll={scrollHandler}
					scrollEventThrottle={16}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							colors={[colors.primary]}
							tintColor={colors.primary}
						/>
					}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.1}
				/>
			) : (
				renderEmptyState()
			)}

			{/* Add Review Modal */}
			<AddReviewModal
				visible={showAddReviewModal}
				onClose={() => setShowAddReviewModal(false)}
				onSubmit={handleAddReview}
				restaurant_id={id || ''}
				restaurant_name={restaurantName || 'Restaurant'}
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
		position: 'absolute',
		left: 0,
		right: 0,
		textAlign: 'center',
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
	listContent: {
		paddingBottom: 20,
	},
	separator: {
		height: 15,
	},
	loadingFooter: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
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
