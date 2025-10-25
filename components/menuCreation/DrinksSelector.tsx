import SodaCanIcon from '@/assets/icons/SodaCanIcon';
import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { DrinkType } from '@/shared/enums';
import { DrinkInclusion, createEmptyDrinks, hasDrinks } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DrinksSelectorProps {
	drinks: DrinkInclusion;
	onDrinksChange: (drinks: DrinkInclusion) => void;
}

export default function DrinksSelector({
	drinks,
	onDrinksChange,
}: DrinksSelectorProps) {
	const { t } = useTranslation();

	const toggleDrink = (drinkType: DrinkType) => {
		const newDrinks = { ...drinks };

		switch (drinkType) {
			case DrinkType.WATER:
				newDrinks.water = !newDrinks.water;
				break;
			case DrinkType.WINE:
				newDrinks.wine = !newDrinks.wine;
				break;
			case DrinkType.SOFT_DRINKS:
				newDrinks.soft_drinks = !newDrinks.soft_drinks;
				break;
			case DrinkType.BEER:
				newDrinks.beer = !newDrinks.beer;
				break;
		}

		onDrinksChange(newDrinks);
	};

	// Función para seleccionar todas las bebidas
	const selectAllDrinks = () => {
		onDrinksChange({
			water: true,
			wine: true,
			soft_drinks: true,
			beer: true,
		});
	};

	// Función para deseleccionar todas las bebidas
	const clearAllDrinks = () => {
		onDrinksChange(createEmptyDrinks());
	};

	// Verificar si todas las bebidas están seleccionadas
	const allSelected =
		drinks.water && drinks.wine && drinks.soft_drinks && drinks.beer;

	// Verificar si no hay bebidas seleccionadas
	const noneSelected = !hasDrinks(drinks);

	// Función para obtener el icono de cada bebida
	const getDrinkIcon = (drinkType: DrinkType) => {
		switch (drinkType) {
			case DrinkType.WATER:
				return 'water-outline';
			case DrinkType.WINE:
				return 'wine-outline';
			case DrinkType.BEER:
				return 'beer-outline';
			default:
				return 'wine-outline';
		}
	};

	// Función para verificar si una bebida está seleccionada
	const isDrinkSelected = (drinkType: DrinkType): boolean => {
		switch (drinkType) {
			case DrinkType.WATER:
				return drinks.water;
			case DrinkType.WINE:
				return drinks.wine;
			case DrinkType.SOFT_DRINKS:
				return drinks.soft_drinks;
			case DrinkType.BEER:
				return drinks.beer;
		}
	};

	// Función para renderizar el ícono correcto para cada bebida
	const renderDrinkIcon = (drinkType: DrinkType, isSelected: boolean) => {
		if (drinkType === DrinkType.SOFT_DRINKS) {
			return (
				<SodaCanIcon
					size={16}
					color={isSelected ? colors.quaternary : colors.primary}
				/>
			);
		}

		const iconName = getDrinkIcon(drinkType);
		return (
			<Ionicons
				name={iconName}
				size={16}
				color={isSelected ? colors.quaternary : colors.primary}
			/>
		);
	};

	const renderDrinkButton = (drinkType: DrinkType, labelKey: string) => {
		const isSelected = isDrinkSelected(drinkType);

		return (
			<TouchableOpacity
				key={drinkType}
				style={[styles.drinkButton, isSelected && styles.drinkButtonSelected]}
				onPress={() => toggleDrink(drinkType)}
			>
				{renderDrinkIcon(drinkType, isSelected)}
				<Text
					style={[
						styles.drinkButtonText,
						isSelected && styles.drinkButtonTextSelected,
					]}
				>
					{t(labelKey)}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.sectionLabel}>
					{t('menuCreation.includedDrinks')}
				</Text>

				{/* Botones de acción rápida */}
				<View style={styles.quickActions}>
					<TouchableOpacity
						style={[
							styles.quickActionButton,
							noneSelected && styles.quickActionButtonActive,
						]}
						onPress={clearAllDrinks}
					>
						<Text
							style={[
								styles.quickActionText,
								noneSelected && styles.quickActionTextActive,
							]}
						>
							{t('menuCreation.drinks.none')}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.quickActionButton,
							allSelected && styles.quickActionButtonActive,
						]}
						onPress={selectAllDrinks}
					>
						<Text
							style={[
								styles.quickActionText,
								allSelected && styles.quickActionTextActive,
							]}
						>
							{t('menuCreation.drinks.all')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Opciones individuales de bebidas */}
			<View style={styles.drinksGrid}>
				{renderDrinkButton(DrinkType.WATER, 'menuCreation.drinks.water')}
				{renderDrinkButton(DrinkType.WINE, 'menuCreation.drinks.wine')}
				{renderDrinkButton(
					DrinkType.SOFT_DRINKS,
					'menuCreation.drinks.soft_drinks',
				)}
				{renderDrinkButton(DrinkType.BEER, 'menuCreation.drinks.beer')}
			</View>

			{/* Información adicional */}
			<Text style={styles.helperText}>
				{t('menuCreation.drinks.helperText')}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 15,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	sectionLabel: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
		flex: 1,
	},
	quickActions: {
		flexDirection: 'row',
		gap: 8,
	},
	quickActionButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: 'transparent',
	},
	quickActionButtonActive: {
		backgroundColor: colors.primary,
	},
	quickActionText: {
		fontSize: 11,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	quickActionTextActive: {
		color: colors.quaternary,
	},
	drinksGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginBottom: 10,
	},
	drinkButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: 'transparent',
		gap: 6,
		minWidth: '45%',
		justifyContent: 'center',
	},
	drinkButtonSelected: {
		backgroundColor: colors.primary,
	},
	drinkButtonText: {
		fontSize: 12,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	drinkButtonTextSelected: {
		color: colors.quaternary,
	},
	helperText: {
		fontSize: 11,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
		marginTop: 5,
		fontStyle: 'italic',
	},
});
