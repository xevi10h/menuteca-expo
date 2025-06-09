import GlutenFreeIcon from '@/assets/icons/GlutenFreeIcon';
import SpicyIcon from '@/assets/icons/SpicyIcon';
import VeganIcon from '@/assets/icons/VeganIcon';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import HeaderModal from './HeaderModal';

interface TagsSelectionModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (tags: RestaurantTag[]) => void;
	selectedTags: RestaurantTag[];
}

export const renderTagIcon = (
	tag: RestaurantTag,
	color: string,
	size: number = 12,
) => {
	switch (tag) {
		case RestaurantTag.KOSHER:
			return (
				<MaterialCommunityIcons name="food-kosher" size={size} color={color} />
			);
		case RestaurantTag.HALAL:
			return (
				<MaterialCommunityIcons name="food-halal" size={size} color={color} />
			);
		case RestaurantTag.VEGAN:
			return <VeganIcon width={size} height={size} color={color} />;
		case RestaurantTag.GLUTEN_FREE:
			return <GlutenFreeIcon width={size} height={size} color={color} />;
		case RestaurantTag.SPICY:
			return <SpicyIcon width={size} height={size} color={color} />;
		case RestaurantTag.VEGETARIAN:
			return <Ionicons name="leaf-outline" size={size} color={color} />;
		case RestaurantTag.OUTDOOR_SEATING:
			return <Ionicons name="sunny-outline" size={size} color={color} />;
		case RestaurantTag.WIFI:
			return <Ionicons name="wifi-outline" size={size} color={color} />;
		case RestaurantTag.RESERVATIONS:
			return <Ionicons name="calendar-outline" size={size} color={color} />;
		case RestaurantTag.LIVE_MUSIC:
			return (
				<Ionicons name="musical-notes-outline" size={size} color={color} />
			);
		case RestaurantTag.PET_FRIENDLY:
			return <Ionicons name="paw-outline" size={size} color={color} />;
		case RestaurantTag.AIR_CONDITIONING:
			return <Ionicons name="snow-outline" size={size} color={color} />;
		case RestaurantTag.FAMILY_FRIENDLY:
			return <Ionicons name="people-outline" size={size} color={color} />;
		case RestaurantTag.ROMANTIC:
			return <Ionicons name="heart-outline" size={size} color={color} />;
		case RestaurantTag.BUSINESS_FRIENDLY:
			return <Ionicons name="briefcase-outline" size={size} color={color} />;
		default:
			return <Ionicons name="restaurant-outline" size={size} color={color} />;
	}
};

export default function TagsSelectionModal({
	visible,
	onClose,
	onSave,
	selectedTags,
}: TagsSelectionModalProps) {
	const { t } = useTranslation();
	const [tempSelected, setTempSelected] =
		useState<RestaurantTag[]>(selectedTags);

	const handleToggleTag = (tagId: RestaurantTag) => {
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
				<HeaderModal
					title={t('registerRestaurant.categories')}
					handleClose={onClose}
					handleSave={handleSave}
					hasBorderBottom={true}
				/>
				<ScrollView style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.categoriesDescription')}
					</Text>
					<View style={styles.tagsGrid}>
						{Object.values(RestaurantTag).map((tag) => {
							return (
								<TouchableOpacity
									key={tag}
									style={[
										styles.tagButton,
										tempSelected.includes(tag) && styles.tagButtonSelected,
									]}
									onPress={() => handleToggleTag(tag)}
								>
									{renderTagIcon(
										tag,
										tempSelected.includes(tag)
											? colors.quaternary
											: colors.primary,
										14,
									)}
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
		gap: 5,
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
