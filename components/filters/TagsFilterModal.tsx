import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import React from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { ModalWrapper } from './ModalWrapper';
import TagButton from './TagButton';

interface TagsFilterModalProps {
	visible: boolean;
	tempSelectedTags: RestaurantTag[];
	onToggleTag: (tag: RestaurantTag) => void;
	onApply: () => void;
	onClose: () => void;
}

export default function TagsFilterModal({
	visible,
	tempSelectedTags,
	onToggleTag,
	onApply,
	onClose,
}: TagsFilterModalProps) {
	const { t } = useTranslation();

	const content = (
		<>
			<Text style={styles.modalTitle}>{t('filters.categories')}</Text>
			<Text style={styles.modalSubtitle}>
				{t('filters.categoriesSubtitle')}
			</Text>

			<ScrollView style={styles.tagsScrollView}>
				<View style={styles.tagsGrid}>
					{Object.values(RestaurantTag).map((tag) => (
						<TagButton
							key={tag}
							tag={tag}
							isSelected={tempSelectedTags.includes(tag)}
							onToggle={() => onToggleTag(tag)}
						/>
					))}
				</View>
			</ScrollView>

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
		fontFamily: fonts.semiBold,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	modalSubtitle: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 15,
	},
	tagsScrollView: {
		maxHeight: 300,
		marginBottom: 20,
	},
	tagsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
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
		fontFamily: fonts.medium,
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
		fontFamily: fonts.medium,
		color: colors.quaternary,
		textAlign: 'center',
	},
});
