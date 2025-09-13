import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import RestaurantCard from '../RestaurantCard';

export type ScrollHorizontalRestaurantProps = {
	title: string;
	restaurants: Restaurant[];
	sortBy: string;
};

export default function ScrollHorizontalRestaurant({
	title,
	restaurants,
}: ScrollHorizontalRestaurantProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={{ marginLeft: 24 }}>
				<Text style={styles.title}>{t(`horizontalScroll.${title}`)}</Text>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{
					marginTop: 10,
				}}
			>
				{restaurants.map((restaurant, index) => {
					return <RestaurantCard key={index} restaurant={restaurant} />;
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'flex-start',
		width: '100%',
		marginBottom: 10,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
	},
	loadingContainer: {
		height: 120,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	errorContainer: {
		height: 80,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
		paddingHorizontal: 24,
	},
	errorText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		textAlign: 'center',
	},
});
