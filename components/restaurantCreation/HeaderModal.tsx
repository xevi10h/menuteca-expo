import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderModalProps {
	title: string;
	handleClose: () => void;
	handleSave: () => void;
	saveDisabled?: boolean;
	hasBorderBottom?: boolean;
}

export default function HeaderModal({
	title,
	handleClose,
	handleSave,
	saveDisabled = false,
	hasBorderBottom = false,
}: HeaderModalProps) {
	const { t } = useTranslation();

	return (
		<View
			style={[
				styles.modalHeader,
				hasBorderBottom && {
					borderBottomWidth: 1,
					borderBottomColor: '#E5E5E5',
				},
			]}
		>
			<TouchableOpacity onPress={handleClose} style={styles.leftButton}>
				<Text style={styles.cancelText}>{t('general.cancel')}</Text>
			</TouchableOpacity>

			<View style={styles.titleContainer}>
				<Text style={styles.modalTitle}>{title}</Text>
			</View>

			<TouchableOpacity
				onPress={handleSave}
				disabled={saveDisabled}
				style={styles.rightButton}
			>
				<Text
					style={[styles.saveText, saveDisabled && styles.saveTextDisabled]}
				>
					{t('general.save')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,

		position: 'relative',
	},
	leftButton: {
		flex: 1,
		alignItems: 'flex-start',
	},
	titleContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		alignItems: 'center',
		pointerEvents: 'none',
	},
	rightButton: {
		flex: 1,
		alignItems: 'flex-end',
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
	},
	modalTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	saveTextDisabled: {
		opacity: 0.5,
		color: colors.primaryLight,
	},
});
