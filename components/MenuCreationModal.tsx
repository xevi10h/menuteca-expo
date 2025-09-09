import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { DishCategory } from '@/shared/enums';
import { Dish, MenuData } from '@/shared/types';
import { useMenuStore } from '@/zustand/MenuStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import DividerWithCircle from './general/DividerWithCircle';
import DaysSelector from './menuCreation/DaysSelector';
import ManualMenuSection from './menuCreation/ManualMenuSection';
import PriceInput from './menuCreation/PriceInput';
import TimeSelector from './menuCreation/TimeSelector';
import HeaderModal from './restaurantCreation/HeaderModal';

// Interfaz para la validación del menú
interface MenuValidation {
	isValid: boolean;
	errors: {
		hasName: boolean;
		hasValidPrice: boolean;
		hasFirstCourse: boolean;
		hasSecondCourse: boolean;
	};
}

// Lista de nombres de platos por defecto que no cuentan como válidos
const DEFAULT_DISH_NAMES = [
	'',
	'ej: ensalada cesar',
	'ej: solomillo de ternera',
	'ej: tarta de queso',
	'ex: ensalada cesar',
	'ex: solomillo de ternera',
	'ex: tarta de queso',
	'ejemplo: ensalada cesar',
	'ejemplo: solomillo de ternera',
	'ejemplo: tarta de queso',
];

// Función para validar un menú
const validateMenu = (
	menuName: string,
	price: string,
	dishes: Dish[],
): MenuValidation => {
	// Validar nombre del menú
	const hasName =
		menuName.trim() !== '' &&
		menuName.trim() !== 'ej: menú de mediodía' &&
		menuName.trim() !== 'ex: menú de mediodía' &&
		menuName.trim() !== 'ejemplo: menú de mediodía';

	// Validar precio
	const priceNumber = parseFloat(price);
	const hasValidPrice = !isNaN(priceNumber) && priceNumber > 0;

	// Filtrar platos válidos (que no sean ejemplos ni vacíos)
	const validDishes = dishes.filter((dish) => {
		const dishName = dish.name.trim().toLowerCase();
		return (
			dishName !== '' &&
			!DEFAULT_DISH_NAMES.some(
				(defaultName) => dishName === defaultName.toLowerCase(),
			)
		);
	});

	// Validar que tenga al menos un primer plato
	const hasFirstCourse = validDishes.some(
		(dish) => dish.category === DishCategory.FIRST_COURSES,
	);

	// Validar que tenga al menos un segundo plato
	const hasSecondCourse = validDishes.some(
		(dish) => dish.category === DishCategory.SECOND_COURSES,
	);

	const errors = {
		hasName: !hasName,
		hasValidPrice: !hasValidPrice,
		hasFirstCourse: !hasFirstCourse,
		hasSecondCourse: !hasSecondCourse,
	};

	const isValid = hasName && hasValidPrice && hasFirstCourse && hasSecondCourse;

	return {
		isValid,
		errors,
	};
};

interface MenuCreationModalProps {
	visible: boolean;
	onClose: () => void;
	onSave?: (menu: MenuData) => void; // Made optional for backward compatibility
	editingMenu?: MenuData;
	restaurantId?: string; // New prop for centralized saving
	useDirectSave?: boolean; // Flag to use centralized saving
}

