import { AddressService, MenuService, RestaurantService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import HeaderModal from '@/components/restaurantCreation/HeaderModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	Animated,
	Dimensions,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditTab from './edit';
import PreviewTab from './preview';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 40; // 20px on each side
const TAB_CONTAINER_WIDTH = screenWidth - HORIZONTAL_PADDING;
const TAB_BUTTON_WIDTH = (TAB_CONTAINER_WIDTH - 8) / 2; // 8px total for padding (4px on each side)

export default function SetupLayout(): React.JSX.Element {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);
	const resetRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.resetRegisterRestaurant,
	);

	const validation = useRegisterRestaurantStore((store) => store.validation);
	const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');
	const [saving, setSaving] = useState(false);

	// Animated value for tab transition
	const translateX = useState(() => new Animated.Value(0))[0];

	const handleBack = (): void => {
		router.back();
	};

	const handleSave = async (): Promise<void> => {
		if (!validation.isValid) {
			// Show validation errors
			const errors: string[] = [];

			if (validation.errors.hasProfileImage) {
				errors.push(t('registerRestaurant.validation.needProfilePhoto'));
			}
			if (validation.errors.hasPhotos) {
				errors.push(t('registerRestaurant.validation.needPhotos'));
			}
			if (validation.errors.hasMenus) {
				errors.push(t('registerRestaurant.validation.needMenus'));
			}
			if (validation.errors.hasCuisine) {
				errors.push(t('registerRestaurant.validation.needCuisine'));
			}
			if (validation.errors.hasAddress) {
				errors.push(t('registerRestaurant.validation.needAddress'));
			}
			if (validation.errors.tooManyTags) {
				errors.push(t('registerRestaurant.validation.tooManyTags'));
			}

			Alert.alert(
				t('registerRestaurant.validation.incomplete'),
				errors.join('\n'),
				[{ text: t('general.ok'), style: 'default' }],
			);
			return;
		}

		setSaving(true);

		try {
			// First create the address if it doesn't have an id
			let addressId: string;

			if (!provisionalRegisterRestaurant.address?.formatted_address) {
				Alert.alert(
					t('validation.error'),
					t('registerRestaurant.validation.needAddress'),
				);
				return;
			}

			// Create address with multilingual format
			const addressData = {
				street: {
					es_ES: provisionalRegisterRestaurant.address.street,
					en_US: provisionalRegisterRestaurant.address.street,
					ca_ES: provisionalRegisterRestaurant.address.street,
					fr_FR: provisionalRegisterRestaurant.address.street,
				},
				number: provisionalRegisterRestaurant.address.number,
				additional_information:
					provisionalRegisterRestaurant.address.additional_information,
				postal_code: provisionalRegisterRestaurant.address.postal_code,
				city: {
					es_ES: provisionalRegisterRestaurant.address.city,
					en_US: provisionalRegisterRestaurant.address.city,
					ca_ES: provisionalRegisterRestaurant.address.city,
					fr_FR: provisionalRegisterRestaurant.address.city,
				},
				country: {
					es_ES: provisionalRegisterRestaurant.address.country,
					en_US: provisionalRegisterRestaurant.address.country,
					ca_ES: provisionalRegisterRestaurant.address.country,
					fr_FR: provisionalRegisterRestaurant.address.country,
				},
				coordinates: provisionalRegisterRestaurant.address.coordinates,
				formatted_address:
					provisionalRegisterRestaurant.address.formatted_address,
			};

			const addressResult = await AddressService.createAddress(addressData);
			if (!addressResult.success || !addressResult.data) {
				Alert.alert(t('validation.error'), addressResult.error);
				return;
			}

			console.log('Address created with ID:', addressResult.data?.id);

			addressId = addressResult.data.id || '';
			if (!addressId) {
				Alert.alert(t('validation.error'), 'Address ID not returned');
				return;
			}

			// Create restaurant with file upload support
			const restaurantData = {
				name: provisionalRegisterRestaurant.name,
				minimum_price: provisionalRegisterRestaurant.minimum_price,
				cuisine_id: provisionalRegisterRestaurant.cuisineId,
				address_id: addressId,
				profile_image: provisionalRegisterRestaurant.profile_image,
				images: provisionalRegisterRestaurant.images,
				main_image: provisionalRegisterRestaurant.images[0] || '',
				tags: provisionalRegisterRestaurant.tags,
				phone: provisionalRegisterRestaurant.phone,
				reservation_link: provisionalRegisterRestaurant.reservation_link,
			};

			const result = await RestaurantService.createRestaurant(restaurantData);

			if (!result.success || !result.data) {
				Alert.alert(
					t('validation.error'),
					result.error || 'Failed to create restaurant',
				);
				return;
			}

			const createdRestaurant = result.data;
			const restaurantId = createdRestaurant.id;

			// Create menus for the restaurant
			const menusToCreate = provisionalRegisterRestaurant.menus || [];
			for (const menu of menusToCreate) {
				const menuData = {
					name: menu.name,
					days: menu.days,
					start_time: menu.start_time,
					end_time: menu.end_time,
					price: menu.price,
					first_courses_to_share: menu.first_courses_to_share,
					second_courses_to_share: menu.second_courses_to_share,
					desserts_to_share: menu.desserts_to_share,
					includes_bread: menu.includes_bread,
					drinks: menu.drinks,
					includes_coffee_and_dessert: menu.includes_coffee_and_dessert,
					minimum_people: menu.minimum_people,
					has_minimum_people: menu.has_minimum_people,
				};

				const menuResult = await MenuService.createMenu(restaurantId, menuData);
				if (!menuResult.success) {
					console.warn('Failed to create menu:', menuResult.error);
				}
			}

			// Reset store
			resetRegisterRestaurant();

			// Navigate back to profile
			router.dismissAll();

			// Show success alert
			setTimeout(() => {
				Alert.alert(
					t('registerRestaurant.success.title'),
					t('registerRestaurant.success.message'),
					[{ text: t('general.ok'), style: 'default' }],
				);
			}, 200);
		} catch (error) {
			Alert.alert(
				t('validation.error'),
				error instanceof Error ? error.message : 'Unknown error occurred',
			);
		} finally {
			setSaving(false);
		}
	};

	const showValidationAlert = () => {
		const errors: string[] = [];

		if (validation.errors.hasProfileImage) {
			errors.push(t('registerRestaurant.validation.needProfilePhoto'));
		}
		if (validation.errors.hasPhotos) {
			errors.push(t('registerRestaurant.validation.needPhotos'));
		}
		if (validation.errors.hasMenus) {
			errors.push(t('registerRestaurant.validation.needMenus'));
		}
		if (validation.errors.hasCuisine) {
			errors.push(t('registerRestaurant.validation.needCuisine'));
		}
		if (validation.errors.hasAddress) {
			errors.push(t('registerRestaurant.validation.needAddress'));
		}
		if (validation.errors.tooManyTags) {
			errors.push(t('registerRestaurant.validation.tooManyTags'));
		}

		Alert.alert(
			t('registerRestaurant.validation.incomplete'),
			errors.join('\n'),
			[{ text: t('general.ok'), style: 'default' }],
		);
	};

	const handleTabPress = (tab: 'edit' | 'preview') => {
		if (tab === currentTab) return;

		// Check if preview tab and validation fails
		if (tab === 'preview' && !validation.isValid) {
			showValidationAlert();
			return;
		}

		const toIndex = tab === 'edit' ? 0 : 1;
		const targetTranslateX = -toIndex * screenWidth;

		Animated.timing(translateX, {
			toValue: targetTranslateX,
			duration: 300,
			useNativeDriver: true,
		}).start();

		setCurrentTab(tab);
	};

	// Custom Tab Bar Component
	const renderTabBar = () => {
		return (
			<View style={styles.tabContainer}>
				<View style={styles.tabBackground}>
					{/* Animated Indicator */}
					<Animated.View
						style={[
							styles.tabIndicator,
							{
								transform: [
									{
										translateX: translateX.interpolate({
											inputRange: [-screenWidth, 0],
											outputRange: [TAB_BUTTON_WIDTH, 0],
											extrapolate: 'clamp',
										}),
									},
								],
							},
						]}
					/>

					{/* Edit Tab Button */}
					<TouchableOpacity
						style={styles.tabButton}
						onPress={() => handleTabPress('edit')}
						activeOpacity={0.7}
					>
						<Animated.Text
							style={[
								styles.tabText,
								{
									color:
										currentTab === 'edit' ? colors.quaternary : colors.primary,
								},
							]}
						>
							{t('general.edit') || 'Editor'}
						</Animated.Text>
					</TouchableOpacity>

					{/* Preview Tab Button */}
					<TouchableOpacity
						style={styles.tabButton}
						onPress={() => handleTabPress('preview')}
						activeOpacity={0.7}
					>
						<Animated.Text
							style={[
								styles.tabText,

								{
									color:
										currentTab === 'preview'
											? colors.quaternary
											: colors.primary,
								},
							]}
						>
							{t('general.preview') || 'Visualizar'}
						</Animated.Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<HeaderModal
				title={provisionalRegisterRestaurant.name}
				handleClose={handleBack}
				handleSave={handleSave}
				saveDisabled={!validation.isValid || saving}
			/>

			{/* Custom Tab Bar */}
			{renderTabBar()}

			{/* Content Container */}
			<View style={styles.contentContainer}>
				<Animated.View
					style={[
						styles.slidingContent,
						{
							transform: [{ translateX }],
						},
					]}
				>
					{/* Edit Tab Content */}
					<View style={styles.tabContent}>
						<EditTab />
					</View>

					{/* Preview Tab Content */}
					<View style={styles.tabContent}>
						<PreviewTab />
					</View>
				</Animated.View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	tabContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	tabBackground: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		padding: 4,
		position: 'relative',
		height: 44,
	},
	tabIndicator: {
		position: 'absolute',
		top: 4,
		left: 4,
		bottom: 4,
		width: TAB_BUTTON_WIDTH,
		backgroundColor: colors.primary,
		borderRadius: 6,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	tabButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
		zIndex: 1,
	},
	tabText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.quaternary,
		textAlign: 'center',
		fontWeight: '500',
	},
	contentContainer: {
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
});
