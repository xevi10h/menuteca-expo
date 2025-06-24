import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import AddressEditModal from '@/components/restaurantCreation/AddressEditModal';
import AddressSection from '@/components/restaurantCreation/AddressSection';
import ContactInfoSection from '@/components/restaurantCreation/ContactInfoSection';
import CuisineSelectionModal from '@/components/restaurantCreation/CuisineSelectionModal';
import CuisineSelectionSection from '@/components/restaurantCreation/CuisineSelectionSection';
import MenusSection from '@/components/restaurantCreation/MenusSection';
import PhotosSection from '@/components/restaurantCreation/PhotosSection';
import ProfilePhotoSection from '@/components/restaurantCreation/ProfilePhotoSection';
import TagsSection from '@/components/restaurantCreation/TagsSection';
import TagsSelectionModal from '@/components/restaurantCreation/TagsSelectionModal';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { Address, MenuData } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

export default function EditTab() {
	const { t } = useTranslation();
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showCuisineModal, setShowCuisineModal] = useState(false);
	const [showTagsModal, setShowTagsModal] = useState(false);

	// Estados para el modal de copiar menú
	const [showCopyMenuModal, setShowCopyMenuModal] = useState(false);
	const [copyingMenuIndex, setCopyingMenuIndex] = useState<number | null>(null);
	const [newMenuName, setNewMenuName] = useState('');

	const {
		registerRestaurant,
		setRegisterRestaurantProfileImage,
		addRegisterRestaurantImage,
		removeRegisterRestaurantImage,
		addRegisterRestaurantMenu,
		updateRegisterRestaurantMenu,
		removeRegisterRestaurantMenu,
		setRegisterRestaurantAddress,
		setRegisterRestaurantCuisineId,
		setRegisterRestaurantTags,
		setRegisterRestaurantPhone,
		setRegisterRestaurantReservationLink,
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

	const handleCopyMenu = (index: number) => {
		const menuToCopy = registerRestaurant.menus?.[index];
		if (menuToCopy) {
			setCopyingMenuIndex(index);
			setNewMenuName(
				t('registerRestaurant.menuNameCopy', {
					menuName: menuToCopy.name,
				}),
			);
			setShowCopyMenuModal(true);
		}
	};

	const handleConfirmCopyMenu = () => {
		if (copyingMenuIndex !== null && newMenuName.trim()) {
			const menuToCopy = registerRestaurant.menus?.[copyingMenuIndex];
			if (menuToCopy) {
				const copiedMenu: MenuData = {
					...menuToCopy,
					id: Date.now().toString(), // Nuevo ID único
					name: newMenuName.trim(),
				};
				addRegisterRestaurantMenu(copiedMenu);
			}
		}
		setShowCopyMenuModal(false);
		setCopyingMenuIndex(null);
		setNewMenuName('');
	};

	const handleCancelCopyMenu = () => {
		setShowCopyMenuModal(false);
		setCopyingMenuIndex(null);
		setNewMenuName('');
	};

	const handleDeleteMenu = (index: number) => {
		const menuToDelete = registerRestaurant.menus?.[index];
		Alert.alert(
			t('registerRestaurant.deleteMenuTitle'),
			t('registerRestaurant.deleteMenuMessage', {
				menuName: menuToDelete?.name || '',
			}),
			[
				{
					text: t('general.cancel'),
					style: 'cancel',
				},
				{
					text: t('general.delete'),
					style: 'destructive',
					onPress: () => removeRegisterRestaurantMenu(index),
				},
			],
		);
	};

	const handleSaveAddress = (address: Address) => {
		setRegisterRestaurantAddress(address);
	};

	const handleSaveCuisines = (selectedCuisine: string | null) => {
		setRegisterRestaurantCuisineId(selectedCuisine);
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
				<View style={styles.sectionContainer}>
					<View style={styles.labelContainer}>
						<Text style={styles.sectionTitle}>
							{t('registerRestaurant.contactInfo')}
						</Text>
					</View>
					<ContactInfoSection
						phone={registerRestaurant.phone || ''}
						reservationLink={registerRestaurant.reservationLink || ''}
						onPhoneChange={setRegisterRestaurantPhone}
						onReservationLinkChange={setRegisterRestaurantReservationLink}
						showTitle={false}
					/>
				</View>

				<View style={styles.sectionContainer}>
					<View style={styles.sectionHeaderWithEdit}>
						<RequiredFieldLabel required={true}>
							{t('registerRestaurant.address')}
						</RequiredFieldLabel>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => setShowAddressModal(true)}
						>
							<Ionicons
								name="pencil-outline"
								size={16}
								color={colors.primary}
							/>
						</TouchableOpacity>
					</View>
					<AddressSection
						address={registerRestaurant.address}
						restaurantName={registerRestaurant.name}
						onEditPress={() => setShowAddressModal(true)}
					/>
				</View>

				{/* Menus Section */}
				<View style={styles.sectionContainer}>
					<RequiredFieldLabel required={true}>
						{t('registerRestaurant.myMenus')}
					</RequiredFieldLabel>
					<MenusSection
						menus={registerRestaurant.menus}
						onEditMenu={handleEditMenu}
						onCopyMenu={handleCopyMenu}
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
						selectedCuisineId={registerRestaurant.cuisineId}
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

			{/* Copy Menu Modal */}
			<Modal visible={showCopyMenuModal} animationType="fade" transparent>
				<View style={styles.modalOverlay}>
					<View style={styles.copyMenuModal}>
						<View style={styles.copyMenuHeader}>
							<Text style={styles.copyMenuTitle}>
								{t('registerRestaurant.copyMenuTitle')}
							</Text>
						</View>

						<Text style={styles.copyMenuDescription}>
							{t('registerRestaurant.copyMenuDescription')}
						</Text>

						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>
								{t('registerRestaurant.newMenuName')}
							</Text>
							<TextInput
								style={styles.copyMenuInput}
								value={newMenuName}
								onChangeText={setNewMenuName}
								placeholder={t('registerRestaurant.menuNamePlaceholder')}
								placeholderTextColor={colors.primaryLight}
								autoFocus
							/>
						</View>

						<View style={styles.copyMenuButtons}>
							<TouchableOpacity
								style={[styles.copyMenuButton, styles.cancelButton]}
								onPress={handleCancelCopyMenu}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.copyMenuButton,
									styles.confirmButton,
									!newMenuName.trim() && styles.confirmButtonDisabled,
								]}
								onPress={handleConfirmCopyMenu}
								disabled={!newMenuName.trim()}
							>
								<Text
									style={[
										styles.confirmButtonText,
										!newMenuName.trim() && styles.confirmButtonTextDisabled,
									]}
								>
									{t('registerRestaurant.copyMenu')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<AddressEditModal
				visible={showAddressModal}
				onClose={() => setShowAddressModal(false)}
				onSave={handleSaveAddress}
				initialAddress={registerRestaurant.address}
			/>

			{/* Cuisine Selection Modal */}
			<CuisineSelectionModal
				visible={showCuisineModal}
				onClose={() => setShowCuisineModal(false)}
				onSave={handleSaveCuisines}
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
		gap: 2,
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
	// Estilos para el modal de copiar menú
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	copyMenuModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 400,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	copyMenuHeader: {
		alignItems: 'center',
		marginBottom: 15,
	},
	copyMenuTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	copyMenuDescription: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
		lineHeight: 20,
	},
	inputContainer: {
		marginBottom: 25,
	},
	inputLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 8,
	},
	copyMenuInput: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	copyMenuButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 15,
	},
	copyMenuButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: colors.primary,
	},
	confirmButton: {
		backgroundColor: colors.primary,
	},
	confirmButtonDisabled: {
		backgroundColor: colors.primaryLight,
		opacity: 0.6,
	},
	cancelButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	confirmButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	confirmButtonTextDisabled: {
		color: colors.quaternary,
		opacity: 0.7,
	},
});
