import { ReviewService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import SortButton from '@/components/reviews/SortButton';
import UserReviewItem from '@/components/reviews/UserReviewItem';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
	FlatList,
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function UserReviewsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const user = useUserStore((state) => state.user);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);

	const [currentSort, setCurrentSort] = useState<SortOption>('newest');
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	// Calculate average rating
	const averageRating = useMemo(() => {
		if (reviews.length === 0) return 0;
		return (
			reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		);
	}, [reviews]);

	// Load user reviews
	const loadReviews = async (pageNumber = 1, isRefresh = false) => {
		if (!isAuthenticated) return;

		try {
			if (isRefresh) {
				setRefreshing(true);
			} else if (pageNumber === 1) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			const response = await ReviewService.getMyReviews({
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
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	};

	// Load reviews on component mount and when sort changes
	useEffect(() => {
		loadReviews(1);
	}, [isAuthenticated, currentSort]);

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

	// Ordenar reseñas localmente (backup in case API doesn't support sorting)
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

	const renderUserInfo = () => {
		const renderProfilePhoto = () => {
			if (user.photo) {
				return (
					<Image source={{ uri: user.photo }} style={styles.user_avatar} />
				);
			} else {
				const initial = user.username
					? user.username.charAt(0).toUpperCase()
					: 'U';
				return (
					<View style={styles.userAvatarPlaceholder}>
						<Text style={styles.userAvatarText}>{initial}</Text>
					</View>
				);
			}
		};

		return (
			<View style={styles.userInfoContainer}>
				{renderProfilePhoto()}
				<View style={styles.userDetails}>
					<Text style={styles.user_name}>{user.name || user.username}</Text>
					<Text style={styles.userEmail}>{user.email}</Text>
				</View>
			</View>
		);
	};

	const renderReviewItem = ({ item }: { item: Review }) => (
		<UserReviewItem review={item} showRestaurantInfo={true} />
	);

	const renderFooter = () => {
		if (!loadingMore) return null;
		return (
			<View style={styles.loadingFooter}>
				<Text style={styles.loadingText}>{t('general.loading')}</Text>
			</View>
		);
	};

	const renderHeader = () => (
		<View style={styles.headerContent}>
			{/* User Info */}
			{renderUserInfo()}

			{/* Stats */}
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
					<Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
					<Text style={styles.statLabel}>{t('profile.averageRating')}</Text>
				</View>
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
			<Text style={styles.emptyStateTitle}>{t('profile.noReviewsYet')}</Text>
			<Text style={styles.emptyStateSubtitle}>
				{t('profile.startReviewing')}
			</Text>
		</View>
	);

	// Show loading screen on initial load
	if (loading && reviews.length === 0) {
		return <LoadingScreen />;
	}

	// Check if user is authenticated
	if (!isAuthenticated) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={24} color={colors.primary} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>{t('profile.myReviews')}</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.notAuthenticatedContainer}>
					<Text style={styles.notAuthenticatedText}>
						{t('profile.notAuthenticated')}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('profile.myReviews')}</Text>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<View style={styles.headerSpacer} />
			</View>

			{/* Content */}
			{reviews.length > 0 ? (
				<FlatList
					data={sortedReviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					ListHeaderComponent={renderHeader}
					ListFooterComponent={renderFooter}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
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
				<>
					{renderHeader()}
					{renderEmptyState()}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		marginHorizontal: -20,
	},
	backButton: {
		alignItems: 'flex-start',
		width: 40,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		position: 'absolute',
		left: 0,
		right: 0,
	},
	headerSpacer: {
		width: 40,
	},
	headerContent: {
		paddingBottom: 16,
		borderBottomColor: colors.primaryLight,
	},
	userInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 20,
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		marginVertical: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	user_avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 16,
	},
	userAvatarPlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	userAvatarText: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	userDetails: {
		flex: 1,
	},
	user_name: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 2,
	},
	userEmail: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
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
	listContent: {
		paddingBottom: 20,
	},
	separator: {
		height: 12,
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
	},
});
