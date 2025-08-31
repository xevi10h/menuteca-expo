import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { router } from 'expo-router';
import {
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const { width } = Dimensions.get('window');

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

	const handleRestaurantPress = (restaurant_id: string) => {
		router.push(`/restaurant/${restaurant_id}`);
	};

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
				{restaurants.map((restaurant) => {
					return (
						<TouchableOpacity
							key={restaurant.id}
							style={{
								marginRight: 12,
								width: width * 0.8,
								marginLeft: 24,
							}}
							onPress={() => handleRestaurantPress(restaurant.id)}
							activeOpacity={0.7}
						>
							<Image
								source={{ uri: restaurant.main_image }}
								style={{
									borderTopRightRadius: 24,
									borderTopLeftRadius: 24,
									width: '100%',
									height: 120,
								}}
								resizeMode="cover"
							/>
							{restaurant.rating && (
								<View
									style={{
										position: 'absolute',
										top: 12,
										right: 12,
										borderRadius: 6,
										borderWidth: 0.5,
										borderColor: colors.quaternary,
										backgroundColor: colors.primary,
									}}
								>
									<Text
										style={{
											fontSize: 10,
											fontFamily: 'Manrope',
											fontWeight: '500',
											color: colors.quaternary,
											paddingHorizontal: 6,
											paddingVertical: 2,
										}}
									>
										{restaurant.rating} ★
									</Text>
								</View>
							)}
							<View
								style={{
									justifyContent: 'space-between',
									flexDirection: 'row',
									alignItems: 'center',
									marginTop: 10,
								}}
							>
								<Text
									style={{
										fontSize: 12,
										fontFamily: 'Manrope',
										fontWeight: '700',
										color: colors.primary,
									}}
									numberOfLines={1}
								>
									{restaurant.name}
								</Text>
								<Text
									style={{
										fontSize: 16,
										fontFamily: 'Manrope',
										fontWeight: '700',
										color: colors.primary,
									}}
								>
									{`${t('general.from')} ${restaurant.minimum_price}€`}
								</Text>
							</View>
							<View
								style={{
									justifyContent: 'space-between',
									flexDirection: 'row',
									alignItems: 'center',
									marginTop: 5,
								}}
							>
								<Text
									style={{
										fontSize: 10,
										fontFamily: 'Manrope',
										fontWeight: '500',
										color: colors.primary,
									}}
									numberOfLines={1}
								>
									{restaurant?.cuisine?.name || ''}
								</Text>
								<Text
									style={{
										fontSize: 10,
										fontFamily: 'Manrope',
										fontWeight: '500',
										color: colors.primary,
									}}
								>
									{restaurant.distance
										? `${restaurant.distance.toFixed(2)} km`
										: ''}
								</Text>
							</View>
						</TouchableOpacity>
					);
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
