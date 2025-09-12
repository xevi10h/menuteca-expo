import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { DishCategory } from '@/shared/enums';
import {
	Dish,
	DrinkInclusion,
	MenuData,
	createEmptyDrinks,
} from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
	Modal,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import DishDescriptionModal from './DishDescriptionModal';
import DrinksSelector from './DrinksSelector';
import SupplementModal from './SupplementModal';

interface ManualMenuSectionProps {
	editingMenu?: MenuData;
	onSave: (dishes: Dish[], menuOptions: Partial<MenuData>) => void;
	initialDishes?: Dish[];
	initialMenuOptions?: Partial<MenuData>;
}

export default function ManualMenuSection({
	editingMenu,
	onSave,
	initialDishes = [],
	initialMenuOptions = {},
}: ManualMenuSectionProps) {
	const { t } = useTranslation();
	const [dishes, setDishes] = useState<Dish[]>(() => {
		// Prioridad: 1. initialDishes (desde foto), 2. editingMenu, 3. platos por defecto
		if (initialDishes && initialDishes.length > 0) {
			return [...initialDishes];
		}
		if (editingMenu && editingMenu.dishes.length > 0) {
			return [...editingMenu.dishes];
		}
		return [
			{
				id: '1',
				name: '',
				description: '',
				extra_price: 0,
				is_vegetarian: false,
				is_lactose_free: false,
				is_spicy: false,
				is_gluten_free: false,
				is_vegan: false,
				category: DishCategory.FIRST_COURSES,
			},
			{
				id: '2',
				name: '',
				description: '',
				extra_price: 0,
				is_vegetarian: false,
				is_lactose_free: false,
				is_spicy: false,
				is_gluten_free: false,
				is_vegan: false,
				category: DishCategory.SECOND_COURSES,
			},
			{
				id: '3',
				name: '',
				description: '',
				extra_price: 0,
				is_vegetarian: false,
				is_lactose_free: false,
				is_spicy: false,
				is_gluten_free: false,
				is_vegan: false,
				category: DishCategory.DESSERTS,
			},
		];
	});

	// Estados para opciones del menú con valores iniciales desde props
	const [first_courses_to_share, setFirstCoursesToShare] = useState(
		initialMenuOptions?.first_courses_to_share ||
			editingMenu?.first_courses_to_share ||
			false,
	);
	const [second_courses_to_share, setSecondCoursesToShare] = useState(
		initialMenuOptions?.second_courses_to_share ||
			editingMenu?.second_courses_to_share ||
			false,
	);
	const [desserts_to_share, setDessertsToShare] = useState(
		initialMenuOptions?.desserts_to_share ||
			editingMenu?.desserts_to_share ||
			false,
	);
	const [includes_bread, setIncludesBread] = useState(
		initialMenuOptions?.includes_bread || editingMenu?.includes_bread || false,
	);

	const [drinks, setDrinks] = useState<DrinkInclusion>(
		initialMenuOptions?.drinks || editingMenu?.drinks || createEmptyDrinks(),
	);

	const [includes_coffee_and_dessert, setIncludesCoffeeAndDessert] = useState<
		'none' | 'coffee' | 'dessert' | 'both'
	>(
		initialMenuOptions?.includes_coffee_and_dessert ||
			editingMenu?.includes_coffee_and_dessert ||
			'none',
	);
	const [has_minimum_people, setHasMinimumPeople] = useState(
		initialMenuOptions?.has_minimum_people ||
			editingMenu?.has_minimum_people ||
			false,
	);
	const [minimum_people, setMinimumPeople] = useState(
		(
			initialMenuOptions?.minimum_people || editingMenu?.minimum_people
		)?.toString() || '2',
	);

	// Estados para modales
	const [showDishModal, setShowDishModal] = useState(false);
	const [showSupplementModal, setShowSupplementModal] = useState(false);
	const [showEditNameModal, setShowEditNameModal] = useState(false);
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);
	const [supplementPrice, setSupplementPrice] = useState('');
	const [editingDishName, setEditingDishName] = useState('');

	// Usar useRef para evitar bucles infinitos
	const prevInitialDishesRef = React.useRef<Dish[]>([]);
	const prevInitialMenuOptionsRef = React.useRef<Partial<MenuData>>({});

	// Efecto para actualizar dishes cuando se reciben initialDishes (desde foto)
	React.useEffect(() => {
		if (initialDishes && initialDishes.length > 0) {
			// Solo actualizar si realmente han cambiado
			const hasChanged =
				JSON.stringify(initialDishes) !==
				JSON.stringify(prevInitialDishesRef.current);
			if (hasChanged) {
				setDishes([...initialDishes]);
				prevInitialDishesRef.current = [...initialDishes];
			}
		}
	}, [initialDishes?.length]);

	// Efecto para actualizar opciones del menú cuando se reciben initialMenuOptions
	React.useEffect(() => {
		if (initialMenuOptions && Object.keys(initialMenuOptions).length > 0) {
			// Solo actualizar si realmente han cambiado
			const hasChanged =
				JSON.stringify(initialMenuOptions) !==
				JSON.stringify(prevInitialMenuOptionsRef.current);
			if (hasChanged) {
				if (initialMenuOptions.first_courses_to_share !== undefined) {
					setFirstCoursesToShare(initialMenuOptions.first_courses_to_share);
				}
				if (initialMenuOptions.second_courses_to_share !== undefined) {
					setSecondCoursesToShare(initialMenuOptions.second_courses_to_share);
				}
				if (initialMenuOptions.desserts_to_share !== undefined) {
					setDessertsToShare(initialMenuOptions.desserts_to_share);
				}
				if (initialMenuOptions.includes_bread !== undefined) {
					setIncludesBread(initialMenuOptions.includes_bread);
				}
				if (initialMenuOptions.drinks !== undefined) {
					setDrinks(initialMenuOptions.drinks);
				}
				if (initialMenuOptions.includes_coffee_and_dessert !== undefined) {
					setIncludesCoffeeAndDessert(
						initialMenuOptions.includes_coffee_and_dessert,
					);
				}
				if (initialMenuOptions.has_minimum_people !== undefined) {
					setHasMinimumPeople(initialMenuOptions.has_minimum_people);
				}
				if (initialMenuOptions.minimum_people !== undefined) {
					setMinimumPeople(initialMenuOptions.minimum_people.toString());
				}
				prevInitialMenuOptionsRef.current = { ...initialMenuOptions };
			}
		}
	}, [Object.keys(initialMenuOptions || {}).length]);

	const addDish = useCallback((category: DishCategory) => {
		const newDish: Dish = {
			id: Date.now().toString(),
			name: '',
			description: '',
			extra_price: 0,
			is_vegetarian: false,
			is_lactose_free: false,
			is_spicy: false,
			is_gluten_free: false,
			is_vegan: false,
			category,
		};
		setDishes((prev) => [...prev, newDish]);
	}, []);

	const updateDishName = useCallback((dishId: string, name: string) => {
		setDishes((prev) =>
			prev.map((d) => (d.id === dishId ? { ...d, name } : d)),
		);
	}, []);

	const removeDish = useCallback((dishId: string) => {
		setDishes((prev) => prev.filter((d) => d.id !== dishId));
	}, []);

	const openDishModal = useCallback((dish: Dish) => {
		setCurrentDish(dish);
		setShowDishModal(true);
	}, []);

	const openSupplementModal = useCallback((dish: Dish) => {
		setCurrentDish(dish);
		setSupplementPrice(dish?.extra_price?.toString() || '0');
		setShowSupplementModal(true);
	}, []);

	const openEditNameModal = useCallback((dish: Dish) => {
		setCurrentDish(dish);
		setEditingDishName(dish.name);
		setShowEditNameModal(true);
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
				extra_price: parseFloat(supplementPrice) || 0,
			};
			setDishes((prev) =>
				prev.map((d) => (d.id === updatedDish.id ? updatedDish : d)),
			);
		}
		setShowSupplementModal(false);
		setSupplementPrice('');
		setCurrentDish(null);
	}, [currentDish, supplementPrice]);

	const saveEditedName = useCallback(() => {
		if (currentDish && editingDishName.trim() !== '') {
			updateDishName(currentDish.id, editingDishName.trim());
		}
		setShowEditNameModal(false);
		setEditingDishName('');
		setCurrentDish(null);
	}, [currentDish, editingDishName, updateDishName]);

	// Optimizar el useEffect que actualiza el parent para evitar bucles
	const stableOnSave = React.useCallback(onSave, []);

	// Actualizar el parent cuando cambien los dishes o las opciones
	React.useEffect(() => {
		const validDishes = dishes.filter(
			(dish) => dish.name.trim() !== '' && dish.name !== 'ej: ensalada cesar',
		);

		const menuOptions = {
			first_courses_to_share,
			second_courses_to_share,
			desserts_to_share,
			includes_bread,
			drinks,
			includes_coffee_and_dessert,
			has_minimum_people,
			minimum_people: has_minimum_people
				? parseInt(minimum_people) || 2
				: undefined,
		};

		stableOnSave(validDishes, menuOptions);
	}, [
		dishes,
		first_courses_to_share,
		second_courses_to_share,
		desserts_to_share,
		includes_bread,
		drinks,
		includes_coffee_and_dessert,
		has_minimum_people,
		minimum_people,
		stableOnSave,
	]);

	const renderDishItem = (dish: Dish) => {
		const formatExtraPrice = (price?: number) => {
			if (!price) {
				return '€+';
			}
			if (price % 1 === 0) {
				return `+${price}€`;
			}

			return `+${price?.toFixed(2)}€`;
		};

		const dishHasDescription =
			dish.description.trim() !== '' ||
			dish.is_gluten_free ||
			dish.is_lactose_free ||
			dish.is_spicy ||
			dish.is_vegan ||
			dish.is_vegetarian;

		return (
			<View key={dish.id} style={styles.dishItem}>
				<TouchableOpacity
					style={styles.dishInputContainer}
					onPress={() => openEditNameModal(dish)}
				>
					<Text
						style={[
							styles.dishInput,
							!dish.name && styles.dishInputPlaceholder,
						]}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{dish.name || t('menuCreation.firstCoursePlaceholder')}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.dishIcon,
						dishHasDescription && styles.dishIconHasContent,
					]}
					onPress={() => openDishModal(dish)}
				>
					<Ionicons
						name="restaurant"
						size={20}
						color={dishHasDescription ? colors.quaternary : colors.primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.priceIcon,
						dish.extra_price > 0 && styles.priceIconHasContent,
					]}
					onPress={() => openSupplementModal(dish)}
				>
					<Text
						style={[
							styles.priceIconText,
							dish.extra_price > 0 && styles.priceTextHasContent,
						]}
					>
						{formatExtraPrice(dish.extra_price)}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.deleteDishIcon}
					onPress={() => removeDish(dish.id)}
				>
					<Ionicons name="trash-outline" size={20} color={colors.primary} />
				</TouchableOpacity>
			</View>
		);
	};

	const renderCoffeeDesertSelector = () => {
		const options = [
			{ key: 'none', label: t('menuCreation.options.none') },
			{ key: 'coffee', label: t('menuCreation.options.coffee') },
			{ key: 'dessert', label: t('menuCreation.options.dessert') },
			{ key: 'both', label: t('menuCreation.options.coffeeAndDessert') },
		];

		return (
			<View style={styles.selectorContainer}>
				<Text style={styles.selectorLabel}>
					{t('menuCreation.coffeeAndDessertOptions')}
				</Text>
				<View style={styles.optionsContainer}>
					{options.map((option) => (
						<TouchableOpacity
							key={option.key}
							style={[
								styles.optionButton,
								includes_coffee_and_dessert === option.key &&
									styles.optionButtonSelected,
							]}
							onPress={() => setIncludesCoffeeAndDessert(option.key as any)}
						>
							<Text
								style={[
									styles.optionButtonText,
									includes_coffee_and_dessert === option.key &&
										styles.optionButtonTextSelected,
								]}
							>
								{option.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
		);
	};

	return (
		<>
			{/* First Courses Section */}
			<View style={styles.courseSection}>
				<View style={styles.courseTitleRow}>
					<View style={styles.labelContainer}>
						<Text style={styles.courseTitle}>
							{t('menuCreation.firstCourses')}
						</Text>
						<Text style={styles.requiredAsterisk}> *</Text>
					</View>
					<View style={styles.shareToggle}>
						<Text style={styles.shareLabel}>{t('menuCreation.toShare')}</Text>
						<Switch
							value={first_courses_to_share}
							onValueChange={setFirstCoursesToShare}
							trackColor={{ false: colors.primaryLight, true: colors.primary }}
							thumbColor={colors.quaternary}
						/>
					</View>
				</View>
				{dishes
					.filter((d) => d.category === DishCategory.FIRST_COURSES)
					.map(renderDishItem)}
				<TouchableOpacity
					style={styles.addDishButton}
					onPress={() => addDish(DishCategory.FIRST_COURSES)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>
						{t('menuCreation.addFirstCourse')}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Second Courses Section */}
			<View style={styles.courseSection}>
				<View style={styles.courseTitleRow}>
					<View style={styles.labelContainer}>
						<Text style={styles.courseTitle}>
							{t('menuCreation.secondCourses')}
						</Text>
						<Text style={styles.requiredAsterisk}> *</Text>
					</View>
					<View style={styles.shareToggle}>
						<Text style={styles.shareLabel}>{t('menuCreation.toShare')}</Text>
						<Switch
							value={second_courses_to_share}
							onValueChange={setSecondCoursesToShare}
							trackColor={{ false: colors.primaryLight, true: colors.primary }}
							thumbColor={colors.quaternary}
						/>
					</View>
				</View>
				{dishes
					.filter((d) => d.category === DishCategory.SECOND_COURSES)
					.map(renderDishItem)}
				<TouchableOpacity
					style={styles.addDishButton}
					onPress={() => addDish(DishCategory.SECOND_COURSES)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>
						{t('menuCreation.addSecondCourse')}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Desserts Section */}
			<View style={styles.courseSection}>
				<View style={styles.courseTitleRow}>
					<Text style={styles.courseTitle}>{t('menuCreation.desserts')}</Text>
					<View style={styles.shareToggle}>
						<Text style={styles.shareLabel}>{t('menuCreation.toShare')}</Text>
						<Switch
							value={desserts_to_share}
							onValueChange={setDessertsToShare}
							trackColor={{ false: colors.primaryLight, true: colors.primary }}
							thumbColor={colors.quaternary}
						/>
					</View>
				</View>
				{dishes
					.filter((d) => d.category === DishCategory.DESSERTS)
					.map(renderDishItem)}
				<TouchableOpacity
					style={styles.addDishButton}
					onPress={() => addDish(DishCategory.DESSERTS)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>{t('menuCreation.addDessert')}</Text>
				</TouchableOpacity>
			</View>

			{/* Menu Options Section */}
			<View style={styles.optionsSection}>
				<Text style={styles.optionsSectionTitle}>
					{t('menuCreation.menuOptions')}
				</Text>

				{/* Bread Option */}
				<View style={styles.optionRow}>
					<Text style={styles.optionLabel}>
						{t('menuCreation.includes_bread')}
					</Text>
					<Switch
						value={includes_bread}
						onValueChange={setIncludesBread}
						trackColor={{ false: colors.primaryLight, true: colors.primary }}
						thumbColor={colors.quaternary}
					/>
				</View>

				<DrinksSelector drinks={drinks} onDrinksChange={setDrinks} />

				{/* Coffee and Dessert Selector */}
				{renderCoffeeDesertSelector()}

				{/* Minimum People Option */}
				<View style={styles.optionRow}>
					<Text style={styles.optionLabel}>
						{t('menuCreation.has_minimum_people')}
					</Text>
					<Switch
						value={has_minimum_people}
						onValueChange={setHasMinimumPeople}
						trackColor={{ false: colors.primaryLight, true: colors.primary }}
						thumbColor={colors.quaternary}
					/>
				</View>

				{/* Minimum People Input */}
				{has_minimum_people && (
					<View style={styles.minimumPeopleContainer}>
						<Text style={styles.minimumPeopleLabel}>
							{t('menuCreation.minimumPeopleLabel')}
						</Text>
						<TextInput
							style={styles.minimumPeopleInput}
							value={minimum_people}
							onChangeText={setMinimumPeople}
							keyboardType="numeric"
							placeholder="2"
						/>
						<Text style={styles.minimumPeopleUnit}>
							{t('menuCreation.people')}
						</Text>
					</View>
				)}
			</View>

			{/* Dish Description Modal */}
			<DishDescriptionModal
				visible={showDishModal}
				dish={currentDish}
				onClose={() => {
					setShowDishModal(false);
					setCurrentDish(null);
				}}
				onSave={saveDish}
			/>

			{/* Supplement Modal */}
			<SupplementModal
				visible={showSupplementModal}
				dish={currentDish}
				supplementPrice={supplementPrice}
				onSupplementPriceChange={setSupplementPrice}
				onClose={() => {
					setShowSupplementModal(false);
					setCurrentDish(null);
					setSupplementPrice('');
				}}
				onSave={addSupplement}
			/>

			{/* Edit Name Modal */}
			<Modal visible={showEditNameModal} transparent animationType="fade">
				<View style={styles.editNameModalOverlay}>
					<View style={styles.editNameModalContent}>
						<Text style={styles.editNameModalTitle}>
							{t('menuCreation.editDishName')}
						</Text>
						<TextInput
							style={styles.editNameModalInput}
							value={editingDishName}
							onChangeText={setEditingDishName}
							placeholder={t('menuCreation.dishNamePlaceholder')}
							multiline={true}
							numberOfLines={3}
							autoFocus
						/>
						<View style={styles.editNameModalButtons}>
							<TouchableOpacity
								style={[styles.editNameModalButton, styles.cancelButton]}
								onPress={() => {
									setShowEditNameModal(false);
									setEditingDishName('');
									setCurrentDish(null);
								}}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.editNameModalButton, styles.saveButton]}
								onPress={saveEditedName}
							>
								<Text style={styles.saveButtonText}>{t('general.save')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	courseSection: {
		marginBottom: 20,
	},
	courseTitleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	courseTitle: {
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
	shareToggle: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	shareLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	dishItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		gap: 5,
	},
	dishInput: {
		flex: 1,
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
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	dishIconHasContent: {
		backgroundColor: colors.primary,
	},
	priceIcon: {
		width: 50,
		height: 50,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	priceIconHasContent: {
		backgroundColor: colors.primary,
	},
	priceIconText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	priceTextHasContent: {
		color: colors.quaternary,
		fontSize: 12,
	},
	deleteDishIcon: {
		width: 50,
		height: 50,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	addDishButton: {
		backgroundColor: colors.secondary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 15,
		borderWidth: 1,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 12,
		gap: 8,
		marginTop: 10,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.5,
		shadowRadius: 4,
	},
	addDishText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
	},
	optionsSection: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 20,
		marginTop: 20,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	optionsSectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 15,
	},
	optionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	optionLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		flex: 1,
	},
	selectorContainer: {
		marginBottom: 15,
	},
	selectorLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 10,
	},
	optionsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	optionButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: 'transparent',
	},
	optionButtonSelected: {
		backgroundColor: colors.primary,
	},
	optionButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	optionButtonTextSelected: {
		color: colors.quaternary,
	},
	minimumPeopleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginTop: 10,
	},
	minimumPeopleLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		flex: 1,
	},
	minimumPeopleInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 60,
	},
	minimumPeopleUnit: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	dishInputContainer: {
		flex: 1,
		borderColor: colors.primaryLight,
		minHeight: 50,
		justifyContent: 'center',
	},
	dishInputPlaceholder: {
		color: colors.primaryLight,
		fontStyle: 'italic',
	},
	editNameModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	editNameModalContent: {
		backgroundColor: colors.secondary,
		borderRadius: 16,
		paddingVertical: 24,
		paddingHorizontal: 20,
		width: '100%',
		maxWidth: 400,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.3,
		shadowRadius: 10,
	},
	editNameModalTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 16,
		textAlign: 'center',
	},
	editNameModalInput: {
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		marginBottom: 20,
		textAlignVertical: 'top',
	},
	editNameModalButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	editNameModalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	cancelButtonText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	saveButton: {
		backgroundColor: colors.primary,
	},
	saveButtonText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
});
