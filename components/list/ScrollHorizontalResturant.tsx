import { RestaurantService } from '@/api/services';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
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
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const getCuisineById = useCuisineStore((state) => state.getCuisineById);

	useEffect(() => {
		const fetchRestaurants = async () => {
			setLoading(true);
			setError(null);

			try {
				const params: any = {
					limit: 10,
				};

				// Map sortBy to API parameters
				switch (sortBy) {
					case 'rating':
						params.sortBy = 'rating';
						params.sortOrder = 'desc';
						params.min_rating = 4.0; // Only show highly rated
						break;
					case 'popular':
						params.sortBy = 'rating';
						params.sortOrder = 'desc';
						break;
					case 'created_at':
					case 'newest':
						params.sortBy = 'created_at';
						params.sortOrder = 'desc';
						break;
					case 'distance':
					case 'closest':
						params.sortBy = 'distance';
						params.sortOrder = 'asc';
						// TODO: Add user location for distance sorting
						break;
					case 'recommended':
						params.sortBy = 'rating';
						params.sortOrder = 'desc';
						params.min_rating = 3.5;
						break;
					case 'alreadyTried':
						// For now, just show random restaurants
						// In the future, this could be based on user's review history
						params.sortBy = 'rating';
						params.sortOrder = 'desc';
						break;
					default:
						params.sortBy = 'created_at';
						params.sortOrder = 'desc';
				}

				const response = await RestaurantService.getAllRestaurants(params);

				if (response.success) {
					setRestaurants(response.data.data);
				} else {
					throw new Error('Failed to fetch restaurants');
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to load restaurants';
				setError(errorMessage);
				console.error(`Error fetching restaurants for ${title}:`, err);
			} finally {
				setLoading(false);
			}
		};

		fetchRestaurants();
	}, [sortBy, title]);

	const handleRestaurantPress = (restaurant_id: string) => {
		router.push(`/restaurant/${restaurant_id}`);
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={{ marginLeft: 24 }}>
					<Text style={styles.title}>{t(`horizontalScroll.${title}`)}</Text>
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.primary} />
				</View>
			</View>
		);
	}

	if (error || restaurants.length === 0) {
		return (
			<View style={styles.container}>
				<View style={{ marginLeft: 24 }}>
					<Text style={styles.title}>{t(`horizontalScroll.${title}`)}</Text>
				</View>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						{error || 'No hay restaurantes disponibles'}
					</Text>
				</View>
			</View>
		);
	}

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
					const cuisine = getCuisineById(restaurant.cuisineId);

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
									{cuisine?.name || ''}
								</Text>
								<Text
									style={{
										fontSize: 10,
										fontFamily: 'Manrope',
										fontWeight: '500',
										color: colors.primary,
									}}
								>
									{restaurant.distance ? `${restaurant.distance} km` : ''}
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
