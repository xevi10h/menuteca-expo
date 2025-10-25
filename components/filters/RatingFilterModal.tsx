import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
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
import { ModalWrapper } from './ModalWrapper';
import { renderStars } from './filterUtils';

interface RatingFilterModalProps {
	visible: boolean;
	tempRating: string;
	isCustomRatingSelected: boolean;
	customRating: string;
	onSelectRating: (rating: string) => void;
	onCustomRatingChange: (value: string) => void;
	onApply: () => void;
	onClose: () => void;
}

export default function RatingFilterModal({
	visible,
	tempRating,
	isCustomRatingSelected,
	customRating,
	onSelectRating,
	onCustomRatingChange,
	onApply,
	onClose,
}: RatingFilterModalProps) {
	const { t } = useTranslation();

	const content = (
		<>
			<Text style={styles.modalTitle}>{t('filters.minimumRating')}</Text>
			<Text style={styles.modalSubtitle}>
				Selecciona valoración mínima para restaurantes
			</Text>

			<View style={styles.ratingOptionsContainer}>
				{/* Opciones predefinidas en una fila */}
				<View style={styles.predefinedOptionsRow}>
					<TouchableOpacity
						style={[
							styles.compactRatingOption,
							tempRating === '4.5' && styles.compactRatingOptionSelected,
						]}
						onPress={() => onSelectRating('4.5')}
					>
						<View style={styles.compactStarsContainer}>{renderStars(4.5)}</View>
						<Text style={styles.compactRatingText}>4.5+</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.compactRatingOption,
							tempRating === '4' && styles.compactRatingOptionSelected,
						]}
						onPress={() => onSelectRating('4')}
					>
						<View style={styles.compactStarsContainer}>{renderStars(4)}</View>
						<Text style={styles.compactRatingText}>4+</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.compactRatingOption,
							tempRating === '3.5' && styles.compactRatingOptionSelected,
						]}
						onPress={() => onSelectRating('3.5')}
					>
						<View style={styles.compactStarsContainer}>{renderStars(3.5)}</View>
						<Text style={styles.compactRatingText}>3.5+</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.compactRatingOption,
							tempRating === '3' && styles.compactRatingOptionSelected,
						]}
						onPress={() => onSelectRating('3')}
					>
						<View style={styles.compactStarsContainer}>{renderStars(3)}</View>
						<Text style={styles.compactRatingText}>3+</Text>
					</TouchableOpacity>
				</View>

				{/* Valoración personalizada */}
				<TouchableOpacity
					style={[
						styles.customRatingFullOption,
						isCustomRatingSelected && styles.customRatingFullOptionSelected,
					]}
					onPress={() => onSelectRating('custom')}
				>
					<View style={styles.customRatingHeader}>
						<Ionicons name="create-outline" size={18} color={colors.primary} />
						<Text style={styles.customRatingTitle}>
							Valoración personalizada
						</Text>
					</View>

					{isCustomRatingSelected && (
						<View style={styles.customInputContainer}>
							<TextInput
								style={styles.customRatingInput}
								value={customRating}
								onChangeText={(text) => {
									// Permitir números decimales del 0 al 5 con punto o coma
									const regex = /^([0-4]([.,][0-9]*)?|5([.,]0*)?|[.,])$/;
									if (regex.test(text) || text === '') {
										// Normalizar coma a punto para procesamiento interno
										const normalizedText = text.replace(',', '.');
										onCustomRatingChange(normalizedText);
									}
								}}
								keyboardType="numeric"
								placeholder="4.7"
								maxLength={3}
							/>
							<Ionicons name="star" size={14} color={colors.primary} />
						</View>
					)}
				</TouchableOpacity>
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
			<ModalWrapper onClose={onClose} hasNumericInputs={isCustomRatingSelected}>
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
	modalSubtitle: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 15,
	},
	ratingOptionsContainer: {
		marginBottom: 20,
	},
	predefinedOptionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		gap: 8,
	},
	compactRatingOption: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 10,
		padding: 12,
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	compactRatingOptionSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
	},
	compactStarsContainer: {
		flexDirection: 'row',
		gap: 1,
		marginBottom: 4,
	},
	compactRatingText: {
		fontSize: 12,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	customRatingFullOption: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 12,
		padding: 16,
		flexDirection: 'row',
		gap: 12,
		alignItems: 'center',
	},
	customRatingFullOptionSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
	},
	customRatingHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	customRatingTitle: {
		fontSize: 14,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	customInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},
	customRatingInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 8,
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlign: 'center',
		minWidth: 60,
		backgroundColor: colors.quaternary,
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
