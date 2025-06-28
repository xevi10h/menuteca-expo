import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CuisineSelectionSectionProps {
	selectedCuisineId?: string;
	onEditPress: () => void;
	showTitle?: boolean;
}

export default function CuisineSelectionSection({
	selectedCuisineId,
	onEditPress,
	showTitle = false,
}: CuisineSelectionSectionProps) {
	const { t } = useTranslation();

	// Usar Zustand store para obtener cuisine por ID
	const { getCuisineById, fetchCuisines, cuisines } = useCuisineStore();

	// Asegurar que tenemos cuisines cargadas si necesitamos mostrar una
	useEffect(() => {
		if (selectedCuisineId && cuisines.length === 0) {
			fetchCuisines();
		}
	}, [selectedCuisineId, cuisines.length, fetchCuisines]);

	const selectedCuisine = selectedCuisineId
		? getCuisineById(selectedCuisineId)
		: undefined;

	return (
		<View style={styles.foodTypesSection}>
			{showTitle && (
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.foodType')}
					</Text>
					<TouchableOpacity style={styles.editButton} onPress={onEditPress}>
						<Ionicons name="pencil-outline" size={16} color={colors.primary} />
					</TouchableOpacity>
				</View>
			)}
			<Text style={styles.sectionSubtitle}>
				{t('registerRestaurant.cuisine_types')}
			</Text>

			<View style={styles.selectedCuisine}>
				<View style={styles.selectedCuisineTag}>
					<Text style={styles.selectedCuisineText}>
						{selectedCuisine
							? selectedCuisine.name
							: t('registerRestaurant.noCuisinesSelected')}
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	foodTypesSection: {
		marginVertical: 0,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		padding: 5,
	},
	sectionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 10,
	},
	selectedCuisine: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	selectedCuisineTag: {
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
	},
	selectedCuisineText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
});
