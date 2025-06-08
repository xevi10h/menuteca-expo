import { getMenusByRestaurantId, getRestaurantById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import { useTranslation } from '@/hooks/useTranslation';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
	Dimensions,
	Image,
	ImageBackground,
	ScrollView,
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
import Information from '../../components/restaurantDetail/Information';
import Menu from '../../components/restaurantDetail/Menu';

const { width: screenWidth } = Dimensions.get('window');

// Interface para las medidas de los tabs
interface TabMeasurements {
	information: { x: number; width: number };
	menu: { x: number; width: number };
}

export default function RestaurantDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { showActionSheetWithOptions } = useActionSheet();

	const restaurant = getRestaurantById(id!);
	const menus = getMenusByRestaurantId(id!);

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

	// Referencias a los componentes para evitar re-renders
	const informationComponent = useMemo(
		() => (
			<Information restaurant={restaurant} onMapPress={openMapNavigation} />
		),
		[restaurant],
	);

	const menuComponent = useMemo(() => <Menu menus={menus} />, [menus]);

	const handleTabLayout = (tab: 'information' | 'menu', event: any) => {
		const { width } = event.nativeEvent.layout;
		const tabIndicator =
			tab === 'information' ? -(width / 2 + 2) : width / 2 + 38;

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
	};

	const handleTabChange = (tab: 'information' | 'menu') => {
		if (tab === activeTab || isTransitioning) return;

		setIsTransitioning(true);

		const targetX = tab === 'information' ? 0 : -(screenWidth - 40);

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

	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: restaurant.mainImage }}
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
				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
						<Animated.View
							style={[styles.slidingContent, contentAnimatedStyle]}
						>
							{/* Information Tab Content */}
							<View style={styles.tabContent}>{informationComponent}</View>

							{/* Menu Tab Content */}
							<View style={styles.tabContent}>{menuComponent}</View>
						</Animated.View>
					</View>

					{/* Bottom spacing */}
					<View style={{ height: 100 }} />
				</ScrollView>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
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
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	headerInfo: {
		position: 'absolute',
		flexDirection: 'row',
		bottom: 50,
		justifyContent: 'center',
		paddingHorizontal: 25,
	},
	restaurantIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	restaurantIconText: {
		color: colors.quaternary,
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '700',
	},
	restaurantDetails: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	restaurantName: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
		marginBottom: 5,
	},
	cuisineText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.quaternary,
		marginBottom: 5,
	},
	priceFromText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	priceText: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	tabContainer: {
		flexDirection: 'row',
		marginVertical: 20,
		paddingBottom: 10,
		justifyContent: 'center',
		gap: 40,
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
		overflow: 'hidden',
	},
	slidingContent: {
		flexDirection: 'row',
		width: (screenWidth - 40) * 2,
	},
	tabContent: {
		width: screenWidth - 40,
		paddingRight: 0,
	},
	tabIndicator: {
		position: 'absolute',
		bottom: 0,
		height: 2,
		backgroundColor: colors.primary,
		borderRadius: 1,
	},
});
