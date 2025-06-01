import { getMenusByRestaurantId, getRestaurantById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
	Image,
	ImageBackground,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { getApps } from 'react-native-map-link';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Information from '../../components/restaurantDetail/Information';
import Menu from '../../components/restaurantDetail/Menu';

export default function RestaurantDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { showActionSheetWithOptions } = useActionSheet();

	const restaurant = getRestaurantById(id!);
	const menus = getMenusByRestaurantId(id!);

	// Estado para las pestañas
	const [activeTab, setActiveTab] = React.useState<'information' | 'menu'>(
		'information',
	);

	// Función para abrir el mapa
	const openMapNavigation = async () => {
		const result = await getApps({
			latitude: restaurant.coordinates.latitude!,
			longitude: restaurant.coordinates.longitude!,
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

				<View style={styles.headerInfo}>
					<View style={styles.restaurantIcon}>
						{restaurant.profileImage ? (
							<Image
								src={restaurant.profileImage}
								style={{ width: '100%', height: '100%', borderRadius: 30 }}
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
							<Text style={styles.restaurantName}>{restaurant.name}</Text>
							<Text style={styles.cuisineText}>
								{t(`cuisinesRestaurants.${restaurant.cuisine}`)}
							</Text>
						</View>
						<View
							style={{ flexDirection: 'row', gap: 5, alignItems: 'baseline' }}
						>
							<Text style={styles.priceFromText}>{t('general.from')}</Text>
							<Text style={styles.priceText}>{restaurant.minimumPrice}€</Text>
						</View>
					</View>
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
							style={styles.tab}
							onPress={() => setActiveTab('information')}
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
							style={styles.tab}
							onPress={() => setActiveTab('menu')}
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
					</View>

					{/* Information Tab Content */}
					{activeTab === 'information' && (
						<Information
							restaurant={restaurant}
							onMapPress={openMapNavigation}
						/>
					)}

					{/* Menu Tab Content */}
					{activeTab === 'menu' && <Menu menus={menus} />}

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
		marginVertical: 10,
		justifyContent: 'center',
	},
	tab: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginRight: 10,
		borderRadius: 20,
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
});
