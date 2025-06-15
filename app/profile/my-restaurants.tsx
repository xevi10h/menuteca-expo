import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	Alert,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyRestaurantsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { userRestaurants, removeUserRestaurant } = useUserStore();
	const {
		setRegisterRestaurantName,
		setRegisterRestaurantAddress,
		setRegisterRestaurantCuisineId,
		setRegisterRestaurantProfileImage,
		setRegisterRestaurantTags,
		resetRegisterRestaurant,
	} = useRegisterRestaurantStore();

	const handleAddRestaurant = () => {
		if (userRestaurants.length >= 10) {
			Alert.alert(
				t('profile.maxRestaurantsTitle'),
				t('profile.maxRestaurantsMessage'),
				[{ text: t('general.ok') }],
			);
			return;
		}
		// Reset store before adding new
		resetRegisterRestaurant();
		router.push('/profile/register-restaurant');
	};

	const handleEditRestaurant = (restaurant: Restaurant) => {
		// Load restaurant data into store
		setRegisterRestaurantName(restaurant.name);
		if (restaurant.address) {
			setRegisterRestaurantAddress(restaurant.address);
		}
		if (restaurant.cuisineId) {
			setRegisterRestaurantCuisineId(restaurant.cuisineId);
		}
		if (restaurant.profileImage) {
			setRegisterRestaurantProfileImage(restaurant.profileImage);
		}
		if (restaurant.tags) {
			setRegisterRestaurantTags(restaurant.tags);
		}
		// Navigate to edit screen
		router.push('/profile/register-restaurant/setup/edit');
	};

	const handleDeleteRestaurant = (restaurant: Restaurant) => {
		Alert.alert(
			t('profile.deleteRestaurantTitle'),
			t('profile.deleteRestaurantMessage', { name: restaurant.name }),
			[
				{ text: t('general.cancel'), style: 'cancel' },
				{
					text: t('general.delete'),
					style: 'destructive',
					onPress: () => {
						removeUserRestaurant(restaurant.id);
					},
				},
			],
		);
	};

	const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
		<TouchableOpacity
			style={styles.restaurantCard}
			onPress={() => handleEditRestaurant(item)}
			activeOpacity={0.8}
		>
			<View style={styles.restaurantContent}>
				{/* Restaurant Image */}
				<View style={styles.imageContainer}>
					{item.profileImage ? (
						<Image
							source={{ uri: item.profileImage }}
							style={styles.restaurantImage}
						/>
					) : (
						<View style={styles.imagePlaceholder}>
							<Ionicons
								name="restaurant"
								size={24}
								color={colors.primaryLight}
							/>
						</View>
					)}
				</View>

				{/* Restaurant Info */}
				<View style={styles.infoContainer}>
					<Text style={styles.restaurantName} numberOfLines={1}>
						{item.name}
					</Text>
					<Text style={styles.restaurantAddress} numberOfLines={2}>
						{item.address?.formattedAddress || t('profile.noAddress')}
					</Text>
					<View style={styles.statusContainer}>
						<View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
							<Text style={styles.statusText}>{t('profile.active')}</Text>
						</View>
					</View>
				</View>

				{/* Actions */}
				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => handleEditRestaurant(item)}
					>
						<Ionicons name="pencil" size={20} color={colors.primary} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => handleDeleteRestaurant(item)}
					>
						<Ionicons name="trash-outline" size={20} color="#D32F2F" />
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyContainer}>
			<Ionicons
				name="restaurant-outline"
				size={80}
				color={colors.primaryLight}
			/>
			<Text style={styles.emptyTitle}>{t('profile.noRestaurants')}</Text>
			<Text style={styles.emptySubtitle}>
				{t('profile.noRestaurantsMessage')}
			</Text>
			<TouchableOpacity style={styles.addButton} onPress={handleAddRestaurant}>
				<Ionicons name="add" size={20} color={colors.quaternary} />
				<Text style={styles.addButtonText}>
					{t('profile.addFirstRestaurant')}
				</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('profile.myRestaurants')}</Text>
				<TouchableOpacity
					style={[
						styles.addIconButton,
						userRestaurants.length >= 10 && styles.addIconButtonDisabled,
					]}
					onPress={handleAddRestaurant}
					disabled={userRestaurants.length >= 10}
				>
					<Ionicons name="add" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Restaurant Count */}
			<View style={styles.countContainer}>
				<Text style={styles.countText}>
					{t('profile.restaurantCount', {
						current: userRestaurants.length,
						max: 10,
					})}
				</Text>
			</View>

			{/* Restaurant List */}
			<FlatList
				data={userRestaurants}
				renderItem={renderRestaurantItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={renderEmptyState}
			/>

			{/* Floating Add Button (only if has restaurants) */}
			{userRestaurants.length > 0 && userRestaurants.length < 10 && (
				<TouchableOpacity
					style={[styles.floatingAddButton, { bottom: insets.bottom + 20 }]}
					onPress={handleAddRestaurant}
				>
					<Ionicons name="add" size={28} color={colors.quaternary} />
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	addIconButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addIconButtonDisabled: {
		opacity: 0.3,
	},
	countContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colors.quaternary,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	countText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	listContent: {
		flexGrow: 1,
		paddingVertical: 20,
	},
	restaurantCard: {
		backgroundColor: colors.quaternary,
		marginHorizontal: 20,
		marginBottom: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	restaurantContent: {
		flexDirection: 'row',
		padding: 16,
	},
	imageContainer: {
		marginRight: 16,
	},
	restaurantImage: {
		width: 80,
		height: 80,
		borderRadius: 12,
	},
	imagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 12,
		backgroundColor: colors.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderStyle: 'dashed',
	},
	infoContainer: {
		flex: 1,
		justifyContent: 'space-between',
	},
	restaurantName: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 4,
	},
	restaurantAddress: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		lineHeight: 18,
		marginBottom: 8,
	},
	statusContainer: {
		flexDirection: 'row',
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	actionsContainer: {
		justifyContent: 'space-between',
	},
	actionButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: colors.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 20,
		marginBottom: 10,
	},
	emptySubtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 30,
		lineHeight: 22,
	},
	addButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
		paddingVertical: 14,
		paddingHorizontal: 24,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	addButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	floatingAddButton: {
		position: 'absolute',
		right: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
});
