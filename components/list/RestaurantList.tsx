import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/shared/types';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

interface RestaurantListProps {
	restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
	const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
		<View style={styles.itemContainer}>
			<RestaurantCard restaurant={item} />
		</View>
	);

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
