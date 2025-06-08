import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { renderTagIcon } from './TagsSelectionModal';

interface TagsSectionProps {
	selectedTags: string[];
	onEditPress: () => void;
	showTitle?: boolean; // Nueva prop para controlar si mostrar el título
}

export default function TagsSection({
	selectedTags,
	onEditPress,
	showTitle = false,
}: TagsSectionProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.tagsSection}>
			{showTitle && (
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>
						{t('registerRestaurant.categories')}
					</Text>
					<TouchableOpacity style={styles.editButton} onPress={onEditPress}>
						<Ionicons name="pencil-outline" size={16} color={colors.primary} />
					</TouchableOpacity>
				</View>
			)}
			<Text style={styles.sectionSubtitle}>
				{t('registerRestaurant.categoriesDescription')}
			</Text>

			<View style={styles.selectedTags}>
				{selectedTags.length > 0 ? (
					selectedTags.map((tagId) => {
						const tagKey = tagId as RestaurantTag;
						return (
							<View key={tagId} style={styles.selectedTag}>
								{renderTagIcon(tagKey, colors.quaternary, 12)}
								<Text style={styles.selectedTagText}>
									{t(`restaurantTags.${tagId}`)}
								</Text>
							</View>
						);
					})
				) : (
					<View style={styles.selectedTag}>
						<Text style={styles.selectedTagText}>
							{t('registerRestaurant.noTagsSelected')}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	tagsSection: {
		marginVertical: 0,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		padding: 5,
	},
	sectionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 10,
	},
	selectedTags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	selectedTag: {
		backgroundColor: colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	selectedTagText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
	},
});
