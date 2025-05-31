import { allRestaurants } from '@/api/responses';
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
import { Image, Platform, ScrollView, Text, View } from 'react-native';
import MapViewType from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
	const [view, setView] = useState<'list' | 'map'>('list');
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const mapViewRef = useRef<MapViewType>(null);

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
					{allRestaurants.map((restaurant) => (
						<Marker
							key={restaurant.id}
							coordinate={{
								latitude: restaurant.coordinates.latitude,
								longitude: restaurant.coordinates.longitude,
							}}
							onPress={() => handleMarkerPress(restaurant)}
						>
							{restaurant.profileImage ? (
								<Image
									src={restaurant.profileImage}
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
