import GlutenFreeIcon from '@/assets/icons/GlutenFreeIcon';
import SpicyIcon from '@/assets/icons/SpicyIcon';
import VeganIcon from '@/assets/icons/VeganIcon';
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
	Alert,
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

const MAX_TAGS = 5;

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
		setTempSelected((prev) => {
			if (prev.includes(tagId)) {
				// Si ya está seleccionado, lo quitamos
				return prev.filter((id) => id !== tagId);
			} else {
				// Si no está seleccionado, verificamos si podemos añadirlo
				if (prev.length >= MAX_TAGS) {
					// Mostrar alerta si se intenta seleccionar más del máximo
					Alert.alert(
						t('registerRestaurant.validation.tooManyTagsTitle'),
						t('registerRestaurant.validation.tooManyTagsMessage', {
							max: MAX_TAGS,
						}),
						[{ text: t('general.ok'), style: 'default' }],
					);
					return prev;
				}
				// Lo añadimos
				return [...prev, tagId];
			}
		});
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

					{/* Contador de tags seleccionados */}
					<View style={styles.counterContainer}>
						<Text style={styles.counterText}>
							{t('registerRestaurant.tagsSelected', {
								count: tempSelected.length,
								max: MAX_TAGS,
							})}
						</Text>
					</View>

					<View style={styles.tagsGrid}>
						{Object.values(RestaurantTag).map((tag) => {
							const isSelected = tempSelected.includes(tag);
							const isDisabled = !isSelected && tempSelected.length >= MAX_TAGS;

							return (
								<TouchableOpacity
									key={tag}
									style={[
										styles.tagButton,
										isSelected && styles.tagButtonSelected,
										isDisabled && styles.tagButtonDisabled,
									]}
									onPress={() => handleToggleTag(tag)}
									disabled={isDisabled}
								>
									{renderTagIcon(
										tag,
										isSelected
											? colors.quaternary
											: isDisabled
											? colors.primaryLight
											: colors.primary,
										14,
									)}
									<Text
										style={[
											styles.tagButtonText,
											isSelected && styles.tagButtonTextSelected,
											isDisabled && styles.tagButtonTextDisabled,
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
		fontFamily: fonts.medium,
		color: colors.primary,
		marginBottom: 20,
	},
	counterContainer: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		padding: 12,
		marginBottom: 20,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	counterText: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
		textAlign: 'center',
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
	tagButtonDisabled: {
		borderColor: colors.primaryLight,
		opacity: 0.5,
	},
	tagButtonText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: fonts.medium,
	},
	tagButtonTextSelected: {
		color: colors.quaternary,
	},
	tagButtonTextDisabled: {
		color: colors.primaryLight,
	},
});
