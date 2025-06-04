import { getRestaurantById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import Information from '@/components/restaurantDetail/Information';
import { useTranslation } from '@/hooks/useTranslation';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { getApps } from 'react-native-map-link';

export default function RestaurantInformationPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { t } = useTranslation();
	const { showActionSheetWithOptions } = useActionSheet();

	const restaurant = getRestaurantById(id!);

	const openMapNavigation = async () => {
		const result = await getApps({
			latitude: restaurant.coordinates.latitude!,
			longitude: restaurant.coordinates.longitude!,
			title: restaurant.name,
			googleForceLatLon: false,
			alwaysIncludeGoogle: true,
			appsWhiteList: ['google-maps', 'apple-maps', 'waze'],
		});
		showActionSheetWithOptions(
			{
				options: [
					...result.map((app) => app.name),
					t('restaurant.cancelOpenMap'),
				],
				textStyle: { fontFamily: 'Manrope' },
				cancelButtonIndex: result.length,
				icons: [
					...result.map((app, index) => (
						<Image
							key={`icon-${app.name}-${index}`}
							source={app.icon}
							style={{ width: 24, height: 24 }}
						/>
					)),
					<Ionicons
						key={'icon-cancel-map'}
						name="close"
						size={24}
						color={colors.quaternary}
					/>,
				],
			},
			(buttonIndex) => {
				buttonIndex !== undefined && result[buttonIndex]?.open();
			},
		);
	};

	return (
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.contentContainer}
		>
			<Information restaurant={restaurant} onMapPress={openMapNavigation} />
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
