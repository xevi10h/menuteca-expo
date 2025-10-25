import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import {
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { ModalWrapper } from './ModalWrapper';

interface PriceFilterModalProps {
	visible: boolean;
	tempPriceMin: string;
	tempPriceMax: string;
	onMinChange: (value: string) => void;
	onMaxChange: (value: string) => void;
	onApply: () => void;
	onClose: () => void;
}

export default function PriceFilterModal({
	visible,
	tempPriceMin,
	tempPriceMax,
	onMinChange,
	onMaxChange,
	onApply,
	onClose,
}: PriceFilterModalProps) {
	const { t } = useTranslation();

	const content = (
		<>
			<Text style={styles.modalTitle}>{t('filters.priceRange')}</Text>

			<View style={styles.priceInputContainer}>
				<View style={styles.priceInputWrapper}>
					<Text style={styles.inputLabel}>{t('filters.from')}</Text>
					<TextInput
						style={styles.priceInput}
						value={tempPriceMin}
						onChangeText={onMinChange}
						keyboardType="numeric"
						placeholder="0"
					/>
					<Text style={styles.currencyLabel}>€</Text>
				</View>

				<Text style={styles.priceSeparator}>-</Text>

				<View style={styles.priceInputWrapper}>
					<Text style={styles.inputLabel}>{t('filters.to')}</Text>
					<TextInput
						style={styles.priceInput}
						value={tempPriceMax}
						onChangeText={onMaxChange}
						keyboardType="numeric"
						placeholder="1000"
					/>
					<Text style={styles.currencyLabel}>€</Text>
				</View>
			</View>

			<View style={styles.modalButtons}>
				<TouchableOpacity style={styles.cancelButton} onPress={onClose}>
					<Text style={styles.cancelButtonText}>{t('general.cancel')}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.applyButton} onPress={onApply}>
					<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
				</TouchableOpacity>
			</View>
		</>
	);

	return (
		<Modal visible={visible} transparent animationType="fade">
			<ModalWrapper onClose={onClose} hasNumericInputs>
				{content}
			</ModalWrapper>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalTitle: {
		fontSize: 18,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	priceInputContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	priceInputWrapper: {
		flex: 1,
		alignItems: 'center',
	},
	inputLabel: {
		fontSize: 12,
		fontFamily: fonts.medium,
		color: colors.primary,
		marginBottom: 8,
	},
	priceInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlign: 'center',
		minWidth: 80,
	},
	currencyLabel: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
		marginTop: 4,
	},
	priceSeparator: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		marginHorizontal: 10,
		marginBottom: 12,
	},
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 10,
	},
	cancelButton: {
		flex: 1,
		padding: 12,
		backgroundColor: colors.secondary,
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
	applyButton: {
		flex: 1,
		padding: 12,
		backgroundColor: colors.primary,
		borderRadius: 8,
	},
	applyButtonText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.quaternary,
		textAlign: 'center',
	},
});
