import { colors } from '@/assets/styles/colors';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useFilterStore } from '@/zustand/FilterStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export default function CuisineFilter() {
	const { main: filters, setCuisines } = useFilterStore();
	const { cuisines, isLoading, error } = useCuisineStore();

	const selectedCuisines = filters.cuisines || [];

	// Reorder cuisines: selected ones first, then the rest
	const orderedCuisines = useMemo(() => {
		const selected = cuisines.filter((cuisine) =>
			selectedCuisines.includes(cuisine.id),
		);
		const unselected = cuisines.filter(
			(cuisine) => !selectedCuisines.includes(cuisine.id),
		);
		return [...selected, ...unselected];
	}, [selectedCuisines, cuisines]);

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

	// Show loading state
	if (isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.primary} />
					<Text style={styles.loadingText}>Cargando cocinas...</Text>
				</View>
			</View>
		);
	}

	// Show error state
	if (error) {
		return (
			<View style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Error al cargar cocinas</Text>
				</View>
			</View>
		);
	}

	// Show empty state
	if (cuisines.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No hay cocinas disponibles</Text>
				</View>
			</View>
		);
	}

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
									source={{ uri: cuisine.image }}
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
							{/* FIXED: Usar cuisine.name directamente (ya viene traducido del backend) */}
							<Text style={[styles.text, isSelected && styles.textSelected]}>
								{cuisine.name}
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
	loadingContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	loadingText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	errorContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	errorText: {
		color: colors.primaryLight,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	retryButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: colors.primary,
		borderRadius: 8,
	},
	retryText: {
		color: colors.quaternary,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyText: {
		color: colors.primaryLight,
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
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
