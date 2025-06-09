import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MenuValidationIndicatorProps {
	validation: {
		isValid: boolean;
		errors: {
			hasName: boolean;
			hasValidPrice: boolean;
			hasFirstCourse: boolean;
			hasSecondCourse: boolean;
		};
	};
}

export default function MenuValidationIndicator({
	validation,
}: MenuValidationIndicatorProps) {
	const { t } = useTranslation();

	if (validation.isValid) {
		return (
			<View style={styles.validContainer}>
				<Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
				<Text style={styles.validText}>
					{t('menuCreation.validation.complete')}
				</Text>
			</View>
		);
	}

	const errorCount = Object.values(validation.errors).filter(Boolean).length;

	return (
		<View style={styles.invalidContainer}>
			<Ionicons name="alert-circle" size={16} color="#D32F2F" />
			<Text style={styles.invalidText}>
				{t('menuCreation.validation.incompleteFields', { count: errorCount })}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	validContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E8F5E8',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		marginVertical: 10,
		gap: 8,
	},
	validText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: '#4CAF50',
	},
	invalidContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFE5E5',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		marginVertical: 10,
		gap: 8,
	},
	invalidText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: '#D32F2F',
	},
});
