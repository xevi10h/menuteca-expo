import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RestaurantCardProps {
	restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
	const { t, locale } = useTranslation();
	const router = useRouter();

	// Helper function to get translated name
	const getTranslatedName = (
		nameObj: string | { [key: string]: string },
	): string => {
		if (typeof nameObj === 'string') {
			return nameObj;
		}

		if (typeof nameObj === 'object' && nameObj !== null) {
			// Try current locale first
			if (nameObj[locale]) {
				return nameObj[locale];
			}

			// Fallback to Spanish
			if (nameObj['es_ES']) {
				return nameObj['es_ES'];
			}

			// Fallback to English
			if (nameObj['en_US']) {
				return nameObj['en_US'];
			}

			// Fallback to any available language
			const availableKeys = Object.keys(nameObj);
			if (availableKeys.length > 0) {
				return nameObj[availableKeys[0]];
			}
		}

		return 'Unknown';
	};

	const handlePress = () => {
		router.push(`/restaurant/${restaurant.id}`);
	};

	const formatDistance = (distance: number): string => {
		if (distance < 1) {
			return `${Math.round(distance * 1000)}m`;
		}
		return `${distance.toFixed(1)}km`;
	};

	const renderStars = (rating: number) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;

		for (let i = 0; i < fullStars; i++) {
			stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
		}

		if (hasHalfStar) {
			stars.push(
				<Ionicons key="half" name="star-half" size={12} color="#FFD700" />,
			);
		}

		const emptyStars = 5 - Math.ceil(rating);
		for (let i = 0; i < emptyStars; i++) {
			stars.push(
				<Ionicons
					key={`empty-${i}`}
					name="star-outline"
					size={12}
					color="#FFD700"
				/>,
			);
		}

		return stars;
	};

	return (
		<TouchableOpacity style={styles.container} onPress={handlePress}>
			{/* Restaurant Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: restaurant.main_image }}
					style={styles.image}
					resizeMode="cover"
				/>
				{/* Distance Badge */}
				{restaurant.distance > 0 && (
					<View style={styles.distanceBadge}>
						<Text style={styles.distanceText}>
							{formatDistance(restaurant.distance)}
						</Text>
					</View>
				)}
			</View>

			{/* Restaurant Info */}
			<View style={styles.infoContainer}>
				<Text style={styles.name} numberOfLines={1}>
					{restaurant.name}
				</Text>

				{restaurant.cuisine && (
					<Text style={styles.cuisine} numberOfLines={1}>
						{getTranslatedName(restaurant.cuisine.name)}
					</Text>
				)}

				{/* Rating and Price Row */}
				<View style={styles.bottomRow}>
					{restaurant.rating && restaurant.rating > 0 ? (
						<View style={styles.ratingContainer}>
							<View style={styles.starsContainer}>
								{renderStars(restaurant.rating)}
							</View>
							<Text style={styles.ratingText}>
								{restaurant.rating.toFixed(1)}
							</Text>
						</View>
					) : (
						<Text style={styles.noRatingText}>{t('restaurant.noRating')}</Text>
					)}

					<View style={styles.priceContainer}>
						<Text style={styles.priceText}>
							{t('restaurant.from')} {restaurant.minimum_price}€
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		marginBottom: 16,
		overflow: 'hidden',
	},
	imageContainer: {
		position: 'relative',
		height: 160,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	distanceBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	distanceText: {
		color: colors.quaternary,
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	infoContainer: {
		padding: 16,
	},
	name: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 4,
	},
	cuisine: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		marginBottom: 12,
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	starsContainer: {
		flexDirection: 'row',
		gap: 1,
	},
	ratingText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	noRatingText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	priceContainer: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	priceText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
