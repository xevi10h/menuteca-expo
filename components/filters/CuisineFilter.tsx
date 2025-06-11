// components/filters/CuisineFilter.tsx
import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useFilterStore } from '@/zustand/FilterStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export default function CuisineFilter() {
	const language = useUserStore((state) => state.user.language);
	const { main: filters, setCuisines } = useFilterStore();
	const selectedCuisines = filters.cuisines || [];

	// Reorder cuisines: selected ones first, then the rest
	const orderedCuisines = useMemo(() => {
		const selected = allCuisines.filter((cuisine) =>
			selectedCuisines.includes(cuisine.id),
		);
		const unselected = allCuisines.filter(
			(cuisine) => !selectedCuisines.includes(cuisine.id),
		);
		return [...selected, ...unselected];
	}, [selectedCuisines]);

	const toggleCuisine = (cuisineId: string) => {
		const isSelected = selectedCuisines.includes(cuisineId);

		if (isSelected) {
			// Remove cuisine
			const newSelection = selectedCuisines.filter((id) => id !== cuisineId);
			setCuisines(newSelection.length > 0 ? newSelection : null);
		} else {
			// Add cuisine
			setCuisines([...selectedCuisines, cuisineId]);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{orderedCuisines.map((cuisine) => {
					const isSelected = selectedCuisines.includes(cuisine.id);
					return (
						<TouchableOpacity
							key={cuisine.id}
							style={styles.cuisineItem}
							onPress={() => toggleCuisine(cuisine.id)}
						>
							<View style={styles.imageContainer}>
								<Image
									src={cuisine.image}
									style={[styles.image, isSelected && styles.imageSelected]}
								/>
								{isSelected && (
									<>
										<View style={styles.selectedOverlay} />
										<TouchableOpacity
											style={styles.removeButton}
											onPress={(e) => {
												e.stopPropagation();
												toggleCuisine(cuisine.id);
											}}
										>
											<Ionicons
												name="close"
												size={12}
												color={colors.quaternary}
											/>
										</TouchableOpacity>
									</>
								)}
							</View>
							<Text style={[styles.text, isSelected && styles.textSelected]}>
								{cuisine.name[language]}
							</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		height: 85,
		width: '100%',
		paddingTop: 10,
	},
	scrollView: {
		paddingHorizontal: 10,
	},
	clearAllButton: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 20,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		height: 48,
		flexDirection: 'row',
		gap: 4,
	},
	clearAllText: {
		color: colors.primary,
		fontSize: 10,
		fontWeight: '600',
		fontFamily: 'Manrope',
	},
	cuisineItem: {
		alignItems: 'center',
		marginRight: 20,
		gap: 5,
	},
	imageContainer: {
		marginTop: 4,
	},
	image: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	imageSelected: {
		borderWidth: 3,
		borderColor: colors.primary,
	},
	selectedOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.primary,
		opacity: 0.3,
		borderRadius: 24,
	},
	removeButton: {
		position: 'absolute',
		top: -4,
		right: -4,
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: colors.secondary,
	},
	text: {
		color: colors.tertiary,
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 10,
		fontWeight: '500',
		fontFamily: 'Manrope',
	},
	textSelected: {
		color: colors.primary,
		fontWeight: '700',
	},
});
