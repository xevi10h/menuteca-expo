import { colors } from '@/assets/styles/colors';
import CenterLocationMapButton from '@/components/CenterLocationMapButton';
import ExpandableMapRestaurantModal from '@/components/ExpandableMapRestaurantModal';
import ListFilter from '@/components/ListFilter';
import MainSearcher from '@/components/MainSearcher';
import ProfilePhotoButton from '@/components/ProfileButton';
import ViewButton from '@/components/ViewButton';
import LoadingScreen from '@/components/auth/LoadingScreen';
import MapView from '@/components/crossPlatformMap/MapView';
import Marker from '@/components/crossPlatformMap/Marker';
import CuisineFilter from '@/components/filters/CuisineFilter';
import RestaurantList from '@/components/list/RestaurantList';
import ScrollHorizontalRestaurant from '@/components/list/ScrollHorizontalResturant';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useRequireAuth } from '@/hooks/useAuth';
import { Restaurant } from '@/shared/types';
import { useFilterStore } from '@/zustand/FilterStore';
import { useRestaurantStore } from '@/zustand/RestaurantStore';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, View } from 'react-native';
import MapViewType, { Camera } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Default location (Barcelona, Spain) if location permission is denied
const DEFAULT_LOCATION = {
	latitude: 41.3851,
	longitude: 2.1734,
};

export default function Index() {
	// Use require auth hook
	const { isLoading: authLoading } = useRequireAuth();

	// Use app initialization hook
	const {
		isInitialized,
		isLoading: appLoading,
		error: appError,
	} = useAppInitialization();

	// Show loading while checking authentication or initializing app
	if (authLoading || appLoading || !isInitialized) {
		return (
			<LoadingScreen
				showLogo={true}
				message={
					authLoading ? 'Checking authentication...' : 'Initializing app...'
				}
				showProgress={false}
			/>
		);
	}

	// Show error if app initialization failed critically
	if (appError) {
		console.error('Critical app initialization error:', appError);
		// Still proceed to show the app - most errors aren't critical
	}

	// If authenticated and initialized, show main app content
	return <MainAppContent />;
}

