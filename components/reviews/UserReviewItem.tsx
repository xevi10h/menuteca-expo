import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import StarRating from '@/components/StarRating';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReviewPhotos from './ReviewPhotos';

interface UserReviewItemProps {
	review: Review;
	showRestaurantInfo?: boolean; // Para mostrar info del restaurante
}

export default function UserReviewItem({
	review,
	showRestaurantInfo = true,
}: UserReviewItemProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const handleRestaurantPress = () => {
		if (review.restaurant_id) {
			router.push(`/restaurant/${review.restaurant_id}`);
		}
	};

	return (
		<View style={styles.reviewItem}>
			{/* Restaurant Header - Solo si showRestaurantInfo es true */}
			{showRestaurantInfo && (
				<TouchableOpacity
					style={styles.restaurantHeader}
					onPress={handleRestaurantPress}
					activeOpacity={0.7}
				>
					<Image
						source={{ uri: review.restaurant_image }}
						style={styles.restaurant_image}
					/>
					<View style={styles.restaurantInfo}>
						<Text style={styles.restaurant_name} numberOfLines={1}>
							{review.restaurant_name}
						</Text>
						<Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
					</View>
					<View style={styles.ratingContainer}>
						<StarRating
							rating={review.rating}
							size={12}
							color={colors.primary}
							emptyColor={colors.primaryLight}
						/>
						<Text style={styles.ratingNumber}>{review.rating}</Text>
						<Ionicons
							name="chevron-forward"
							size={16}
							color={colors.primaryLight}
						/>
					</View>
				</TouchableOpacity>
			)}

			{/* User Header - Solo si NO showRestaurantInfo */}
			{!showRestaurantInfo && (
				<View style={styles.userHeader}>
					<View style={styles.userInfo}>
						<Image
							source={{ uri: review.user_avatar }}
							style={styles.user_avatar}
						/>
						<View style={styles.userDetails}>
							<Text style={styles.user_name}>{review.user_name}</Text>
							<Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
						</View>
					</View>
					<View style={styles.ratingContainer}>
						<StarRating
							rating={review.rating}
							size={16}
							color={colors.primary}
							emptyColor={colors.primaryLight}
						/>
						<Text style={styles.ratingNumber}>{review.rating}</Text>
					</View>
				</View>
			)}

			{/* Review Content */}
			<Text style={styles.reviewComment}>{review.comment}</Text>

			{/* Review Photos */}
			<ReviewPhotos photos={review.photos} />

			{/* Restaurant Response */}
			{review.restaurant_response && (
				<View style={styles.restaurant_response}>
					<View style={styles.responseHeader}>
						<Ionicons name="storefront" size={16} color={colors.primary} />
						<Text style={styles.responseLabel} numberOfLines={1}>
							{t('reviews.restaurant_response')}
						</Text>
						<Text style={styles.responseDate} numberOfLines={1}>
							{formatDate(review.restaurant_response.date)}
						</Text>
					</View>
					<Text style={styles.responseMessage}>
						{review.restaurant_response.message}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	reviewItem: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	restaurantHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.secondary,
		gap: 10,
	},
	restaurant_image: {
		width: 50,
		height: 50,
		borderRadius: 8,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurant_name: {
		fontSize: 14,

		fontFamily: fonts.semiBold,
		color: colors.primary,
		marginBottom: 2,
	},
	userHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	user_avatar: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		marginRight: 12,
	},
	userDetails: {
		flex: 1,
	},
	user_name: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		marginBottom: 2,
	},
	reviewDate: {
		fontSize: 12,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	ratingNumber: {
		fontSize: 12,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	reviewComment: {
		fontSize: 12,
		fontFamily: fonts.regular,
		color: colors.primary,
		lineHeight: 22,
	},
	restaurant_response: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		padding: 15,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
		marginTop: 15,
	},
	responseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	responseLabel: {
		fontSize: 12,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		flex: 1,
	},
	responseDate: {
		fontSize: 8,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
	},
	responseMessage: {
		fontSize: 10,
		fontFamily: fonts.regular,
		color: colors.primary,
		lineHeight: 20,
	},
});
