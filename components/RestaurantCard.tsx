import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RestaurantCardProps {
	restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const handlePress = () => {
		router.push(`/restaurant/${restaurant.id}`);
	};

	return (
		<TouchableOpacity
			style={styles.card}
			onPress={handlePress}
			activeOpacity={0.8}
		>
			<Image
				source={{ uri: restaurant.main_image }}
				style={styles.image}
				resizeMode="cover"
			/>

			{/* Rating badge */}
			{restaurant.rating && (
				<View style={styles.ratingBadge}>
					<Text style={styles.ratingText}>{restaurant.rating} ★</Text>
				</View>
			)}

			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.name} numberOfLines={1}>
						{restaurant.name}
					</Text>
					<Text style={styles.price}>
						{t('general.from')} {restaurant.minimum_price}€
					</Text>
				</View>

				<View style={styles.details}>
					{restaurant.cuisine.name && (
						<Text style={styles.cuisine} numberOfLines={1}>
							{restaurant.cuisine.name}
						</Text>
					)}
					<Text style={styles.distance}>{restaurant.distance} km</Text>
				</View>

				{/* Tags preview (show first 2-3 tags) */}
				{restaurant.tags && restaurant.tags.length > 0 && (
					<View style={styles.tagsContainer}>
						{restaurant.tags.slice(0, 3).map((tag) => (
							<View key={tag} style={styles.tag}>
								<Text style={styles.tagText}>{t(`restaurantTags.${tag}`)}</Text>
							</View>
						))}
						{restaurant.tags.length > 3 && (
							<View style={styles.tag}>
								<Text style={styles.tagText}>
									+{restaurant.tags.length - 3}
								</Text>
							</View>
						)}
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		marginBottom: 16,
	},
	image: {
		width: '100%',
		height: 140,
		backgroundColor: colors.secondary,
	},
	ratingBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
		borderWidth: 1,
		borderColor: colors.quaternary,
	},
	ratingText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	content: {
		padding: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	name: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		flex: 1,
		marginRight: 12,
	},
	price: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flexShrink: 0,
	},
	details: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	cuisine: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		flex: 1,
		marginRight: 12,
	},
	distance: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		flexShrink: 0,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	tag: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	tagText: {
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
