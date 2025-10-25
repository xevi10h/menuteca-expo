import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StarRatingProps {
	rating: number;
	size?: number;
	color?: string;
	emptyColor?: string;
	maxStars?: number;
}

export default function StarRating({
	rating,
	size = 16,
	color = colors.primary,
	emptyColor = colors.primaryLight,
	maxStars = 5,
}: StarRatingProps) {
	// Asegurar que el rating esté entre 0 y maxStars
	const normalizedRating = Math.max(0, Math.min(maxStars, rating));

	// Función para renderizar una estrella individual
	const renderStar = (index: number) => {
		const starPosition = index; // 0, 1, 2, 3, 4
		const fillAmount = normalizedRating - starPosition; // Cuánto de esta estrella debe rellenarse

		// SIEMPRE renderizar la estrella con contorno como base
		const baseStar = (
			<Ionicons
				name="star-outline"
				size={size}
				color={emptyColor}
				style={styles.starBase}
			/>
		);

		// Si no hay relleno para esta estrella, solo mostrar el contorno
		if (fillAmount <= 0) {
			return (
				<View key={index} style={styles.starContainer}>
					{baseStar}
				</View>
			);
		}

		// Calcular el porcentaje de relleno (entre 0 y 1)
		const fillPercentage = Math.min(1, fillAmount);

		// Redondear a múltiplos de 10% para mejor visualización
		const roundedPercentage = Math.round(fillPercentage * 10) * 10;

		// Si el porcentaje es muy bajo (menos del 10%), solo mostrar contorno
		if (roundedPercentage <= 5) {
			return (
				<View key={index} style={styles.starContainer}>
					{baseStar}
				</View>
			);
		}

		// Si está casi llena (95% o más), mostrar estrella completa sobre el contorno
		if (roundedPercentage >= 95) {
			return (
				<View key={index} style={styles.starContainer}>
					{baseStar}
					<Ionicons
						name="star"
						size={size}
						color={color}
						style={styles.starFilled}
					/>
				</View>
			);
		}

		// Para porcentajes intermedios, mostrar relleno parcial
		return (
			<View key={index} style={styles.starContainer}>
				{baseStar}
				<View
					style={[
						styles.starFill,
						{
							width: (size * roundedPercentage) / 100,
							height: size,
						},
					]}
				>
					<Ionicons
						name="star"
						size={size}
						color={color}
						style={styles.starFilled}
					/>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			{Array.from({ length: maxStars }, (_, index) => renderStar(index))}
		</View>
	);
}

// Componente adicional para mostrar rating con número
interface StarRatingWithNumberProps extends StarRatingProps {
	showNumber?: boolean;
	numberStyle?: object;
}

export const StarRatingWithNumber: React.FC<StarRatingWithNumberProps> = ({
	rating,
	size = 16,
	color = colors.primary,
	emptyColor = colors.primaryLight,
	maxStars = 5,
	showNumber = true,
	numberStyle = {},
}) => {
	return (
		<View style={styles.containerWithNumber}>
			<StarRating
				rating={rating}
				size={size}
				color={color}
				emptyColor={emptyColor}
				maxStars={maxStars}
			/>
			{showNumber && (
				<Text
					style={[styles.ratingNumber, { fontSize: size * 0.8 }, numberStyle]}
				>
					{rating.toFixed(1)}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	containerWithNumber: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	starContainer: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 1,
	},
	starBase: {
		// Estrella base siempre visible
	},
	ratingNumber: {
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	starFill: {
		position: 'absolute',
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'flex-start',
		top: 0,
		left: 0,
	},
	starFilled: {
		position: 'absolute',
		left: 0,
		top: 0,
	},
});
