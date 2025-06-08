import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import AddressEditModal from '@/components/restaurantCreation/AddressEditModal';
import AddressSection from '@/components/restaurantCreation/AddressSection';
import CuisineSelectionModal from '@/components/restaurantCreation/CuisineSelectionModal';
import CuisineSelectionSection from '@/components/restaurantCreation/CuisineSelectionSection';
import MenusSection from '@/components/restaurantCreation/MenusSection';
import PhotosSection from '@/components/restaurantCreation/PhotosSection';
import ProfilePhotoSection from '@/components/restaurantCreation/ProfilePhotoSection';
import TagsSection from '@/components/restaurantCreation/TagsSection';
import TagsSelectionModal from '@/components/restaurantCreation/TagsSelectionModal';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { MenuData } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

// Interface for enhanced address components
interface AddressComponents {
	street: string;
	number: string;
	additionalNumber: string;
	city: string;
	postalCode: string;
	country: string;
}

export default function EditTab() {
	const { t } = useTranslation();
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showCuisineModal, setShowCuisineModal] = useState(false);
	const [showTagsModal, setShowTagsModal] = useState(false);

	const {
		registerRestaurant,
		setRegisterRestaurantProfileImage,
		addRegisterRestaurantImage,
		removeRegisterRestaurantImage,
		addRegisterRestaurantMenu,
		updateRegisterRestaurantMenu,
		removeRegisterRestaurantMenu,
		setRegisterRestaurantAddress,
		setRegisterRestaurantCoordinates,
		setRegisterRestaurantCuisine,
		setRegisterRestaurantTags,
	} = useRegisterRestaurantStore();

	const handleAddImages = (imageUris: string[]) => {
		imageUris.forEach((uri) => {
			addRegisterRestaurantImage(uri);
		});
	};

	const handleAddMenu = (menu: MenuData) => {
		if (editingMenuIndex !== null) {
			updateRegisterRestaurantMenu(editingMenuIndex, menu);
			setEditingMenuIndex(null);
		} else {
			addRegisterRestaurantMenu(menu);
		}
		setShowMenuModal(false);
	};

	const handleEditMenu = (index: number) => {
		setEditingMenuIndex(index);
		setShowMenuModal(true);
	};

	const handleDeleteMenu = (index: number) => {
		Alert.alert(
			t('registerRestaurant.deleteMenuTitle'),
			t('registerRestaurant.deleteMenuMessage'),
			[
				{ text: t('general.cancel'), style: 'cancel' },
				{
					text: t('general.delete'),
					style: 'destructive',
					onPress: () => removeRegisterRestaurantMenu(index),
				},
			],
		);
	};

	const handleSaveAddress = (
		address: string,
		coordinates?: { latitude: number; longitude: number },
		addressComponents?: AddressComponents,
	) => {
		setRegisterRestaurantAddress(address);
		if (coordinates) {
			setRegisterRestaurantCoordinates(coordinates);
		}
		// You could also store the addressComponents if needed for more detailed address info
		console.log('Address components:', addressComponents);
	};

	const handleSaveCuisines = (selectedCuisine: string | null) => {
		setRegisterRestaurantCuisine(selectedCuisine);
	};

	const handleSaveTags = (selectedTags: RestaurantTag[]) => {
		setRegisterRestaurantTags(selectedTags);
	};

	// Helper component for required field indicator with red asterisk
	const RequiredFieldLabel = ({
		children,
		required = false,
	}: {
		children: React.ReactNode;
		required?: boolean;
	}) => (
		<View style={styles.labelContainer}>
			<Text style={styles.sectionTitle}>{children}</Text>
			{required && <Text style={styles.requiredAsterisk}> *</Text>}
		</View>
	);

	return (
		<>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Profile Photo Section */}
				<ProfilePhotoSection
					profileImage={registerRestaurant.profileImage}
					onImageSelected={setRegisterRestaurantProfileImage}
				/>

				{/* Address Section */}
				<AddressSection
					address={registerRestaurant.address}
					coordinates={registerRestaurant.coordinates}
					restaurantName={registerRestaurant.name}
					onEditPress={() => setShowAddressModal(true)}
				/>

				{/* Menus Section */}
				<View style={styles.sectionContainer}>
					<RequiredFieldLabel required={true}>
						{t('registerRestaurant.myMenus')}
					</RequiredFieldLabel>
					<MenusSection
						menus={registerRestaurant.menus}
						onEditMenu={handleEditMenu}
						onDeleteMenu={handleDeleteMenu}
						onAddMenu={() => {
							setEditingMenuIndex(null);
							setShowMenuModal(true);
						}}
						showTitle={false}
					/>
				</View>

				{/* Photos Section */}
				<View style={styles.sectionContainer}>
					<RequiredFieldLabel required={true}>
						{t('registerRestaurant.uploadPhotos')}
					</RequiredFieldLabel>
					<PhotosSection
						images={registerRestaurant.images}
						onImagesAdded={handleAddImages}
						onImageRemoved={removeRegisterRestaurantImage}
						showTitle={false}
					/>
				</View>

				{/* Food Types Section */}
				<View style={styles.sectionContainer}>
					<View style={styles.sectionHeaderWithEdit}>
						<RequiredFieldLabel required={true}>
							{t('registerRestaurant.foodType')}
						</RequiredFieldLabel>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => setShowCuisineModal(true)}
						>
							<Ionicons
								name="pencil-outline"
								size={16}
								color={colors.primary}
							/>
						</TouchableOpacity>
					</View>
					<CuisineSelectionSection
						selectedCuisineId={registerRestaurant.cuisine}
						onEditPress={() => setShowCuisineModal(true)}
						showTitle={false}
					/>
				</View>

				{/* Tags Section */}
				<View style={styles.sectionContainer}>
					<View style={styles.sectionHeaderWithEdit}>
						<RequiredFieldLabel required={false}>
							{t('registerRestaurant.categories')}
						</RequiredFieldLabel>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => setShowTagsModal(true)}
						>
							<Ionicons
								name="pencil-outline"
								size={16}
								color={colors.primary}
							/>
						</TouchableOpacity>
					</View>
					<TagsSection
						selectedTags={registerRestaurant.tags || []}
						onEditPress={() => setShowTagsModal(true)}
						showTitle={false}
					/>
				</View>

				<View style={{ height: 50 }} />
			</ScrollView>

			{/* Menu Creation Modal */}
			<MenuCreationModal
				visible={showMenuModal}
				onClose={() => {
					setShowMenuModal(false);
					setEditingMenuIndex(null);
				}}
				onSave={handleAddMenu}
				editingMenu={
					editingMenuIndex !== null
						? registerRestaurant.menus?.[editingMenuIndex]
						: undefined
				}
			/>

			{/* Enhanced Address Edit Modal */}
			<AddressEditModal
				visible={showAddressModal}
				onClose={() => setShowAddressModal(false)}
				onSave={handleSaveAddress}
				initialAddress={registerRestaurant.address}
				initialCoordinates={registerRestaurant.coordinates}
			/>

			{/* Cuisine Selection Modal */}
			<CuisineSelectionModal
				visible={showCuisineModal}
				onClose={() => setShowCuisineModal(false)}
				onSave={handleSaveCuisines}
				selectedCuisine={registerRestaurant.cuisine}
			/>

			{/* Tags Selection Modal */}
			<TagsSelectionModal
				visible={showTagsModal}
				onClose={() => setShowTagsModal(false)}
				onSave={handleSaveTags}
				selectedTags={registerRestaurant.tags || []}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 20,
		backgroundColor: colors.secondary,
	},
	sectionContainer: {
		marginVertical: 15,
	},
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	sectionHeaderWithEdit: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	requiredAsterisk: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: '#D32F2F',
	},
	editButton: {
		padding: 5,
	},
});
