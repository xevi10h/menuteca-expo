import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { Image, StyleSheet, Text, View } from 'react-native';

interface RestaurantBasicInformationProps {
	restaurant: Restaurant;
	color?: string;
}

export default function RestaurantBasicInformation({
	restaurant,
	color,
}: RestaurantBasicInformationProps) {
	const { t } = useTranslation();
	const colorToUse = color || colors.primary;

	return (
		<View style={styles.headerInfo}>
			<View style={styles.restaurantIcon}>
				{restaurant.profile_image ? (
					<Image
						src={restaurant.profile_image}
						style={{ width: '100%', height: '100%', borderRadius: 30 }}
						resizeMode="cover"
					/>
				) : (
					<Text style={styles.restaurantIconText}>
						{restaurant.name
							.split(' ')
							.map((word) => word[0])
							.join('')
							.slice(0, 2)}
					</Text>
				)}
			</View>
			<View style={styles.restaurantDetails}>
				<View style={{ flex: 1, width: '50%' }}>
					<Text
						style={[styles.restaurant_name, { color: colorToUse }]}
						numberOfLines={2}
					>
						{restaurant.name}
					</Text>
					{restaurant?.cuisine?.name && (
						<Text style={[styles.cuisineText, { color: colorToUse }]}>
							{restaurant.cuisine.name}
						</Text>
					)}
				</View>
				<View>
					{restaurant.rating && (
						<View style={{ alignItems: 'flex-end', marginBottom: 5 }}>
							<View style={[styles.ratingBadge, { borderColor: colorToUse }]}>
								<Text
									style={[
										styles.ratingText,
										{
											color: colorToUse,
										},
									]}
								>
									{restaurant.rating} ★
								</Text>
							</View>
						</View>
					)}
					<View
						style={{
							flexDirection: 'row',
							gap: 5,
							alignItems: 'baseline',
						}}
					>
						<Text style={[styles.priceFromText, { color: colorToUse }]}>
							{t('general.from')}
						</Text>
						<Text style={[styles.priceText, { color: colorToUse }]}>
							{restaurant.minimum_price}€
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	headerInfo: {
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'center',
		paddingHorizontal: 25,
	},
	restaurantIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	restaurantIconText: {
		color: colors.quaternary,
		fontSize: 18,
		fontFamily: fonts.bold,
	},
	restaurantDetails: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 20,
	},
	restaurant_name: {
		fontSize: 20,
		fontFamily: fonts.bold,
		color: colors.primary,
		marginBottom: 5,
	},
	cuisineText: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primary,
		marginBottom: 5,
	},
	ratingBadge: {
		borderRadius: 6,
		borderWidth: 0.5,
	},
	ratingText: {
		fontSize: 12,
		fontFamily: fonts.medium,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	priceFromText: {
		fontSize: 16,
		fontFamily: fonts.medium,
	},
	priceText: {
		fontSize: 24,
		fontFamily: fonts.semiBold,
	},
});
