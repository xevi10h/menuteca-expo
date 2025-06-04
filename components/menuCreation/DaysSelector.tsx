import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Days } from '@/shared/enums';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DaysSelectorProps {
	selectedDays: string[];
	onToggleDay: (day: string) => void;
}

export default function DaysSelector({
	selectedDays,
	onToggleDay,
}: DaysSelectorProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.daysContainer}>
			{Object.values(Days).map((day) => (
				<TouchableOpacity
					key={day}
					style={[
						styles.dayButton,
						selectedDays.includes(day) && styles.dayButtonSelected,
					]}
					onPress={() => onToggleDay(day)}
				>
					<Text
						style={[
							styles.dayText,
							selectedDays.includes(day) && styles.dayTextSelected,
						]}
					>
						{t(`daysLetter.${day}`)}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	daysContainer: {
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'space-between',
	},
	dayButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.secondary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	dayButtonSelected: {
		backgroundColor: colors.primary,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	dayText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	dayTextSelected: {
		color: colors.quaternary,
	},
});
