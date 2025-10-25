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

interface DistanceFilterModalProps {
	visible: boolean;
	tempDistance: string;
	onDistanceChange: (value: string) => void;
	onApply: () => void;
	onClose: () => void;
}

export default function DistanceFilterModal({
	visible,
	tempDistance,
	onDistanceChange,
	onApply,
	onClose,
}: DistanceFilterModalProps) {
	const { t } = useTranslation();

	const content = (
		<>
			<Text style={styles.modalTitle}>{t('filters.maxDistance')}</Text>

			<View style={styles.distanceContainer}>
				<TextInput
					style={styles.distanceInput}
					value={tempDistance}
					onChangeText={onDistanceChange}
					keyboardType="numeric"
					placeholder="10"
				/>
				<Text style={styles.distanceLabel}>km</Text>
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
	distanceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 30,
	},
	distanceInput: {
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
	distanceLabel: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
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
