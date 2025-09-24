import { MenuService, RestaurantService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import NotFoundRestaurant from '@/components/NotFoundRestaurant';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import Information from '@/components/restaurantDetail/Information';
import Menu from '@/components/restaurantDetail/Menu';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData, Restaurant } from '@/shared/types';
import { useActionSheet } from '@expo/react-native-action-sheet';
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
import { getApps } from 'react-native-map-link';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Simular estados de la API
type LoadingState = 'loading' | 'success' | 'error' | 'not-found';

// Interface para las medidas de los tabs
interface TabMeasurements {
	information: { x: number; width: number };
	menu: { x: number; width: number };
}

// Componente de error genérico
const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.errorContainer, { paddingTop: insets.top }]}>
			{/* Header with back button */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Error content */}
			<View style={styles.errorContent}>
				<Ionicons name="wifi-outline" size={80} color={colors.primaryLight} />
				<Text style={styles.errorTitle}>{t('restaurant.error.title')}</Text>
				<Text style={styles.errorDescription}>
					{t('restaurant.error.description')}
				</Text>

				<TouchableOpacity style={styles.retryButton} onPress={onRetry}>
					<Ionicons
						name="refresh-outline"
						size={20}
						color={colors.quaternary}
					/>
					<Text style={styles.retryButtonText}>
						{t('restaurant.error.retry')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default function RestaurantDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { showActionSheetWithOptions } = useActionSheet();

	// Estados
	const [loadingState, setLoadingState] = useState<LoadingState>('loading');
	const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
	const [menus, setMenus] = useState<MenuData[]>([]);

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

	// Función para cargar datos del restaurante
	const loadRestaurantData = async () => {
		if (!id) {
			setLoadingState('not-found');
			return;
		}

		try {
			setLoadingState('loading');

			// Fetch restaurant details
			const restaurant_response = await RestaurantService.getRestaurantById(id);

			if (!restaurant_response.success || !restaurant_response.data) {
				setLoadingState('not-found');
				return;
			}

			setRestaurant(restaurant_response.data);

			// Fetch restaurant menus
			try {
				const menusResponse = await MenuService.getRestaurantMenus(id);
				if (menusResponse.success && menusResponse.data) {
					setMenus(menusResponse.data);
				} else {
					// If menus fail, continue with empty array
					setMenus([]);
				}
			} catch (menuError) {
				console.error('Error loading menus:', menuError);
				setMenus([]);
			}

			setLoadingState('success');
		} catch (error) {
			console.error('Error loading restaurant:', error);
			setLoadingState('error');
		}
	};

	// Cargar datos al montar el componente
	useEffect(() => {
		loadRestaurantData();
	}, [id]);

	// Referencias a los componentes para evitar re-renders
	const informationComponent = useMemo(() => {
		if (!restaurant) return null;
		return (
			<Information restaurant={restaurant} onMapPress={openMapNavigation} />
		);
	}, [restaurant]);

	const menuComponent = useMemo(() => {
		return <Menu menus={menus} />;
	}, [menus]);

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

		try {
			const result = await getApps({
				latitude: restaurant.address.coordinates.latitude,
				longitude: restaurant.address.coordinates.longitude,
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
					textStyle: { fontFamily: 'Montserrat-Regular' },
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
		} catch (error) {
			console.error('Error opening map navigation:', error);
		}
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

	// Renderizar según el estado
	if (loadingState === 'loading') {
		return <LoadingScreen />;
	}

	if (loadingState === 'error') {
		return <ErrorScreen onRetry={loadRestaurantData} />;
	}

	if (loadingState === 'not-found' || !restaurant) {
		return <NotFoundRestaurant restaurant_id={id} />;
	}

	// Renderizar restaurante exitosamente cargado
	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: restaurant.images[0] }}
					style={[styles.headerImage, { height: 250 + insets.top }]}
					resizeMode="cover"
				/>
				<View style={styles.imageOverlay} />

				{/* Back Button */}
				<TouchableOpacity
					style={[styles.backButton, { top: insets.top + 10 }]}
					onPress={() => router.back()}
				>
					<Ionicons name="chevron-back" size={24} color={colors.quaternary} />
				</TouchableOpacity>

				{/* Share Button */}
				<TouchableOpacity
					style={[styles.shareButton, { top: insets.top + 10 }]}
					onPress={() => {
						/* Handle share */
					}}
				>
					<Ionicons name="share-outline" size={24} color={colors.quaternary} />
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

	// Loading styles
	loadingContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	loadingHeader: {
		height: 60,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	loadingBackButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primaryLight,
		opacity: 0.3,
	},
	loadingContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
	},
	loadingText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},

	// Error styles
	errorContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	errorContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
		gap: 20,
	},
	errorTitle: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	errorDescription: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		lineHeight: 24,
	},
	retryButton: {
		backgroundColor: colors.primary,
		paddingVertical: 15,
		paddingHorizontal: 25,
		borderRadius: 25,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginTop: 10,
	},
	retryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},

	// Main restaurant styles
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
	header: {
		height: 60,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	backButton: {
		position: 'absolute',
		left: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	shareButton: {
		position: 'absolute',
		right: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
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
});
