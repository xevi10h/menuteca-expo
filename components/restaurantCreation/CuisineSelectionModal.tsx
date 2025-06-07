import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderModal from './HeaderModal';

interface CuisineSelectionModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (cuisine: string | null) => void;
	selectedCuisine?: string;
}

export default function CuisineSelectionModal({
	visible,
	onClose,
	onSave,
	selectedCuisine,
}: CuisineSelectionModalProps) {
	const { t } = useTranslation();
	const language = useUserStore((state) => state.user.language);
	const [tempSelected, setTempSelected] = useState<string | undefined>(
		selectedCuisine,
	);

	const handleToggleCuisine = (cuisineId: string) => {
		setTempSelected((prev) => (prev === cuisineId ? undefined : cuisineId));
	};

	const handleSave = () => {
		onSave(tempSelected || null);
		onClose();
	};

	useEffect(() => {
		if (visible) {
			setTempSelected(selectedCuisine);
		}
	}, [visible, selectedCuisine]);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<HeaderModal
					title={t('registerRestaurant.foodType')}
					handleClose={onClose}
					handleSave={handleSave}
				/>
				<View style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.cuisineTypesSubtitle')}
					</Text>
					<View style={styles.cuisineGrid}>
						{allCuisines.map((cuisine) => (
							<TouchableOpacity
								key={cuisine.id}
								style={[
									styles.cuisineButton,
									tempSelected === cuisine.id && styles.cuisineButtonSelected,
								]}
								onPress={() => handleToggleCuisine(cuisine.id)}
							>
								<Text
									style={[
										styles.cuisineButtonText,
										tempSelected === cuisine.id &&
											styles.cuisineButtonTextSelected,
									]}
								>
									{cuisine.name[language]}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
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
		paddingTop: 20,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 20,
	},
	cuisineGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 10,
	},
	cuisineButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: 12,
	},
	cuisineButtonSelected: {
		backgroundColor: colors.primary,
	},
	cuisineButtonText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	cuisineButtonTextSelected: {
		color: colors.quaternary,
	},
});