// Componente separado para el contenido principal de la app
function MainAppContent() {
	const { top } = useSafeAreaInsets();
	const [statusForegroundPermissions, requestStatusForegroundPermissions] =
		Location.useForegroundPermissions();
	const [view, setView] = useState<'list' | 'map'>('list');
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingError, setLoadingError] = useState<string | null>(null);
	const [hasInitialLoad, setHasInitialLoad] = useState(false);
	const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
	const mapViewRef = useRef<MapViewType>(null);

	// Estado para paginación cuando hay filtros activos
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	// Get filter state to determine view mode
	const filters = useFilterStore((state) => state.main);

	// Use restaurant store for caching
	const {
		fetchRestaurants,
		isLoading: storeLoading,
		error: storeError,
		isRateLimited,
		clearError,
	} = useRestaurantStore();

	// Request location permissions and get current location
	const requestLocationAndLoad = useCallback(async () => {
		try {
			// Check if we already have permission
			if (statusForegroundPermissions?.granted) {
				const { coords } = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});
				setCurrentLocation({
					latitude: coords.latitude,
					longitude: coords.longitude,
				});
				return { latitude: coords.latitude, longitude: coords.longitude };
			}

			// Request permission if we don't have it
			const permission = await requestStatusForegroundPermissions();
			console.log('Location permission status:', permission);

			if (permission.granted) {
				const { coords } = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});
				setCurrentLocation({
					latitude: coords.latitude,
					longitude: coords.longitude,
				});

				return { latitude: coords.latitude, longitude: coords.longitude };
			} else {
				// Permission denied, use default location
				console.log('Location permission denied, using default location');

				setCurrentLocation(DEFAULT_LOCATION);
				return DEFAULT_LOCATION;
			}
		} catch (error) {
			console.error('Error getting location:', error);
			// Fallback to default location

			setCurrentLocation(DEFAULT_LOCATION);
			return DEFAULT_LOCATION;
		}
	}, [statusForegroundPermissions, requestStatusForegroundPermissions]);

	// Check if any non-persistent filters are active (excludes sort and cuisines)
	const hasActiveFilters =
		filters.textSearch.trim() !== '' ||
		filters.priceRange.min > 0 ||
		filters.priceRange.max < 1000 ||
		filters.ratingRange.min > 0 ||
		(filters.tags && filters.tags.length > 0) ||
		filters.timeRange !== null ||
		filters.distance !== null ||
		(filters.cuisines && filters.cuisines.length > 0);

	// Función para aplicar filtros localmente
	const applyLocalFilters = useCallback(
		(restaurantList: Restaurant[]) => {
			let filtered = [...restaurantList];

			// Filtro de texto
			if (filters.textSearch.trim()) {
				const searchTerm = filters.textSearch.toLowerCase();
				filtered = filtered.filter(
					(restaurant) =>
						restaurant.name.toLowerCase().includes(searchTerm) ||
						restaurant.cuisine?.name?.toLowerCase().includes(searchTerm),
				);
			}

			// Filtro de precio
			if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
				filtered = filtered.filter(
					(restaurant) =>
						restaurant.minimum_price >= filters.priceRange.min &&
						restaurant.minimum_price <= filters.priceRange.max,
				);
			}

			// Filtro de rating
			if (filters.ratingRange.min > 0) {
				filtered = filtered.filter(
					(restaurant) =>
						restaurant.rating && restaurant.rating >= filters.ratingRange.min,
				);
			}

			// Filtro de tags
			if (filters.tags && filters.tags.length > 0) {
				filtered = filtered.filter((restaurant) =>
					filters.tags!.some((tag) => restaurant.tags?.includes(tag)),
				);
			}

			// Filtro de cuisines
			if (filters.cuisines && filters.cuisines.length > 0) {
				filtered = filtered.filter((restaurant) =>
					filters.cuisines!.includes(restaurant.cuisine?.id),
				);
			}

			// Filtro de distancia
			if (filters.distance !== null && filters.distance > 0) {
				filtered = filtered.filter(
					(restaurant) =>
						restaurant.distance !== undefined &&
						restaurant.distance <= filters.distance!,
				);
			}

			return filtered;
		},
		[filters],
	);

	// Función para ordenar restaurantes
	const applySorting = useCallback(
		(restaurantList: Restaurant[]) => {
			const sorted = [...restaurantList];

			switch (filters.orderBy) {
				case 'price':
					sorted.sort((a, b) => {
						if (filters.orderDirection === 'asc') {
							return a.minimum_price - b.minimum_price;
						}
						return b.minimum_price - a.minimum_price;
					});
					break;
				case 'distance':
					sorted.sort((a, b) => {
						const distA = a.distance || Infinity;
						const distB = b.distance || Infinity;
						return distA - distB;
					});
					break;
				case 'recommended':
				default:
					// Lógica de recomendados (combina rating, distancia, etc.)
					sorted.sort((a, b) => {
						const scoreA =
							(a.rating || 0) * 0.7 +
							(a.distance ? (10 - a.distance) * 0.3 : 0);
						const scoreB =
							(b.rating || 0) * 0.7 +
							(b.distance ? (10 - b.distance) * 0.3 : 0);
						return scoreB - scoreA;
					});
					break;
			}

			return sorted;
		},
		[filters.orderBy, filters.orderDirection],
	);

	// Función para obtener restaurantes para categorías específicas (sin filtros)
	const getRestaurantsByCategory = useCallback(
		(category: string, restaurantList: Restaurant[]) => {
			const sorted = [...restaurantList];

			switch (category) {
				case 'bestRating':
					return sorted
						.filter((r) => r.rating && r.rating > 0)
						.sort((a, b) => (b.rating || 0) - (a.rating || 0))
						.slice(0, 10);

				case 'mostPopular':
					// Simular popularidad con una combinación de rating y número de reviews
					return sorted
						.sort((a, b) => {
							const popularityA = (a.rating || 0) * (a.reviews?.length || 1);
							const popularityB = (b.rating || 0) * (b.reviews?.length || 1);
							return popularityB - popularityA;
						})
						.slice(0, 10);

				case 'newest':
					return sorted
						.sort(
							(a, b) =>
								new Date(b.created_at).getTime() -
								new Date(a.created_at).getTime(),
						)
						.slice(0, 10);

				case 'closest':
					return sorted
						.filter((r) => r.distance !== undefined)
						.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
						.slice(0, 10);

				case 'recommended':
					// Algoritmo de recomendación personalizado
					return sorted
						.sort((a, b) => {
							const scoreA =
								(a.rating || 0) * 0.6 +
								(a.distance ? (10 - a.distance) * 0.4 : 0);
							const scoreB =
								(b.rating || 0) * 0.6 +
								(b.distance ? (10 - b.distance) * 0.4 : 0);
							return scoreB - scoreA;
						})
						.slice(0, 10);

				default:
					return sorted.slice(0, 10);
			}
		},
		[],
	);

	// Load restaurants data with proper error handling
	const loadRestaurants = useCallback(
		async (pageNumber = 1, append = false) => {
			// Don't load if already loading or rate limited
			if (storeLoading || loading || isRateLimited) {
				console.log('Skipping load: already loading or rate limited');
				return;
			}

			try {
				if (pageNumber === 1) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}
				setLoadingError(null);

				// Get current location (with permission handling)
				const location = await requestLocationAndLoad();

				// Use store's fetchRestaurants which handles caching
				const restaurantData = await fetchRestaurants({
					page: pageNumber,
					limit: 50, // Usar 50 como límite base
					latitude: location.latitude,
					longitude: location.longitude,
				});

				if (append && pageNumber > 1) {
					setRestaurants((prev) => [...prev, ...restaurantData]);
				} else {
					setRestaurants(restaurantData);
					setHasInitialLoad(true);
				}

				// Determinar si hay más páginas (simplificado - en una app real vendría del backend)
				setHasMore(restaurantData.length === 50);
				setPage(pageNumber);

				// Clear any previous errors on successful load
				clearError();
			} catch (error) {
				console.error('Error loading restaurants:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				setLoadingError(errorMessage);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[
			storeLoading,
			loading,
			isRateLimited,
			fetchRestaurants,
			clearError,
			requestLocationAndLoad,
		],
	);

	// Función para cargar más restaurantes (paginación)
	const loadMoreRestaurants = useCallback(() => {
		if (hasActiveFilters && hasMore && !loadingMore && !loading) {
			loadRestaurants(page + 1, true);
		}
	}, [hasActiveFilters, hasMore, loadingMore, loading, page, loadRestaurants]);

	// Reset page when filters change
	useEffect(() => {
		if (hasActiveFilters) {
			setPage(1);
			setHasMore(true);
			loadRestaurants(1, false);
		}
	}, [
		filters.textSearch,
		filters.priceRange,
		filters.ratingRange,
		filters.tags,
		filters.cuisines,
		filters.distance,
		filters.timeRange,
		filters.orderBy,
		filters.orderDirection,
		hasActiveFilters,
	]);

	// Initial load effect - only runs once
	useEffect(() => {
		if (!hasInitialLoad && restaurants.length === 0) {
			loadRestaurants();
		}
	}, [hasInitialLoad]);

	// Handle store errors
	useEffect(() => {
		if (storeError && !loading) {
			if (!loadingError || loadingError !== storeError) {
				setLoadingError(storeError);

				if (!storeError.includes('Rate limited')) {
					setTimeout(() => {
						Alert.alert(
							'Error loading restaurants',
							storeError,
							[
								{
									text: 'Retry',
									onPress: () => {
										clearError();
										loadRestaurants();
									},
								},
								{ text: 'OK', style: 'cancel' },
							],
							{ cancelable: true },
						);
					}, 500);
				}
			}
		}
	}, [storeError, loading, loadingError, clearError, loadRestaurants]);

	// Procesar restaurantes según si hay filtros o no
	const processedRestaurants = hasActiveFilters
		? applySorting(applyLocalFilters(restaurants))
		: restaurants;

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
			const location = await requestLocationAndLoad();

			if (mapViewRef.current) {
				const newCamera: Camera = {
					center: {
						latitude: location.latitude,
						longitude: location.longitude,
					},
					zoom: 16,
					heading: 0,
					pitch: 0,
					altitude: 1000,
				};
				mapViewRef.current?.animateCamera(newCamera, { duration: 1000 });
			}
		} catch (error) {
			console.error('Error getting location:', error);
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
			console.error('Error centering on restaurant:', error);
		}
	};

	// Show loading indicator for initial load
	if (!hasInitialLoad && loading) {
		return (
			<LoadingScreen
				showLogo={false}
				message="Loading restaurants..."
				showProgress={false}
			/>
		);
	}

	// Show rate limit message
	if (isRateLimited && restaurants.length === 0) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.secondary,
					paddingTop: top,
					justifyContent: 'center',
					alignItems: 'center',
					paddingHorizontal: 40,
				}}
			>
				<Text
					style={{
						fontSize: 18,
						fontFamily: 'Manrope',
						fontWeight: '600',
						color: colors.primary,
						textAlign: 'center',
						marginBottom: 20,
					}}
				>
					Too many requests
				</Text>
				<Text
					style={{
						fontSize: 14,
						fontFamily: 'Manrope',
						color: colors.primaryLight,
						textAlign: 'center',
					}}
				>
					Please wait a moment before trying again.
				</Text>
			</View>
		);
	}

	return (
		<View
			style={{
				alignItems: 'center',
				backgroundColor: colors.secondary,
				paddingTop: top,
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
					<RestaurantList
						restaurants={processedRestaurants}
						onLoadMore={loadMoreRestaurants}
						hasMore={hasMore}
						loadingMore={loadingMore}
					/>
				) : (
					// Show original horizontal scrolls when no filters are active
					<ScrollView
						showsVerticalScrollIndicator={false}
						style={{ marginTop: 10 }}
					>
						<ScrollHorizontalRestaurant
							title="recommended"
							sortBy="recommended"
							restaurants={getRestaurantsByCategory('recommended', restaurants)}
						/>
						<ScrollHorizontalRestaurant
							title="bestRating"
							sortBy="rating"
							restaurants={getRestaurantsByCategory('bestRating', restaurants)}
						/>
						<ScrollHorizontalRestaurant
							title="closest"
							sortBy="distance"
							restaurants={getRestaurantsByCategory('closest', restaurants)}
						/>
						<ScrollHorizontalRestaurant
							title="mostPopular"
							sortBy="popular"
							restaurants={getRestaurantsByCategory('mostPopular', restaurants)}
						/>
						<ScrollHorizontalRestaurant
							title="newest"
							sortBy="created_at"
							restaurants={getRestaurantsByCategory('newest', restaurants)}
						/>

						<View style={{ height: 100 }} />
					</ScrollView>
				)
			) : (
				// Map view - usar restaurantes procesados también en el mapa
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
						showsUserLocation={true}
						showsMyLocationButton={false}
						showsCompass={false}
						showsBuildings={false}
						showsIndoors={false}
						showsScale={false}
						showsTraffic={false}
						showsIndoorLevelPicker={false}
						initialRegion={{
							latitude: currentLocation.latitude,
							longitude: currentLocation.longitude,
							latitudeDelta: 0.0922,
							longitudeDelta: 0.0421,
						}}
					>
						{processedRestaurants.map((restaurant) => (
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
