import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { DishCategory } from '@/shared/enums';
import { Dish, MenuData } from '@/shared/types.js';
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

	const renderMenuItem = ({ item }: { item: Dish }) => (
		<View style={styles.menuItem}>
			<View style={styles.menuItemHeader}>
				<Text style={styles.menuItemName}>{item.name}</Text>
				<View style={styles.menuItemIcons}>
					{item.isLactoseFree && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/lactose_free_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.isSpicy && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/spicy_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.isGlutenFree && (
						<View style={styles.dietIcon}>
							<Image
								source={require('@/assets/images/gluten_free_icon.png')}
								style={{ width: 18, height: 18 }}
								resizeMode="contain"
							/>
						</View>
					)}
					{item.isVegetarian && (
						<View style={styles.dietIcon}>
							<Ionicons name="leaf-outline" size={18} color={colors.primary} />
						</View>
					)}
					{item.isVegan && (
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
			{item.extraPrice > 0 && (
				<View style={styles.menuItemPriceContainer}>
					<Text style={styles.menuItemPriceText}>
						+{item.extraPrice.toFixed(2)}€
					</Text>
				</View>
			)}
		</View>
	);

	const renderMenuCategory = ({ item }: { item: GroupedDishes }) => (
		<View style={styles.menuCategory}>
			<Text style={styles.menuCategoryTitle}>{item.categoryName}</Text>
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
	const groupedDishes = groupDishesByCategory(currentMenu.dishes);

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
					<Text style={styles.menuHeader}>{currentMenu.name}</Text>
					<Text style={styles.menuSubHeader}>{currentMenu.subtitle}</Text>
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
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 2,
	},
	menuSubHeader: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
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
	menuCategoryTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 15,
		textAlign: 'left',
		borderBottomWidth: 1,
		borderBottomColor: '#E8F0E8',
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
		fontFamily: 'Manrope',
		fontWeight: '600',
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
	dietIconText: {
		fontSize: 12,
	},
	menuItemDescription: {
		fontSize: 13,
		fontFamily: 'Manrope',
		fontWeight: '400',
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
		fontFamily: 'Manrope',
		fontWeight: '600',
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
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		textAlign: 'center',
	},
});

export default Menu;
