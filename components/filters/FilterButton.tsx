import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FilterButtonProps {
	label: string;
	iconName: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
	isActive?: boolean;
}

export default function FilterButton({
	label,
	iconName,
	onPress,
	isActive = false,
}: FilterButtonProps) {
	return (
		<TouchableOpacity
			style={[styles.filterButton, isActive && styles.filterButtonActive]}
			onPress={onPress}
		>
			<Ionicons
				name={iconName}
				size={14}
				color={isActive ? colors.quaternary : colors.primary}
			/>
			<Text style={[styles.filterText, isActive && styles.filterTextActive]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	filterButton: {
		backgroundColor: colors.secondary,
		opacity: 0.5,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	filterButtonActive: {
		backgroundColor: colors.primary,
		opacity: 1,
	},
	filterText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: fonts.medium,
	},
	filterTextActive: {
		color: colors.quaternary,
	},
});
