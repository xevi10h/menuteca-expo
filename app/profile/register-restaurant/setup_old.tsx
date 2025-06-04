import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData, Restaurant } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
	Dimensions,
	ImageBackground,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Interface para las medidas de los tabs
interface TabMeasurements {
	edit: { x: number; width: number };
	preview: { x: number; width: number };
}

export default function SetupScreen() {
	const language = useUserStore((state) => state.user.language);
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [menus, setMenus] = useState<MenuData[]>([]);

	// Estado para las pestañas
	const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Estado para almacenar las medidas de los tabs
	const [tabMeasurements, setTabMeasurements] = useState<TabMeasurements>({
		edit: { x: 0, width: 0 },
		preview: { x: 0, width: 0 },
	});

	// Animated values
	const translateX = useSharedValue(0);
	const tabIndicatorX = useSharedValue(0);
	const tabIndicatorWidth = useSharedValue(0);

	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);

	// Crear un objeto Restaurant temporal para la vista previa
	const previewRestaurant: Restaurant = useMemo(
		() => ({
			id: 'temp',
			name: provisionalRegisterRestaurant.name || 'Tu Restaurante',
			minimumPrice:
				menus.length > 0 ? Math.min(...menus.map((m) => m.price)) : 15,
			cuisine:
				provisionalRegisterRestaurant.cuisinesIds?.[0] || 'mediterranean',
			rating: 4.5,
			mainImage:
				'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			profileImage: undefined,
			images: [
				'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
				'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
				'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
			],
			distance: 0,
			address: provisionalRegisterRestaurant.address || 'Tu dirección',
			coordinates: {
				latitude: 41.3851,
				longitude: 2.1734,
			},
		}),
		[provisionalRegisterRestaurant, menus],
	);

	const handleBack = () => {
		router.back();
	};

	const handleSave = () => {
		// Aquí guardarías toda la información del restaurante
		// y navegarías de vuelta a la pantalla principal
		router.dismissAll();
	};

	const addMenu = (menu: MenuData) => {
		setMenus((prev) => [...prev, menu]);
	};

	const handleTabLayout = (tab: 'edit' | 'preview', event: any) => {
		const { width } = event.nativeEvent.layout;
		const tabIndicator = tab === 'edit' ? -(width / 2 + 2) : width / 2 + 38;

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

	const handleTabChange = (tab: 'edit' | 'preview') => {
		if (tab === activeTab || isTransitioning) return;

		setIsTransitioning(true);

		const targetX = tab === 'edit' ? 0 : -(screenWidth - 40);

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

	// Componente de vista de edición
	const EditView = useMemo(
		() => (
			<ScrollView
				style={styles.tabContentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Photo Section */}
				<View style={styles.photoSection}>
					<Text style={styles.photoLabel}>
						{t('registerRestaurant.selectPhoto')}
					</Text>
					<View style={styles.photoPlaceholder}>
						<Ionicons name="image-outline" size={40} color={colors.primary} />
					</View>
				</View>

				{/* Address Section */}
				<View style={styles.addressSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.address')}
					</Text>
					<TouchableOpacity style={styles.editButton}>
						<Ionicons name="pencil" size={16} color={colors.primary} />
					</TouchableOpacity>
					<MapView
						style={styles.miniMap}
						initialRegion={{
							latitude: 41.3851,
							longitude: 2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
					>
						<Marker
							coordinate={{
								latitude: 41.3851,
								longitude: 2.1734,
							}}
							title={provisionalRegisterRestaurant.name}
						/>
					</MapView>
				</View>

				{/* Menus Section */}
				<View style={styles.menusSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.myMenus')}
					</Text>
					{menus.map((menu, index) => (
						<View key={index} style={styles.menuItem}>
							<Text style={styles.menuName}>
								{menu.name || 'Menú de mediodía'}
							</Text>
							<View style={styles.menuActions}>
								<TouchableOpacity>
									<Ionicons name="pencil" size={16} color={colors.primary} />
								</TouchableOpacity>
								<TouchableOpacity>
									<Ionicons name="trash" size={16} color={colors.primary} />
								</TouchableOpacity>
							</View>
						</View>
					))}
					<TouchableOpacity
						style={styles.addMenuButton}
						onPress={() => setShowMenuModal(true)}
					>
						<Ionicons name="add" size={20} color={colors.primary} />
						<Text style={styles.addMenuText}>
							{t('registerRestaurant.addMenu')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Photos Section */}
				<View style={styles.photosSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.uploadPhotos')}
					</Text>
					<Text style={styles.sectionSubtitle}>
						{t('registerRestaurant.uploadPhotosDescription')}
					</Text>
					<TouchableOpacity style={styles.uploadButton}>
						<Text style={styles.uploadButtonText}>
							{t('registerRestaurant.uploadPhotos')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Food Types Section */}
				<View style={styles.foodTypesSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.foodType')}
					</Text>
					<Text style={styles.sectionSubtitle}>
						{t('registerRestaurant.foodTypeDescription')}
					</Text>

					<View style={styles.selectedCuisines}>
						{provisionalRegisterRestaurant?.cuisinesIds ? (
							provisionalRegisterRestaurant?.cuisinesIds
								.slice(0, 3)
								.map((cuisine) => (
									<View key={cuisine} style={styles.selectedCuisineTag}>
										<Text style={styles.selectedCuisineText}>
											{
												allCuisines.find((c) => c.id === cuisine)?.name[
													language
												]
											}
										</Text>
									</View>
								))
						) : (
							<View key={'no-cuisine'} style={styles.selectedCuisineTag}>
								<Text style={styles.selectedCuisineText}>
									{t('registerRestaurant.noCuisinesSelected')}
								</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		),
		[menus, provisionalRegisterRestaurant, language, t, setShowMenuModal],
	);

	// Componente de vista previa
	const PreviewView = useMemo(
		() => (
			<View style={styles.tabContentContainer}>
				<ImageBackground
					source={require('@/assets/images/background_food.png')}
					style={styles.previewContentBackground}
					imageStyle={styles.backgroundImage}
				>
					<ScrollView
						style={styles.previewScrollContent}
						showsVerticalScrollIndicator={false}
					>
						{/* Restaurant Basic Information */}
						<View style={styles.previewHeader}>
							<RestaurantBasicInformation
								restaurant={previewRestaurant}
								color={colors.primary}
							/>
						</View>

						{/* Tags */}
						<View style={styles.tagsContainer}>
							{provisionalRegisterRestaurant.cuisinesIds
								?.slice(0, 3)
								.map((cuisineId) => {
									const cuisine = allCuisines.find((c) => c.id === cuisineId);
									return cuisine ? (
										<View key={cuisineId} style={styles.tag}>
											<Text style={styles.tagText}>
												{cuisine.name[language]}
											</Text>
										</View>
									) : null;
								})}
							<View style={styles.tag}>
								<Text style={styles.tagText}>{t('restaurant.vegetarian')}</Text>
							</View>
						</View>

						{/* Address */}
						<View style={styles.addressContainer}>
							<Ionicons
								name="location-outline"
								size={16}
								color={colors.primary}
							/>
							<Text style={styles.addressText}>
								{provisionalRegisterRestaurant.address || 'Tu dirección'}
							</Text>
						</View>

						{/* Map */}
						<View style={styles.mapContainer}>
							<MapView
								style={styles.previewMap}
								initialRegion={{
									latitude: 41.3851,
									longitude: 2.1734,
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
								scrollEnabled={false}
								zoomEnabled={false}
								pitchEnabled={false}
								rotateEnabled={false}
							>
								<Marker
									coordinate={{
										latitude: 41.3851,
										longitude: 2.1734,
									}}
									title={provisionalRegisterRestaurant.name}
									description={provisionalRegisterRestaurant.address}
								/>
							</MapView>
							<View style={styles.mapOverlay}>
								<Ionicons
									name="navigate-outline"
									size={24}
									color={colors.quaternary}
								/>
							</View>
						</View>

						{/* Menus Section */}
						{menus.length > 0 && (
							<View style={styles.previewMenusSection}>
								<Text style={styles.previewSectionTitle}>
									{t('restaurant.menu')}
								</Text>
								{menus.map((menu, index) => (
									<View key={index} style={styles.previewMenuItem}>
										<Text style={styles.previewMenuName}>{menu.name}</Text>
										<Text style={styles.previewMenuPrice}>
											{t('general.from')} {menu.price}€
										</Text>
									</View>
								))}
							</View>
						)}

						{/* Photos Section Placeholder */}
						<View style={styles.previewPhotosSection}>
							<Text style={styles.previewSectionTitle}>
								{t('restaurant.photos')}
							</Text>
							<View style={styles.previewPhotoPlaceholder}>
								<Ionicons
									name="images-outline"
									size={40}
									color={colors.primary}
								/>
								<Text style={styles.previewPhotoText}>
									{t('registerRestaurant.uploadPhotos')}
								</Text>
							</View>
						</View>

						<View style={{ height: 100 }} />
					</ScrollView>
				</ImageBackground>
			</View>
		),
		[previewRestaurant, provisionalRegisterRestaurant, menus, language, t],
	);

	return (
		<View style={[styles.setupContainer, { paddingTop: insets.top }]}>
			<View style={styles.setupHeader}>
				<TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
					<Text style={styles.cancelText}>{t('general.cancel')}</Text>
				</TouchableOpacity>
				<View style={{ flex: 2 }}>
					<Text style={styles.setupTitle} numberOfLines={1}>
						{provisionalRegisterRestaurant.name}
					</Text>
				</View>
				<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
					<Text style={styles.saveText}>{t('general.save')}</Text>
				</TouchableOpacity>
			</View>

			{/* Tab Container */}
			<View style={styles.tabContainer}>
				<TouchableOpacity
					onPress={() => handleTabChange('edit')}
					disabled={isTransitioning}
					onLayout={(event) => handleTabLayout('edit', event)}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'edit' && styles.activeTabText,
						]}
					>
						{t('general.edit') || 'Editar'}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => handleTabChange('preview')}
					disabled={isTransitioning}
					onLayout={(event) => handleTabLayout('preview', event)}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'preview' && styles.activeTabText,
						]}
					>
						{t('general.preview') || 'Visualizar'}
					</Text>
				</TouchableOpacity>

				{/* Animated tab indicator */}
				<Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
			</View>

			{/* Animated Content Container */}
			<View style={styles.animatedContentContainer}>
				<Animated.View style={[styles.slidingContent, contentAnimatedStyle]}>
					{/* Edit Tab Content */}
					<View style={styles.tabContent}>{EditView}</View>

					{/* Preview Tab Content */}
					<View style={styles.tabContent}>{PreviewView}</View>
				</Animated.View>
			</View>

			<MenuCreationModal
				visible={showMenuModal}
				onClose={() => setShowMenuModal(false)}
				onSave={addMenu}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	setupContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	setupHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		gap: 10,
		width: '100%',
	},
	cancelButton: {
		flex: 1,
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
	},
	setupTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	saveButton: {
		flex: 1,
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		textAlign: 'right',
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
	tabIndicator: {
		position: 'absolute',
		bottom: 0,
		height: 2,
		backgroundColor: colors.primary,
		borderRadius: 1,
	},
	animatedContentContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	slidingContent: {
		flexDirection: 'row',
		width: screenWidth * 2,
		flex: 1,
	},
	tabContent: {
		width: screenWidth,
		flex: 1,
	},
	tabContentContainer: {
		flex: 1,
		paddingHorizontal: 20,
	},
	// Edit View Styles
	photoSection: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	photoLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	photoPlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
	},
	addressSection: {
		paddingVertical: 20,
		position: 'relative',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		position: 'absolute',
		top: 20,
		right: 0,
		padding: 5,
		zIndex: 1,
	},
	miniMap: {
		height: 150,
		borderRadius: 10,
		overflow: 'hidden',
	},
	menusSection: {
		paddingVertical: 20,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 10,
	},
	menuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	menuActions: {
		flexDirection: 'row',
		gap: 15,
	},
	addMenuButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 8,
		gap: 8,
	},
	addMenuText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	photosSection: {
		paddingVertical: 20,
	},
	sectionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 15,
	},
	uploadButton: {
		backgroundColor: colors.quaternary,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignSelf: 'center',
	},
	uploadButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	foodTypesSection: {
		paddingVertical: 20,
	},
	selectedCuisines: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	selectedCuisineTag: {
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
	},
	selectedCuisineText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	// Preview View Styles
	previewContentBackground: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	backgroundImage: {
		opacity: 1,
	},
	previewScrollContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	previewHeader: {
		paddingVertical: 20,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
	},
	tag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: colors.primaryLight,
		borderRadius: 15,
		marginRight: 8,
		marginBottom: 8,
	},
	tagText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	addressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	addressText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 8,
	},
	mapContainer: {
		height: 150,
		borderRadius: 15,
		marginBottom: 30,
		overflow: 'hidden',
		position: 'relative',
	},
	previewMap: {
		width: '100%',
		height: '100%',
	},
	mapOverlay: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		borderRadius: 20,
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	previewMenusSection: {
		marginBottom: 30,
	},
	previewSectionTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 15,
	},
	previewMenuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	previewMenuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	previewMenuPrice: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	previewPhotosSection: {
		marginBottom: 30,
	},
	previewPhotoPlaceholder: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 40,
	},
	previewPhotoText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginTop: 10,
	},
});
