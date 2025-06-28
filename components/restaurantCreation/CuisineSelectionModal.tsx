import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderModal from './HeaderModal';

interface CuisineSelectionModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (cuisine: string | null) => void;
}

export default function CuisineSelectionModal({
	visible,
	onClose,
	onSave,
}: CuisineSelectionModalProps) {
	const { t } = useTranslation();
	const selectedCuisineId = useRegisterRestaurantStore(
		(state) => state.registerRestaurant.cuisineId,
	);

	const { cuisines } = useCuisineStore();

	const [tempSelected, setTempSelected] = useState<string | undefined>(
		selectedCuisineId,
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
			setTempSelected(selectedCuisineId);
		}
	}, [visible, selectedCuisineId]);

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
					hasBorderBottom={true}
				/>
				<View style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.cuisine_typesSubtitle')}
					</Text>
					{cuisines.length > 0 && (
						<View style={styles.cuisineGrid}>
							{cuisines.map((cuisine) => (
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
										{cuisine.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},
	loadingText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
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
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},
	emptyText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryButtonText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
});
