import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { DishCategory } from '@/shared/enums';
import { Dish, MenuData } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import DishDescriptionModal from './DishDescriptionModal';
import SupplementModal from './SupplementModal';

interface ManualMenuSectionProps {
	editingMenu?: MenuData;
	onSave: (dishes: Dish[]) => void;
}

export default function ManualMenuSection({
	editingMenu,
	onSave,
}: ManualMenuSectionProps) {
	const { t } = useTranslation();
	const [dishes, setDishes] = useState<Dish[]>(() => {
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

	// Estados para modales
	const [showDishModal, setShowDishModal] = useState(false);
	const [showSupplementModal, setShowSupplementModal] = useState(false);
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);
	const [supplementPrice, setSupplementPrice] = useState('');

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

	// Actualizar el parent cuando cambien los dishes
	React.useEffect(() => {
		// Solo actualizar si hay cambios reales en los dishes
		const validDishes = dishes.filter(
			(dish) => dish.name.trim() !== '' && dish.name !== 'ej: ensalada cesar',
		);
		onSave(validDishes);
	}, [dishes]); // Removemos onSave de las dependencias para evitar el loop

	return (
		<>
			<View style={styles.courseSection}>
				<Text style={styles.courseTitle}>{t('menuCreation.firstCourses')}</Text>
				{dishes
					.filter((d) => d.category === DishCategory.FIRST_COURSES)
					.map((dish) => (
						<View key={dish.id} style={styles.dishItem}>
							<TextInput
								style={styles.dishInput}
								value={dish.name}
								onChangeText={(text) => updateDishName(dish.id, text)}
								placeholder={t('menuCreation.firstCoursePlaceholder')}
							/>
							<TouchableOpacity
								style={styles.dishIcon}
								onPress={() => openDishModal(dish)}
							>
								<Ionicons name="restaurant" size={20} color={colors.primary} />
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
					onPress={() => addDish(DishCategory.FIRST_COURSES)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>
						{t('menuCreation.addFirstCourse')}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.courseSection}>
				<Text style={styles.courseTitle}>
					{t('menuCreation.secondCourses')}
				</Text>
				{dishes
					.filter((d) => d.category === DishCategory.SECOND_COURSES)
					.map((dish) => (
						<View key={dish.id} style={styles.dishItem}>
							<TextInput
								style={styles.dishInput}
								value={dish.name}
								onChangeText={(text) => updateDishName(dish.id, text)}
								placeholder={t('menuCreation.secondCoursePlaceholder')}
							/>
							<TouchableOpacity
								style={styles.dishIcon}
								onPress={() => openDishModal(dish)}
							>
								<Ionicons name="restaurant" size={20} color={colors.primary} />
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
					onPress={() => addDish(DishCategory.SECOND_COURSES)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>
						{t('menuCreation.addSecondCourse')}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.courseSection}>
				<Text style={styles.courseTitle}>{t('menuCreation.desserts')}</Text>
				{dishes
					.filter((d) => d.category === DishCategory.DESSERTS)
					.map((dish) => (
						<View key={dish.id} style={styles.dishItem}>
							<TextInput
								style={styles.dishInput}
								value={dish.name}
								onChangeText={(text) => updateDishName(dish.id, text)}
								placeholder={t('menuCreation.dessertPlaceholder')}
							/>
							<TouchableOpacity
								style={styles.dishIcon}
								onPress={() => openDishModal(dish)}
							>
								<Ionicons name="restaurant" size={20} color={colors.primary} />
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
					onPress={() => addDish(DishCategory.DESSERTS)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>{t('menuCreation.addDessert')}</Text>
				</TouchableOpacity>
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
	priceIcon: {
		width: 50,
		height: 50,
		borderRadius: 12,
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
});
