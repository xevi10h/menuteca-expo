import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { TAG_ICONS } from './TagsSection';

interface TagsSelectionModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (tags: string[]) => void;
	selectedTags: string[];
}

export default function TagsSelectionModal({
	visible,
	onClose,
	onSave,
	selectedTags,
}: TagsSelectionModalProps) {
	const { t } = useTranslation();
	const [tempSelected, setTempSelected] = useState<string[]>(selectedTags);

	const handleToggleTag = (tagId: string) => {
		setTempSelected((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	};

	const handleSave = () => {
		onSave(tempSelected);
		onClose();
	};

	useEffect(() => {
		if (visible) {
			setTempSelected(selectedTags);
		}
	}, [visible, selectedTags]);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity onPress={onClose}>
						<Text style={styles.cancelText}>{t('general.cancel')}</Text>
					</TouchableOpacity>
					<Text style={styles.modalTitle}>
						{t('registerRestaurant.categories')}
					</Text>
					<TouchableOpacity onPress={handleSave}>
						<Text style={styles.saveText}>{t('general.save')}</Text>
					</TouchableOpacity>
				</View>
				<ScrollView style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.categoriesDescription')}
					</Text>
					<View style={styles.tagsGrid}>
						{Object.values(RestaurantTag).map((tag) => {
							const iconName = TAG_ICONS[tag];
							return (
								<TouchableOpacity
									key={tag}
									style={[
										styles.tagButton,
										tempSelected.includes(tag) && styles.tagButtonSelected,
									]}
									onPress={() => handleToggleTag(tag)}
								>
									<Ionicons
										name={iconName}
										size={16}
										color={
											tempSelected.includes(tag)
												? colors.quaternary
												: colors.primary
										}
										style={{ marginRight: 5 }}
									/>
									<Text
										style={[
											styles.tagButtonText,
											tempSelected.includes(tag) &&
												styles.tagButtonTextSelected,
										]}
									>
										{t(`restaurantTags.${tag}`)}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</ScrollView>
			</View>
		</Modal>
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
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 20,
	},
	tagsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 10,
	},
	tagButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	tagButtonSelected: {
		backgroundColor: colors.primary,
	},
	tagButtonText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	tagButtonTextSelected: {
		color: colors.quaternary,
	},
});
