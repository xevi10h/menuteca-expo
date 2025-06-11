import { allRestaurants, getCuisineById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
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

export type ScrollHorizontalResturantProps = {
	title: string;
	sortBy: string;
};

export default function ScrollHorizontalResturant({
	title,
	sortBy,
}: ScrollHorizontalResturantProps) {
	const { t } = useTranslation();
	const language = useUserStore((state) => state.user.language);

	const handleRestaurantPress = (restaurantId: string) => {
		router.push(`/restaurant/${restaurantId}`);
	};

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
				{allRestaurants.map((restaurant) => (
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
							source={{ uri: restaurant.mainImage }}
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
								{`${
									restaurant.cuisineId
										? getCuisineById(restaurant.cuisineId)?.name[language]
										: ''
								}`}
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
					</TouchableOpacity>
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
