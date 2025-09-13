import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
	Modal,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { ModalWrapper } from './ModalWrapper';
import { formatTimeFromDate } from './filterUtils';

interface ScheduleFilterModalProps {
	visible: boolean;
	startTime: Date;
	endTime: Date;
	activeTimePicker: 'start' | 'end' | null;
	onStartTimePress: () => void;
	onEndTimePress: () => void;
	onTimeChange: (event: any, selectedDate?: Date) => void;
	onConfirmTime: () => void;
	onApply: () => void;
	onClose: () => void;
}

export default function ScheduleFilterModal({
	visible,
	startTime,
	endTime,
	activeTimePicker,
	onStartTimePress,
	onEndTimePress,
	onTimeChange,
	onConfirmTime,
	onApply,
	onClose,
}: ScheduleFilterModalProps) {
	const { t } = useTranslation();

	const content = (
		<>
			<Text style={styles.modalTitle}>{t('filters.schedule')}</Text>

			<View style={styles.timeInputContainer}>
				<View style={styles.timeInputWrapper}>
					<Text style={styles.inputLabel}>{t('filters.from')}</Text>
					<TouchableOpacity
						style={styles.timePickerButton}
						onPress={onStartTimePress}
					>
						<Text style={styles.timePickerText}>
							{formatTimeFromDate(startTime)}
						</Text>
						<Ionicons name="time-outline" size={16} color={colors.primary} />
					</TouchableOpacity>
				</View>

				<Text style={styles.timeSeparator}>-</Text>

				<View style={styles.timeInputWrapper}>
					<Text style={styles.inputLabel}>{t('filters.to')}</Text>
					<TouchableOpacity
						style={styles.timePickerButton}
						onPress={onEndTimePress}
					>
						<Text style={styles.timePickerText}>
							{formatTimeFromDate(endTime)}
						</Text>
						<Ionicons name="time-outline" size={16} color={colors.primary} />
					</TouchableOpacity>
				</View>
			</View>

			{/* Single Time Picker que cambia según activeTimePicker */}
			{activeTimePicker && (
				<View style={styles.timePickerContainer}>
					<Text style={styles.timePickerLabel}>
						{activeTimePicker === 'start' ? t('filters.from') : t('filters.to')}
					</Text>
					<DateTimePicker
						value={activeTimePicker === 'start' ? startTime : endTime}
						mode="time"
						is24Hour={true}
						display={Platform.OS === 'ios' ? 'spinner' : 'default'}
						onChange={onTimeChange}
						style={styles.timePicker}
					/>
					{Platform.OS === 'ios' && (
						<TouchableOpacity
							style={styles.timePickerConfirm}
							onPress={onConfirmTime}
						>
							<Text style={styles.timePickerConfirmText}>
								{t('general.ok')}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

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
			<ModalWrapper onClose={onClose}>{content}</ModalWrapper>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	timeInputContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	timeInputWrapper: {
		flex: 1,
		alignItems: 'center',
	},
	inputLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 8,
	},
	timePickerButton: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 80,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	timePickerText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
	},
	timePickerContainer: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		padding: 10,
		marginVertical: 10,
		alignItems: 'center',
	},
	timePickerLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	timePicker: {
		width: 200,
		height: 100,
	},
	timePickerConfirm: {
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 6,
		marginTop: 10,
	},
	timePickerConfirmText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	timeSeparator: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
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
		fontFamily: 'Manrope',
		fontWeight: '500',
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
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
		textAlign: 'center',
	},
});
