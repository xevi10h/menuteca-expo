import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import AddressEditModal from '@/components/restaurantCreation/AddressEditModal';
import AddressSection from '@/components/restaurantCreation/AddressSection';
import CuisineSelectionModal from '@/components/restaurantCreation/CuisineSelectionModal';
import CuisineSelectionSection from '@/components/restaurantCreation/CuisineSelectionSection';
import MenusSection from '@/components/restaurantCreation/MenusSection';
import PhotosSection from '@/components/restaurantCreation/PhotosSection';
import ProfilePhotoSection from '@/components/restaurantCreation/ProfilePhotoSection';
import RestaurantTagsSection from '@/components/restaurantCreation/RestaurantTagsSection';
import TagsSelectionModal from '@/components/restaurantCreation/TagsSelectionModal';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

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
	) => {
		setRegisterRestaurantAddress(address);
		if (coordinates) {
			setRegisterRestaurantCoordinates(coordinates);
		}
	};

	const handleSaveCuisines = (selectedCuisine: string | null) => {
		setRegisterRestaurantCuisine(selectedCuisine);
	};

	const handleSaveTags = (selectedTags: string[]) => {
		setRegisterRestaurantTags(selectedTags);
	};

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
				<MenusSection
					menus={registerRestaurant.menus}
					onEditMenu={handleEditMenu}
					onDeleteMenu={handleDeleteMenu}
					onAddMenu={() => {
						setEditingMenuIndex(null);
						setShowMenuModal(true);
					}}
				/>

				{/* Photos Section */}
				<PhotosSection
					images={registerRestaurant.images}
					onImagesAdded={handleAddImages}
					onImageRemoved={removeRegisterRestaurantImage}
				/>

				{/* Food Types Section */}
				<CuisineSelectionSection
					selectedCuisineId={registerRestaurant.cuisineId}
					onEditPress={() => setShowCuisineModal(true)}
				/>

				{/* Tags Section */}
				<RestaurantTagsSection
					selectedTags={registerRestaurant.tags || []}
					onEditPress={() => setShowTagsModal(true)}
				/>

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

			{/* Address Edit Modal */}
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
				selectedCuisine={registerRestaurant.cuisineId}
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
});
