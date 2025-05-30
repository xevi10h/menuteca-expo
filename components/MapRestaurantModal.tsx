import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Restaurant } from './list/ScrollHorizontalResturant';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapRestaurantModalProps {
	restaurant: Restaurant | null;
	isVisible: boolean;
	onClose: () => void;
}

export default function MapRestaurantModal({
	restaurant,
	isVisible,
	onClose,
}: MapRestaurantModalProps) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const opacity = useSharedValue(0);

	React.useEffect(() => {
		if (isVisible && restaurant) {
			opacity.value = withTiming(1, { duration: 200 });
			translateY.value = withSpring(0, {
				damping: 20,
				stiffness: 90,
			});
		} else {
			opacity.value = withTiming(0, { duration: 200 });
			translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
				if (!isVisible) {
					runOnJS(onClose)();
				}
			});
		}
	}, [isVisible, restaurant]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	if (!restaurant) return null;

	return (
		<View
			style={[StyleSheet.absoluteFill, styles.container]}
			pointerEvents={isVisible ? 'auto' : 'none'}
		>
			<Animated.View style={[styles.backdrop, backdropStyle]}>
				<TouchableOpacity
					style={StyleSheet.absoluteFill}
					onPress={onClose}
					activeOpacity={1}
				/>
			</Animated.View>

			<Animated.View
				style={[styles.modal, modalStyle, { paddingBottom: insets.bottom }]}
			>
				{/* Handle */}
				<View style={styles.handle} />

				{/* Content */}
				<ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
					{/* Header Image */}
					<Image
						source={{ uri: restaurant.image }}
						style={styles.headerImage}
						resizeMode="cover"
					/>

					{/* Restaurant Info Header */}
					<View style={styles.headerInfo}>
						<View style={styles.restaurantIcon}>
							<Text style={styles.restaurantIconText}>
								{restaurant.name
									.split(' ')
									.map((word) => word[0])
									.join('')
									.slice(0, 2)}
							</Text>
						</View>
						<View style={styles.restaurantDetails}>
							<Text style={styles.restaurantName}>{restaurant.name}</Text>
							<Text style={styles.priceText}>
								{t('general.from')} {restaurant.minimumPrice}€
							</Text>
						</View>
					</View>

					{/* Information Tab */}
					<View style={styles.tabContainer}>
						<TouchableOpacity style={[styles.tab, styles.activeTab]}>
							<Text style={[styles.tabText, styles.activeTabText]}>
								{t('restaurant.information')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.tab}>
							<Text style={styles.tabText}>{t('restaurant.menu')}</Text>
						</TouchableOpacity>
					</View>

					{/* Tags */}
					<View style={styles.tagsContainer}>
						<View style={styles.tag}>
							<Text style={styles.tagText}>
								{t(`cuisinesRestaurants.${restaurant.cuisine}`)}
							</Text>
						</View>
						<View style={styles.tag}>
							<Text style={styles.tagText}>{t('restaurant.vegetarian')}</Text>
						</View>
						<View style={styles.tag}>
							<Text style={styles.tagText}>{t('restaurant.glutenFree')}</Text>
						</View>
						<View style={styles.tag}>
							<Text style={styles.tagText}>{t('restaurant.vegan')}</Text>
						</View>
					</View>

					{/* Address */}
					<View style={styles.addressContainer}>
						<Ionicons
							name="location-outline"
							size={16}
							color={colors.primary}
						/>
						<Text style={styles.addressText}>Rector Ubach 50, Barcelona</Text>
					</View>

					{/* Reviews Section */}
					<View style={styles.reviewsSection}>
						<Text style={styles.sectionTitle}>{t('restaurant.reviews')}</Text>
						<View style={styles.ratingContainer}>
							<Text style={styles.ratingText}>{restaurant.rating} / 5</Text>
							<Ionicons name="star" size={20} color="#FFD700" />
						</View>
					</View>

					{/* Bottom spacing */}
					<View style={{ height: 50 }} />
				</ScrollView>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modal: {
		backgroundColor: colors.secondary,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: SCREEN_HEIGHT * 0.8,
		minHeight: SCREEN_HEIGHT * 0.4,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: colors.tertiary,
		borderRadius: 2,
		alignSelf: 'center',
		marginTop: 10,
		marginBottom: 20,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	headerImage: {
		width: '100%',
		height: 200,
		borderRadius: 15,
		marginBottom: 20,
	},
	headerInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 20,
	},
	restaurantIcon: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	restaurantIconText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '700',
	},
	restaurantDetails: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 5,
	},
	priceText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	tabContainer: {
		flexDirection: 'row',
		marginBottom: 20,
	},
	tab: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		marginRight: 10,
		borderRadius: 15,
		backgroundColor: 'transparent',
	},
	activeTab: {
		backgroundColor: colors.primary,
	},
	tabText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.tertiary,
	},
	activeTabText: {
		color: colors.secondary,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
	},
	tag: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		marginRight: 8,
		marginBottom: 8,
	},
	tagText: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	addressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	addressText: {
		fontSize: 13,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 8,
	},
	reviewsSection: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 15,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		backgroundColor: colors.quaternary,
		borderRadius: 8,
	},
	ratingText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginRight: 8,
	},
});
