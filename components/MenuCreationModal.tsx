import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Dish, MenuData } from '@/shared/types';
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
	}, []);

	const toggleDay = useCallback((day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	}, []);

	const handleDishesChange = useCallback((dishes: Dish[]) => {
		setMenuDishes(dishes);
	}, []);

	const handleSave = useCallback(() => {
		const menu: MenuData = {
			id: editingMenu?.id || Date.now().toString(),
			name: menuName,
			days: selectedDays,
			startTime,
			endTime,
			price: parseFloat(price) || 0,
			dishes: menuDishes,
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

						{/* Manual Menu Section */}
						{showManualMenu && (
							<ManualMenuSection
								editingMenu={editingMenu}
								onSave={handleDishesChange}
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

						<DividerWithCircle color={colors.primary} marginVertical={20} />

						<TouchableOpacity style={styles.addPhotoMenuButton}>
							<Text style={styles.addPhotoMenuText}>
								{t('menuCreation.addPhotoMenu')}
							</Text>
						</TouchableOpacity>
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
});
