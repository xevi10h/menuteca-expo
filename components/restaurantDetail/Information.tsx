import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { renderTagIcon } from '../restaurantCreation/TagsSelectionModal';

const width = Dimensions.get('window').width;

interface InformationProps {
	restaurant: Restaurant;
	onMapPress: () => void;
}

const Information: React.FC<InformationProps> = ({
	restaurant,
	onMapPress,
}) => {
	const { t } = useTranslation();
	const progressValue = useSharedValue<number>(0);
	console.log('restauranttags', restaurant);
	return (
		<>
			{/* Tags */}
			<View style={styles.tagsContainer}>
				{restaurant.tags?.map((tag) => {
					return (
						<View key={tag} style={styles.tag}>
							{renderTagIcon(tag, colors.quaternary, 14)}
							<Text style={styles.tagText}>{t(`restaurantTags.${tag}`)}</Text>
						</View>
					);
				})}
			</View>

			{/* Address containe */}
			{restaurant.address && (
				<>
					<TouchableOpacity
						style={styles.addressContainer}
						onPress={onMapPress}
					>
						<Ionicons
							name="location-outline"
							size={16}
							color={colors.primary}
						/>
						<Text style={styles.addressText}>
							{restaurant.address.formattedAddress}
						</Text>
					</TouchableOpacity>

					{/* Map */}
					<TouchableOpacity onPress={onMapPress}>
						<View style={styles.mapContainer}>
							<MapView
								style={styles.map}
								initialRegion={{
									latitude: restaurant.address.coordinates.latitude,
									longitude: restaurant.address.coordinates.longitude,
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
										latitude: restaurant.address.coordinates.latitude,
										longitude: restaurant.address.coordinates.longitude,
									}}
									title={restaurant.name}
									description={restaurant.address.formattedAddress}
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
					</TouchableOpacity>
				</>
			)}

			{/* Photos Section */}
			<View style={styles.photosSection}>
				<Text style={styles.sectionTitle}>{t('restaurant.photos')}</Text>
				<Carousel
					loop
					style={styles.carousel}
					width={width - 40}
					height={200}
					scrollAnimationDuration={500}
					data={restaurant.images}
					onProgressChange={progressValue}
					renderItem={({ index }) => (
						<View style={styles.imagesContainer}>
							<Image
								source={{
									uri: restaurant?.images[index],
								}}
								resizeMode="cover"
								style={styles.image}
							/>
						</View>
					)}
				/>

				<Pagination.Basic
					progress={progressValue}
					data={restaurant.images}
					dotStyle={styles.paginationDot}
					activeDotStyle={styles.paginationActiveDot}
					containerStyle={styles.paginationContainer}
					horizontal
				/>
			</View>

			{/* Reviews Section */}
			<View>
				<Text style={styles.sectionTitle}>{t('restaurant.reviews')}</Text>
				<View style={styles.ratingContainer}>
					{restaurant.rating ? (
						<>
							<Text style={styles.ratingText}>{restaurant.rating} / 5</Text>
							<Ionicons name="star" size={20} color={colors.primary} />
						</>
					) : (
						<Text style={styles.ratingText}>{t('restaurant.noRating')}</Text>
					)}
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
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
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
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
	map: {
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
	photosSection: {
		marginBottom: 30,
	},
	carousel: {
		borderRadius: 24,
	},
	imagesContainer: {
		height: 200,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	image: {
		width: '100%',
		height: '100%',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	paginationContainer: {
		gap: 8,
		marginTop: -15,
		justifyContent: 'center',
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primary,
	},
	paginationActiveDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.quaternary,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 15,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		borderWidth: 1,
		borderColor: colors.primary,
		justifyContent: 'center',
		borderRadius: 10,
	},
	ratingText: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginRight: 8,
	},
});

export default Information;
