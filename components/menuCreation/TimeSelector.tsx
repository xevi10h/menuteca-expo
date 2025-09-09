import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMenuTime } from '@/shared/functions/utils';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import {
	Modal,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface TimeSelectorProps {
	start_time: string;
	end_time: string;
	onStartTimeChange: (time: string) => void;
	onEndTimeChange: (time: string) => void;
}

export default function TimeSelector({
	start_time,
	end_time,
	onStartTimeChange,
	onEndTimeChange,
}: TimeSelectorProps) {
	const { t } = useTranslation();
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);
	const [tempTime, setTempTime] = useState(new Date());

	const createTimeFromString = useCallback((timeString: string) => {
		const [hours, minutes] = timeString
			.split(':')
			.map((num) => parseInt(num, 10));
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	}, []);

	const formatTimeFromDate = useCallback((date: Date) => {
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}, []);

	const handleStartTimePress = () => {
		setTempTime(createTimeFromString(start_time));
		setShowStartTimePicker(true);
	};

	const handleEndTimePress = () => {
		setTempTime(createTimeFromString(end_time));
		setShowEndTimePicker(true);
	};

	const handleStartTimeConfirm = () => {
		onStartTimeChange(formatTimeFromDate(tempTime));
		setShowStartTimePicker(false);
	};

	const handleEndTimeConfirm = () => {
		onEndTimeChange(formatTimeFromDate(tempTime));
		setShowEndTimePicker(false);
	};

	const handleTimeChange = (event: any, selectedDate?: Date) => {
		if (selectedDate) {
			setTempTime(selectedDate);
		}
	};

	return (
		<>
			<View style={styles.timeSection}>
				<Text style={styles.timeLabel}>{t('menuCreation.timeFrom')}</Text>

				<TouchableOpacity
					style={styles.timeInputButton}
					onPress={handleStartTimePress}
				>
					<Text style={styles.timeInputText}>{formatMenuTime(start_time)}</Text>
					<Ionicons name="time-outline" size={16} color={colors.primary} />
				</TouchableOpacity>

				<Text style={styles.timeTo}>{t('menuCreation.timeTo')}</Text>

				<TouchableOpacity
					style={styles.timeInputButton}
					onPress={handleEndTimePress}
				>
					<Text style={styles.timeInputText}>{formatMenuTime(end_time)}</Text>
					<Ionicons name="time-outline" size={16} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Start Time Picker Modal */}
			<Modal visible={showStartTimePicker} transparent animationType="fade">
				<View style={styles.overlayContainer}>
					<View style={styles.timePickerModal}>
						<DateTimePicker
							value={tempTime}
							mode="time"
							is24Hour={true}
							display={Platform.OS === 'ios' ? 'spinner' : 'default'}
							onChange={handleTimeChange}
							style={styles.timePicker}
						/>
						<View style={styles.timePickerButtons}>
							<TouchableOpacity
								style={styles.timePickerButton}
								onPress={() => setShowStartTimePicker(false)}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.timePickerButton, styles.confirmButton]}
								onPress={handleStartTimeConfirm}
							>
								<Text style={styles.confirmButtonText}>
									{t('general.save')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* End Time Picker Modal */}
			<Modal visible={showEndTimePicker} transparent animationType="fade">
				<View style={styles.overlayContainer}>
					<View style={styles.timePickerModal}>
						<DateTimePicker
							value={tempTime}
							mode="time"
							is24Hour={true}
							display={Platform.OS === 'ios' ? 'spinner' : 'default'}
							onChange={handleTimeChange}
							style={styles.timePicker}
						/>
						<View style={styles.timePickerButtons}>
							<TouchableOpacity
								style={styles.timePickerButton}
								onPress={() => setShowEndTimePicker(false)}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.timePickerButton, styles.confirmButton]}
								onPress={handleEndTimeConfirm}
							>
								<Text style={styles.confirmButtonText}>
									{t('general.save')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	timeSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 15,
	},
	timeLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
	},
	timeTo: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.tertiary,
	},
	timeInputButton: {
		borderRadius: 12,
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	timeInputText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		marginRight: 8,
		fontWeight: '300',
	},
	overlayContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	timePickerModal: {
		backgroundColor: colors.quaternary,
		borderRadius: 15,
		padding: 20,
		width: '100%',
		maxWidth: 300,
		alignItems: 'center',
	},
	timePickerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 20,
	},
	timePicker: {
		width: 200,
		height: 120,
	},
	timePickerButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 20,
		gap: 10,
	},
	timePickerButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.primary,
	},
	confirmButton: {
		backgroundColor: colors.primary,
	},
	cancelButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	confirmButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
});
