import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function EditTab() {
	const language = useUserStore((state) => state.user.language);
	const { t } = useTranslation();
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showCuisineModal, setShowCuisineModal] = useState(false);
	const [tempAddress, setTempAddress] = useState('');

	const {
		registerRestaurant,
		setRegisterRestaurantProfileImage,
		addRegisterRestaurantImage,
		removeRegisterRestaurantImage,
		addRegisterRestaurantMenu,
		updateRegisterRestaurantMenu,
		removeRegisterRestaurantMenu,
		setRegisterRestaurantAddress,
		setRegisterRestaurantCuisine,
	} = useRegisterRestaurantStore();

	const handlePickProfileImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permisos necesarios',
				'Necesitamos permisos para acceder a tus fotos',
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setRegisterRestaurantProfileImage(result.assets[0].uri);
		}
	};

	const handlePickImages = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permisos necesarios',
				'Necesitamos permisos para acceder a tus fotos',
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			result.assets.forEach((asset) => {
				addRegisterRestaurantImage(asset.uri);
			});
		}
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
			'Eliminar menú',
			'¿Estás seguro de que quieres eliminar este menú?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: () => removeRegisterRestaurantMenu(index),
				},
			],
		);
	};

	const handleSaveAddress = () => {
		setRegisterRestaurantAddress(tempAddress);
		setShowAddressModal(false);
		setTempAddress('');
	};

	const handleOpenAddressModal = () => {
		setTempAddress(registerRestaurant.address || '');
		setShowAddressModal(true);
	};

	const handleSaveCuisines = (selectedCuisine: string | null) => {
		setRegisterRestaurantCuisine(selectedCuisine);
		setShowCuisineModal(false);
	};

	return (
		<>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Profile Photo Section */}
				<View style={styles.photoSection}>
					<Text style={styles.photoLabel}>
						{t('registerRestaurant.selectPhoto')}
					</Text>
					<TouchableOpacity
						style={styles.photoPlaceholder}
						onPress={handlePickProfileImage}
					>
						{registerRestaurant.profileImage ? (
							<Image
								source={{ uri: registerRestaurant.profileImage }}
								style={styles.profileImage}
								resizeMode="cover"
							/>
						) : (
							<Ionicons name="image-outline" size={40} color={colors.primary} />
						)}
					</TouchableOpacity>
				</View>

				{/* Address Section */}
				<View style={styles.addressSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							{t('registerRestaurant.address')}
						</Text>
						<TouchableOpacity
							style={styles.editButton}
							onPress={handleOpenAddressModal}
						>
							<Ionicons
								name="pencil-outline"
								size={16}
								color={colors.primary}
							/>
						</TouchableOpacity>
					</View>
					<MapView
						style={styles.miniMap}
						initialRegion={{
							latitude: registerRestaurant.coordinates?.latitude || 41.3851,
							longitude: registerRestaurant.coordinates?.longitude || 2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
						scrollEnabled={false}
						zoomEnabled={false}
					>
						<Marker
							coordinate={{
								latitude: registerRestaurant.coordinates?.latitude || 41.3851,
								longitude: registerRestaurant.coordinates?.longitude || 2.1734,
							}}
							title={registerRestaurant.name}
							description={registerRestaurant.address}
						/>
					</MapView>
					{registerRestaurant.address && (
						<Text style={styles.addressText}>{registerRestaurant.address}</Text>
					)}
				</View>

				{/* Menus Section */}
				<View style={styles.menusSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.myMenus')}
					</Text>
					<View
						style={{
							gap: 10,
						}}
					>
						{registerRestaurant.menus?.map((menu, index) => (
							<View style={styles.menuItem} key={index}>
								<View key={index} style={styles.menuNameContainer}>
									<Text style={styles.menuName}>
										{menu.name || 'Menú de mediodía'}
									</Text>
								</View>
								<View style={styles.menuActions}>
									<TouchableOpacity onPress={() => handleEditMenu(index)}>
										<Ionicons
											name="pencil-outline"
											size={20}
											color={colors.primary}
										/>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => handleDeleteMenu(index)}>
										<Ionicons
											name="trash-outline"
											size={20}
											color={colors.primary}
										/>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
					<TouchableOpacity
						style={styles.addMenuButton}
						onPress={() => {
							setEditingMenuIndex(null);
							setShowMenuModal(true);
						}}
					>
						<Ionicons name="add" size={20} color={colors.primary} />
						<Text style={styles.addMenuText}>
							{t('registerRestaurant.addMenu')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Photos Section */}
				<View style={styles.photosSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.uploadPhotos')}
					</Text>
					<Text style={styles.sectionSubtitle}>
						{t('registerRestaurant.uploadPhotosDescription')}
					</Text>

					{registerRestaurant.images &&
						registerRestaurant.images.length > 0 && (
							<ScrollView
								horizontal
								style={styles.imagesContainer}
								showsHorizontalScrollIndicator={false}
							>
								{registerRestaurant.images.map((image, index) => (
									<View key={index} style={styles.imageWrapper}>
										<Image
											source={{ uri: image }}
											style={styles.uploadedImage}
										/>
										<TouchableOpacity
											style={styles.removeImageButton}
											onPress={() => removeRegisterRestaurantImage(index)}
										>
											<Ionicons
												name="close"
												size={16}
												color={colors.quaternary}
											/>
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}

					<TouchableOpacity
						style={styles.uploadButton}
						onPress={handlePickImages}
					>
						<Text style={styles.uploadButtonText}>
							{t('registerRestaurant.uploadPhotos')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Food Types Section */}
				<View style={styles.foodTypesSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							{t('registerRestaurant.foodType')}
						</Text>
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
					<Text style={styles.sectionSubtitle}>
						{t('registerRestaurant.cuisineTypes')}
					</Text>

					<View style={styles.selectedCuisine}>
						{registerRestaurant?.cuisineId ? (
							<View
								key={registerRestaurant?.cuisineId}
								style={styles.selectedCuisineTag}
							>
								<Text style={styles.selectedCuisineText}>
									{
										allCuisines.find(
											(c) => c.id === registerRestaurant?.cuisineId,
										)?.name[language]
									}
								</Text>
							</View>
						) : (
							<View key={'no-cuisine'} style={styles.selectedCuisineTag}>
								<Text style={styles.selectedCuisineText}>
									{t('registerRestaurant.noCuisinesSelected')}
								</Text>
							</View>
						)}
					</View>
					<View style={{ height: 50 }} />
				</View>
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
			<Modal
				visible={showAddressModal}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowAddressModal(false)}>
							<Text style={styles.cancelText}>{t('general.cancel')}</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{t('registerRestaurant.address')}
						</Text>
						<TouchableOpacity onPress={handleSaveAddress}>
							<Text style={styles.saveText}>{t('general.save')}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.modalContent}>
						<Text style={styles.label}>
							{t('registerRestaurant.addressSubtitle')}
						</Text>
						<TextInput
							style={styles.input}
							placeholder={t('registerRestaurant.addressPlaceholder')}
							value={tempAddress}
							onChangeText={setTempAddress}
							multiline
						/>
					</View>
				</View>
			</Modal>

			{/* Cuisine Selection Modal */}
			<CuisineSelectionModal
				visible={showCuisineModal}
				onClose={() => setShowCuisineModal(false)}
				onSave={handleSaveCuisines}
				selectedCuisine={registerRestaurant.cuisineId}
			/>
		</>
	);
}

// Cuisine Selection Modal Component
interface CuisineSelectionModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (cuisine: string | null) => void;
	selectedCuisine?: string;
}

function CuisineSelectionModal({
	visible,
	onClose,
	onSave,
	selectedCuisine,
}: CuisineSelectionModalProps) {
	const { t } = useTranslation();
	const language = useUserStore((state) => state.user.language);
	const [tempSelected, setTempSelected] = useState<string | undefined>(
		selectedCuisine,
	);

	const handleToggleCuisine = (cuisineId: string) => {
		setTempSelected((prev) => (prev === cuisineId ? undefined : cuisineId));
	};

	const handleSave = () => {
		onSave(tempSelected || null);
		onClose();
	};

	React.useEffect(() => {
		if (visible) {
			setTempSelected(selectedCuisine);
		}
	}, [visible, selectedCuisine]);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity onPress={onClose}>
						<Text style={styles.cancelText}>{t('general.cancel')}</Text>
					</TouchableOpacity>
					<Text style={styles.modalTitle}>
						{t('registerRestaurant.foodType')}
					</Text>
					<TouchableOpacity onPress={handleSave}>
						<Text style={styles.saveText}>{t('general.save')}</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.cuisineTypesSubtitle')}
					</Text>
					<View style={styles.cuisineGrid}>
						{allCuisines.map((cuisine) => (
							<TouchableOpacity
								key={cuisine.id}
								style={[
									styles.cuisineButton,
									tempSelected === cuisine.id && styles.cuisineButtonSelected,
								]}
								onPress={() => handleToggleCuisine(cuisine.id)}
							>
								<Text
									style={[
										styles.cuisineButtonText,
										tempSelected === cuisine.id &&
											styles.cuisineButtonTextSelected,
									]}
								>
									{cuisine.name[language]}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 20,
		backgroundColor: colors.secondary,
	},
	photoSection: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	photoLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	photoPlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	profileImage: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},
	addressSection: {
		paddingVertical: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		padding: 5,
	},
	miniMap: {
		height: 150,
		borderRadius: 10,
		overflow: 'hidden',
		marginBottom: 10,
	},
	addressText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
	},
	menusSection: {
		marginVertical: 15,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	menuNameContainer: {
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderRadius: 12,
		borderColor: colors.primary,
		borderWidth: 1,
		flex: 1,
		marginRight: 10,
	},
	menuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
		flex: 1,
	},
	menuActions: {
		flexDirection: 'row',
		gap: 15,
	},
	addMenuButton: {
		backgroundColor: colors.secondary,
		marginTop: 15,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		borderWidth: 1,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 8,
		gap: 8,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	addMenuText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	photosSection: {
		paddingVertical: 20,
	},
	sectionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 10,
	},
	imagesContainer: {
		paddingTop: 15,
		marginBottom: 15,
	},
	imageWrapper: {
		marginRight: 10,
		position: 'relative',
	},
	uploadedImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	removeImageButton: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: colors.primary,
		borderRadius: 10,
		width: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	uploadButton: {
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 24,
		alignSelf: 'center',
		borderWidth: 1,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4,
		width: '100%',
		marginTop: 10,
		alignItems: 'center',
	},
	uploadButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
	},
	foodTypesSection: {
		marginVertical: 15,
	},
	selectedCuisine: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	selectedCuisineTag: {
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
	},
	selectedCuisineText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
	},
	modalTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 10,
	},
	input: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlignVertical: 'top',
		minHeight: 100,
	},
	cuisineGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 10,
	},
	cuisineButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: 12,
	},
	cuisineButtonSelected: {
		backgroundColor: colors.primary,
	},
	cuisineButtonText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	cuisineButtonTextSelected: {
		color: colors.quaternary,
	},
});
