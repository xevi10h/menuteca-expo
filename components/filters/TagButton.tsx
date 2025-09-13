import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface TagButtonProps {
	tag: RestaurantTag;
	isSelected: boolean;
	onToggle: () => void;
}

export default function TagButton({ tag, isSelected, onToggle }: TagButtonProps) {
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
			onPress={onToggle}
		>
			<Text
				style={[
					styles.tagButtonText,
					isSelected && styles.tagButtonTextSelected,
				]}
			>
				{t(`restaurantTags.${tag}`)}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	tagButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: 'transparent',
	},
	tagButtonSelected: {
		backgroundColor: colors.primary,
	},
	tagButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	tagButtonTextSelected: {
		color: colors.quaternary,
	},
});