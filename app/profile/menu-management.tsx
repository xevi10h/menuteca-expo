import { RestaurantService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import MenuCreationModal from '@/components/MenuCreationModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMenuTime } from '@/shared/functions/utils';
import { MenuData, Restaurant } from '@/shared/types';
import { useMenuStore } from '@/zustand/MenuStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component for individual menu item
interface MenuListItemProps {
	menu: MenuData;
	restaurantName: string;
	isRestaurantActive: boolean;
	onEdit: (menu: MenuData) => void;
}

function MenuListItem({
	menu,
	restaurantName,
	isRestaurantActive,
	onEdit,
}: MenuListItemProps) {
	const { t } = useTranslation();

	const formatDays = (days: string[]): string => {
		if (days.length === 7) return t('menuManagement.everyday');
		if (days.length === 0) return t('menuManagement.noDays');

		const dayNames: { [key: string]: string } = {
			monday: t('days.monday'),
			tuesday: t('days.tuesday'),
			wednesday: t('days.wednesday'),
			thursday: t('days.thursday'),
			friday: t('days.friday'),
			saturday: t('days.saturday'),
			sunday: t('days.sunday'),
		};

		return days.map((day) => dayNames[day] || day).join(', ');
	};

	const formatTime = (startTime: string, endTime: string): string => {
		return `${formatMenuTime(startTime)} - ${formatMenuTime(endTime)}`;
	};

	return (
		<TouchableOpacity
			style={[styles.menuItem, !isRestaurantActive && styles.menuItemInactive]}
			onPress={() => onEdit(menu)}
		>
			<View style={styles.menuItemContent}>
				<View style={styles.menuItemHeader}>
					<Text
						style={[
							styles.menuName,
							!isRestaurantActive && styles.textInactive,
						]}
						numberOfLines={1}
					>
						{menu.name}
					</Text>
					<Text
						style={[
							styles.menuPrice,
							!isRestaurantActive && styles.textInactive,
						]}
					>
						{menu?.price?.toFixed(2)}€
					</Text>
				</View>

				<View style={styles.menuItemDetails}>
					<Text
						style={[
							styles.menuDays,
							!isRestaurantActive && styles.textInactive,
						]}
						numberOfLines={1}
					>
						{formatDays(menu.days)}
					</Text>
					<Text
						style={[
							styles.menuTime,
							!isRestaurantActive && styles.textInactive,
						]}
					>
						{formatTime(menu.start_time, menu.end_time)}
					</Text>
				</View>

				<View style={styles.menuItemFooter}>
					<Text
						style={[
							styles.dishCount,
							!isRestaurantActive && styles.textInactive,
						]}
					>
						{t('menuManagement.dishCount', { count: menu.dishes.length })}
					</Text>

					{!isRestaurantActive && (
						<View style={styles.inactiveTag}>
							<Text style={styles.inactiveTagText}>
								{t('menuManagement.restaurantInactive')}
							</Text>
						</View>
					)}
				</View>
			</View>

			<Ionicons
				name="chevron-forward"
				size={20}
				color={
					isRestaurantActive ? colors.primaryLight : colors.primaryLight + '80'
				}
			/>
		</TouchableOpacity>
	);
}

// Component for restaurant group header
interface RestaurantGroupHeaderProps {
	restaurant: Restaurant;
	menuCount: number;
}

function RestaurantGroupHeader({
	restaurant,
	menuCount,
}: RestaurantGroupHeaderProps) {
	const { t } = useTranslation();

	return (
		<View
			style={[
				styles.restaurantGroupHeader,
				!restaurant.is_active && styles.restaurantGroupHeaderInactive,
			]}
		>
			<View style={styles.restaurantInfo}>
				<View style={styles.restaurantNameRow}>
					<Text
						style={[
							styles.restaurantName,
							!restaurant.is_active && styles.textInactive,
						]}
						numberOfLines={1}
					>
						{restaurant.name}
					</Text>
					{!restaurant.is_active && <View style={styles.statusDot} />}
				</View>
				<Text
					style={[
						styles.restaurantDetails,
						!restaurant.is_active && styles.textInactive,
					]}
				>
					{restaurant.cuisine.name} •{' '}
					{t('menuManagement.menuCount', { count: menuCount })}
				</Text>
			</View>
		</View>
	);
}

export default function MenuManagementScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { fetchRestaurantMenus, updateMenuWithDishes } = useMenuStore();

	// States
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [allMenus, setAllMenus] = useState<{
		[restaurantId: string]: MenuData[];
	}>({});
	const [showMenuModal, setShowMenuModal] = useState(false);
	const [editingMenu, setEditingMenu] = useState<MenuData | undefined>(
		undefined,
	);
	const [editingRestaurantId, setEditingRestaurantId] = useState<string>('');

	// Load all restaurants and their menus
	const loadAllData = useCallback(async () => {
		try {
			// Load user's restaurants
			const restaurantsResponse = await RestaurantService.getMyRestaurants();

			if (restaurantsResponse.success && restaurantsResponse.data) {
				setRestaurants(restaurantsResponse.data);

				// Load menus for each restaurant
				const menusData: { [restaurantId: string]: MenuData[] } = {};

				await Promise.all(
					restaurantsResponse.data.map(async (restaurant) => {
						try {
							const menus = await fetchRestaurantMenus(restaurant.id);
							menusData[restaurant.id] = menus;
						} catch (error) {
							console.error(
								`Error loading menus for restaurant ${restaurant.id}:`,
								error,
							);
							menusData[restaurant.id] = [];
						}
					}),
				);

				setAllMenus(menusData);
			}
		} catch (error) {
			console.error('Error loading restaurants and menus:', error);
			Alert.alert(t('validation.error'), t('menuManagement.errorLoadingData'));
		}
	}, []); // Quitar las dependencias problemáticas

	// Initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await loadAllData();
			setLoading(false);
		};

		loadData();
	}, []); // Solo ejecutar una vez al montar el componente

	// Refresh handler
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadAllData();
		setRefreshing(false);
	}, [loadAllData]);

	// Back handler
	const handleBack = () => {
		router.back();
	};

	// Edit menu handler
	const handleEditMenu = (menu: MenuData, restaurantId: string) => {
		setEditingMenu(menu);
		setEditingRestaurantId(restaurantId);
		setShowMenuModal(true);
	};

	// Save menu handler
	const handleSaveMenu = async (updatedMenu: MenuData) => {
		try {
			const result = await updateMenuWithDishes(
				editingRestaurantId,
				updatedMenu,
			);

			if (result.success && result.data) {
				// Update local state
				setAllMenus((prev) => ({
					...prev,
					[editingRestaurantId]: prev[editingRestaurantId].map((menu) =>
						menu.id === updatedMenu.id ? result.data! : menu,
					),
				}));
			} else {
				Alert.alert(
					t('validation.error'),
					result.error || 'Failed to update menu',
				);
				return; // Don't close modal on error
			}
		} catch (error) {
			console.error('Error updating menu:', error);
			Alert.alert(t('validation.error'), 'Failed to update menu');
			return; // Don't close modal on error
		}

		// Close modal only on success
		setShowMenuModal(false);
		setEditingMenu(undefined);
		setEditingRestaurantId('');
	};

	// Close modal handler
	const handleCloseModal = () => {
		setShowMenuModal(false);
		setEditingMenu(undefined);
		setEditingRestaurantId('');
	};

	// Calculate total menu count
	const totalMenuCount = Object.values(allMenus).reduce(
		(total, menus) => total + menus.length,
		0,
	);

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('menuManagement.title')}</Text>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>

				<View style={styles.headerRight}>
					<Text style={styles.totalCount}>
						{t('menuManagement.totalMenus', { count: totalMenuCount })}
					</Text>
				</View>
			</View>

			{totalMenuCount === 0 ? (
				// Empty state
				<View style={styles.emptyState}>
					<Ionicons
						name="restaurant-outline"
						size={64}
						color={colors.primaryLight}
					/>
					<Text style={styles.emptyStateTitle}>
						{t('menuManagement.noMenusTitle')}
					</Text>
					<Text style={styles.emptyStateText}>
						{t('menuManagement.noMenusText')}
					</Text>
					<TouchableOpacity
						style={styles.addFirstMenuButton}
						onPress={handleBack}
					>
						<Text style={styles.addFirstMenuButtonText}>
							{t('menuManagement.addFirstMenu')}
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				// Menu list
				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							colors={[colors.primary]}
							tintColor={colors.primary}
						/>
					}
				>
					{restaurants.map((restaurant) => {
						const restaurantMenus = allMenus[restaurant.id] || [];

						if (restaurantMenus.length === 0) return null;

						return (
							<View key={restaurant.id} style={styles.restaurantGroup}>
								<RestaurantGroupHeader
									restaurant={restaurant}
									menuCount={restaurantMenus.length}
								/>

								{restaurantMenus.map((menu) => (
									<MenuListItem
										key={menu.id}
										menu={menu}
										restaurantName={restaurant.name}
										isRestaurantActive={restaurant.is_active}
										onEdit={(menu) => handleEditMenu(menu, restaurant.id)}
									/>
								))}
							</View>
						);
					})}

					<View style={{ height: 50 }} />
				</ScrollView>
			)}

			{/* Menu Creation Modal */}
			<MenuCreationModal
				visible={showMenuModal}
				onClose={handleCloseModal}
				onSave={handleSaveMenu}
				editingMenu={editingMenu}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		position: 'absolute',
		left: 0,
		right: 0,
	},
	headerRight: {
		width: 50,
		alignItems: 'flex-end',
	},
	totalCount: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	restaurantGroup: {
		marginBottom: 32,
	},
	restaurantGroupHeader: {
		paddingHorizontal: 4,
		paddingVertical: 16,
		marginBottom: 12,
	},
	restaurantGroupHeaderInactive: {
		opacity: 0.7,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurantNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	restaurantName: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		flex: 1,
	},
	statusDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#EF4444',
		marginLeft: 12,
	},
	restaurantDetails: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		marginLeft: 4,
	},
	menuItem: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	menuItemInactive: {
		backgroundColor: colors.quaternary + 'C0',
		borderWidth: 1,
		borderColor: colors.primaryLight + '20',
	},
	menuItemContent: {
		flex: 1,
		marginRight: 12,
	},
	menuItemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	menuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 1,
		marginRight: 8,
	},
	menuPrice: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	menuItemDetails: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	menuDays: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		flex: 1,
		marginRight: 8,
	},
	menuTime: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	menuItemFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dishCount: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
	},
	inactiveTag: {
		backgroundColor: '#EF4444',
		borderRadius: 8,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	inactiveTagText: {
		fontSize: 9,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
	textInactive: {
		opacity: 0.6,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginTop: 20,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyStateText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 30,
	},
	addFirstMenuButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	addFirstMenuButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
