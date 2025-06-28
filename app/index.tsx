import { RestaurantService } from '@/api/services';
import { colors } from '@/assets/styles/colors';
import CenterLocationMapButton from '@/components/CenterLocationMapButton';
import ExpandableMapRestaurantModal from '@/components/ExpandableMapRestaurantModal';
import ListFilter from '@/components/ListFilter';
import MainSearcher from '@/components/MainSearcher';
import ProfilePhotoButton from '@/components/ProfileButton';
import ViewButton from '@/components/ViewButton';
import MapView from '@/components/crossPlatformMap/MapView';
import Marker from '@/components/crossPlatformMap/Marker';
import CuisineFilter from '@/components/filters/CuisineFilter';
import RestaurantList from '@/components/list/RestaurantList';
import ScrollHorizontalResturant from '@/components/list/ScrollHorizontalResturant';
import { Restaurant } from '@/shared/types';
import { useFilterStore } from '@/zustand/FilterStore';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, ScrollView, Text, View } from 'react-native';
import MapViewType, { Camera } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
	const [statusForegroundPermissions, requestStatusForegroundPermissions] =
		Location.useForegroundPermissions();
	const [view, setView] = useState<'list' | 'map'>('list');
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(true);
	const mapViewRef = useRef<MapViewType>(null);

	// Get filter state to determine view mode
	const filters = useFilterStore((state) => state.main);

	// Check if any non-persistent filters are active (excludes sort and cuisines)
	const hasActiveFilters =
		filters.textSearch.trim() !== '' ||
		filters.priceRange.min > 0 ||
		filters.priceRange.max < 1000 ||
		filters.ratingRange.min > 0 ||
		(filters.tags && filters.tags.length > 0) ||
		filters.timeRange !== null ||
		filters.distance !== null;

	// Load restaurants data
	useEffect(() => {
		const loadRestaurants = async () => {
			try {
				setLoading(true);
				const response = await RestaurantService.getAllRestaurants({
					page: 1,
					limit: 100, // Load more restaurants for map
				});

				if (response.success) {
					setRestaurants(response.data.data);
				}
			} catch (error) {
				console.error('Error loading restaurants:', error);
			} finally {
				setLoading(false);
			}
		};

		loadRestaurants();
	}, []);

	const handleMarkerPress = async (restaurant: Restaurant) => {
		await centerCoordinatesMarker(restaurant);
		setSelectedRestaurant(restaurant);
		setModalVisible(true);
	};

	const handleModalClose = () => {
		setModalVisible(false);
		setSelectedRestaurant(null);
	};

	const centerCoordinatesButtonAction = async () => {
		try {
			// Verificar el estado del permiso
			if (!statusForegroundPermissions?.granted) {
				// Solicitar permisos si aún no se han concedido
				const newPermissions = await requestStatusForegroundPermissions();
				if (!newPermissions.granted) {
					// Manejar la situación si los permisos no son concedidos
					return; // Salir de la función si no hay permisos
				}
			}

			const { coords } = await Location.getCurrentPositionAsync();
			const { longitude, latitude } = coords;
			if (longitude && latitude && mapViewRef.current) {
				const newCamera: Camera = {
					center: {
						latitude,
						longitude,
					},
					zoom: 16,
					heading: 0,
					pitch: 0,
					altitude: 1000,
				};
				mapViewRef.current?.animateCamera(newCamera, { duration: 1000 });
			}
		} catch (error) {
			console.error(error);
		}
	};

	const centerCoordinatesMarker = async (restaurant: Restaurant) => {
		try {
			const { longitude, latitude } = restaurant.address.coordinates;
			if (longitude && latitude && mapViewRef.current) {
				const newCamera: Camera = {
					center: {
						latitude,
						longitude,
					},
					zoom: 16,
					heading: 0,
					pitch: 0,
					altitude: 1000,
				};
				mapViewRef.current?.animateCamera(newCamera, { duration: 1000 });
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View
			style={{
				alignItems: 'center',
				backgroundColor: colors.secondary,
				paddingTop: useSafeAreaInsets().top,
				flex: 1,
				zIndex: -1,
			}}
		>
			{/* Header */}
			<View
				style={{
					width: '100%',
					height: 42,
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'row',
					gap: 10,
					paddingHorizontal: 10,
				}}
			>
				<View
					style={{
						width: 42,
						height: 42,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Image
						source={require('@/assets/images/logo_small_primary.png')}
						style={{ width: 36.05, height: 29 }}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<MainSearcher />
				</View>
				<View
					style={{
						width: 42,
						height: 42,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<ProfilePhotoButton />
				</View>
			</View>

			{/* Cuisine Filter */}
			<CuisineFilter />

			{/* List Filter */}
			<ListFilter />

			{/* Content Area */}
			{view === 'list' ? (
				hasActiveFilters ? (
					// Show filtered list when filters are active
					<RestaurantList />
				) : (
					// Show original horizontal scrolls when no filters are active
					<ScrollView
						showsVerticalScrollIndicator={false}
						style={{ marginTop: 10 }}
					>
						<ScrollHorizontalResturant title="bestRating" sortBy="rating" />
						<ScrollHorizontalResturant title="mostPopular" sortBy="popular" />
						<ScrollHorizontalResturant title="newest" sortBy="created_at" />
						<ScrollHorizontalResturant title="closest" sortBy="distance" />
						<ScrollHorizontalResturant
							title="recommended"
							sortBy="recommended"
						/>
						<ScrollHorizontalResturant
							title="alreadyTried"
							sortBy="alreadyTried"
						/>
						<View style={{ height: 100 }} />
					</ScrollView>
				)
			) : (
				// Map view
				<View
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: -2,
					}}
				>
					<MapView
						provider={Platform.OS !== 'ios' ? 'google' : undefined}
						ref={mapViewRef}
						style={{
							flex: 1,
						}}
						showsUserLocation
						showsMyLocationButton={false}
						showsCompass={false}
						showsBuildings={false}
						showsIndoors={false}
						showsScale={false}
						showsTraffic={false}
						showsIndoorLevelPicker={false}
						initialRegion={{
							latitude: 41.3851,
							longitude: 2.1734,
							latitudeDelta: 0.0922,
							longitudeDelta: 0.0421,
						}}
					>
						{restaurants.map((restaurant) => (
							<Marker
								key={restaurant.id}
								coordinate={{
									latitude: restaurant.address.coordinates.latitude,
									longitude: restaurant.address.coordinates.longitude,
								}}
								onPress={async () => handleMarkerPress(restaurant)}
							>
								{restaurant.profile_image ? (
									<Image
										src={restaurant.profile_image}
										style={{ width: 40, height: 40, borderRadius: 20 }}
										resizeMode="cover"
									/>
								) : (
									<View
										style={{
											width: 40,
											height: 40,
											borderRadius: 20,
											backgroundColor: colors.primary,
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<Text
											style={{
												color: colors.quaternary,
												fontSize: 18,
												fontFamily: 'Manrope',
												fontWeight: '700',
											}}
										>
											{restaurant.name
												.split(' ')
												.map((word) => word[0])
												.join('')
												.slice(0, 2)}
										</Text>
									</View>
								)}
							</Marker>
						))}
					</MapView>
				</View>
			)}

			{/* Map Controls */}
			{view === 'map' && (
				<CenterLocationMapButton
					onPress={async () => await centerCoordinatesButtonAction()}
					additionalBottom={140}
				/>
			)}

			{/* View Toggle Buttons */}
			<ViewButton
				onPress={() => setView('list')}
				iconName="menu-outline"
				additionalBottom={60}
				active={view === 'list'}
			/>
			<ViewButton
				onPress={() => setView('map')}
				iconName="map-outline"
				active={view === 'map'}
			/>

			{/* Modal para detalles del restaurante desde el mapa */}
			{selectedRestaurant && (
				<ExpandableMapRestaurantModal
					restaurant={selectedRestaurant}
					isVisible={modalVisible}
					onClose={handleModalClose}
				/>
			)}
		</View>
	);
}
