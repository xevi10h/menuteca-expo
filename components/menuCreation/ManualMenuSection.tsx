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
					onPress={() => addDish(DishCategory.APPETIZERS)}
				>
					<Ionicons name="add" size={20} color={colors.primary} />
					<Text style={styles.addDishText}>
						{t('menuCreation.addFirstCourse')}
					</Text>
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
});
