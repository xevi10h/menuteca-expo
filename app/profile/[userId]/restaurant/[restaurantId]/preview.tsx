import { MenuService, RestaurantService } from '@/api/hybridServices';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import Information from '@/components/restaurantDetail/Information';
import Menu from '@/components/restaurantDetail/Menu';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData, Restaurant } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
	Dimensions,
	Image,
	ImageBackground,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface TabMeasurements {
	information: { x: number; width: number };
	menu: { x: number; width: number };
}

export default function UserRestaurantPreview() {
	const { t } = useTranslation();
	const router = useRouter();
	const { user_id, restaurant_id } = useLocalSearchParams<{
		user_id: string;
		restaurant_id: string;
	}>();
	const insets = useSafeAreaInsets();

	const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
	const [menus, setMenus] = useState<MenuData[]>([]);
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState<{ isActive: boolean }>({
		isActive: false,
	});

	// Estado para las pestañas
	const [activeTab, setActiveTab] = useState<'information' | 'menu'>(
		'information',
	);
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Estado para almacenar las medidas de los tabs
	const [tabMeasurements, setTabMeasurements] = useState<TabMeasurements>({
		information: { x: 0, width: 0 },
		menu: { x: 0, width: 0 },
	});

	// Animated values
	const translateX = useSharedValue(0);
	const tabIndicatorX = useSharedValue(0);
	const tabIndicatorWidth = useSharedValue(0);

	useEffect(() => {
		const loadRestaurantData = async () => {
			if (!restaurant_id) return;

			setLoading(true);
			try {
				// Load restaurant data
				const restaurantResponse = await RestaurantService.getRestaurantById(
					restaurant_id,
				);

				if (restaurantResponse.success) {
					setRestaurant(restaurantResponse.data);
					setStatus({ isActive: restaurantResponse.data.is_active || false });
				}

				// Load restaurant menus
				const menusResponse = await MenuService.getRestaurantMenus(
					restaurant_id,
				);

				if (menusResponse.success) {
					setMenus(menusResponse.data);
				}
			} catch (error) {
				console.error('Error loading restaurant data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadRestaurantData();
	}, [restaurant_id]);

	const handleBack = () => {
		router.back();
	};

	const handleEdit = () => {
		router.push(`/profile/${user_id}/restaurant/${restaurant_id}/edit`);
	};

	const handleMapPress = () => {
		// Implementar navegación al mapa si es necesario
		console.log('Map navigation not implemented in preview');
	};

	const informationComponent = useMemo(() => {
		if (!restaurant) return null;
		return <Information restaurant={restaurant} onMapPress={handleMapPress} />;
	}, [restaurant]);

	const menuComponent = useMemo(() => {
		if (menus.length === 0) {
			return (
				<View style={styles.emptyContent}>
					<Text style={styles.emptyText}>
						{t('restaurant.noMenuAvailable')}
					</Text>
					<Text style={styles.emptySubtext}>
						{t('previewRestaurant.addMenuFromEditTab')}
					</Text>
				</View>
			);
		}
		return <Menu menus={menus} />;
	}, [menus, t]);

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

	const handleTabChange = (tab: 'information' | 'menu') => {
		if (tab === activeTab || isTransitioning) return;

		setIsTransitioning(true);

		const targetX = tab === 'information' ? 0 : -screenWidth;

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

	if (loading) {
		return <LoadingScreen />;
	}

	if (!restaurant) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={24} color={colors.primary} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						{t('editRestaurant.restaurantNotFound')}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				{restaurant.main_image && (
					<Image
						source={{ uri: restaurant.main_image }}
						style={[styles.headerImage, { height: 250 + insets.top }]}
						resizeMode="cover"
					/>
				)}
				<View style={styles.imageOverlay} />

				{/* Back Button */}
				<TouchableOpacity
					style={[styles.backButton, { top: insets.top + 10 }]}
					onPress={handleBack}
				>
					<Ionicons name="chevron-back" size={24} color={colors.quaternary} />
				</TouchableOpacity>

				{/* Status Badge - Centrado arriba */}
				<View style={styles.statusBadgeContainer}>
					<View style={[styles.statusBadge, { top: insets.top + 10 }]}>
						<View
							style={[
								styles.statusDot,
								{ backgroundColor: status.isActive ? '#10B981' : '#EF4444' },
							]}
						/>
						<Text style={styles.statusText}>
							{status.isActive ? t('profile.active') : t('profile.inactive')}
						</Text>
					</View>
				</View>

				{/* Edit Button */}
				<TouchableOpacity
					style={[styles.editButton, { top: insets.top + 10 }]}
					onPress={handleEdit}
				>
					<Ionicons name="pencil-outline" size={24} color={colors.quaternary} />
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
			</View>

			{/* Content with Background Image */}
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
					<Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
				</View>

				{/* Animated Content Container */}
				<View style={styles.animatedContentContainer}>
					<Animated.View style={[styles.slidingContent, contentAnimatedStyle]}>
						{/* Information Tab Content with its own ScrollView */}
						<View style={styles.tabContent}>
							<Animated.ScrollView
								style={styles.tabScrollView}
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.scrollContent}
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
								scrollEnabled={activeTab === 'menu'}
							>
								{menuComponent}
								<View style={{ height: 100 }} />
							</Animated.ScrollView>
						</View>
					</Animated.View>
				</View>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginLeft: 10,
	},
	imageContainer: {
		position: 'relative',
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
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	editButton: {
		position: 'absolute',
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusBadgeContainer: {
		position: 'absolute',
		right: 0,
		left: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusBadge: {
		position: 'absolute',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		height: 40,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	statusText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	contentBackground: {
		flex: 1,
		backgroundColor: colors.secondary,
		marginTop: -30,
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
		fontFamily: 'Manrope',
		fontWeight: '500',
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
		width: screenWidth * 2,
		height: '100%',
	},
	tabContent: {
		width: screenWidth,
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
	emptyContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 10,
	},
	emptySubtext: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
});
