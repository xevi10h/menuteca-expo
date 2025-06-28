import { mockUserReviews } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import SortButton from '@/components/reviews/SortButton';
import UserReviewItem from '@/components/reviews/UserReviewItem';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function UserReviewsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const user = useUserStore((state) => state.user);

	const [currentSort, setCurrentSort] = useState<SortOption>('newest');
	const [reviews] = useState<Review[]>(mockUserReviews);

	// Calculate average rating
	const averageRating = useMemo(() => {
		if (reviews.length === 0) return 0;
		return (
			reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		);
	}, [reviews]);

	// Ordenar reseñas
	const sortedReviews = useMemo(() => {
		const reviewsCopy = [...reviews];

		switch (currentSort) {
			case 'newest':
				return reviewsCopy.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
			case 'oldest':
				return reviewsCopy.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				);
			case 'highest':
				return reviewsCopy.sort((a, b) => b.rating - a.rating);
			case 'lowest':
				return reviewsCopy.sort((a, b) => a.rating - b.rating);
			default:
				return reviewsCopy;
		}
	}, [reviews, currentSort]);

	const getSortOptions = (): {
		option: SortOption;
		label: string;
		icon?: keyof typeof Ionicons.glyphMap;
	}[] => [
		{ option: 'newest', label: t('reviews.newest'), icon: 'time-outline' },
		{
			option: 'highest',
			label: t('reviews.highest'),
			icon: 'trending-up-outline',
		},
		{
			option: 'lowest',
			label: t('reviews.lowest'),
			icon: 'trending-down-outline',
		},
		{ option: 'oldest', label: t('reviews.oldest'), icon: 'hourglass-outline' },
	];

	const handleBack = () => {
		router.back();
	};

	const renderUserInfo = () => {
		const renderProfilePhoto = () => {
			if (user.photo) {
				return (
					<Image source={{ uri: user.photo }} style={styles.user_avatar} />
				);
			} else {
				const initial = user.username
					? user.username.charAt(0).toUpperCase()
					: 'U';
				return (
					<View style={styles.userAvatarPlaceholder}>
						<Text style={styles.userAvatarText}>{initial}</Text>
					</View>
				);
			}
		};

		return (
			<View style={styles.userInfoContainer}>
				{renderProfilePhoto()}
				<View style={styles.userDetails}>
					<Text style={styles.user_name}>{user.name || user.username}</Text>
					<Text style={styles.userEmail}>{user.email}</Text>
				</View>
			</View>
		);
	};

	const renderReviewItem = ({ item }: { item: Review }) => (
		<UserReviewItem review={item} showRestaurantInfo={true} />
	);

	const renderHeader = () => (
		<View style={styles.headerContent}>
			{/* User Info */}
			{renderUserInfo()}

			{/* Stats */}
			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{reviews.length}</Text>
					<Text style={styles.statLabel}>
						{t('reviews.totalReviews', {
							count: reviews.length,
						})}
					</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
					<Text style={styles.statLabel}>{t('profile.averageRating')}</Text>
				</View>
			</View>

			{/* Sort Options */}
			<View style={styles.sortContainer}>
				<Text style={styles.sortLabel}>{t('filters.sortBy')}:</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.sortButtons}
				>
					{getSortOptions().map(({ option, label, icon }) => (
						<SortButton
							key={option}
							label={label}
							isActive={currentSort === option}
							onPress={() => setCurrentSort(option)}
							icon={icon}
						/>
					))}
				</ScrollView>
			</View>
		</View>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Ionicons
				name="chatbubble-outline"
				size={64}
				color={colors.primaryLight}
			/>
			<Text style={styles.emptyStateTitle}>{t('profile.noReviewsYet')}</Text>
			<Text style={styles.emptyStateSubtitle}>
				{t('profile.startReviewing')}
			</Text>
		</View>
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('profile.myReviews')}</Text>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<View style={styles.headerSpacer} />
			</View>

			{/* Content */}
			{reviews.length > 0 ? (
				<FlatList
					data={sortedReviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					ListHeaderComponent={renderHeader}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
				/>
			) : (
				<>
					{renderHeader()}
					{renderEmptyState()}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
		marginHorizontal: -20,
	},
	backButton: {
		alignItems: 'flex-start',
		width: 40,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		position: 'absolute',
		left: 0,
		right: 0,
	},
	headerSpacer: {
		width: 40,
	},
	headerContent: {
		paddingBottom: 16,
		borderBottomColor: colors.primaryLight,
	},
	userInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 20,
		backgroundColor: colors.quaternary,
		marginHorizontal: 16,
		marginVertical: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	user_avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 16,
	},
	userAvatarPlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	userAvatarText: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	userDetails: {
		flex: 1,
	},
	user_name: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 2,
	},
	userEmail: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
	},
	statLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 4,
	},
	sortContainer: {
		marginBottom: 8,
	},
	sortLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 12,
	},
	sortButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	listContent: {
		paddingBottom: 20,
	},
	separator: {
		height: 12,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyStateTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyStateSubtitle: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
	},
});
