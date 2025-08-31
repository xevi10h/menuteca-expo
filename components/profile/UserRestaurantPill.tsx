import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserRestaurantPillProps {
	restaurant: Restaurant;
}

export default function UserRestaurantPill({
	restaurant,
}: UserRestaurantPillProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const user_id = useUserStore((state) => state.user.id);

	// El status se puede obtener directamente del restaurant object
	const status = {
		isActive: restaurant.is_active || false,
	};

	const handlePreview = () => {
		router.push(`/profile/${user_id}/restaurant/${restaurant.id}/preview`);
	};

	const handleEdit = () => {
		router.push(`/profile/${user_id}/restaurant/${restaurant.id}/edit`);
	};

	const renderRestaurantImage = () => {
		if (restaurant.profile_image) {
			return (
				<Image
					source={{ uri: restaurant.profile_image }}
					style={styles.restaurant_image}
				/>
			);
		} else {
			const initial = restaurant.name.charAt(0).toUpperCase();
			return (
				<View style={styles.restaurantImagePlaceholder}>
					<Text style={styles.restaurantImageText}>{initial}</Text>
				</View>
			);
		}
	};

	const formatCity = (address: any): string => {
		if (typeof address === 'string') {
			return address; // Fallback para direcciones string
		}
		return address?.city || '';
	};

	return (
		<View style={styles.container}>
			{/* Restaurant Image */}
			<View style={styles.imageContainer}>{renderRestaurantImage()}</View>

			{/* Restaurant Info */}
			<View style={styles.infoContainer}>
				<View style={styles.headerRow}>
					<Text style={styles.restaurant_name} numberOfLines={1}>
						{restaurant.name}
					</Text>
					<View style={styles.statusContainer}>
						<View
							style={[
								styles.statusDot,
								{ backgroundColor: status.isActive ? '#10B981' : '#EF4444' },
							]}
						/>
						<Text
							style={[
								styles.statusText,
								{ color: status.isActive ? '#10B981' : '#EF4444' },
							]}
						>
							{status.isActive ? t('profile.active') : t('profile.inactive')}
						</Text>
					</View>
				</View>

				<View style={styles.detailsRow}>
					{restaurant.cuisine && (
						<Text style={styles.cuisineText} numberOfLines={1}>
							{restaurant.cuisine.name}
						</Text>
					)}
					<Text style={styles.priceText}>
						{t('general.from')} {restaurant.minimum_price.toFixed(2)}€
					</Text>
				</View>

				{restaurant.rating && (
					<View style={styles.ratingRow}>
						<Ionicons name="star" size={14} color="#FFD700" />
						<Text style={styles.ratingText}>{restaurant.rating}</Text>
						<Text style={styles.addressText} numberOfLines={1}>
							• {formatCity(restaurant.address)}
						</Text>
					</View>
				)}
			</View>

			{/* Action Buttons */}
			<View style={styles.actionsContainer}>
				<TouchableOpacity
					style={[styles.actionButton, styles.previewButton]}
					onPress={handlePreview}
				>
					<Ionicons name="eye-outline" size={16} color={colors.primary} />
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.actionButton, styles.editButton]}
					onPress={handleEdit}
				>
					<Ionicons name="pencil-outline" size={16} color={colors.quaternary} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	imageContainer: {
		marginRight: 12,
	},
	restaurant_image: {
		width: 50,
		height: 50,
		borderRadius: 12,
	},
	restaurantImagePlaceholder: {
		width: 50,
		height: 50,
		borderRadius: 12,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	restaurantImageText: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	infoContainer: {
		flex: 1,
		marginRight: 12,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	restaurant_name: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 1,
		marginRight: 8,
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	statusText: {
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	detailsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	cuisineText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		flex: 1,
		marginRight: 8,
	},
	priceText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	ratingText: {
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	addressText: {
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		flex: 1,
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	previewButton: {
		backgroundColor: colors.secondary,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	editButton: {
		backgroundColor: colors.primary,
	},
});
