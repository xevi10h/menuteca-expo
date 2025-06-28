import { getCuisineById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
	Dimensions,
	Image,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
	const selectedCuisine = restaurant?.cuisineId
		? getCuisineById(restaurant?.cuisineId)
		: null;

	const handleClose = () => {
		opacity.value = withTiming(0, { duration: 200 });
		translateY.value = withTiming(SCREEN_HEIGHT, { duration: 400 }, () => {
			runOnJS(onClose)();
		});
	};

	useEffect(() => {
		if (isVisible && restaurant) {
			opacity.value = withTiming(1, { duration: 200 });
			translateY.value = withSpring(0, {
				damping: 20,
				stiffness: 90,
			});
		} else if (!isVisible) {
			handleClose();
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
					onPress={handleClose}
					activeOpacity={1}
				/>
			</Animated.View>

			<Animated.View
				style={[styles.modal, modalStyle, { paddingBottom: insets.bottom }]}
			>
				<View style={styles.handle}>
					<View style={styles.chevronContainer}>
						<Ionicons
							name="chevron-up-outline"
							size={20}
							color={colors.primary}
						/>
					</View>
				</View>

				{/* Content */}
				<View style={styles.content}>
					{/* Restaurant Info Header */}
					<View style={styles.headerInfo}>
						<View style={styles.restaurantIcon}>
							{restaurant.profile_image ? (
								<Image
									source={{ uri: restaurant.profile_image }}
									style={{ width: '100%', height: '100%', borderRadius: 25 }}
									resizeMode="cover"
								/>
							) : (
								<Text style={styles.restaurantIconText}>
									{restaurant.name
										.split(' ')
										.map((word) => word[0])
										.join('')
										.slice(0, 2)}
								</Text>
							)}
						</View>
						<View style={styles.restaurantDetails}>
							<View style={{ flex: 1, width: '50%' }}>
								<Text style={styles.restaurant_name}>{restaurant.name}</Text>
								{selectedCuisine?.name && (
									<Text style={styles.cuisineText}>{selectedCuisine.name}</Text>
								)}
							</View>
							<View>
								<View style={{ alignItems: 'flex-end', marginBottom: 5 }}>
									<View
										style={{
											borderRadius: 6,
											borderWidth: 0.5,
											borderColor: colors.primary,
										}}
									>
										<Text
											style={{
												fontSize: 12,
												fontFamily: 'Manrope',
												fontWeight: '500',
												color: colors.primary,
												paddingHorizontal: 6,
												paddingVertical: 2,
											}}
										>
											{restaurant.rating} ★
										</Text>
									</View>
								</View>
								<View
									style={{
										flexDirection: 'row',
										gap: 5,
										alignItems: 'baseline',
									}}
								>
									<Text style={styles.priceFromText}>{t('general.from')}</Text>
									<Text style={styles.priceText}>
										{restaurant.minimum_price}€
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
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
		height: 150,
	},
	handle: {
		width: '100%',
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chevronContainer: {
		transform: [{ scaleX: 1.5 }, { scaleY: 0.7 }],
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	headerInfo: {
		flexDirection: 'row',
		alignItems: 'center',
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
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	restaurant_name: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 5,
	},
	cuisineText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 5,
	},
	priceFromText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	priceText: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
});
