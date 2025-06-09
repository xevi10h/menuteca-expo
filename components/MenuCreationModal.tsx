import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Dish, MenuData } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
	Modal,
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
	const [showManualMenu, setShowManualMenu] = useState(false);
	const [menuDishes, setMenuDishes] = useState<Dish[]>([]);

	// New state for menu options
	const [menuOptions, setMenuOptions] = useState<Partial<MenuData>>({});

	// Inicializar solo cuando el modal se abre
	React.useEffect(() => {
		if (visible) {
			if (editingMenu) {
				setMenuName(editingMenu.name);
				setSelectedDays([...editingMenu.days]);
				setStartTime(editingMenu.startTime);
				setEndTime(editingMenu.endTime);
				setPrice(editingMenu.price.toString());
				setShowManualMenu(editingMenu.dishes.length > 0);
				setMenuDishes([...editingMenu.dishes]);
				setMenuOptions({
					firstCoursesToShare: editingMenu.firstCoursesToShare,
					secondCoursesToShare: editingMenu.secondCoursesToShare,
					dessertsToShare: editingMenu.dessertsToShare,
					includesBread: editingMenu.includesBread,
					includesDrink: editingMenu.includesDrink,
					includesCoffeeAndDessert: editingMenu.includesCoffeeAndDessert,
					hasMinimumPeople: editingMenu.hasMinimumPeople,
					minimumPeople: editingMenu.minimumPeople,
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
		[],
	);

	const handleSave = useCallback(() => {
		const menu: MenuData = {
			id: editingMenu?.id || Date.now().toString(),
			name: menuName,
			days: selectedDays,
			startTime,
			endTime,
			price: parseFloat(price) || 0,
			dishes: menuDishes,
			...menuOptions, // Spread the new menu options
		};
		onSave(menu);
		onClose();
	}, [
		menuName,
		selectedDays,
		startTime,
		endTime,
		price,
		menuDishes,
		menuOptions,
		editingMenu?.id,
		onSave,
		onClose,
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
				/>
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
						<DaysSelector selectedDays={selectedDays} onToggleDay={toggleDay} />
					</View>

					{/* Time */}
					<View style={styles.section}>
						<Text style={styles.label}>{t('menuCreation.whatTime')}</Text>
						<TimeSelector
							startTime={startTime}
							endTime={endTime}
							onStartTimeChange={setStartTime}
							onEndTimeChange={setEndTime}
						/>
					</View>

					{/* Price */}
					<View style={styles.section}>
						<Text style={styles.label}>{t('menuCreation.price')}</Text>
						<PriceInput value={price} onChangeText={setPrice} />
					</View>

					{/* Divider */}
					<View style={styles.divider} />

					{/* Menu Section */}
					<View style={styles.menuSection}>
						<Text style={styles.menuTitle}>{t('menuCreation.menuTitle')}</Text>

						<TouchableOpacity style={styles.addPhotoMenuButton}>
							<Ionicons
								name="camera-outline"
								size={16}
								color={colors.quaternary}
							/>
							<Text style={styles.addPhotoMenuText}>
								{t('menuCreation.addPhotoMenu')}
							</Text>
						</TouchableOpacity>

						<DividerWithCircle color={colors.primary} marginVertical={20} />

						{/* Manual Menu Section */}
						{showManualMenu && (
							<ManualMenuSection
								editingMenu={editingMenu}
								onSave={handleDishesAndOptionsChange}
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
	addPhotoMenuText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
	},
});
