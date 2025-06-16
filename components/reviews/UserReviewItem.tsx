import { colors } from '@/assets/styles/colors';
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
		if (review.restaurantId) {
			router.push(`/restaurant/${review.restaurantId}`);
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
						source={{ uri: review.restaurantImage }}
						style={styles.restaurantImage}
					/>
					<View style={styles.restaurantInfo}>
						<Text style={styles.restaurantName}>{review.restaurantName}</Text>
						<Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
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
					<Ionicons
						name="chevron-forward"
						size={16}
						color={colors.primaryLight}
					/>
				</TouchableOpacity>
			)}

			{/* User Header - Solo si NO showRestaurantInfo */}
			{!showRestaurantInfo && (
				<View style={styles.userHeader}>
					<View style={styles.userInfo}>
						<Image
							source={{ uri: review.userAvatar }}
							style={styles.userAvatar}
						/>
						<View style={styles.userDetails}>
							<Text style={styles.userName}>{review.userName}</Text>
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
			{review.restaurantResponse && (
				<View style={styles.restaurantResponse}>
					<View style={styles.responseHeader}>
						<Ionicons name="storefront" size={16} color={colors.primary} />
						<Text style={styles.responseLabel}>
							{t('reviews.restaurantResponse')}
						</Text>
						<Text style={styles.responseDate}>
							{formatDate(review.restaurantResponse.date)}
						</Text>
					</View>
					<Text style={styles.responseMessage}>
						{review.restaurantResponse.message}
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
		marginBottom: 15,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.secondary,
	},
	restaurantImage: {
		width: 50,
		height: 50,
		borderRadius: 8,
		marginRight: 12,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
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
	userAvatar: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		marginRight: 12,
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 2,
	},
	reviewDate: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	ratingNumber: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	reviewComment: {
		fontSize: 15,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		lineHeight: 22,
		marginBottom: 15,
	},
	restaurantResponse: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		padding: 15,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	responseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	responseLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 1,
	},
	responseDate: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	responseMessage: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		lineHeight: 20,
	},
});
