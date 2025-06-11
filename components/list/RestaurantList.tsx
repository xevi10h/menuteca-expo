import { allRestaurants } from '@/api/responses';
import RestaurantCard from '@/components/RestaurantCard';
import { useFilteredRestaurants } from '@/helpers/filterHelper';
import { useFilterStore } from '@/zustand/FilterStore';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const ITEMS_PER_PAGE = 10;

export default function RestaurantList() {
	const filters = useFilterStore((state) => state.main);

	// Use the filter helper to get filtered restaurants
	const filteredRestaurants = useFilteredRestaurants(allRestaurants, filters);

	const renderRestaurantItem = ({
		item,
	}: {
		item: (typeof allRestaurants)[0];
	}) => (
		<View style={styles.itemContainer}>
			<RestaurantCard restaurant={item} />
		</View>
	);

	const keyExtractor = (item: (typeof allRestaurants)[0]) => item.id;

	return (
		<FlatList
			data={filteredRestaurants}
			renderItem={renderRestaurantItem}
			keyExtractor={keyExtractor}
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
			// Infinite scroll setup
			onEndReachedThreshold={0.1}
			removeClippedSubviews={true}
			maxToRenderPerBatch={ITEMS_PER_PAGE}
			windowSize={10}
			// Add some padding at the bottom
			ListFooterComponent={<View style={styles.footer} />}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	itemContainer: {
		marginBottom: 16,
	},
	footer: {
		height: 100, // Space at the bottom
	},
});
