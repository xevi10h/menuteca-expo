import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

interface Dish {
	id: string;
	name: string;
	description: string;
	extraPrice: number;
	isVegetarian: boolean;
	isLactoseFree: boolean;
	isSpicy: boolean;
	isGlutenFree: boolean;
	category: 'PRIMEROS' | 'SEGUNDOS' | 'POSTRES';
}

interface MenuData {
	id: string;
	name: string;
	days: string[];
	startTime: string;
	endTime: string;
	price: string;
	dishes: Dish[];
}

interface MenuCreationModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (menu: MenuData) => void;
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function MenuCreationModal({
	visible,
	onClose,
	onSave,
}: MenuCreationModalProps) {
	const { t } = useTranslation();
	const [menuName, setMenuName] = useState('');
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [startTime, setStartTime] = useState('00:00');
	const [endTime, setEndTime] = useState('00:00');
	const [price, setPrice] = useState('');
	const [dishes, setDishes] = useState<Dish[]>([
		{
			id: '1',
			name: t('menuCreation.dishPlaceholder'),
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category: 'PRIMEROS',
		},
		{
			id: '2',
			name: t('menuCreation.dishPlaceholder'),
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category: 'PRIMEROS',
		},
		{
			id: '3',
			name: t('menuCreation.dishPlaceholder'),
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category: 'PRIMEROS',
		},
		{
			id: '4',
			name: t('menuCreation.dishPlaceholder'),
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category: 'PRIMEROS',
		},
	]);

	const [showDishModal, setShowDishModal] = useState(false);
	const [showSupplementModal, setShowSupplementModal] = useState(false);
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);
	const [supplementPrice, setSupplementPrice] = useState('');

	const toggleDay = (day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const addDish = (
		category: 'PRIMEROS' | 'SEGUNDOS' | 'POSTRES' = 'PRIMEROS',
	) => {
		const newDish: Dish = {
			id: Date.now().toString(),
			name: t('menuCreation.dishPlaceholder'),
			description: '',
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			category,
		};
		setDishes((prev) => [...prev, newDish]);
	};

	const openDishModal = (dish: Dish) => {
		setCurrentDish(dish);
		setShowDishModal(true);
	};

	const openSupplementModal = (dish: Dish) => {
		setCurrentDish(dish);
		setShowSupplementModal(true);
	};

	const saveDish = (updatedDish: Dish) => {
		setDishes((prev) =>
			prev.map((d) => (d.id === updatedDish.id ? updatedDish : d)),
		);
		setShowDishModal(false);
		setCurrentDish(null);
	};

	const addSupplement = () => {
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
	};

	const handleSave = () => {
		const menu: MenuData = {
			id: Date.now().toString(),
			name: menuName,
			days: selectedDays,
			startTime,
			endTime,
			price,
			dishes,
		};
		onSave(menu);
		// Reset form
		setMenuName('');
		setSelectedDays([]);
		setStartTime('00:00');
		setEndTime('00:00');
		setPrice('');
		setDishes([]);
		onClose();
	};

	return (
		<>
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
						<Text style={styles.modalTitle}>Sant Francesc Restaurant</Text>
						<TouchableOpacity onPress={handleSave}>
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
								{DAYS.map((day) => (
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
											{day}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Time */}
						<View style={styles.section}>
							<Text style={styles.label}>{t('menuCreation.whatTime')}</Text>
							<View style={styles.timeContainer}>
								<Text style={styles.timeLabel}>
									{t('menuCreation.timeFrom')}
								</Text>
								<TextInput
									style={styles.timeInput}
									value={startTime}
									onChangeText={setStartTime}
									placeholder="00:00"
								/>
								<Text style={styles.timeLabel}>{t('menuCreation.timeTo')}</Text>
								<TextInput
									style={styles.timeInput}
									value={endTime}
									onChangeText={setEndTime}
									placeholder="00:00"
								/>
							</View>
						</View>

						{/* Price */}
						<View style={styles.section}>
							<Text style={styles.label}>{t('menuCreation.price')}</Text>
							<TextInput
								style={styles.input}
								placeholder={t('menuCreation.pricePlaceholder')}
								value={price}
								onChangeText={setPrice}
							/>
						</View>

						{/* Menu Section */}
						<View style={styles.menuSection}>
							<Text style={styles.menuTitle}>
								{t('menuCreation.menuTitle')}
							</Text>

							{/* First Courses */}
							<View style={styles.courseSection}>
								<Text style={styles.courseTitle}>
									{t('menuCreation.firstCourses')}
								</Text>
								{dishes
									.filter((d) => d.category === 'PRIMEROS')
									.map((dish) => (
										<View key={dish.id} style={styles.dishItem}>
											<TextInput
												style={styles.dishInput}
												value={dish.name}
												onChangeText={(text) => {
													setDishes((prev) =>
														prev.map((d) =>
															d.id === dish.id ? { ...d, name: text } : d,
														),
													);
												}}
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
									onPress={() => addDish('PRIMEROS')}
								>
									<Ionicons name="add" size={20} color={colors.primary} />
									<Text style={styles.addDishText}>
										{t('menuCreation.addFirstCourse')}
									</Text>
								</TouchableOpacity>
							</View>

							{/* Second Courses */}
							<View style={styles.courseSection}>
								<Text style={styles.courseTitle}>
									{t('menuCreation.secondCourses')}
								</Text>
								{dishes
									.filter((d) => d.category === 'SEGUNDOS')
									.map((dish) => (
										<View key={dish.id} style={styles.dishItem}>
											<TextInput
												style={styles.dishInput}
												value={dish.name}
												onChangeText={(text) => {
													setDishes((prev) =>
														prev.map((d) =>
															d.id === dish.id ? { ...d, name: text } : d,
														),
													);
												}}
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
									onPress={() => addDish('SEGUNDOS')}
								>
									<Ionicons name="add" size={20} color={colors.primary} />
									<Text style={styles.addDishText}>
										{t('menuCreation.addSecondCourse')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						{/* Add Menu Button */}
						<TouchableOpacity style={styles.addMenuButton}>
							<Text style={styles.addMenuText}>
								{t('menuCreation.addManually')}
							</Text>
						</TouchableOpacity>

						<View style={styles.divider} />

						{/* Upload Photo Button */}
						<TouchableOpacity style={styles.uploadPhotoButton}>
							<Text style={styles.uploadPhotoText}>
								{t('menuCreation.uploadMenuPhoto')}
							</Text>
						</TouchableOpacity>
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
								onPress={() => {
									if (currentDish) {
										setCurrentDish({
											...currentDish,
											isGlutenFree: !currentDish.isGlutenFree,
										});
									}
								}}
							>
								<Ionicons
									name="leaf-outline"
									size={20}
									color={colors.primary}
								/>
								<Text style={styles.dietaryText}>
									{t('menuCreation.dietary.glutenFree')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isLactoseFree && styles.dietaryOptionSelected,
								]}
								onPress={() => {
									if (currentDish) {
										setCurrentDish({
											...currentDish,
											isLactoseFree: !currentDish.isLactoseFree,
										});
									}
								}}
							>
								<Ionicons
									name="water-outline"
									size={20}
									color={colors.primary}
								/>
								<Text style={styles.dietaryText}>
									{t('menuCreation.dietary.lactoseFree')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isVegetarian && styles.dietaryOptionSelected,
								]}
								onPress={() => {
									if (currentDish) {
										setCurrentDish({
											...currentDish,
											isVegetarian: !currentDish.isVegetarian,
										});
									}
								}}
							>
								<Ionicons name="leaf" size={20} color={colors.primary} />
								<Text style={styles.dietaryText}>
									{t('menuCreation.dietary.vegetarian')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.dietaryOption,
									currentDish?.isSpicy && styles.dietaryOptionSelected,
								]}
								onPress={() => {
									if (currentDish) {
										setCurrentDish({
											...currentDish,
											isSpicy: !currentDish.isSpicy,
										});
									}
								}}
							>
								<Ionicons name="flame" size={20} color={colors.primary} />
								<Text style={styles.dietaryText}>
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
	},
	section: {
		marginVertical: 15,
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
	},
	daysContainer: {
		flexDirection: 'row',
		gap: 10,
	},
	dayButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dayButtonSelected: {
		backgroundColor: colors.primary,
	},
	dayText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	dayTextSelected: {
		color: colors.quaternary,
	},
	timeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 15,
	},
	timeLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	timeInput: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 8,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		width: 80,
		textAlign: 'center',
	},
	menuSection: {
		marginTop: 20,
	},
	menuTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
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
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
	},
	dishIcon: {
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	priceIcon: {
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
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
		borderRadius: 8,
		gap: 8,
	},
	addDishText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	addMenuButton: {
		backgroundColor: colors.primary,
		paddingVertical: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 20,
	},
	addMenuText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	divider: {
		height: 1,
		backgroundColor: '#E5E5E5',
		marginVertical: 20,
	},
	uploadPhotoButton: {
		backgroundColor: colors.quaternary,
		paddingVertical: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 40,
	},
	uploadPhotoText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
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
