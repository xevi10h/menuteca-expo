import { colors } from '@/assets/styles/colors';
import { Restaurant } from '@/components/list/ScrollHorizontalResturant';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data - en producción esto vendría de una API
const getRestaurantById = (id: string): Restaurant => {
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

	return restaurants.find((r) => r.id === parseInt(id)) || restaurants[0];
};

export default function RestaurantDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const restaurant = getRestaurantById(id!);

	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: restaurant.image }}
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
						<Text style={styles.restaurantIconText}>
							{restaurant.name
								.split(' ')
								.map((word) => word[0])
								.join('')
								.slice(0, 2)}
						</Text>
					</View>
					<View style={styles.restaurantDetails}>
						<Text style={styles.restaurantName}>{restaurant.name}</Text>
						<View
							style={{ flexDirection: 'row', gap: 5, alignItems: 'baseline' }}
						>
							<Text style={styles.priceFromText}>{t('general.from')}</Text>
							<Text style={styles.priceText}>{restaurant.minimumPrice}€</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Content */}
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Restaurant Info Header */}

				{/* Information Tab */}
				<View style={styles.tabContainer}>
					<TouchableOpacity style={[styles.tab, styles.activeTab]}>
						<Text style={[styles.tabText, styles.activeTabText]}>
							{t('restaurant.information')}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.tab}>
						<Text style={styles.tabText}>{t('restaurant.menu')}</Text>
					</TouchableOpacity>
				</View>

				{/* Tags */}
				<View style={styles.tagsContainer}>
					<View style={styles.tag}>
						<Text style={styles.tagText}>
							{t(`cuisinesRestaurants.${restaurant.cuisine}`)}
						</Text>
					</View>
					<View style={styles.tag}>
						<Text style={styles.tagText}>{t('restaurant.vegetarian')}</Text>
					</View>
					<View style={styles.tag}>
						<Text style={styles.tagText}>{t('restaurant.glutenFree')}</Text>
					</View>
					<View style={styles.tag}>
						<Text style={styles.tagText}>{t('restaurant.vegan')}</Text>
					</View>
				</View>

				{/* Address */}
				<View style={styles.addressContainer}>
					<Ionicons name="location-outline" size={16} color={colors.primary} />
					<Text style={styles.addressText}>Rector Ubach 50, Barcelona</Text>
				</View>

				{/* Map placeholder */}
				<View style={styles.mapPlaceholder}>
					<Text style={styles.mapPlaceholderText}>
						{t('restaurant.mapPlaceholder')}
					</Text>
				</View>

				{/* Photos Section */}
				<View style={styles.photosSection}>
					<Text style={styles.sectionTitle}>{t('restaurant.photos')}</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<Image
							source={{ uri: restaurant.image }}
							style={styles.photoItem}
						/>
						<Image
							source={{ uri: restaurant.image }}
							style={styles.photoItem}
						/>
						<Image
							source={{ uri: restaurant.image }}
							style={styles.photoItem}
						/>
					</ScrollView>
				</View>

				{/* Reviews Section */}
				<View style={styles.reviewsSection}>
					<Text style={styles.sectionTitle}>{t('restaurant.reviews')}</Text>
					<View style={styles.ratingContainer}>
						<Text style={styles.ratingText}>{restaurant.rating} / 5</Text>
						<Ionicons name="star" size={20} color="#FFD700" />
					</View>
				</View>

				{/* Bottom spacing */}
				<View style={{ height: 100 }} />
			</ScrollView>
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
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	},
	backButton: {
		position: 'absolute',
		left: 20,
		width: 40,
		height: 40,
		borderRadius: 20,

		justifyContent: 'center',
		alignItems: 'center',
	},
	shareButton: {
		position: 'absolute',
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,

		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		backgroundColor: colors.secondary,
		marginTop: -30,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
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
		marginBottom: 20,
	},
	tab: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginRight: 10,
		borderRadius: 20,
		backgroundColor: 'transparent',
	},
	activeTab: {
		backgroundColor: colors.primary,
	},
	tabText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.tertiary,
	},
	activeTabText: {
		color: colors.secondary,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
	},
	tag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		marginRight: 8,
		marginBottom: 8,
	},
	tagText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
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
	mapPlaceholder: {
		height: 150,
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 30,
	},
	mapPlaceholderText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.tertiary,
	},
	photosSection: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 15,
	},
	photoItem: {
		width: 120,
		height: 80,
		borderRadius: 10,
		marginRight: 10,
	},
	reviewsSection: {
		marginBottom: 30,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		backgroundColor: colors.quaternary,
		borderRadius: 10,
	},
	ratingText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginRight: 8,
	},
});
