import { colors } from '@/assets/styles/colors';
import RestaurantCard from '@/components/RestaurantCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useFilterStore } from '@/zustand/FilterStore';
import { useRestaurantStore } from '@/zustand/RestaurantStore';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface RestaurantListProps {
	// Optional override if you want to pass restaurants directly
	restaurants?: Restaurant[];
	// Show loading state externally
	showLoading?: boolean;
}

export default function RestaurantList({
	restaurants: propRestaurants,
	showLoading = false,
}: RestaurantListProps) {
	const { t } = useTranslation();
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	// Zustand stores
	const { fetchRestaurants, isLoading: storeLoading } = useRestaurantStore();
	const filters = useFilterStore((state) => state.main);

	// Use prop restaurants if provided, otherwise fetch based on filters
	const shouldFetchRestaurants = !propRestaurants;

	useEffect(() => {
		if (shouldFetchRestaurants) {
			loadRestaurants(1, false, true); // Reset to first page when filters change
		}
	}, [
		shouldFetchRestaurants,
		filters.textSearch,
		filters.cuisines,
		filters.orderBy,
		filters.orderDirection,
		filters.priceRange,
		filters.ratingRange,
		filters.tags,
		filters.timeRange,
		filters.distance,
	]);

	// Use prop restaurants if provided
	useEffect(() => {
		if (propRestaurants) {
			setRestaurants(propRestaurants);
			setHasMore(false); // Assume no pagination when restaurants are provided
		}
	}, [propRestaurants]);

	const buildApiParams = () => {
		const params: any = {
			page,
			limit: 20,
		};

		// Text search
		if (filters.textSearch.trim()) {
			params.search = filters.textSearch.trim();
		}

		// Cuisines
		if (filters.cuisines && filters.cuisines.length > 0) {
			params.cuisine_id = filters.cuisines[0]; // API might only support one cuisine
		}

		// Sorting
		switch (filters.orderBy) {
			case 'price':
				params.sortBy = 'minimum_price';
				break;
			case 'value':
				params.sortBy = 'rating'; // Value could be rating-based
				break;
			case 'distance':
				params.sortBy = 'distance';
				break;
			case 'recommended':
			default:
				params.sortBy = 'rating';
				break;
		}
		params.sortOrder = filters.orderDirection;

		// Price range
		if (filters.priceRange.min > 0) {
			params.min_price = filters.priceRange.min;
		}
		if (filters.priceRange.max < 1000) {
			params.max_price = filters.priceRange.max;
		}

		// Rating range
		if (filters.ratingRange.min > 0) {
			params.min_rating = filters.ratingRange.min;
		}

		// Tags
		if (filters.tags && filters.tags.length > 0) {
			params.tags = filters.tags;
		}

		// Distance
		if (filters.distance) {
			params.radius = filters.distance;
			// TODO: Add user location coordinates
			// params.latitude = userLatitude;
			// params.longitude = userLongitude;
		}

		return params;
	};

	const loadRestaurants = async (
		pageNumber: number = 1,
		isRefresh: boolean = false,
		resetList: boolean = false,
	) => {
		if (!shouldFetchRestaurants) return;

		try {
			if (isRefresh) {
				setRefreshing(true);
			} else if (pageNumber === 1 || resetList) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			setError(null);

			const params = { ...buildApiParams(), page: pageNumber };
			const fetchedRestaurants = await fetchRestaurants(params);

			if (pageNumber === 1 || isRefresh || resetList) {
				setRestaurants(fetchedRestaurants);
			} else {
				setRestaurants((prev) => [...prev, ...fetchedRestaurants]);
			}

			// Assume we have more if we got a full page
			setHasMore(fetchedRestaurants.length === params.limit);
			setPage(pageNumber);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load restaurants';
			setError(errorMessage);
			console.error('Error loading restaurants:', err);
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	};

	const handleRefresh = () => {
		if (shouldFetchRestaurants) {
			setPage(1);
			setHasMore(true);
			loadRestaurants(1, true);
		}
	};

	const handleLoadMore = () => {
		if (
			shouldFetchRestaurants &&
			hasMore &&
			!loadingMore &&
			!loading &&
			!storeLoading
		) {
			loadRestaurants(page + 1);
		}
	};

	const handleRetry = () => {
		setError(null);
		loadRestaurants(1, false, true);
	};

	const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
		<View style={styles.itemContainer}>
			<RestaurantCard restaurant={item} />
		</View>
	);

	const renderFooter = () => {
		if (!shouldFetchRestaurants || !hasMore)
			return <View style={styles.footer} />;

		if (loadingMore) {
			return (
				<View style={styles.loadingFooter}>
					<ActivityIndicator size="small" color={colors.primary} />
					<Text style={styles.loadingText}>{t('general.loading')}</Text>
				</View>
			);
		}

		return <View style={styles.footer} />;
	};

	const renderEmptyState = () => {
		if (loading || storeLoading || showLoading) {
			return (
				<View style={styles.emptyStateContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={styles.emptyStateText}>{t('general.loading')}</Text>
				</View>
			);
		}

		if (error) {
			return (
				<View style={styles.emptyStateContainer}>
					<Text style={styles.emptyStateTitle}>
						{t('restaurant.error.title')}
					</Text>
					<Text style={styles.emptyStateText}>{error}</Text>
					<TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
						<Text style={styles.retryButtonText}>{t('general.retry')}</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<View style={styles.emptyStateContainer}>
				<Text style={styles.emptyStateTitle}>{t('restaurants.noResults')}</Text>
				<Text style={styles.emptyStateText}>
					{t('restaurants.tryDifferentFilters')}
				</Text>
			</View>
		);
	};

	const keyExtractor = (item: Restaurant) => item.id;

	const isLoading = loading || storeLoading || showLoading;
	const showEmptyState = restaurants.length === 0 && !isLoading;

	return (
		<FlatList
			data={restaurants}
			renderItem={renderRestaurantItem}
			keyExtractor={keyExtractor}
			contentContainerStyle={[
				styles.container,
				showEmptyState && styles.emptyContainer,
			]}
			showsVerticalScrollIndicator={false}
			removeClippedSubviews={true}
			maxToRenderPerBatch={10}
			windowSize={10}
			ListFooterComponent={renderFooter}
			ListEmptyComponent={showEmptyState ? renderEmptyState : null}
			refreshControl={
				shouldFetchRestaurants ? (
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={[colors.primary]}
						tintColor={colors.primary}
					/>
				) : undefined
			}
			onEndReached={handleLoadMore}
			onEndReachedThreshold={0.1}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	emptyContainer: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	itemContainer: {
		marginBottom: 16,
	},
	footer: {
		height: 100, // Space at the bottom
	},
	loadingFooter: {
		paddingVertical: 20,
		alignItems: 'center',
		gap: 8,
	},
	loadingText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
		paddingVertical: 60,
	},
	emptyStateTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 12,
	},
	emptyStateText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	retryButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
