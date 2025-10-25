import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import Information from '@/components/restaurantDetail/Information';
import Menu from '@/components/restaurantDetail/Menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import React, { useMemo, useState } from 'react';
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

const { width: screenWidth } = Dimensions.get('window');

// Interface para las medidas de los tabs
interface TabMeasurements {
	information: { x: number; width: number };
	menu: { x: number; width: number };
}

export default function PreviewTab() {
	const { t } = useTranslation();
	const registerRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);

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

	// Menús del restaurante provisional
	const previewMenus = registerRestaurant.menus || [];

	// Función mock para onMapPress ya que no tenemos navegación real
	const handleMapPress = () => {
		console.log('Map pressed - navigation would open here');
	};

	// Referencias a los componentes para evitar re-renders
	const informationComponent = useMemo(
		() => (
			<Information
				restaurant={registerRestaurant}
				onMapPress={handleMapPress}
				dontShowReviews={true}
			/>
		),
		[registerRestaurant],
	);

	const menuComponent = useMemo(() => {
		if (previewMenus.length === 0) {
			return (
				<View style={styles.emptyMenuContainer}>
					<Text style={styles.emptyMenuText}>
						{t('restaurant.noMenuAvailable')}
					</Text>
					<Text style={styles.emptyMenuSubtext}>
						Añade un menú desde la pestaña de edición
					</Text>
				</View>
			);
		}
		return <Menu menus={previewMenus} />;
	}, [previewMenus, t]);

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

	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				{registerRestaurant?.images?.[0] && (
					<Image
						source={{ uri: registerRestaurant.images[0] }}
						style={styles.headerImage}
						resizeMode="cover"
					/>
				)}
				<View style={styles.imageOverlay} />

				<View style={styles.restaurantInfo}>
					<RestaurantBasicInformation
						restaurant={registerRestaurant}
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
	imageContainer: {
		position: 'relative',
	},
	headerImage: {
		width: '100%',
		height: 200,
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
	},
	restaurantInfo: {
		position: 'absolute',
		bottom: 60,
		width: '100%',
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
	emptyMenuContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyMenuText: {
		fontSize: 18,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 10,
	},
	emptyMenuSubtext: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
	},
});
