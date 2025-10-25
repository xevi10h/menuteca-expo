import { ReviewService } from '@/api';
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import AddReviewModal from '@/components/AddReviewModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
	generateRestaurantDeepLink,
	generateRestaurantShareMessage,
	getDeviceLanguage,
} from '@/shared/functions/utils';
import { Restaurant, Review } from '@/shared/types';
import { useMenuStore } from '@/zustand/MenuStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Dimensions,
	Image,
	ImageBackground,
	Share,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { getApps } from 'react-native-map-link';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RestaurantBasicInformation from './RestaurantBasicInformation';
import Information from './restaurantDetail/Information';
import Menu from './restaurantDetail/Menu';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabMeasurements {
	information: { x: number; width: number };
	menu: { x: number; width: number };
}

interface ExpandableMapRestaurantModalProps {
	restaurant: Restaurant;
	isVisible: boolean;
	onClose: () => void;
}

export default function ExpandableMapRestaurantModal({
	restaurant,
	isVisible,
	onClose,
}: ExpandableMapRestaurantModalProps) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { showActionSheetWithOptions } = useActionSheet();

	// Animation values
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const opacity = useSharedValue(0);
	const modalHeight = useSharedValue(150); // Initial collapsed height
	const isExpanded = useSharedValue(false);

	// Menu store for caching
	const {
		fetchRestaurantMenus,
		getMenusByRestaurantId,
		isLoading: menusLoading,
	} = useMenuStore();
	const [menus, setMenus] = useState(restaurant?.menus || []);

	// Estado para las pestañas
	const [activeTab, setActiveTab] = useState<'information' | 'menu'>(
		'information',
	);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [showAddReviewModal, setShowAddReviewModal] = useState(false);
	const [userReview, setUserReview] = useState<any>(null);
	const [checkingUserReview, setCheckingUserReview] = useState(true);

	// Estado para almacenar las medidas de los tabs
	const [tabMeasurements, setTabMeasurements] = useState<TabMeasurements>({
		information: { x: 0, width: 0 },
		menu: { x: 0, width: 0 },
	});

	// Animated values
	const translateX = useSharedValue(0);
	const tabIndicatorX = useSharedValue(0);
	const tabIndicatorWidth = useSharedValue(0);

	// Memoized function to load menus
	const loadMenusForRestaurant = useCallback(
		async (restaurantId: string) => {
			// First check if we have cached menus
			const cachedMenus = getMenusByRestaurantId(restaurantId);

			if (cachedMenus) {
				setMenus(cachedMenus);
			} else {
				// If restaurant already has menus, use them while fetching fresh data
				if (restaurant.menus && restaurant.menus.length > 0) {
					setMenus(restaurant.menus);
				}

				// Fetch fresh menu data

				try {
					const fetchedMenus = await fetchRestaurantMenus(restaurantId);
					setMenus(fetchedMenus);
				} catch (error) {
					console.error('❌ Error fetching menus:', error);
				}
			}
		},
		[getMenusByRestaurantId, fetchRestaurantMenus, restaurant.menus],
	);

	// Load menus when restaurant changes or modal becomes visible
	useEffect(() => {
		if (restaurant?.id && isVisible) {
			loadMenusForRestaurant(restaurant.id);
			checkUserReview(restaurant.id);
		} else {
		}
	}, [restaurant?.id, isVisible, loadMenusForRestaurant]);

	// Check if user has already reviewed this restaurant
	const checkUserReview = async (restaurantId: string) => {
		try {
			setCheckingUserReview(true);
			const response = await ReviewService.getUserReviewForRestaurant(
				restaurantId,
			);
			if (response.success) {
				setUserReview(response.data);
			}
		} catch (error) {
			console.error('Error checking user review:', error);
		} finally {
			setCheckingUserReview(false);
		}
	};

	// Additional effect that runs on mount to ensure we catch the loading
	useEffect(() => {
		// Force load if conditions are met
		if (restaurant?.id && isVisible) {
			loadMenusForRestaurant(restaurant.id);
		}
	}, []);

	const informationComponent = useMemo(
		() => (
			<Information
				restaurant={restaurant}
				onMapPress={openMapNavigation}
				userReview={userReview}
				checkingUserReview={checkingUserReview}
			/>
		),
		[restaurant, userReview, checkingUserReview],
	);

	const menuComponent = useMemo(() => <Menu menus={menus} />, [menus]);

	const handleClose = () => {
		opacity.value = withTiming(0, { duration: 200 });
		translateY.value = withTiming(SCREEN_HEIGHT, { duration: 400 }, () => {
			runOnJS(onClose)();
		});
		modalHeight.value = 150;
		isExpanded.value = false;
	};

	const expandModal = () => {
		isExpanded.value = true;
		modalHeight.value = withSpring(SCREEN_HEIGHT - insets.top, {
			damping: 20,
			stiffness: 90,
		});
	};

	const collapseModal = () => {
		isExpanded.value = false;
		modalHeight.value = withSpring(150, {
			damping: 20,
			stiffness: 90,
		});
	};

	const handleAddReview = (newReview: Omit<Review, 'id' | 'date'>) => {
		// En una app real, aquí enviarías la review a tu backend
		console.log('New review added from map modal:', newReview);
		setShowAddReviewModal(false);
		// Update user review state so button changes to "already reviewed"
		setUserReview(newReview);
	};

	// Pan gesture for expanding/collapsing
	const panGesture = Gesture.Pan()
		.onStart(() => {
			// Store initial state
		})
		.onUpdate((event) => {
			if (!isExpanded.value && event.translationY < -50) {
				// Expanding gesture
				const progress = Math.abs(event.translationY) / 200;
				const newHeight =
					150 + progress * (SCREEN_HEIGHT - insets.top - 50 - 150);
				modalHeight.value = Math.min(
					newHeight,
					SCREEN_HEIGHT - insets.top - 50,
				);
			} else if (isExpanded.value && event.translationY > 50) {
				// Collapsing gesture
				const progress = event.translationY / 200;
				const newHeight =
					SCREEN_HEIGHT -
					insets.top -
					50 -
					progress * (SCREEN_HEIGHT - insets.top - 50 - 150);
				modalHeight.value = Math.max(newHeight, 150);
			}
		})
		.onEnd((event) => {
			if (!isExpanded.value && event.translationY < -50) {
				runOnJS(expandModal)();
			} else if (isExpanded.value && event.translationY > 50) {
				runOnJS(collapseModal)();
			} else {
				// Snap back to current state
				if (isExpanded.value) {
					modalHeight.value = withSpring(SCREEN_HEIGHT - insets.top - 50);
				} else {
					modalHeight.value = withSpring(150);
				}
			}
		});

	const handleTabLayout = (tab: 'information' | 'menu', event: any) => {
		const { width } = event.nativeEvent.layout;
		const tabIndicator = tab === 'information' ? -(width / 2) : width / 2 + 42;

		setTabMeasurements((prev) => {
			const newMeasurements = {
				...prev,
				[tab]: { x: tabIndicator, width: width * 0.8 },
			};

			if (
				tab === activeTab &&
				(tabIndicatorWidth.value === 0 || tabIndicatorX.value === 0)
			) {
				tabIndicatorX.value = tabIndicator;
				tabIndicatorWidth.value = width * 0.8;
			}

			return newMeasurements;
		});
	};

	const openMapNavigation = async () => {
		if (!restaurant) return;

		const result = await getApps({
			latitude: restaurant.address.coordinates.latitude!,
			longitude: restaurant.address.coordinates.longitude!,
			title: restaurant.name,
			googleForceLatLon: false,
			alwaysIncludeGoogle: true,
			appsWhiteList: ['google-maps', 'apple-maps', 'waze'],
		});

		showActionSheetWithOptions(
			{
				options: [
					...result.map((app) => app.name),
					t('restaurant.cancelOpenMap'),
				],
				cancelButtonIndex: result.length,
				icons: [
					...result.map((app, index) => (
						<Image
							key={`icon-${app.name}-${index}`}
							source={app.icon}
							style={{ width: 24, height: 24 }}
						/>
					)),
					<Ionicons
						key={'icon-cancel-map'}
						name="close"
						size={24}
						color={colors.quaternary}
					/>,
				],
			},
			(buttonIndex) => {
				buttonIndex !== undefined && result[buttonIndex]?.open();
			},
		);
	};

	const handleShareRestaurant = async () => {
		if (!restaurant) return;

		try {
			const deepLink = generateRestaurantDeepLink(restaurant.id);
			const language = getDeviceLanguage();
			const message = generateRestaurantShareMessage(
				restaurant.name,
				deepLink,
				language,
			);

			const result = await Share.share({
				message,
				url: deepLink, // For iOS
			});

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// Shared with activity type
					console.log('Shared with activity type:', result.activityType);
				} else {
					// Shared
					console.log('Restaurant shared successfully');
				}
			} else if (result.action === Share.dismissedAction) {
				// Dismissed
				console.log('Share dismissed');
			}
		} catch (error) {
			console.error('Error sharing restaurant:', error);
			Alert.alert(
				t('restaurant.error.title'),
				t('restaurant.error.shareError'),
			);
		}
	};

	const handleTabChange = (tab: 'information' | 'menu') => {
		if (tab === activeTab || isTransitioning) return;

		setIsTransitioning(true);

		const targetX = tab === 'information' ? 0 : -SCREEN_WIDTH;

		const currentTabMeasurement = tabMeasurements[tab];
		if (currentTabMeasurement.width > 0) {
			tabIndicatorX.value = withTiming(currentTabMeasurement.x, {
				duration: 300,
			});
			tabIndicatorWidth.value = withTiming(currentTabMeasurement.width, {
				duration: 300,
			});
		}

		translateX.value = withTiming(targetX, { duration: 300 }, () => {
			runOnJS(setIsTransitioning)(false);
		});

		setActiveTab(tab);
	};

	// Animated styles
	const contentAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	const tabIndicatorStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: tabIndicatorX.value }],
			width: tabIndicatorWidth.value,
		};
	});

	useEffect(() => {
		console.log('🎭 MODAL ANIMATION EFFECT - isVisible/restaurant changed:', {
			isVisible,
			restaurantId: restaurant?.id,
			restaurantName: restaurant?.name,
			timestamp: new Date().toISOString(),
		});

		if (isVisible && restaurant) {
			console.log('🎭 Modal opening animation started');
			opacity.value = withTiming(1, { duration: 200 });
			translateY.value = withSpring(0, {
				damping: 20,
				stiffness: 90,
			});
			modalHeight.value = 150;
			isExpanded.value = false;
			handleTabChange('information');
		} else if (!isVisible) {
			console.log('🎭 Modal closing');
			// Reset user review state when closing modal
			setUserReview(null);
			setCheckingUserReview(true);
			handleClose();
		}
	}, [isVisible, restaurant]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		height: modalHeight.value,
	}));

	const headerImageStyle = useAnimatedStyle(() => ({
		opacity: isExpanded.value
			? withTiming(1, { duration: 300 })
			: withTiming(0, { duration: 300 }),
		height: isExpanded.value
			? withTiming(200 + insets.top, { duration: 300 })
			: withTiming(0, { duration: 300 }),
	}));

	const collapsedContentStyle = useAnimatedStyle(() => ({
		opacity: isExpanded.value
			? withTiming(0, { duration: 200 })
			: withTiming(1, { duration: 200 }),
		display: isExpanded.value ? 'none' : 'flex',
	}));

	const expandedContentStyle = useAnimatedStyle(() => ({
		opacity: isExpanded.value
			? withTiming(1, { duration: 300 })
			: withTiming(0, { duration: 200 }),
		display: isExpanded.value ? 'flex' : 'none',
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

			<GestureDetector gesture={panGesture}>
				<Animated.View style={[styles.modal, modalStyle]}>
					{/* Header Image - Only visible when expanded */}
					<Animated.View
						style={[styles.headerImageContainer, headerImageStyle]}
					>
						<Image
							source={{ uri: restaurant.images[0] }}
							style={[styles.headerImage, { height: 200 + insets.top }]}
							resizeMode="cover"
						/>
						<View style={styles.imageOverlay} />

						{/* Back Button */}
						<TouchableOpacity
							style={[styles.backButton, { top: insets.top - 20 }]}
							onPress={handleClose}
						>
							<Ionicons
								name="chevron-down"
								size={24}
								color={colors.quaternary}
							/>
						</TouchableOpacity>

						{/* Share Button */}
						<TouchableOpacity
							style={[styles.shareButton, { top: insets.top - 20 }]}
							onPress={handleShareRestaurant}
						>
							<Ionicons
								name="share-outline"
								size={24}
								color={colors.quaternary}
							/>
						</TouchableOpacity>

						<View
							style={{
								position: 'absolute',
								bottom: 50,
								width: '100%',
							}}
						>
							<RestaurantBasicInformation
								restaurant={restaurant}
								color={colors.quaternary}
							/>
						</View>
					</Animated.View>

					{/* Handle */}
					<View style={styles.handle}>
						<View style={styles.chevronContainer}>
							<Ionicons
								name="chevron-up-outline"
								size={20}
								color={colors.primary}
							/>
						</View>
					</View>

					{/* Collapsed Content */}
					<Animated.View
						style={[styles.collapsedContent, collapsedContentStyle]}
					>
						<TouchableOpacity style={styles.content} onPress={expandModal}>
							<RestaurantBasicInformation
								restaurant={restaurant}
								color={colors.primary}
							/>
						</TouchableOpacity>
					</Animated.View>

					{/* Expanded Content */}
					<Animated.View style={[styles.expandedContent, expandedContentStyle]}>
						<ImageBackground
							source={require('@/assets/images/background_food.png')}
							style={styles.contentBackground}
							imageStyle={styles.backgroundImage}
						>
							{/* Tab Container */}
							<View style={styles.tabContainer}>
								<TouchableOpacity
									onPress={() => handleTabChange('information')}
									disabled={isTransitioning}
									onLayout={(event) => handleTabLayout('information', event)}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'information' && styles.activeTabText,
										]}
									>
										{t('restaurant.information')}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleTabChange('menu')}
									disabled={isTransitioning}
									onLayout={(event) => handleTabLayout('menu', event)}
								>
									<Text
										style={[
											styles.tabText,
											activeTab === 'menu' && styles.activeTabText,
										]}
									>
										{t('restaurant.menu')}
									</Text>
								</TouchableOpacity>

								{/* Animated tab indicator */}
								<Animated.View
									style={[styles.tabIndicator, tabIndicatorStyle]}
								/>
							</View>

							{/* Animated Content Container */}
							<View style={styles.animatedContentContainer}>
								<Animated.View
									style={[styles.slidingContent, contentAnimatedStyle]}
								>
									{/* Information Tab Content with its own ScrollView */}
									<View style={styles.tabContent}>
										<Animated.ScrollView
											style={styles.tabScrollView}
											showsVerticalScrollIndicator={false}
											contentContainerStyle={styles.scrollContent}
											nestedScrollEnabled={true}
											scrollEnabled={activeTab === 'information'}
										>
											{informationComponent}
											<View style={{ height: 100 }} />
										</Animated.ScrollView>
									</View>

									{/* Menu Tab Content with its own ScrollView */}
									<View style={styles.tabContent}>
										<Animated.ScrollView
											style={styles.tabScrollView}
											showsVerticalScrollIndicator={false}
											contentContainerStyle={styles.scrollContent}
											nestedScrollEnabled={true}
											scrollEnabled={activeTab === 'menu'}
										>
											{menuComponent}
											<View style={{ height: 100 }} />
										</Animated.ScrollView>
									</View>
								</Animated.View>
							</View>
						</ImageBackground>
					</Animated.View>
				</Animated.View>
			</GestureDetector>

			{/* Add Review Modal */}
			<AddReviewModal
				visible={showAddReviewModal}
				onClose={() => setShowAddReviewModal(false)}
				onSubmit={handleAddReview}
				restaurant_id={restaurant.id}
				restaurant_name={restaurant.name}
			/>
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
		overflow: 'hidden',
	},
	headerImageContainer: {
		position: 'relative',
		overflow: 'hidden',
	},
	headerImage: {
		width: '100%',
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
	},
	backButton: {
		position: 'absolute',
		left: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	shareButton: {
		position: 'absolute',
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
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
	collapsedContent: {
		flex: 1,
		paddingBottom: 15,
	},
	content: {
		flex: 1,
	},
	expandedContent: {
		flex: 1,
	},
	contentBackground: {
		flex: 1,
		marginTop: -70,
		backgroundColor: colors.secondary,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	backgroundImage: {
		opacity: 1,
	},
	tabContainer: {
		flexDirection: 'row',
		marginVertical: 20,
		paddingBottom: 10,
		justifyContent: 'center',
		gap: 40,
		paddingHorizontal: 20,
	},
	tabText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primaryLight,
	},
	activeTabText: {
		color: colors.primary,
	},
	animatedContentContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	slidingContent: {
		flexDirection: 'row',
		width: SCREEN_WIDTH * 2,
		height: '100%',
	},
	tabContent: {
		width: SCREEN_WIDTH,
		flex: 1,
	},
	tabScrollView: {
		flex: 1,
		paddingHorizontal: 20,
	},
	scrollContent: {
		flexGrow: 1,
	},
	tabIndicator: {
		position: 'absolute',
		bottom: 0,
		height: 2,
		backgroundColor: colors.primary,
		borderRadius: 1,
	},
});
