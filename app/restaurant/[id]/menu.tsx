import { getMenusByRestaurantId } from '@/api/responses';
import Menu from '@/components/restaurantDetail/Menu';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function RestaurantMenuPage() {
	const { id } = useLocalSearchParams<{ id: string }>();

	const menus = getMenusByRestaurantId(id!);

	return (
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.contentContainer}
		>
			<Menu menus={menus} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		backgroundColor: 'transparent',
	},
	contentContainer: {
		paddingBottom: 100,
		paddingTop: 20,
		backgroundColor: 'transparent',
	},
});
