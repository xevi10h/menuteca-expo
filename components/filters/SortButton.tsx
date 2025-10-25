// components/filters/SortButton.tsx
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { useFilterStore } from '@/zustand/FilterStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ModalWrapper } from './ModalWrapper';

export default function SortButton() {
	const { t } = useTranslation();
	const { main: filters, setOrderBy, setOrderDirection } = useFilterStore();
	const [showSortModal, setShowSortModal] = useState(false);

	const getSortDisplayText = () => {
		switch (filters.orderBy) {
			case 'price':
				return filters.orderDirection === 'asc'
					? t('filters.priceLowToHigh')
					: t('filters.priceHighToLow');
			case 'distance':
				return t('filters.closest');
			case 'recommended':
			default:
				return t('filters.recommended');
		}
	};

	const handleSortSelection = (
		orderBy: 'recommended' | 'price' | 'distance',
		direction: 'asc' | 'desc',
	) => {
		setOrderBy(orderBy);
		setOrderDirection(direction);
		setShowSortModal(false);
	};

	return (
		<>
			<TouchableOpacity
				style={styles.sortButton}
				onPress={() => setShowSortModal(true)}
			>
				<Ionicons
					name="swap-vertical-outline"
					size={14}
					color={colors.primary}
				/>
				<Text style={styles.sortText}>{getSortDisplayText()}</Text>
			</TouchableOpacity>

			{/* Sort Modal */}
			<Modal visible={showSortModal} transparent animationType="fade">
				<ModalWrapper onClose={() => setShowSortModal(false)}>
					<>
						<Text style={styles.modalTitle}>{t('filters.sortBy')}</Text>

						<View style={styles.sortOptions}>
							<TouchableOpacity
								style={[
									styles.sortOption,
									filters.orderBy === 'recommended' &&
										styles.sortOptionSelected,
								]}
								onPress={() => handleSortSelection('recommended', 'desc')}
							>
								<Text
									style={[
										styles.sortOptionText,
										filters.orderBy === 'recommended' &&
											styles.sortOptionTextSelected,
									]}
								>
									{t('filters.recommended')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.sortOption,
									filters.orderBy === 'price' &&
										filters.orderDirection === 'asc' &&
										styles.sortOptionSelected,
								]}
								onPress={() => handleSortSelection('price', 'asc')}
							>
								<Text
									style={[
										styles.sortOptionText,
										filters.orderBy === 'price' &&
											filters.orderDirection === 'asc' &&
											styles.sortOptionTextSelected,
									]}
								>
									{t('filters.priceLowToHigh')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.sortOption,
									filters.orderBy === 'price' &&
										filters.orderDirection === 'desc' &&
										styles.sortOptionSelected,
								]}
								onPress={() => handleSortSelection('price', 'desc')}
							>
								<Text
									style={[
										styles.sortOptionText,
										filters.orderBy === 'price' &&
											filters.orderDirection === 'desc' &&
											styles.sortOptionTextSelected,
									]}
								>
									{t('filters.priceHighToLow')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.sortOption,
									filters.orderBy === 'distance' && styles.sortOptionSelected,
								]}
								onPress={() => handleSortSelection('distance', 'asc')}
							>
								<Text
									style={[
										styles.sortOptionText,
										filters.orderBy === 'distance' &&
											styles.sortOptionTextSelected,
									]}
								>
									{t('filters.closest')}
								</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							style={styles.cancelButton}
							onPress={() => setShowSortModal(false)}
						>
							<Text style={styles.cancelButtonText}>{t('general.cancel')}</Text>
						</TouchableOpacity>
					</>
				</ModalWrapper>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	sortButton: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	sortText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: fonts.medium,
	},
	modalTitle: {
		fontSize: 18,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	sortOptions: {
		gap: 12,
		marginBottom: 20,
	},
	sortOption: {
		padding: 16,
		backgroundColor: colors.secondary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	sortOptionSelected: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	sortOptionText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		textAlign: 'center',
	},
	sortOptionTextSelected: {
		color: colors.quaternary,
	},
	cancelButton: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	cancelButtonText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		textAlign: 'center',
	},
});
