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
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				isVegan: false,
				category: DishCategory.FIRST_COURSES,
			},
			{
				id: '2',
				name: '',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				isVegan: false,
				category: DishCategory.SECOND_COURSES,
			},
			{
				id: '3',
				name: '',
				description: '',
				extraPrice: 0,
				isVegetarian: false,
				isLactoseFree: false,
				isSpicy: false,
				isGlutenFree: false,
				isVegan: false,
				category: DishCategory.DESSERTS,
			},
		];
	});

	// Estados para opciones del menú con valores iniciales desde props
	const [firstCoursesToShare, setFirstCoursesToShare] = useState(
		initialMenuOptions?.firstCoursesToShare ||
			editingMenu?.firstCoursesToShare ||
			false,
	);
	const [secondCoursesToShare, setSecondCoursesToShare] = useState(
		initialMenuOptions?.secondCoursesToShare ||
			editingMenu?.secondCoursesToShare ||
			false,
	);
	const [dessertsToShare, setDessertsToShare] = useState(
		initialMenuOptions?.dessertsToShare ||
			editingMenu?.dessertsToShare ||
			false,
	);
	const [includesBread, setIncludesBread] = useState(
		initialMenuOptions?.includesBread || editingMenu?.includesBread || false,
	);

	const [drinks, setDrinks] = useState<DrinkInclusion>(
		initialMenuOptions?.drinks || editingMenu?.drinks || createEmptyDrinks(),
	);

	const [includesCoffeeAndDessert, setIncludesCoffeeAndDessert] = useState<
		'none' | 'coffee' | 'dessert' | 'both'
	>(
		initialMenuOptions?.includesCoffeeAndDessert ||
			editingMenu?.includesCoffeeAndDessert ||
			'none',
	);
	const [hasMinimumPeople, setHasMinimumPeople] = useState(
		initialMenuOptions?.hasMinimumPeople ||
			editingMenu?.hasMinimumPeople ||
			false,
	);
	const [minimumPeople, setMinimumPeople] = useState(
		(
			initialMenuOptions?.minimumPeople || editingMenu?.minimumPeople
		)?.toString() || '2',
	);

	// Estados para modales
	const [showDishModal, setShowDishModal] = useState(false);
	const [showSupplementModal, setShowSupplementModal] = useState(false);
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);
	const [supplementPrice, setSupplementPrice] = useState('');

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
				if (initialMenuOptions.firstCoursesToShare !== undefined) {
					setFirstCoursesToShare(initialMenuOptions.firstCoursesToShare);
				}
				if (initialMenuOptions.secondCoursesToShare !== undefined) {
					setSecondCoursesToShare(initialMenuOptions.secondCoursesToShare);
				}
				if (initialMenuOptions.dessertsToShare !== undefined) {
					setDessertsToShare(initialMenuOptions.dessertsToShare);
				}
				if (initialMenuOptions.includesBread !== undefined) {
					setIncludesBread(initialMenuOptions.includesBread);
				}
				if (initialMenuOptions.drinks !== undefined) {
					setDrinks(initialMenuOptions.drinks);
				}
				if (initialMenuOptions.includesCoffeeAndDessert !== undefined) {
					setIncludesCoffeeAndDessert(
						initialMenuOptions.includesCoffeeAndDessert,
					);
				}
				if (initialMenuOptions.hasMinimumPeople !== undefined) {
					setHasMinimumPeople(initialMenuOptions.hasMinimumPeople);
				}
				if (initialMenuOptions.minimumPeople !== undefined) {
					setMinimumPeople(initialMenuOptions.minimumPeople.toString());
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
			extraPrice: 0,
			isVegetarian: false,
			isLactoseFree: false,
			isSpicy: false,
			isGlutenFree: false,
			isVegan: false,
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
		setSupplementPrice(dish.extraPrice.toString());
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

	// Optimizar el useEffect que actualiza el parent para evitar bucles
	const stableOnSave = React.useCallback(onSave, []);

	// Actualizar el parent cuando cambien los dishes o las opciones
	React.useEffect(() => {
		const validDishes = dishes.filter(
			(dish) => dish.name.trim() !== '' && dish.name !== 'ej: ensalada cesar',
		);

		const menuOptions = {
			firstCoursesToShare,
			secondCoursesToShare,
			dessertsToShare,
			includesBread,
			drinks,
			includesCoffeeAndDessert,
			hasMinimumPeople,
			minimumPeople: hasMinimumPeople
				? parseInt(minimumPeople) || 2
				: undefined,
		};

		stableOnSave(validDishes, menuOptions);
	}, [
		dishes,
		firstCoursesToShare,
		secondCoursesToShare,
		dessertsToShare,
		includesBread,
		drinks,
		includesCoffeeAndDessert,
		hasMinimumPeople,
		minimumPeople,
		stableOnSave,
	]);

	const renderDishItem = (dish: Dish) => {
		const formatExtraPrice = (price: number) => {
			if (price === 0) {
				return '€+';
			}
			if (price % 1 === 0) {
				return `+${price}€`;
			}
			return `+${price.toFixed(2)}€`;
		};

		const dishHasDescription =
			dish.description.trim() !== '' ||
			dish.isGlutenFree ||
			dish.isLactoseFree ||
			dish.isSpicy ||
			dish.isVegan ||
			dish.isVegetarian;

		return (
			<View key={dish.id} style={styles.dishItem}>
				<TextInput
					style={styles.dishInput}
					value={dish.name}
					onChangeText={(text) => updateDishName(dish.id, text)}
					placeholder={t('menuCreation.firstCoursePlaceholder')}
				/>
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
						dish.extraPrice > 0 && styles.priceIconHasContent,
					]}
					onPress={() => openSupplementModal(dish)}
				>
					<Text
						style={[
							styles.priceIconText,
							dish.extraPrice > 0 && styles.priceTextHasContent,
						]}
					>
						{formatExtraPrice(dish.extraPrice)}
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
								includesCoffeeAndDessert === option.key &&
									styles.optionButtonSelected,
							]}
							onPress={() => setIncludesCoffeeAndDessert(option.key as any)}
						>
							<Text
								style={[
									styles.optionButtonText,
									includesCoffeeAndDessert === option.key &&
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
							value={firstCoursesToShare}
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
							value={secondCoursesToShare}
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
							value={dessertsToShare}
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
						{t('menuCreation.includesBread')}
					</Text>
					<Switch
						value={includesBread}
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
						{t('menuCreation.hasMinimumPeople')}
					</Text>
					<Switch
						value={hasMinimumPeople}
						onValueChange={setHasMinimumPeople}
						trackColor={{ false: colors.primaryLight, true: colors.primary }}
						thumbColor={colors.quaternary}
					/>
				</View>

				{/* Minimum People Input */}
				{hasMinimumPeople && (
					<View style={styles.minimumPeopleContainer}>
						<Text style={styles.minimumPeopleLabel}>
							{t('menuCreation.minimumPeopleLabel')}
						</Text>
						<TextInput
							style={styles.minimumPeopleInput}
							value={minimumPeople}
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
});
