import { colors } from '@/assets/styles/colors';
import StarRating from '@/components/StarRating';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ReviewPhotos from './ReviewPhotos';

interface ReviewItemProps {
	review: Review;
}

export default function ReviewItem({ review }: ReviewItemProps) {
	const { t } = useTranslation();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<View style={styles.reviewItem}>
			{/* User Header */}
			<View style={styles.reviewHeader}>
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

			{/* Review Content */}
			<Text style={styles.reviewComment}>{review.comment}</Text>

			{/* Review Photos */}
			<ReviewPhotos photos={review.photos} />

			{/* Restaurant Response */}
			{review.restaurant_response && (
				<View style={styles.restaurant_response}>
					<View style={styles.responseHeader}>
						<Ionicons name="storefront" size={16} color={colors.primary} />
						<Text style={styles.responseLabel}>
							{t('reviews.restaurant_response')}
						</Text>
						<Text style={styles.responseDate}>
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
		marginHorizontal: 16,
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
	reviewHeader: {
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
	restaurant_response: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		padding: 15,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
		marginTop: 10,
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
