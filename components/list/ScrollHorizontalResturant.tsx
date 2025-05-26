import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ScrollHorizontalResturantProps = {
	title: string;
	sortBy: string;
};

export type Restaurant = {
	id: number;
	name: string;
	minimumPrice: number;
	cuisine: string;
	rating: number;
	image: string;
	distance: number;
};

export default function ScrollHorizontalResturant({
	title,
	sortBy,
}: ScrollHorizontalResturantProps) {
	const restaurants: Restaurant[] = [
		{
			id: 1,
			name: 'Sant Francesc Restaurant',
			minimumPrice: 15,
			cuisine: 'mediterranean',
			rating: 4.5,
			image:
				'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			distance: 2.5,
		},
		{
			id: 2,
			name: 'Tika Tacos',
			minimumPrice: 12,
			cuisine: 'mexican',
			rating: 4.0,
			image:
				'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			distance: 3.0,
		},
		{
			id: 3,
			name: 'El gran sol',
			minimumPrice: 10,
			cuisine: 'chinese',
			rating: 4.8,
			image:
				'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
			distance: 1.5,
		},
	];
	const { t } = useTranslation();
	return (
		<View style={styles.container}>
			<View style={{ marginLeft: 24 }}>
				<Text
					style={{ fontSize: 24, fontFamily: 'Manrope', fontWeight: '700' }}
				>
					{t(`horizontalScroll.${title}`)}
				</Text>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{
					marginTop: 10,
				}}
			>
				{restaurants.map((restaurant) => (
					<View
						key={restaurant.id}
						style={{
							marginRight: 12,
							width: 345,
							marginLeft: 24,
						}}
					>
						<Image
							source={{ uri: restaurant.image }}
							style={{
								borderTopRightRadius: 24,
								borderTopLeftRadius: 24,
								width: '100%',
								height: 120,
							}}
							resizeMode="cover"
						/>
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
								{`${t('general.from')} ${restaurant.minimumPrice}€`}
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
							>
								{t(`cuisinesRestaurants.${restaurant.cuisine}`)}
							</Text>
							<Text
								style={{
									fontSize: 10,
									fontFamily: 'Manrope',
									fontWeight: '500',
									color: colors.primary,
								}}
							>
								{`${restaurant.distance} km`}
							</Text>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'flex-start',
		width: '100%',
		marginTop: 10,
	},
});
