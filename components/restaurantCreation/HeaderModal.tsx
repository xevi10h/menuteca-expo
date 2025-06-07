import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderModalProps {
	title: string;
	handleClose: () => void;
	handleSave: () => void;
}
export default function HeaderModal({
	title,
	handleClose,
	handleSave,
}: HeaderModalProps) {
	const { t } = useTranslation();
	return (
		<View style={styles.modalHeader}>
			<TouchableOpacity onPress={handleClose}>
				<Text style={styles.cancelText}>{t('general.cancel')}</Text>
			</TouchableOpacity>
			<View>
				<Text style={styles.modalTitle}>{title}</Text>
			</View>
			<TouchableOpacity onPress={handleSave}>
				<Text style={styles.saveText}>{t('general.save')}</Text>
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
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
		gap: 10,
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		textAlign: 'left',
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
		textAlign: 'right',
	},
});
