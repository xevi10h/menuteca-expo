import { colors } from '@/assets/styles/colors';
import CenterLocationMapButton from '@/components/CenterLocationMapButton';
import CuisineHorizontalScroll from '@/components/CuisineHorizontalScroll';
import ListFilter from '@/components/ListFilter';
import MainSearcher from '@/components/MainSearcher';
import MapRestaurantModal from '@/components/MapRestaurantModal';
import ProfilePhotoButton from '@/components/ProfileButton';
import ViewButton from '@/components/ViewButton';
import MapView from '@/components/crossPlatformMap/MapView';
import Marker from '@/components/crossPlatformMap/Marker';
import ScrollHorizontalResturant, {
	Restaurant,
} from '@/components/list/ScrollHorizontalResturant';
import { useRef, useState } from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import MapViewType from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
	const [view, setView] = useState<'list' | 'map'>('list');
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const mapViewRef = useRef<MapViewType>(null);

	// Mock restaurants data - en producción esto vendría de una API
	const restaurants: Restaurant[] = [
		{
			id: 1,
			name: 'Sant Francesc Restaurant',
			minimumPrice: 15,
			cuisine: 'mediterranean',
			rating: 4.5,
			image:
				'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			distance: 2.5,
		},
		{
			id: 2,
			name: 'Tika Tacos',
			minimumPrice: 12,
			cuisine: 'mexican',
			rating: 4.0,
			image:
				'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			distance: 3.0,
		},
		{
			id: 3,
			name: 'El gran sol',
			minimumPrice: 10,
			cuisine: 'chinese',
			rating: 4.8,
			image:
				'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
			distance: 1.5,
		},
	];

	const handleMarkerPress = (restaurant: Restaurant) => {
		setSelectedRestaurant(restaurant);
		setModalVisible(true);
	};

	const handleModalClose = () => {
		setModalVisible(false);
		setSelectedRestaurant(null);
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

			<CuisineHorizontalScroll />
			<ListFilter />

			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{ marginTop: 10, display: view === 'list' ? 'flex' : 'none' }}
			>
				<ScrollHorizontalResturant title="bestRating" sortBy="rating" />
				<ScrollHorizontalResturant title="mostPopular" sortBy="popular" />
				<ScrollHorizontalResturant title="newest" sortBy="createdAt" />
				<ScrollHorizontalResturant title="closest" sortBy="distance" />
				<ScrollHorizontalResturant title="recommended" sortBy="recommended" />
				<ScrollHorizontalResturant title="alreadyTried" sortBy="alreadyTried" />
			</ScrollView>

			<View
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: -2,
					display: view === 'map' ? 'flex' : 'none',
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
					{restaurants.map((restaurant, index) => (
						<Marker
							key={restaurant.id}
							coordinate={{
								latitude: 41.3851 + index * 0.01, // Mock coordinates
								longitude: 2.1734 + index * 0.01,
							}}
							onPress={() => handleMarkerPress(restaurant)}
						/>
					))}
				</MapView>
			</View>

			{view === 'map' && (
				<CenterLocationMapButton
					onPress={() => setView('map')}
					additionalBottom={140}
				/>
			)}
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
			<MapRestaurantModal
				restaurant={selectedRestaurant}
				isVisible={modalVisible}
				onClose={handleModalClose}
			/>
		</View>
	);
}
