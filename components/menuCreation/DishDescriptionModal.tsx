import GlutenFreeIcon from '@/assets/icons/GlutenFreeIcon';
import LactoseFreeIcon from '@/assets/icons/LactoseFreeIcon';
import SpicyIcon from '@/assets/icons/SpicyIcon';
import VeganIcon from '@/assets/icons/VeganIcon';
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Dish } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

interface DishDescriptionModalProps {
	visible: boolean;
	dish: Dish | null;
	onClose: () => void;
	onSave: (dish: Dish) => void;
}

export default function DishDescriptionModal({
	visible,
	dish,
	onClose,
	onSave,
}: DishDescriptionModalProps) {
	const { t } = useTranslation();
	const [currentDish, setCurrentDish] = useState<Dish | null>(null);

	React.useEffect(() => {
		if (visible && dish) {
			setCurrentDish({ ...dish });
		}
	}, [visible, dish]);

	const toggleDietaryOption = (
		option: keyof Pick<
			Dish,
			| 'is_gluten_free'
			| 'is_lactose_free'
			| 'is_vegetarian'
			| 'is_spicy'
			| 'is_vegan'
		>,
	) => {
		if (currentDish) {
			setCurrentDish({
				...currentDish,
				[option]: !currentDish[option],
			});
		}
	};

	const handleSave = () => {
		if (currentDish) {
			onSave(currentDish);
		}
	};

	if (!currentDish) return null;

	return (
		<Modal visible={visible} animationType="fade" transparent>
			<View style={styles.overlayContainer}>
				<View style={styles.dishModal}>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Ionicons name="close" size={24} color={colors.primary} />
					</TouchableOpacity>

					<Text style={styles.dishModalTitle}>
						{t('menuCreation.addDishDescription')}{' '}
						<Text style={styles.dishModalTitleName}>{dish?.name || ''}</Text>
					</Text>

					<TextInput
						style={styles.dishDescriptionInput}
						placeholder={t('menuCreation.dishDescriptionPlaceholder')}
						multiline
						numberOfLines={4}
						value={currentDish.description}
						onChangeText={(text) => {
							setCurrentDish({ ...currentDish, description: text });
						}}
					/>

					<Text style={styles.dietaryLabel}>
						{t('menuCreation.dietaryOptions')}
					</Text>

					<View style={styles.dietaryOptions}>
						<TouchableOpacity
							style={[
								styles.dietaryOption,
								currentDish.is_gluten_free && styles.dietaryOptionSelected,
							]}
							onPress={() => toggleDietaryOption('is_gluten_free')}
						>
							<GlutenFreeIcon
								width={20}
								color={
									currentDish.is_gluten_free
										? colors.quaternary
										: colors.primary
								}
							/>
							<Text
								style={[
									styles.dietaryText,
									currentDish.is_gluten_free && styles.dietaryTextSelected,
								]}
							>
								{t('menuCreation.dietary.glutenFree')}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.dietaryOption,
								currentDish.is_lactose_free && styles.dietaryOptionSelected,
							]}
							onPress={() => toggleDietaryOption('is_lactose_free')}
						>
							<LactoseFreeIcon
								width={20}
								color={
									currentDish.is_lactose_free
										? colors.quaternary
										: colors.primary
								}
							/>
							<Text
								style={[
									styles.dietaryText,
									currentDish.is_lactose_free && styles.dietaryTextSelected,
								]}
							>
								{t('menuCreation.dietary.lactoseFree')}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.dietaryOption,
								currentDish.is_spicy && styles.dietaryOptionSelected,
							]}
							onPress={() => toggleDietaryOption('is_spicy')}
						>
							<SpicyIcon
								width={20}
								color={
									currentDish.is_spicy ? colors.quaternary : colors.primary
								}
							/>
							<Text
								style={[
									styles.dietaryText,
									currentDish.is_spicy && styles.dietaryTextSelected,
								]}
							>
								{t('menuCreation.dietary.spicy')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.dietaryOption,
								currentDish.is_vegetarian && styles.dietaryOptionSelected,
							]}
							onPress={() => toggleDietaryOption('is_vegetarian')}
						>
							<Ionicons
								name="leaf-outline"
								size={20}
								color={
									currentDish.is_vegetarian ? colors.quaternary : colors.primary
								}
							/>
							<Text
								style={[
									styles.dietaryText,
									currentDish.is_vegetarian && styles.dietaryTextSelected,
								]}
							>
								{t('menuCreation.dietary.vegetarian')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.dietaryOption,
								currentDish.is_vegan && styles.dietaryOptionSelected,
							]}
							onPress={() => toggleDietaryOption('is_vegan')}
						>
							<VeganIcon
								width={20}
								color={
									currentDish.is_vegan ? colors.quaternary : colors.primary
								}
							/>
							<Text
								style={[
									styles.dietaryText,
									currentDish.is_vegan && styles.dietaryTextSelected,
								]}
							>
								{t('menuCreation.dietary.vegan')}
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={styles.addDescriptionButton}
						onPress={handleSave}
					>
						<Text style={styles.addDescriptionText}>
							{t('menuCreation.addDescription')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlayContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		zIndex: 9999,
	},
	dishModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 400,
		zIndex: 10000,
	},
	closeButton: {
		alignSelf: 'flex-end',
		marginBottom: 10,
	},
	dishModalTitle: {
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	dishModalTitleName: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	dishDescriptionInput: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlignVertical: 'top',
		marginBottom: 20,
		minHeight: 100,
	},
	dietaryLabel: {
		fontSize: 12,
		fontFamily: fonts.regular,
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
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	dietaryTextSelected: {
		color: colors.quaternary,
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
		fontFamily: fonts.semiBold,
	},
});
