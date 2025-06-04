import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Days, DishCategory } from '@/shared/enums';
import { Dish, MenuData } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import {
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

interface MenuCreationModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (menu: MenuData) => void;
	editingMenu?: MenuData;
}

export default function MenuCreationModal({
	visible,
	onClose,
	onSave,
	editingMenu,
}: MenuCreationModalProps) {
	const { t } = useTranslation();

	// Estados básicos del menú
	const [menuName, setMenuName] = useState('');
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [startTime, setStartTime] = useState('00:00');
	const [endTime, setEndTime] = useState('00:00');
	const [price, setPrice] = useState('');
	const [dishes, setDishes] = useState<Dish[]>([]);

	// Estados para el time picker
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	// Estados para modales secundarios
	const [showDishModal, setShowDishModal] = useState(false);
	const [showSupplementModal, setShowSupplementModal] = useState(false);
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);
	const [supplementPrice, setSupplementPrice] = useState('');

	// Inicializar solo cuando el modal se abre
	React.useEffect(() => {
		if (visible) {
			if (editingMenu) {
				setMenuName(editingMenu.name);
				setSelectedDays([...editingMenu.days]);
				setStartTime(editingMenu.startTime);
				setEndTime(editingMenu.endTime);
				setPrice(editingMenu.price.toString());
				setDishes([...editingMenu.dishes]);
			} else {
				resetForm();
			}
		}
	}, [visible, editingMenu?.id]); // Solo depende de visible y el ID del menú

	const resetForm = useCallback(() => {
		setMenuName('');
		setSelectedDays([]);
		setStartTime('00:00');
		setEndTime('00:00');
		setPrice('');
		setDishes([
			{
				id: '1',
				name: 'ej: ensalada cesar',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				category: DishCategory.APPETIZERS,
			},
			{
				id: '2',
				name: 'ej: ensalada cesar',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				category: DishCategory.APPETIZERS,
			},
			{
				id: '3',
				name: 'ej: ensalada cesar',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				category: DishCategory.APPETIZERS,
			},
			{
				id: '4',
				name: 'ej: ensalada cesar',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				category: DishCategory.APPETIZERS,
			},
		]);
	}, []);

	const toggleDay = useCallback((day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	}, []);

	const addDish = useCallback((category: DishCategory) => {
		const newDish: Dish = {
			id: Date.now().toString(),
			name: 'ej: ensalada cesar',
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category,
		};
		setDishes((prev) => [...prev, newDish]);
	}, []);

	const updateDishName = useCallback((dishId: string, name: string) => {
		setDishes((prev) =>
			prev.map((d) => (d.id === dishId ? { ...d, name } : d)),
		);
	}, []);

	const openDishModal = useCallback((dish: Dish) => {
		setCurrentDish(dish);
		setShowDishModal(true);
	}, []);

	const openSupplementModal = useCallback((dish: Dish) => {
		setCurrentDish(dish);
		setSupplementPrice(dish.extraPrice > 0 ? dish.extraPrice.toString() : '');
		setShowSupplementModal(true);
	}, []);

	const saveDish = useCallback((updatedDish: Dish) => {
		setDishes((prev) =>
			prev.map((d) => (d.id === updatedDish.id ? updatedDish : d)),
		);
		setShowDishModal(false);
		setCurrentDish(null);
	}, []);

	const addSupplement = useCallback(() => {
		if (currentDish && supplementPrice) {
			const updatedDish = {
				...currentDish,
				extraPrice: parseFloat(supplementPrice) || 0,
			};
			setDishes((prev) =>
				prev.map((d) => (d.id === updatedDish.id ? updatedDish : d)),
			);
		}
		setShowSupplementModal(false);
		setSupplementPrice('');
		setCurrentDish(null);
	}, [currentDish, supplementPrice]);

	// Funciones para manejar time picker
	const createTimeFromString = useCallback((timeString: string) => {
		const [hours, minutes] = timeString
			.split(':')
			.map((num) => parseInt(num, 10));
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	}, []);

	const formatTimeFromDate = useCallback((date: Date) => {
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}, []);

	const handleStartTimeChange = useCallback(
		(event: any, selectedDate?: Date) => {
			setShowStartTimePicker(false);
			if (selectedDate) {
				const timeString = formatTimeFromDate(selectedDate);
				setStartTime(timeString);
			}
		},
		[formatTimeFromDate],
	);

	const handleEndTimeChange = useCallback(
		(event: any, selectedDate?: Date) => {
			setShowEndTimePicker(false);
			if (selectedDate) {
				const timeString = formatTimeFromDate(selectedDate);
				setEndTime(timeString);
			}
		},
		[formatTimeFromDate],
	);

	const handleSave = useCallback(() => {
		const menu: MenuData = {
			id: editingMenu?.id || Date.now().toString(),
			name: menuName,
			days: selectedDays,
			startTime,
			endTime,
			price: parseFloat(price) || 0,
			dishes: dishes.filter(
				(dish) => dish.name.trim() !== '' && dish.name !== 'ej: ensalada cesar',
			),
		};
		onSave(menu);
		onClose();
	}, [
		menuName,
		selectedDays,
		startTime,
		endTime,
		price,
		dishes,
		editingMenu?.id,
		onSave,
		onClose,
	]);

	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	const toggleDietaryOption = useCallback(
		(
			option: keyof Pick<
				Dish,
				'isGlutenFree' | 'isLactoseFree' | 'isVegetarian' | 'isSpicy'
			>,
		) => {
			if (currentDish) {
				setCurrentDish({
					...currentDish,
					[option]: !currentDish[option],
				});
			}
		},
		[currentDish],
	);

	return (
		<>
			<Modal
				visible={visible}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={handleClose} style={{ flex: 1 }}>
							<Text style={styles.cancelText}>{t('general.cancel')}</Text>
						</TouchableOpacity>

						<View style={{ flex: 2 }}>
							<Text style={styles.modalTitle}>
								{editingMenu
									? t('menuCreation.editMenu')
									: t('menuCreation.createMenu')}
							</Text>
						</View>
						<TouchableOpacity onPress={handleSave} style={{ flex: 1 }}>
							<Text style={styles.saveText}>{t('general.save')}</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						style={styles.modalContent}
						showsVerticalScrollIndicator={false}
					>
						{/* Menu Name */}
						<View style={styles.section}>
							<Text style={styles.label}>{t('menuCreation.menuName')}</Text>
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
							<View style={styles.daysContainer}>
								{Object.values(Days).map((day) => (
									<TouchableOpacity
										key={day}
										style={[
											styles.dayButton,
											selectedDays.includes(day) && styles.dayButtonSelected,
										]}
										onPress={() => toggleDay(day)}
									>
										<Text
											style={[
												styles.dayText,
												selectedDays.includes(day) && styles.dayTextSelected,
											]}
										>
											{t(`daysLetter.${day}`)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Time */}
						<View style={styles.section}>
							<Text style={styles.label}>{t('menuCreation.whatTime')}</Text>
							{showStartTimePicker || showEndTimePicker ? (
								<DateTimePicker
									value={createTimeFromString(
										showStartTimePicker ? startTime : endTime,
									)}
									mode="time"
									is24Hour={true}
									display={Platform.OS === 'ios' ? 'spinner' : 'default'}
									onChange={
										showStartTimePicker
											? handleStartTimeChange
											: handleEndTimeChange
									}
								/>
							) : (
								<View style={styles.timeSection}>
									<Text style={styles.timeLabel}>
										{t('menuCreation.timeFrom')}
									</Text>

									<TouchableOpacity
										style={styles.timeInputButton}
										onPress={() => setShowStartTimePicker(true)}
									>
										<Text style={styles.timeInputText}>{startTime}</Text>
										<Ionicons
											name="time-outline"
											size={16}
											color={colors.primary}
										/>
									</TouchableOpacity>

									<Text style={styles.timeTo}>{t('menuCreation.timeTo')}</Text>

									<TouchableOpacity
										style={styles.timeInputButton}
										onPress={() => setShowEndTimePicker(true)}
									>
										<Text style={styles.timeInputText}>{endTime}</Text>
										<Ionicons
											name="time-outline"
											size={16}
											color={colors.primary}
										/>
									</TouchableOpacity>
								</View>
							)}
						</View>

						{/* Price */}
						<View style={styles.section}>
							<Text style={styles.label}>{t('menuCreation.price')}</Text>
							<TextInput
								style={styles.input}
								placeholder={t('menuCreation.pricePlaceholder')}
								value={price}
								onChangeText={setPrice}
								keyboardType="numeric"
							/>
						</View>

						{/* Divider */}
						<View style={styles.divider} />

						{/* Menu Section */}
						<View style={styles.menuSection}>
							<Text style={styles.menuTitle}>
								{t('menuCreation.menuTitle')}
							</Text>

							{/* First Courses */}
							{/* <View style={styles.courseSection}>
								<Text style={styles.courseTitle}>
									{t('menuCreation.firstCourses')}
								</Text>
								{dishes
									.filter((d) => d.category === DishCategory.APPETIZERS)
									.map((dish) => (
										<View key={dish.id} style={styles.dishItem}>
											<TextInput
												style={styles.dishInput}
												value={dish.name}
												onChangeText={(text) => updateDishName(dish.id, text)}
												placeholder="ej: ensalada cesar"
											/>
											<TouchableOpacity
												style={styles.dishIcon}
												onPress={() => openDishModal(dish)}
											>
												<Ionicons
													name="restaurant"
													size={20}
													color={colors.primary}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={styles.priceIcon}
												onPress={() => openSupplementModal(dish)}
											>
												<Text style={styles.priceIconText}>€+</Text>
											</TouchableOpacity>
										</View>
									))}
								<TouchableOpacity
									style={styles.addDishButton}
									onPress={() => addDish(DishCategory.APPETIZERS)}
								>
									<Ionicons name="add" size={20} color={colors.primary} />
									<Text style={styles.addDishText}>
										{t('menuCreation.addFirstCourse')}
									</Text>
								</TouchableOpacity>
							</View> */}
						</View>

						{/* Add Menu Button */}
						<TouchableOpacity style={styles.addManualMenuButton}>
							<Text style={styles.addManualMenuText}>
								{t('menuCreation.addManualMenu')}
							</Text>
						</TouchableOpacity>
						<DividerWithCircle color={colors.primary} marginVertical={20} />
						<TouchableOpacity style={styles.addPhotoMenuButton}>
							<Text style={styles.addPhotoMenuText}>
								{t('menuCreation.addPhotoMenu')}
							</Text>
						</TouchableOpacity>
						<View style={{ height: 100 }} />
					</ScrollView>
				</View>
			</Modal>

			{/* Dish Description Modal */}
			<Modal visible={showDishModal} animationType="fade" transparent>
				<View style={styles.overlayContainer}>
					<View style={styles.dishModal}>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setShowDishModal(false)}
						>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>

						<Text style={styles.dishModalTitle}>
							{t('menuCreation.addDishDescription')}
						</Text>

						<TextInput
							style={styles.dishDescriptionInput}
							placeholder={t('menuCreation.dishDescriptionPlaceholder')}
							multiline
							numberOfLines={4}
							value={currentDish?.description || ''}
							onChangeText={(text) => {
								if (currentDish) {
									setCurrentDish({ ...currentDish, description: text });
								}
							}}
						/>

						<Text style={styles.dietaryLabel}>
							{t('menuCreation.dietaryOptions')}
						</Text>

						<View style={styles.dietaryOptions}>
							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isGlutenFree && styles.dietaryOptionSelected,
								]}
								onPress={() => toggleDietaryOption('isGlutenFree')}
							>
								<Ionicons
									name="leaf-outline"
									size={20}
									color={
										currentDish?.isGlutenFree
											? colors.quaternary
											: colors.primary
									}
								/>
								<Text
									style={[
										styles.dietaryText,
										currentDish?.isGlutenFree && styles.dietaryTextSelected,
									]}
								>
									{t('menuCreation.dietary.glutenFree')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isLactoseFree && styles.dietaryOptionSelected,
								]}
								onPress={() => toggleDietaryOption('isLactoseFree')}
							>
								<Ionicons
									name="water-outline"
									size={20}
									color={
										currentDish?.isLactoseFree
											? colors.quaternary
											: colors.primary
									}
								/>
								<Text
									style={[
										styles.dietaryText,
										currentDish?.isLactoseFree && styles.dietaryTextSelected,
									]}
								>
									{t('menuCreation.dietary.lactoseFree')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isVegetarian && styles.dietaryOptionSelected,
								]}
								onPress={() => toggleDietaryOption('isVegetarian')}
							>
								<Ionicons
									name="leaf"
									size={20}
									color={
										currentDish?.isVegetarian
											? colors.quaternary
											: colors.primary
									}
								/>
								<Text
									style={[
										styles.dietaryText,
										currentDish?.isVegetarian && styles.dietaryTextSelected,
									]}
								>
									{t('menuCreation.dietary.vegetarian')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isSpicy && styles.dietaryOptionSelected,
								]}
								onPress={() => toggleDietaryOption('isSpicy')}
							>
								<Ionicons
									name="flame"
									size={20}
									color={
										currentDish?.isSpicy ? colors.quaternary : colors.primary
									}
								/>
								<Text
									style={[
										styles.dietaryText,
										currentDish?.isSpicy && styles.dietaryTextSelected,
									]}
								>
									{t('menuCreation.dietary.spicy')}
								</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							style={styles.addDescriptionButton}
							onPress={() => {
								if (currentDish) {
									saveDish(currentDish);
								}
							}}
						>
							<Text style={styles.addDescriptionText}>
								{t('menuCreation.addDescription')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Supplement Modal */}
			<Modal visible={showSupplementModal} animationType="fade" transparent>
				<View style={styles.overlayContainer}>
					<View style={styles.supplementModal}>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setShowSupplementModal(false)}
						>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>

						<Text style={styles.supplementTitle}>
							{t('menuCreation.addSupplement')}
						</Text>

						<TextInput
							style={styles.supplementInput}
							placeholder={t('menuCreation.supplementPlaceholder')}
							value={supplementPrice}
							onChangeText={setSupplementPrice}
							keyboardType="numeric"
						/>

						<TouchableOpacity
							style={styles.addSupplementButton}
							onPress={addSupplement}
						>
							<Text style={styles.addSupplementText}>
								{t('menuCreation.addSupplementButton')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
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
		gap: 10,
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		textAlign: 'left',
	},
	modalTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		textAlign: 'right',
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		marginVertical: 15,
	},
	label: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
		marginBottom: 10,
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
	daysContainer: {
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'space-between',
	},
	dayButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.secondary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	dayButtonSelected: {
		backgroundColor: colors.primary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	dayText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	dayTextSelected: {
		color: colors.quaternary,
	},
	timeSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 15,
	},
	timeLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
	},
	timeTo: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
	},
	timeInputButton: {
		borderRadius: 12,
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	timeInputText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		marginRight: 8,
		fontWeight: '300',
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
	courseSection: {
		marginBottom: 20,
	},
	courseTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	dishItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		gap: 10,
	},
	dishInput: {
		flex: 1,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 15,
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	dishIcon: {
		width: 50,
		height: 50,
		borderRadius: 12,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	priceIcon: {
		width: 50,
		height: 50,
		borderRadius: 12,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	priceIconText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	addDishButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 12,
		gap: 8,
		marginTop: 10,
	},
	addDishText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	addManualMenuButton: {
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
	},
	addManualMenuText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
	},
	addPhotoMenuButton: {
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
	addPhotoMenuText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
	},
	overlayContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	dishModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 400,
	},
	closeButton: {
		alignSelf: 'flex-end',
		marginBottom: 10,
	},
	dishModalTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	dishDescriptionInput: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlignVertical: 'top',
		marginBottom: 20,
		minHeight: 100,
	},
	dietaryLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 15,
	},
	dietaryOptions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 20,
	},
	dietaryOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primary,
		gap: 5,
	},
	dietaryOptionSelected: {
		backgroundColor: colors.primary,
	},
	dietaryText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	dietaryTextSelected: {
		color: colors.quaternary,
	},
	addDescriptionButton: {
		backgroundColor: colors.primary,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	addDescriptionText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	supplementModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 300,
	},
	supplementTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	supplementInput: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	addSupplementButton: {
		backgroundColor: colors.primary,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	addSupplementText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
});
