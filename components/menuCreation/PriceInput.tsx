import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface PriceInputProps {
	value: string;
	onChangeText: (text: string) => void;
}

export default function PriceInput({ value, onChangeText }: PriceInputProps) {
	const { t } = useTranslation();

	const handlePriceChange = (text: string) => {
		// Solo permitir números y punto decimal
		const numericValue = text.replace(/[^0-9.]/g, '');
		// Evitar múltiples puntos decimales
		const parts = numericValue.split('.');
		if (parts.length > 2) {
			return;
		}
		onChangeText(numericValue);
	};

	return (
		<View style={styles.priceContainer}>
			<TextInput
				style={styles.priceInput}
				placeholder={t('menuCreation.pricePlaceholder')}
				value={value}
				onChangeText={handlePriceChange}
				keyboardType="numeric"
			/>
			<View style={styles.euroSymbol}>
				<Text style={styles.euroText}>€</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
	},
	priceInput: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 15,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
	},
	euroSymbol: {
		paddingHorizontal: 15,
		paddingVertical: 15,
		backgroundColor: colors.primary,
		borderTopRightRadius: 11,
		borderBottomRightRadius: 11,
		borderLeftWidth: 1,
		borderLeftColor: colors.primary,
		minWidth: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	euroText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
