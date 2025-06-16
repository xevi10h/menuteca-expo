import {
	getUserRestaurantById,
	getUserRestaurantMenus,
	getUserRestaurantStatus,
	updateUserRestaurantStatus,
} from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
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
import { Address, MenuData, Restaurant } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserRestaurantEdit() {
	const { t } = useTranslation();
	const router = useRouter();
	const { userId, restaurantId } = useLocalSearchParams<{
		userId: string;
		restaurantId: string;
	}>();
	const insets = useSafeAreaInsets();

	// Loading and data states
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
	const [isActive, setIsActive] = useState(false);

	// Modal states
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showCuisineModal, setShowCuisineModal] = useState(false);
	const [showTagsModal, setShowTagsModal] = useState(false);

	// Copy menu modal states
	const [showCopyMenuModal, setShowCopyMenuModal] = useState(false);
	const [copyingMenuIndex, setCopyingMenuIndex] = useState<number | null>(null);
	const [newMenuName, setNewMenuName] = useState('');

	useEffect(() => {
		const loadRestaurantData = async () => {
			setLoading(true);
			try {
				// Simular delay de carga
				await new Promise((resolve) => setTimeout(resolve, 500));

				if (restaurantId) {
					const restaurantData = getUserRestaurantById(restaurantId);
					const menusData = getUserRestaurantMenus(restaurantId);
					const statusData = getUserRestaurantStatus(restaurantId);

					if (restaurantData) {
						setRestaurant({
							...restaurantData,
							menus: menusData,
						});
						setIsActive(statusData.isActive);
					}
				}
			} catch (error) {
				console.error('Error loading restaurant data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadRestaurantData();
	}, [restaurantId]);

	const handleBack = () => {
		router.back();
	};

	const handleSave = async () => {
		if (!restaurant) return;

		setSaving(true);
		try {
			// Simular guardado
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Actualizar estado del restaurante
			if (restaurantId) {
				updateUserRestaurantStatus(restaurantId, isActive);
			}

			Alert.alert('Éxito', 'Restaurante actualizado correctamente', [
				{ text: 'OK', onPress: () => router.back() },
			]);
		} catch (error) {
			Alert.alert('Error', 'No se pudo actualizar el restaurante');
		} finally {
			setSaving(false);
		}
	};

	const handleAddImages = (imageUris: string[]) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			images: [...restaurant.images, ...imageUris],
		});
	};

	const handleRemoveImage = (index: number) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			images: restaurant.images.filter((_, i) => i !== index),
		});
	};

	const handleSetProfileImage = (imageUri: string) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			profileImage: imageUri,
		});
	};

	const handleAddMenu = (menu: MenuData) => {
		if (!restaurant) return;

		const updatedMenus = [...restaurant.menus];
		if (editingMenuIndex !== null) {
			updatedMenus[editingMenuIndex] = menu;
			setEditingMenuIndex(null);
		} else {
			updatedMenus.push(menu);
		}

		setRestaurant({
			...restaurant,
			menus: updatedMenus,
		});
		setShowMenuModal(false);
	};

	const handleEditMenu = (index: number) => {
		setEditingMenuIndex(index);
		setShowMenuModal(true);
	};

	const handleCopyMenu = (index: number) => {
		const menuToCopy = restaurant?.menus?.[index];
		if (menuToCopy) {
			setCopyingMenuIndex(index);
			setNewMenuName(`${menuToCopy.name} - Copia`);
			setShowCopyMenuModal(true);
		}
	};

	const handleConfirmCopyMenu = () => {
		if (!restaurant || copyingMenuIndex === null || !newMenuName.trim()) return;

		const menuToCopy = restaurant.menus[copyingMenuIndex];
		if (menuToCopy) {
			const copiedMenu: MenuData = {
				...menuToCopy,
				id: Date.now().toString(),
				name: newMenuName.trim(),
			};

			setRestaurant({
				...restaurant,
				menus: [...restaurant.menus, copiedMenu],
			});
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
		if (!restaurant) return;

		const menuToDelete = restaurant.menus[index];
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
					onPress: () => {
						setRestaurant({
							...restaurant,
							menus: restaurant.menus.filter((_, i) => i !== index),
						});
					},
				},
			],
		);
	};

	const handleSaveAddress = (address: Address) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			address,
		});
	};

	const handleSaveCuisines = (selectedCuisine: string | null) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			cuisineId: selectedCuisine || '',
		});
	};

	const handleSaveTags = (selectedTags: RestaurantTag[]) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			tags: selectedTags,
		});
	};

	const handlePhoneChange = (phone: string) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			phone,
		});
	};

	const handleReservationLinkChange = (reservationLink: string) => {
		if (!restaurant) return;
		setRestaurant({
			...restaurant,
			reservationLink,
		});
	};

	// Helper component for required field indicator
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

	if (loading) {
		return <LoadingScreen />;
	}

	if (!restaurant) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={24} color={colors.primary} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Restaurante no encontrado</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Editar {restaurant.name}</Text>
				<TouchableOpacity
					onPress={handleSave}
					style={[styles.saveButton, saving && styles.saveButtonDisabled]}
					disabled={saving}
				>
					<Text style={styles.saveButtonText}>
						{saving ? 'Guardando...' : 'Guardar'}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Restaurant Status */}
				<View style={styles.sectionContainer}>
					<View style={styles.statusSection}>
						<View style={styles.statusInfo}>
							<Text style={styles.statusTitle}>Estado del restaurante</Text>
							<Text style={styles.statusDescription}>
								{isActive
									? 'Tu restaurante está visible para los usuarios'
									: 'Tu restaurante está oculto y no aparecerá en las búsquedas'}
							</Text>
						</View>
						<Switch
							value={isActive}
							onValueChange={setIsActive}
							trackColor={{
								false: colors.primaryLight,
								true: colors.primary,
							}}
							thumbColor={colors.quaternary}
						/>
					</View>
				</View>

				{/* Profile Photo Section */}
				<ProfilePhotoSection
					profileImage={restaurant.profileImage}
					onImageSelected={handleSetProfileImage}
				/>

				{/* Contact Info */}
				<View style={styles.sectionContainer}>
					<View style={styles.labelContainer}>
						<Text style={styles.sectionTitle}>
							{t('registerRestaurant.contactInfo')}
						</Text>
					</View>
					<ContactInfoSection
						phone={restaurant.phone || ''}
						reservationLink={restaurant.reservationLink || ''}
						onPhoneChange={handlePhoneChange}
						onReservationLinkChange={handleReservationLinkChange}
						showTitle={false}
					/>
				</View>

				{/* Address */}
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
						address={restaurant.address}
						restaurantName={restaurant.name}
						onEditPress={() => setShowAddressModal(true)}
					/>
				</View>

				{/* Menus */}
				<View style={styles.sectionContainer}>
					<RequiredFieldLabel required={true}>
						{t('registerRestaurant.myMenus')}
					</RequiredFieldLabel>
					<MenusSection
						menus={restaurant.menus}
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

				{/* Photos */}
				<View style={styles.sectionContainer}>
					<RequiredFieldLabel required={true}>
						{t('registerRestaurant.uploadPhotos')}
					</RequiredFieldLabel>
					<PhotosSection
						images={restaurant.images}
						onImagesAdded={handleAddImages}
						onImageRemoved={handleRemoveImage}
						showTitle={false}
					/>
				</View>

				{/* Cuisine Type */}
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
						selectedCuisineId={restaurant.cuisineId}
						onEditPress={() => setShowCuisineModal(true)}
						showTitle={false}
					/>
				</View>

				{/* Tags */}
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
						selectedTags={restaurant.tags || []}
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
						? restaurant.menus[editingMenuIndex]
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

			{/* Address Edit Modal */}
			<AddressEditModal
				visible={showAddressModal}
				onClose={() => setShowAddressModal(false)}
				onSave={handleSaveAddress}
				initialAddress={restaurant.address}
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
				selectedTags={restaurant.tags || []}
			/>
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
		borderBottomColor: colors.primaryLight,
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
		flex: 1,
		textAlign: 'center',
		marginHorizontal: 10,
	},
	saveButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	sectionContainer: {
		marginVertical: 15,
	},
	statusSection: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statusInfo: {
		flex: 1,
		marginRight: 16,
	},
	statusTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 4,
	},
	statusDescription: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		lineHeight: 20,
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
	// Copy menu modal styles
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
