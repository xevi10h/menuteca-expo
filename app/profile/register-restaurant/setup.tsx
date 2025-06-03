import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import MenuCreationModal from '@/components/MenuCreationModal';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SetupScreen() {
	const language = useUserStore((state) => state.user.language);
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [menus, setMenus] = useState<MenuData[]>([]);

	const handleBack = () => {
		router.back();
	};

	const handleSave = () => {
		// Aquí guardarías toda la información del restaurante
		// y navegarías de vuelta a la pantalla principal
		router.dismissAll();
	};

	const addMenu = (menu: MenuData) => {
		setMenus((prev) => [...prev, menu]);
	};
	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);
	return (
		<View style={[styles.setupContainer, { paddingTop: insets.top }]}>
			<View style={styles.setupHeader}>
				<TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
					<Text style={styles.cancelText}>{t('general.cancel')}</Text>
				</TouchableOpacity>
				<View style={{ flex: 2 }}>
					<Text style={styles.setupTitle} numberOfLines={1}>
						{provisionalRegisterRestaurant.name}
					</Text>
				</View>
				<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
					<Text style={styles.saveText}>{t('general.save')}</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.setupContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Photo Section */}
				<View style={styles.photoSection}>
					<Text style={styles.photoLabel}>
						{t('registerRestaurant.selectPhoto')}
					</Text>
					<View style={styles.photoPlaceholder}>
						<Ionicons name="image-outline" size={40} color={colors.primary} />
					</View>
				</View>

				{/* Address Section */}
				<View style={styles.addressSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.address')}
					</Text>
					<TouchableOpacity style={styles.editButton}>
						<Ionicons name="pencil" size={16} color={colors.primary} />
					</TouchableOpacity>
					<MapView
						style={styles.miniMap}
						initialRegion={{
							latitude: 41.3851,
							longitude: 2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
					>
						<Marker
							coordinate={{
								latitude: 41.3851,
								longitude: 2.1734,
							}}
							title="Sala La Paloma"
						/>
					</MapView>
				</View>

				{/* Menus Section */}
				<View style={styles.menusSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.myMenus')}
					</Text>
					{menus.map((menu, index) => (
						<View key={index} style={styles.menuItem}>
							<Text style={styles.menuName}>
								{menu.name || 'Menú de mediodía'}
							</Text>
							<View style={styles.menuActions}>
								<TouchableOpacity>
									<Ionicons name="pencil" size={16} color={colors.primary} />
								</TouchableOpacity>
								<TouchableOpacity>
									<Ionicons name="trash" size={16} color={colors.primary} />
								</TouchableOpacity>
							</View>
						</View>
					))}
					<TouchableOpacity
						style={styles.addMenuButton}
						onPress={() => setShowMenuModal(true)}
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
					<TouchableOpacity style={styles.uploadButton}>
						<Text style={styles.uploadButtonText}>
							{t('registerRestaurant.uploadPhotos')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Food Types Section */}
				<View style={styles.foodTypesSection}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.foodType')}
					</Text>
					<Text style={styles.sectionSubtitle}>
						{t('registerRestaurant.foodTypeDescription')}
					</Text>

					<View style={styles.selectedCuisines}>
						{provisionalRegisterRestaurant?.cuisinesIds ? (
							provisionalRegisterRestaurant?.cuisinesIds
								.slice(0, 3)
								.map((cuisine) => (
									<View key={cuisine} style={styles.selectedCuisineTag}>
										<Text style={styles.selectedCuisineText}>
											{
												allCuisines.find((c) => c.id === cuisine)?.name[
													language
												]
											}
										</Text>
									</View>
								))
						) : (
							<View key={'no-cuisine'} style={styles.selectedCuisineTag}>
								<Text style={styles.selectedCuisineText}>
									{t('registerRestaurant.noCuisinesSelected')}
								</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			<MenuCreationModal
				visible={showMenuModal}
				onClose={() => setShowMenuModal(false)}
				onSave={addMenu}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	setupContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	setupHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		gap: 10,
		width: '100%',
	},
	cancelButton: {
		flex: 1,
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
	},
	setupTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	saveButton: {
		flex: 1,
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		textAlign: 'right',
	},
	setupContent: {
		flex: 1,
		paddingHorizontal: 20,
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
	},
	addressSection: {
		paddingVertical: 20,
		position: 'relative',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		position: 'absolute',
		top: 20,
		right: 0,
		padding: 5,
		zIndex: 1,
	},
	miniMap: {
		height: 150,
		borderRadius: 10,
		overflow: 'hidden',
	},
	menusSection: {
		paddingVertical: 20,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 10,
	},
	menuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	menuActions: {
		flexDirection: 'row',
		gap: 15,
	},
	addMenuButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 8,
		gap: 8,
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
		marginBottom: 15,
	},
	uploadButton: {
		backgroundColor: colors.quaternary,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignSelf: 'center',
	},
	uploadButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	foodTypesSection: {
		paddingVertical: 20,
	},
	selectedCuisines: {
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
});
