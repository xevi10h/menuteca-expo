import { colors } from '@/assets/styles/colors';
import StarRating from '@/components/StarRating';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
} from 'react-native-reanimated';

interface ReviewsSummaryProps {
	reviews: Review[];
	averageRating: number;
	onWriteReview: () => void | undefined;
	scrollY: Animated.SharedValue<number>;
	isCompact?: boolean;
}

export default function ReviewsSummary({
	reviews,
	averageRating,
	onWriteReview,
	scrollY,
	isCompact = false,
}: ReviewsSummaryProps) {
	const { t } = useTranslation();

	// Calculate rating distribution
	const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
		const count = reviews.filter(
			(review) => Math.floor(review.rating) === rating,
		).length;
		const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
		return { rating, count, percentage };
	});

	// Animated styles for collapsing
	const animatedStyles = useAnimatedStyle(() => {
		const scale = interpolate(
			scrollY.value,
			[0, 100, 200],
			[1, 0.9, 0.8],
			Extrapolate.CLAMP,
		);

		const opacity = interpolate(
			scrollY.value,
			[0, 150, 300],
			[1, 0.7, 0],
			Extrapolate.CLAMP,
		);

		const translateY = interpolate(
			scrollY.value,
			[0, 200],
			[0, -20],
			Extrapolate.CLAMP,
		);

		return {
			transform: [{ scale }, { translateY }],
			opacity,
		};
	});

	const compactAnimatedStyles = useAnimatedStyle(() => {
		const opacity = interpolate(
			scrollY.value,
			[200, 300, 400],
			[0, 0.8, 1],
			Extrapolate.CLAMP,
		);

		const translateY = interpolate(
			scrollY.value,
			[200, 400],
			[50, 0],
			Extrapolate.CLAMP,
		);

		return {
			opacity,
			transform: [{ translateY }],
		};
	});

	if (isCompact) {
		return (
			<Animated.View style={[styles.compactContainer, compactAnimatedStyles]}>
				<View style={styles.compactContent}>
					<View style={styles.compactRating}>
						<Text style={styles.compactRatingNumber}>
							{averageRating.toFixed(1)}
						</Text>
						<StarRating
							rating={averageRating}
							size={14}
							color={colors.primary}
							emptyColor={colors.primaryLight}
						/>
					</View>
					<Text style={styles.compactReviewCount}>
						{t('reviews.totalReviews', { count: reviews.length })}
					</Text>
				</View>
				<TouchableOpacity
					style={styles.compactWriteButton}
					onPress={onWriteReview}
				>
					<Ionicons name="create-outline" size={16} color={colors.quaternary} />
				</TouchableOpacity>
			</Animated.View>
		);
	}

	return (
		<Animated.View style={[styles.container, animatedStyles]}>
			<View style={styles.header}>
				<View style={styles.averageRating}>
					<Text style={styles.averageRatingNumber}>
						{averageRating.toFixed(1)}
					</Text>
					<View style={styles.starsAndCount}>
						<StarRating
							rating={averageRating}
							size={20}
							color={colors.primary}
							emptyColor={colors.primaryLight}
						/>
						<Text style={styles.totalReviews}>
							{t('reviews.totalReviews', { count: reviews.length })}
						</Text>
					</View>
				</View>
			</View>

			{/* Rating Distribution */}
			<View style={styles.ratingDistribution}>
				{ratingDistribution.map(({ rating, count, percentage }) => (
					<View key={rating} style={styles.ratingRow}>
						<Text style={styles.ratingLabel}>{rating}</Text>
						<Ionicons name="star" size={12} color="#FFD700" />
						<View style={styles.ratingBar}>
							<View
								style={[styles.ratingBarFill, { width: `${percentage}%` }]}
							/>
						</View>
						<Text style={styles.ratingCount}>({count})</Text>
					</View>
				))}
			</View>

			{/* Write Review Button */}
			<TouchableOpacity
				style={styles.writeReviewButton}
				onPress={onWriteReview}
			>
				<Ionicons name="create-outline" size={16} color={colors.quaternary} />
				<Text style={styles.writeReviewText}>{t('reviews.writeReview')}</Text>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		marginVertical: 16,
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	header: {
		alignItems: 'center',
		marginBottom: 20,
	},
	averageRating: {
		alignItems: 'center',
	},
	averageRatingNumber: {
		fontSize: 48,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
	},
	starsAndCount: {
		alignItems: 'center',
	},
	totalReviews: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 8,
	},
	ratingDistribution: {
		gap: 8,
		marginBottom: 20,
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	ratingLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		width: 10,
	},
	ratingBar: {
		flex: 1,
		height: 8,
		backgroundColor: colors.secondary,
		borderRadius: 4,
		overflow: 'hidden',
	},
	ratingBarFill: {
		height: '100%',
		backgroundColor: '#FFD700',
		borderRadius: 4,
	},
	ratingCount: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		width: 30,
		textAlign: 'right',
	},
	writeReviewButton: {
		backgroundColor: colors.primary,
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	writeReviewText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	// Compact styles
	compactContainer: {
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		marginBottom: 8,
		borderRadius: 12,
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	compactContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	compactRating: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	compactRatingNumber: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	compactReviewCount: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	compactWriteButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		padding: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 3,
	},
});
