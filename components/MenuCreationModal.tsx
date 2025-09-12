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
	Platform,
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

const convertImageToBase64 = async (uri: string): Promise<string> => {
	try {
		const response = await fetch(uri);
		const blob = await response.blob();

		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Remover el prefix "data:image/jpeg;base64," para obtener solo el base64
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error('Error converting image to base64:', error);
		throw error;
	}
};

const getMimeTypeFromUri = (uri: string): string => {
	const extension = uri.split('.').pop()?.toLowerCase();
	switch (extension) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		case 'webp':
			return 'image/webp';
		default:
			return 'image/jpeg'; // Default fallback
	}
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
	const [showProcessingModal, setShowProcessingModal] = useState(false);

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
			allowsEditing: Platform.OS === 'android',
			quality: 0.8,
			aspect: undefined,
		});

		if (!result.canceled) {
			processPhoto(result.assets[0].uri);
		}
	};

	// Función para llamar a la API de análisis de menú (actualizada)
	const analyzeMenuImage = async (
		imageUri: string,
	): Promise<{
		success: boolean;
		data?: {
			dishes: Dish[];
			menuData: Partial<MenuData>;
			suggestedMenuName?: string;
			suggestedPrice?: number;
		};
		error?: string;
		errorType?: string;
	}> => {
		try {
			console.log('🔍 Starting menu image analysis...');
			console.log('🖼️ Image URI:', imageUri);

			// Convertir imagen a base64
			const base64Data = await convertImageToBase64(imageUri);
			const mimeType = getMimeTypeFromUri(imageUri);

			console.log('📤 Preparing to send image to analysis API...');
			console.log('🔍 Base64 data length:', base64Data.length);
			console.log('🔍 MIME type:', mimeType);
			console.log('🔍 Environment URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
			console.log('🔍 Language header:', navigator.language);

			// Crear el payload
			const payload = {
				imageData: base64Data,
				mimeType: mimeType,
			};

			console.log(
				'📦 Payload size:',
				JSON.stringify(payload).length,
				'characters',
			);

			// Llamar a la función de Supabase
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-menu-image`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
						'Accept-Language': navigator.language, // Enviar idioma preferido
					},
					body: JSON.stringify(payload),
				},
			);

			console.log('📡 API Response received');
			console.log('📡 Response status:', response.status);
			console.log('📡 Response statusText:', response.statusText);
			console.log(
				'📡 Response headers:',
				Object.fromEntries(response.headers.entries()),
			);

			let errorData;
			try {
				const responseText = await response.text();
				console.log('📝 Raw response text length:', responseText.length);
				console.log(
					'📝 Raw response text preview:',
					responseText.substring(0, 500),
				);

				errorData = JSON.parse(responseText);
				console.log('✅ Response parsed successfully:', errorData);
			} catch (parseError) {
				console.error('❌ Failed to parse response:', parseError);
				return {
					success: false,
					error:
						'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
					errorType: 'network_error',
				};
			}

			if (!response.ok) {
				console.error('❌ API Error:', errorData);
				console.error('❌ API Error details:', {
					status: response.status,
					statusText: response.statusText,
					errorData: errorData,
				});

				// El servidor ya devuelve el mensaje apropiado en el idioma correcto
				return {
					success: false,
					error: errorData.error,
					errorType: errorData.errorType || 'processing_error',
				};
			}

			console.log('✅ Analysis result:', errorData);
			return errorData;
		} catch (error) {
			console.error('💥 Error analyzing menu image:', error);

			// Detectar errores de red específicos
			let errorType = 'processing_error';
			if (error instanceof TypeError && error.message.includes('fetch')) {
				errorType = 'network_error';
			}

			return {
				success: false,
				error:
					'Error al procesar la imagen. Por favor, asegúrate de que la imagen es clara y legible.',
				errorType: errorType,
			};
		}
	};

	// Función para cancelar el procesamiento
	const cancelPhotoProcessing = () => {
		setIsProcessingPhoto(false);
		setShowProcessingModal(false);
		setPhotoProcessed(false);
		setPhotoProcessSuccess(false);
	};

	// Modificar la función processPhoto en el componente MenuCreationModal
	const processPhoto = async (photoUri: string) => {
		try {
			setIsProcessingPhoto(true);
			setShowProcessingModal(true);
			setPhotoProcessed(false);

			console.log('📸 Processing photo:', photoUri);

			// Llamar a la API real de análisis de menú
			const analysisResult = await analyzeMenuImage(photoUri);

			setIsProcessingPhoto(false);
			setShowProcessingModal(false);
			setPhotoProcessed(true);
			setPhotoProcessSuccess(analysisResult.success);

			console.log('🔍 Analysis result success:', analysisResult.success);
			console.log('🔍 Analysis result data:', analysisResult.data);

			if (analysisResult.success && analysisResult.data) {
				// Si el análisis es exitoso, establecer los datos reales
				const { dishes, menuData, suggestedMenuName, suggestedPrice } =
					analysisResult.data;

				console.log('✅ Setting menu data:');
				console.log('📝 Dishes count:', dishes.length);
				console.log('📝 First dish:', dishes[0]);
				console.log('📝 Menu options:', menuData);
				console.log('📝 Suggested name:', suggestedMenuName);
				console.log('📝 Suggested price:', suggestedPrice);

				// Establecer los datos del menú analizados
				setMenuDishes(dishes);
				console.log('✅ Menu dishes set');

				setMenuOptions(menuData);
				console.log('✅ Menu options set');

				// Si hay nombre y precio sugeridos, establecerlos también
				if (suggestedMenuName && suggestedMenuName !== 'Menú del día') {
					setMenuName(suggestedMenuName);
					console.log('✅ Menu name set to:', suggestedMenuName);
				}
				if (suggestedPrice && suggestedPrice > 0) {
					setPrice(suggestedPrice.toString());
					console.log('✅ Menu price set to:', suggestedPrice);
				}

				// Mostrar el manual menu
				console.log('🔧 Setting showManualMenu to true');
				setShowManualMenu(true);

				// Forzar re-render agregando un pequeño delay
				setTimeout(() => {
					console.log('🔧 Manual menu should now be visible');
					console.log(
						'🔧 Current dishes state should have:',
						dishes.length,
						'dishes',
					);
				}, 100);

				// Mostrar mensaje de éxito
				setTimeout(() => {
					Alert.alert(
						t('menuCreation.photoMenuSuccessTitle'),
						t('menuCreation.photoMenuSuccess'),
						[{ text: t('general.ok'), style: 'default' }],
					);
				}, 500);
			} else {
				console.log('❌ Analysis failed:', analysisResult.error);
				console.log('❌ Error type:', analysisResult.errorType);

				// Mostrar mensaje de error específico basado en el tipo de error
				const errorType = analysisResult.errorType || 'processing_error';
				let alertTitle = t('menuCreation.photoMenuErrorTitle');

				// Personalizar título según el tipo de error usando las claves de traducción existentes
				switch (errorType) {
					case 'not_menu':
						alertTitle = t('menuCreation.notMenuErrorTitle');
						break;
					case 'quota_exceeded':
						alertTitle = t('menuCreation.quotaExceededTitle');
						break;
					case 'network_error':
						alertTitle = t('menuCreation.networkErrorTitle');
						break;
				}

				setTimeout(() => {
					Alert.alert(
						alertTitle,
						analysisResult.error || t('menuCreation.photoMenuError'),
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
			setShowProcessingModal(false);

			setTimeout(() => {
				Alert.alert(
					t('menuCreation.photoMenuErrorTitle'),
					error instanceof Error
						? error.message
						: t('menuCreation.photoMenuError'),
					[{ text: t('general.ok'), style: 'default' }],
				);
			}, 500);
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

			{/* Modal de procesamiento de foto */}
			<Modal visible={showProcessingModal} transparent animationType="fade">
				<View style={styles.processingModalOverlay}>
					<View style={styles.processingModalContent}>
						<ActivityIndicator size="large" color={colors.primary} />
						<Text style={styles.processingModalTitle}>
							{t('menuCreation.processingPhoto')}
						</Text>
						<Text style={styles.processingModalSubtitle}>
							{t('menuCreation.analysingMenu')}
						</Text>
						<TouchableOpacity
							style={styles.cancelProcessingButton}
							onPress={cancelPhotoProcessing}
						>
							<Text style={styles.cancelProcessingText}>
								{t('general.cancel')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
	processingModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	processingModalContent: {
		backgroundColor: colors.secondary,
		borderRadius: 20,
		paddingVertical: 40,
		paddingHorizontal: 30,
		alignItems: 'center',
		minWidth: 280,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.3,
		shadowRadius: 10,
	},
	processingModalTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 20,
		textAlign: 'center',
	},
	processingModalSubtitle: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
		marginTop: 10,
		textAlign: 'center',
		marginBottom: 30,
	},
	cancelProcessingButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 25,
	},
	cancelProcessingText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
});
