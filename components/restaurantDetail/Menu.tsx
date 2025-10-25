import SodaCanIcon from '@/assets/icons/SodaCanIcon';
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { DishCategory } from '@/shared/enums';
import {
	Dish,
	DrinkInclusion,
	MenuData,
	getSelectedDrinks,
	hasDrinks,
} from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface MenuProps {
	menus: MenuData[];
}

interface GroupedDishes {
	category: DishCategory;
	categoryName: string;
	dishes: Dish[];
}

const Menu: React.FC<MenuProps> = ({ menus }) => {
	const { t } = useTranslation();
	const [currentMenuIndex, setCurrentMenuIndex] = useState(0);

	// Early return if no menus available
	if (!menus || menus.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>{t('restaurant.noMenusAvailable')}</Text>
			</View>
		);
	}

	const currentMenu = menus[currentMenuIndex];
	const canGoLeft = currentMenuIndex > 0;
	const canGoRight = currentMenuIndex < menus.length - 1;

	const handlePreviousMenu = () => {
		if (canGoLeft) {
			setCurrentMenuIndex(currentMenuIndex - 1);
		}
	};

	const handleNextMenu = () => {
		if (canGoRight) {
			setCurrentMenuIndex(currentMenuIndex + 1);
		}
	};

	// Función para formatear los días
	const formatDays = (days: string[]): string => {
		if (!days || days.length === 0) return '';

		const sortedDays = days.sort((a, b) => {
			const dayOrder = [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday',
			];
			return dayOrder.indexOf(a) - dayOrder.indexOf(b);
		});

		const dayTranslations = sortedDays.map((day) => t(`days.${day}`));
		return dayTranslations.join(', ');
	};

	// Función para formatear horarios
	const formatSchedule = (start_time: string, end_time: string): string => {
		// Si ambos horarios son 00:00, no mostrar horario
		if (start_time === '00:00' && end_time === '00:00') {
			return '';
		}
		return `${start_time} - ${end_time}`;
	};

	// Función para formatear coffee/dessert option
	const formatCoffeeDesert = (
		option: 'none' | 'eitherOne' | 'coffee' | 'dessert' | 'both' | undefined,
	): string => {
		if (!option || option === 'none') return '';
		if (option === 'coffee') return t('menuCreation.includesCoffee');
		if (option === 'dessert') return t('menuCreation.includesDessert');
		if (option === 'eitherOne')
			return t('menuCreation.includes_coffee_or_dessert');
		if (option === 'both') return t('menuCreation.includes_coffee_and_dessert');
		return '';
	};

	const formatDrinks = (drinks?: DrinkInclusion): string => {
		if (!drinks || !hasDrinks(drinks)) return '';

		const selectedDrinks = getSelectedDrinks(drinks);
		const drinkLabels = selectedDrinks.map((drink) => {
			switch (drink) {
				case 'water':
					return t('menuCreation.drinks.water');
				case 'wine':
					return t('menuCreation.drinks.wine');
				case 'soft_drinks':
					return t('menuCreation.drinks.soft_drinks');
				case 'beer':
					return t('menuCreation.drinks.beer');
				default:
					return '';
			}
		});

		return drinkLabels.join(', ');
	};

	const getDrinksIconType = (drinks?: DrinkInclusion): 'ionicon' | 'custom' => {
		if (!drinks || !hasDrinks(drinks)) return 'ionicon';

		const selectedDrinks = getSelectedDrinks(drinks);

		if (selectedDrinks.length === 1 && selectedDrinks[0] === 'soft_drinks') {
			return 'custom';
		}

		return 'ionicon';
	};

	const getDrinksIoniconName = (drinks?: DrinkInclusion) => {
		if (!drinks || !hasDrinks(drinks)) return 'wine-outline';

		const selectedDrinks = getSelectedDrinks(drinks);

		// Si tiene todas las bebidas, mostrar icono genérico
		if (selectedDrinks.length >= 3) {
			return 'wine-outline';
		}

		// Si solo tiene una bebida, mostrar su icono específico
		if (selectedDrinks.length === 1) {
			switch (selectedDrinks[0]) {
				case 'water':
					return 'water-outline';
				case 'wine':
					return 'wine-outline';
				case 'beer':
					return 'beer-outline';
				default:
					return 'wine-outline';
			}
		}

		// Para múltiples bebidas, usar icono genérico
		return 'wine-outline';
	};

	const renderDrinksIcon = (drinks?: DrinkInclusion) => {
		const iconType = getDrinksIconType(drinks);

		if (iconType === 'custom') {
			return <SodaCanIcon size={12} color={colors.quaternary} />;
		}

		return (
			<Ionicons
				name={getDrinksIoniconName(drinks)}
				size={12}
				color={colors.quaternary}
			/>
		);
	};

	// Función para agrupar platos por categoría
	const groupDishesByCategory = (dishes: Dish[]): GroupedDishes[] => {
		const grouped = dishes.reduce((acc, dish) => {
			if (!acc[dish.category]) {
				acc[dish.category] = [];
			}
			acc[dish.category].push(dish);
			return acc;
		}, {} as Record<DishCategory, Dish[]>);

		// Convertir a array y añadir nombres de categorías traducidos
		return Object.entries(grouped).map(([category, dishes]) => ({
			category: category as DishCategory,
			categoryName: t(`dishCategories.${category}`),
			dishes: dishes,
		}));
	};

	const showSchedule =
		currentMenu?.days?.length > 0 ||
		currentMenu?.start_time !== '00:00' ||
		currentMenu?.end_time !== '00:00';

	const showOptions =
		currentMenu?.includes_bread ||
		currentMenu?.includes_coffee_and_dessert !== 'none' ||
		currentMenu?.has_minimum_people ||
		hasDrinks(currentMenu?.drinks);

	const renderMenuItem = ({ item }: { item: Dish }) => (
		<View style={styles.menuItem}>
			<View style={styles.menuItemHeader}>
				<Text style={styles.menuItemName}>{item.name}</Text>
				<View style={styles.menuItemIcons}>
					{item.is_lactose_free && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/lactose_free_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.is_spicy && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/spicy_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.is_gluten_free && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/gluten_free_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.is_vegetarian && (
						<View style={styles.dietIcon}>
							<Ionicons name="leaf-outline" size={18} color={colors.primary} />
						</View>
					)}
					{item.is_vegan && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/vegetarian_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
				</View>
			</View>
			<Text style={styles.menuItemDescription}>{item.description}</Text>
			{item.extra_price > 0 && (
				<View style={styles.menuItemPriceContainer}>
					<Text style={styles.menuItemPriceText}>
						+{item.extra_price.toFixed(2)}€
					</Text>
				</View>
			)}
		</View>
	);

	const renderCategoryHeader = ({ item }: { item: GroupedDishes }) => {
		const isToShare =
			(item.category === DishCategory.FIRST_COURSES &&
				currentMenu?.first_courses_to_share) ||
			(item.category === DishCategory.SECOND_COURSES &&
				currentMenu?.second_courses_to_share) ||
			(item.category === DishCategory.DESSERTS &&
				currentMenu?.desserts_to_share);

		return (
			<View style={styles.categoryHeaderContainer}>
				<Text style={styles.menuCategoryTitle}>{item.categoryName}</Text>
				{isToShare && (
					<View style={styles.shareTag}>
						<Ionicons name="people-outline" size={12} color={colors.primary} />
						<Text style={styles.shareTagText}>{t('menuCreation.toShare')}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderMenuCategory = ({ item }: { item: GroupedDishes }) => (
		<View style={styles.menuCategory}>
			{renderCategoryHeader({ item })}
			<FlatList
				data={item.dishes}
				renderItem={renderMenuItem}
				keyExtractor={(dish) => dish.id.toString()}
				scrollEnabled={false}
			/>
		</View>
	);

	if (!currentMenu) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>{t('restaurant.noMenuAvailable')}</Text>
			</View>
		);
	}

	// Agrupar los platos del menú actual por categoría
	const groupedDishes = groupDishesByCategory(currentMenu?.dishes || []);

	return (
		<View style={styles.menuContainer}>
			{/* Menu Navigation Header */}
			<View style={styles.menuNavigationContainer}>
				<TouchableOpacity
					style={[
						styles.navigationButton,
						!canGoLeft && styles.navigationButtonDisabled,
					]}
					onPress={handlePreviousMenu}
					disabled={!canGoLeft}
				>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>

				<View style={styles.menuHeaderContainer}>
					<Text style={styles.menuHeader}>{currentMenu?.name}</Text>
					<Text style={styles.menuSubHeader}>{`${t('general.from')} ${
						currentMenu?.price
					}€`}</Text>
				</View>

				<TouchableOpacity
					style={[
						styles.navigationButton,
						!canGoRight && styles.navigationButtonDisabled,
					]}
					onPress={handleNextMenu}
					disabled={!canGoRight}
				>
					<Ionicons name="chevron-forward" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Menu Dots Indicator */}
			{menus.length > 1 && (
				<View style={styles.dotsContainer}>
					{menus.map((_, index) => (
						<TouchableOpacity
							key={index}
							style={[
								styles.dot,
								index === currentMenuIndex && styles.activeDot,
							]}
							onPress={() => setCurrentMenuIndex(index)}
						/>
					))}
				</View>
			)}

			{/* Menu Details Section */}
			{(showSchedule || showOptions) && (
				<View style={styles.menuDetailsSection}>
					{/* Schedule and Days */}
					{showSchedule && (
						<View style={styles.scheduleContainer}>
							{formatDays(currentMenu?.days) && (
								<View style={styles.scheduleItem}>
									<Ionicons
										name="calendar-outline"
										size={16}
										color={colors.primary}
									/>
									<Text style={styles.scheduleText}>
										{formatDays(currentMenu?.days)}
									</Text>
								</View>
							)}
							{formatSchedule(
								currentMenu?.start_time,
								currentMenu?.end_time,
							) && (
								<View style={[styles.scheduleItem]}>
									<Ionicons
										name="time-outline"
										size={16}
										color={colors.primary}
									/>
									<Text style={styles.scheduleText}>
										{formatSchedule(
											currentMenu?.start_time,
											currentMenu?.end_time,
										)}
									</Text>
								</View>
							)}
						</View>
					)}

					{/* Menu Includes Section */}
					{showOptions && (
						<View>
							<Text style={styles.includesTitle}>
								{t('menuCreation.menuOptions')}
							</Text>
							<View style={styles.includesGrid}>
								{currentMenu?.includes_bread && (
									<View style={styles.includeTag}>
										<Ionicons
											name="restaurant-outline"
											size={12}
											color={colors.quaternary}
										/>
										<Text style={styles.includeTagText}>
											{t('menuCreation.includes_bread')}
										</Text>
									</View>
								)}

								{currentMenu?.drinks && hasDrinks(currentMenu?.drinks) && (
									<View style={styles.includeTag}>
										{renderDrinksIcon(currentMenu?.drinks)}
										<Text style={styles.includeTagText}>
											{formatDrinks(currentMenu?.drinks)}
										</Text>
									</View>
								)}

								{currentMenu?.includes_coffee_and_dessert &&
									currentMenu?.includes_coffee_and_dessert !== 'none' && (
										<View style={styles.includeTag}>
											<Ionicons
												name="cafe-outline"
												size={12}
												color={colors.quaternary}
											/>
											<Text style={styles.includeTagText}>
												{formatCoffeeDesert(
													currentMenu?.includes_coffee_and_dessert,
												)}
											</Text>
										</View>
									)}
								{currentMenu?.has_minimum_people &&
									currentMenu?.minimum_people && (
										<View style={styles.includeTag}>
											<Ionicons
												name="people-outline"
												size={12}
												color={colors.quaternary}
											/>
											<Text style={styles.includeTagText}>
												{t('menuCreation.minimumPeopleLabel')}{' '}
												{currentMenu?.minimum_people}
											</Text>
										</View>
									)}
							</View>
						</View>
					)}
				</View>
			)}

			{/* Menu Categories */}
			<FlatList
				data={groupedDishes}
				renderItem={renderMenuCategory}
				keyExtractor={(groupedDish) => groupedDish.category}
				scrollEnabled={false}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.menuContent}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	menuContainer: {
		flex: 1,
	},
	menuNavigationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		borderRadius: 15,
		paddingVertical: 15,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 3.84,
		elevation: 2,
	},
	navigationButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	navigationButtonDisabled: {
		opacity: 0.3,
	},
	menuHeaderContainer: {
		flex: 1,
		alignItems: 'center',
	},
	menuHeader: {
		fontSize: 20,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 2,
	},
	menuSubHeader: {
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlign: 'center',
	},
	dotsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		gap: 8,
		marginTop: 0,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primary,
	},
	activeDot: {
		backgroundColor: colors.primary,
		width: 16,
	},
	menuDetailsSection: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 15,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 3.84,
		elevation: 2,
		gap: 10,
	},
	scheduleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 15,
		gap: 10,
	},
	scheduleItem: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		gap: 8,
	},
	scheduleText: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
		flex: 1,
	},
	includesTitle: {
		fontSize: 14,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		marginBottom: 10,
	},
	includesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	includeTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primary,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
		gap: 4,
	},
	includeTagText: {
		fontSize: 11,
		fontFamily: fonts.medium,
		color: colors.quaternary,
	},
	menuContent: {
		paddingBottom: 20,
	},
	menuCategory: {
		marginBottom: 20,
		borderRadius: 15,
		overflow: 'hidden',
		backgroundColor: colors.quaternary,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.08,
		shadowRadius: 3.84,
		elevation: 3,
	},
	categoryHeaderContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	menuCategoryTitle: {
		fontSize: 16,
		fontFamily: fonts.bold,
		color: colors.quaternary,
		flex: 1,
	},
	shareTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.secondary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 10,
		gap: 4,
	},
	shareTagText: {
		fontSize: 10,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	menuItem: {
		backgroundColor: colors.quaternary,
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#f5f5f5',
	},
	menuItemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	menuItemName: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		flex: 1,
		marginRight: 10,
	},
	menuItemIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	dietIcon: {
		width: 18,
		height: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
	menuItemDescription: {
		fontSize: 13,
		fontFamily: fonts.regular,
		color: colors.primary,
		lineHeight: 18,
		marginBottom: 12,
		textAlign: 'left',
	},
	menuItemPriceContainer: {
		alignItems: 'flex-end',
	},
	menuItemPriceText: {
		fontSize: 12,
		fontFamily: fonts.semiBold,
		color: colors.quaternary,
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		textAlign: 'center',
		minWidth: 60,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	emptyText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		textAlign: 'center',
	},
});

export default Menu;
