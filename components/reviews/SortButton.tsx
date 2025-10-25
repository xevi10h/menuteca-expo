import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SortButtonProps {
	label: string;
	isActive: boolean;
	onPress: () => void;
	icon?: keyof typeof Ionicons.glyphMap;
}

export default function SortButton({
	label,
	isActive,
	onPress,
	icon,
}: SortButtonProps) {
	return (
		<TouchableOpacity
			style={[styles.sortButton, isActive && styles.sortButtonActive]}
			onPress={onPress}
		>
			{icon && (
				<Ionicons
					name={icon}
					size={14}
					color={isActive ? colors.quaternary : colors.primary}
				/>
			)}
			<Text
				style={[styles.sortButtonText, isActive && styles.sortButtonTextActive]}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	sortButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		marginRight: 10,
	},
	sortButtonActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	sortButtonText: {
		fontSize: 12,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	sortButtonTextActive: {
		color: colors.quaternary,
	},
});
