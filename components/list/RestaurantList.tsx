import { colors } from '@/assets/styles/colors';
import RestaurantCard from '@/components/RestaurantCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import React from 'react';
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from 'react-native';

interface RestaurantListProps {
	restaurants: Restaurant[];
	onLoadMore?: () => void;
	hasMore?: boolean;
	loadingMore?: boolean;
}

export default function RestaurantList({
	restaurants,
	onLoadMore,
	hasMore = false,
	loadingMore = false,
}: RestaurantListProps) {
	const { t } = useTranslation();

	const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
		<View style={styles.itemContainer}>
			<RestaurantCard restaurant={item} />
		</View>
	);

	const renderFooter = () => {
		if (!loadingMore) return <View style={styles.footer} />;

		return (
			<View style={styles.loadingFooter}>
				<ActivityIndicator size="small" color={colors.primary} />
				<Text style={styles.loadingText}>{t('general.loading')}</Text>
			</View>
		);
	};

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyTitle}>{t('restaurants.noResults')}</Text>
			<Text style={styles.emptySubtitle}>
				{t('restaurants.noResultsSubtitle')}
			</Text>
		</View>
	);

	const handleEndReached = () => {
		if (onLoadMore && hasMore && !loadingMore) {
			onLoadMore();
		}
	};

	const keyExtractor = (item: Restaurant) => item.id;

	return (
		<FlatList
			data={restaurants}
			renderItem={renderRestaurantItem}
			keyExtractor={keyExtractor}
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
			removeClippedSubviews={true}
			maxToRenderPerBatch={10}
			windowSize={10}
			ListFooterComponent={renderFooter}
			ListEmptyComponent={renderEmpty}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.3}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		paddingTop: 10,
		flexGrow: 1,
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
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
	},
	loadingText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 10,
	},
	emptySubtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 24,
	},
});
