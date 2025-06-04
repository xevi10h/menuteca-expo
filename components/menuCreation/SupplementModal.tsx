import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

interface SupplementModalProps {
	visible: boolean;
	supplementPrice: string;
	onSupplementPriceChange: (price: string) => void;
	onClose: () => void;
	onSave: () => void;
}

export default function SupplementModal({
	visible,
	supplementPrice,
	onSupplementPriceChange,
	onClose,
	onSave,
}: SupplementModalProps) {
	const { t } = useTranslation();

	const handlePriceChange = (text: string) => {
		// Solo permitir números y punto decimal
		const numericValue = text.replace(/[^0-9.]/g, '');
		// Evitar múltiples puntos decimales
		const parts = numericValue.split('.');
		if (parts.length > 2) {
			return;
		}
		onSupplementPriceChange(numericValue);
	};

	return (
		<Modal visible={visible} animationType="fade" transparent>
			<View style={styles.overlayContainer}>
				<View style={styles.supplementModal}>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Ionicons name="close" size={24} color={colors.primary} />
					</TouchableOpacity>

					<Text style={styles.supplementTitle}>
						{t('menuCreation.addSupplement')}
					</Text>

					<View style={styles.priceContainer}>
						<TextInput
							style={styles.supplementInput}
							placeholder={t('menuCreation.supplementPlaceholder')}
							value={supplementPrice}
							onChangeText={handlePriceChange}
							keyboardType="numeric"
						/>
						<View style={styles.euroSymbol}>
							<Text style={styles.euroText}>€</Text>
						</View>
					</View>

					<TouchableOpacity style={styles.addSupplementButton} onPress={onSave}>
						<Text style={styles.addSupplementText}>
							{t('menuCreation.addSupplementButton')}
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
	supplementModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 300,
		zIndex: 10000,
	},
	closeButton: {
		alignSelf: 'flex-end',
		marginBottom: 10,
	},
	supplementTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
		marginBottom: 20,
	},
	supplementInput: {
		flex: 1,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
	},
	euroSymbol: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		backgroundColor: colors.primary,
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
		minWidth: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	euroText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	addSupplementButton: {
		backgroundColor: colors.primary,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	addSupplementText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
});