export default function MenuCreationModal({
	visible,
	onClose,
	onSave,
	editingMenu,
	restaurantId,
	useDirectSave = false,
}: MenuCreationModalProps) {
	const { t } = useTranslation();
	const { createMenuWithDishes, updateMenuWithDishes, isLoading } =
		useMenuStore();

	// Estados básicos del menú
	const [menuName, setMenuName] = useState('');
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [start_time, setStartTime] = useState('00:00');
	const [end_time, setEndTime] = useState('00:00');
	const [price, setPrice] = useState('');
	const [showManualMenu, setShowManualMenu] = useState(false);
	const [menuDishes, setMenuDishes] = useState<Dish[]>([]);

	// Estados para el procesamiento de fotos
	const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
	const [photoProcessed, setPhotoProcessed] = useState(false);
	const [photoProcessSuccess, setPhotoProcessSuccess] = useState(false);

	// New state for menu options
	const [menuOptions, setMenuOptions] = useState<Partial<MenuData>>({});

	// Local saving state
	const [isSaving, setIsSaving] = useState(false);

	// Estado para la validación del menú
	const [validation, setValidation] = useState<MenuValidation>({
		isValid: false,
		errors: {
			hasName: true,
			hasValidPrice: true,
			hasFirstCourse: true,
			hasSecondCourse: true,
		},
	});

	// Simular un menú generado por el backend
	const generateSimulatedMenu = (): {
		dishes: Dish[];
		menuData: Partial<MenuData>;
	} => {
		const simulatedDishes: Dish[] = [
			{
				id: Date.now().toString() + '_1',
				name: 'Ensalada mixta',
				description:
					'Lechuga, tomate, cebolla, aceitunas y vinagreta de la casa',
				extra_price: 0,
				category: DishCategory.FIRST_COURSES,
				is_vegetarian: true,
				is_lactose_free: true,
				is_spicy: false,
				is_gluten_free: true,
				is_vegan: true,
			},
			{
				id: Date.now().toString() + '_2',
				name: 'Sopa del día',
				description:
					'Sopa casera preparada con ingredientes frescos de temporada',
				extra_price: 0,
				category: DishCategory.FIRST_COURSES,
				is_vegetarian: true,
				is_lactose_free: false,
				is_spicy: false,
				is_gluten_free: false,
				is_vegan: false,
			},
			{
				id: Date.now().toString() + '_3',
				name: 'Pollo a la plancha',
				description: 'Pechuga de pollo a la plancha con guarnición de verduras',
				extra_price: 0,
				category: DishCategory.SECOND_COURSES,
				is_vegetarian: false,
				is_lactose_free: true,
				is_spicy: false,
				is_gluten_free: true,
				is_vegan: false,
			},
			{
				id: Date.now().toString() + '_4',
				name: 'Merluza al horno',
				description: 'Merluza fresca al horno con patatas panaderas',
				extra_price: 2.5,
				category: DishCategory.SECOND_COURSES,
				is_vegetarian: false,
				is_lactose_free: true,
				is_spicy: false,
				is_gluten_free: true,
				is_vegan: false,
			},
			{
				id: Date.now().toString() + '_5',
				name: 'Flan casero',
				description: 'Flan casero con caramelo líquido',
				extra_price: 0,
				category: DishCategory.DESSERTS,
				is_vegetarian: true,
				is_lactose_free: false,
				is_spicy: false,
				is_gluten_free: true,
				is_vegan: false,
			},
			{
				id: Date.now().toString() + '_6',
				name: 'Fruta de temporada',
				description: 'Selección de fruta fresca de temporada',
				extra_price: 0,
				category: DishCategory.DESSERTS,
				is_vegetarian: true,
				is_lactose_free: true,
				is_spicy: false,
				is_gluten_free: true,
				is_vegan: true,
			},
		];

		const simulatedMenuData: Partial<MenuData> = {
			first_courses_to_share: false,
			second_courses_to_share: false,
			desserts_to_share: false,
			includes_bread: true,
			drinks: {
				water: true,
				wine: false,
				soft_drinks: true,
				beer: false,
			},
			includes_coffee_and_dessert: 'coffee',
			has_minimum_people: false,
			minimum_people: undefined,
		};

		return { dishes: simulatedDishes, menuData: simulatedMenuData };
	};

	// Simular llamada al backend para procesar la foto
	const simulateBackendCall = async (): Promise<boolean> => {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Simular 100% de éxito, 0% de error
				const success = Math.random() > 0.0;
				resolve(success);
			}, 2000);
		});
	};

	// Manejar la carga y procesamiento de la foto
	const handlePhotoMenuUpload = async () => {
		try {
			// Solicitar permisos
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert(
					t('registerRestaurant.permissionsRequired'),
					t('registerRestaurant.photoPermissionMessage'),
				);
				return;
			}

			// Mostrar opciones para tomar foto o seleccionar de galería
			Alert.alert(t('menuCreation.uploadMenuPhoto'), '', [
				{
					text: t('general.cancel'),
					style: 'cancel',
				},
				{
					text: t('general.camera'),
					onPress: () => openCamera(),
				},
				{
					text: t('general.gallery'),
					onPress: () => openGallery(),
				},
			]);
		} catch (error) {
			console.error('Error requesting permissions:', error);
		}
	};

	const openCamera = async () => {
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			processPhoto(result.assets[0].uri);
		}
	};

	const openGallery = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			processPhoto(result.assets[0].uri);
		}
	};

	const processPhoto = async (photoUri: string) => {
		try {
			setIsProcessingPhoto(true);
			setPhotoProcessed(false);

			// Simular llamada al backend
			const success = await simulateBackendCall();

			setIsProcessingPhoto(false);
			setPhotoProcessed(true);
			setPhotoProcessSuccess(success);

			if (success) {
				// Si el procesamiento es exitoso, generar menú simulado
				const { dishes, menuData } = generateSimulatedMenu();

				// Establecer los datos ANTES de mostrar el manual menu
				setMenuDishes(dishes);
				setMenuOptions(menuData);

				// Luego mostrar el manual menu
				setShowManualMenu(true);

				// Mostrar mensaje de éxito
				setTimeout(() => {
					Alert.alert(
						t('menuCreation.photoMenuSuccessTitle'),
						t('menuCreation.photoMenuSuccess'),
						[{ text: t('general.ok'), style: 'default' }],
					);
				}, 500);
			} else {
				// Mostrar mensaje de error
				setTimeout(() => {
					Alert.alert(
						t('menuCreation.photoMenuErrorTitle'),
						t('menuCreation.photoMenuError'),
						[{ text: t('general.ok'), style: 'default' }],
					);
				}, 500);
			}

			// Resetear estados después de 3 segundos
			setTimeout(() => {
				setPhotoProcessed(false);
				setPhotoProcessSuccess(false);
			}, 3000);
		} catch (error) {
			console.error('Error processing photo:', error);
			setIsProcessingPhoto(false);
			Alert.alert(
				t('menuCreation.photoMenuErrorTitle'),
				t('menuCreation.photoMenuError'),
			);
		}
	};

	// Inicializar solo cuando el modal se abre
	React.useEffect(() => {
		if (visible) {
			if (editingMenu) {
				setMenuName(editingMenu.name);
				setSelectedDays([...editingMenu.days]);
				setStartTime(editingMenu.start_time);
				setEndTime(editingMenu.end_time);
				setPrice(editingMenu.price.toString());
				setShowManualMenu(editingMenu.dishes.length > 0);
				setMenuDishes([...editingMenu.dishes]);
				setMenuOptions({
					first_courses_to_share: editingMenu.first_courses_to_share,
					second_courses_to_share: editingMenu.second_courses_to_share,
					desserts_to_share: editingMenu.desserts_to_share,
					includes_bread: editingMenu.includes_bread,
					drinks: editingMenu.drinks,
					includes_coffee_and_dessert: editingMenu.includes_coffee_and_dessert,
					has_minimum_people: editingMenu.has_minimum_people,
					minimum_people: editingMenu.minimum_people,
				});
			} else {
				resetForm();
			}
		}
	}, [visible, editingMenu?.id]);

	const resetForm = useCallback(() => {
		setMenuName('');
		setSelectedDays([]);
		setStartTime('00:00');
		setEndTime('00:00');
		setPrice('');
		setShowManualMenu(false);
		setMenuDishes([]);
		setMenuOptions({});
		setIsProcessingPhoto(false);
		setPhotoProcessed(false);
		setPhotoProcessSuccess(false);
	}, []);

	const toggleDay = useCallback((day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	}, []);

	const handleDishesAndOptionsChange = useCallback(
		(dishes: Dish[], options: Partial<MenuData>) => {
			setMenuDishes(dishes);
			setMenuOptions(options);
		},
		[], // Sin dependencias ya que solo estamos seteando estado
	);

	// Actualizar validación cuando cambien los campos
	React.useEffect(() => {
		const newValidation = validateMenu(menuName, price, menuDishes);
		setValidation(newValidation);
	}, [menuName, price, menuDishes]);

	const handleSave = useCallback(async () => {
		// Validar el menú antes de guardar
		const currentValidation = validateMenu(menuName, price, menuDishes);

		if (!currentValidation.isValid) {
			// Mostrar errores de validación
			const errors: string[] = [];

			if (currentValidation.errors.hasName) {
				errors.push(t('menuCreation.validation.needName'));
			}
			if (currentValidation.errors.hasValidPrice) {
				errors.push(t('menuCreation.validation.needValidPrice'));
			}
			if (currentValidation.errors.hasFirstCourse) {
				errors.push(t('menuCreation.validation.needFirstCourse'));
			}
			if (currentValidation.errors.hasSecondCourse) {
				errors.push(t('menuCreation.validation.needSecondCourse'));
			}

			Alert.alert(t('menuCreation.validation.incomplete'), errors.join('\n'), [
				{ text: t('general.ok'), style: 'default' },
			]);
			return;
		}

		const menu: MenuData = {
			id: editingMenu?.id || Date.now().toString(),
			name: menuName,
			days: selectedDays,
			start_time,
			end_time,
			price: parseFloat(price) || 0,
			dishes: menuDishes,
			...menuOptions,
		};

		// Use centralized save if enabled and restaurant ID is provided
		if (useDirectSave && restaurantId) {
			setIsSaving(true);
			try {
				let result;
				if (editingMenu?.id) {
					// Update existing menu
					result = await updateMenuWithDishes(restaurantId, menu);
				} else {
					// Create new menu
					result = await createMenuWithDishes(restaurantId, menu);
				}

				if (result.success) {
					onClose();
					// Optionally call onSave with the saved menu for UI updates
					if (onSave && result.data) {
						onSave(result.data);
					}
				} else {
					Alert.alert(
						t('validation.error'),
						result.error || 'Failed to save menu',
					);
				}
			} catch (error) {
				console.error('Error saving menu:', error);
				Alert.alert(t('validation.error'), 'Failed to save menu');
			} finally {
				setIsSaving(false);
			}
		} else {
			// Use traditional callback-based save
			if (onSave) {
				onSave(menu);
				onClose();
			}
		}
	}, [
		menuName,
		selectedDays,
		start_time,
		end_time,
		price,
		menuDishes,
		menuOptions,
		editingMenu?.id,
		onSave,
		onClose,
		useDirectSave,
		restaurantId,
		createMenuWithDishes,
		updateMenuWithDishes,
		t,
	]);

	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	const handleShowManualMenu = () => {
		setShowManualMenu(true);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<HeaderModal
					title={
						editingMenu
							? t('menuCreation.editMenu')
							: t('menuCreation.createMenu')
					}
					handleClose={handleClose}
					handleSave={handleSave}
					saveDisabled={
						!validation.isValid || isSaving || (useDirectSave && isLoading)
					}
					hasBorderBottom={true}
				/>
				<ScrollView
					style={styles.modalContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Menu Name */}
					<View style={styles.section}>
						<View style={styles.labelContainer}>
							<Text style={styles.label}>{t('menuCreation.menuName')}</Text>
							<Text style={styles.requiredAsterisk}> *</Text>
						</View>
						<TextInput
							style={styles.input}
							placeholder={t('menuCreation.menuNamePlaceholder')}
							value={menuName}
							onChangeText={setMenuName}
						/>
					</View>

					{/* Days */}
					<View style={styles.section}>
						<Text style={styles.label}>{t('menuCreation.whatDays')}</Text>
						<DaysSelector selectedDays={selectedDays} onToggleDay={toggleDay} />
					</View>

					{/* Time */}
					<View style={styles.section}>
						<Text style={styles.label}>{t('menuCreation.whatTime')}</Text>
						<TimeSelector
							start_time={start_time}
							end_time={end_time}
							onStartTimeChange={setStartTime}
							onEndTimeChange={setEndTime}
						/>
					</View>

					{/* Price */}
					<View style={styles.section}>
						<View style={styles.labelContainer}>
							<Text style={styles.label}>{t('menuCreation.price')}</Text>
							<Text style={styles.requiredAsterisk}> *</Text>
						</View>
						<PriceInput value={price} onChangeText={setPrice} />
					</View>

					{/* Divider */}
					<View style={styles.divider} />

					{/* Menu Section */}
					<View style={styles.menuSection}>
						<View style={styles.labelContainer}>
							<Text style={styles.menuTitle}>
								{t('menuCreation.menuTitle')}
							</Text>
							<Text style={[styles.requiredAsterisk, { fontSize: 24 }]}>
								{' '}
								*
							</Text>
						</View>

						{/* Photo Upload Button */}
						<TouchableOpacity
							style={[
								styles.addPhotoMenuButton,
								isProcessingPhoto && styles.addPhotoMenuButtonDisabled,
							]}
							onPress={handlePhotoMenuUpload}
							disabled={isProcessingPhoto}
						>
							{isProcessingPhoto ? (
								<>
									<ActivityIndicator size="small" color={colors.quaternary} />
									<Text style={styles.addPhotoMenuText}>
										{t('menuCreation.processingPhoto')}
									</Text>
								</>
							) : (
								<>
									<Ionicons
										name="sparkles-outline"
										size={16}
										color={colors.quaternary}
									/>
									<Text style={styles.addPhotoMenuText}>
										{t('menuCreation.addPhotoMenu')}
									</Text>
								</>
							)}
						</TouchableOpacity>

						<DividerWithCircle color={colors.primary} marginVertical={20} />

						{/* Manual Menu Section */}
						{showManualMenu && (
							<ManualMenuSection
								editingMenu={editingMenu}
								onSave={handleDishesAndOptionsChange}
								initialDishes={menuDishes}
								initialMenuOptions={menuOptions}
							/>
						)}

						{/* Add Menu Button */}
						{!showManualMenu && (
							<TouchableOpacity
								style={styles.addManualMenuButton}
								onPress={handleShowManualMenu}
							>
								<Text style={styles.addManualMenuText}>
									{t('menuCreation.addManualMenu')}
								</Text>
							</TouchableOpacity>
						)}

						<View style={{ height: 100 }} />
					</View>
				</ScrollView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		marginVertical: 15,
	},
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 2,
	},
	label: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
		marginBottom: 10,
	},
	requiredAsterisk: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: '#D32F2F',
	},
	input: {
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 15,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	divider: {
		height: 1,
		backgroundColor: colors.primary,
		marginVertical: 20,
	},
	menuSection: {
		marginTop: 10,
	},
	menuTitle: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
		marginBottom: 20,
	},
	addManualMenuButton: {
		backgroundColor: colors.secondary,
		paddingVertical: 15,
		borderRadius: 24,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	addManualMenuText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
	},
	addPhotoMenuButton: {
		backgroundColor: colors.primary,
		paddingVertical: 15,
		borderRadius: 24,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.quaternary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
	},
	addPhotoMenuButtonDisabled: {
		opacity: 0.7,
	},
	addPhotoMenuText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
	},
});
