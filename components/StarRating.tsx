import { colors } from '@/assets/styles/colors';
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

	// Función para renderizar una estrella individual con precisión de 10%
	const renderStar = (index: number) => {
		const starValue = index + 1;
		const fillPercentage = Math.max(0, Math.min(1, normalizedRating - index));

		// Si está completamente vacía
		if (fillPercentage === 0) {
			return (
				<Ionicons
					key={index}
					name="star-outline"
					size={size}
					color={emptyColor}
					style={{ marginHorizontal: 1 }}
				/>
			);
		}

		// Si está completamente llena
		if (fillPercentage >= 1) {
			return (
				<Ionicons
					key={index}
					name="star"
					size={size}
					color={color}
					style={{ marginHorizontal: 1 }}
				/>
			);
		}

		// Estrella parcialmente llena - con precisión del 10%
		const percentage = Math.round(fillPercentage * 10) * 10; // Redondear a múltiplos de 10%

		// Determinar qué tipo de estrella mostrar basado en el porcentaje
		if (percentage >= 90) {
			// 90-100% -> estrella completa
			return (
				<Ionicons
					key={index}
					name="star"
					size={size}
					color={color}
					style={{ marginHorizontal: 1 }}
				/>
			);
		} else if (percentage >= 10) {
			// 10-80% -> usar estrella con relleno parcial
			return (
				<View
					key={index}
					style={[styles.starContainer, { marginHorizontal: 1 }]}
				>
					{/* Estrella base vacía */}
					<Ionicons
						name="star-outline"
						size={size}
						color={emptyColor}
						style={styles.starBase}
					/>
					{/* Estrella parcialmente llena usando clip */}
					<View
						style={[
							styles.starFill,
							{
								width: `${percentage}%`,
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
		} else {
			// 0-10% -> estrella vacía
			return (
				<Ionicons
					key={index}
					name="star-outline"
					size={size}
					color={emptyColor}
					style={{ marginHorizontal: 1 }}
				/>
			);
		}
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
	ratingNumber: {
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	starContainer: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	starBase: {
		position: 'absolute',
	},
	starFill: {
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	starFilled: {
		position: 'absolute',
		left: 0,
	},
});
