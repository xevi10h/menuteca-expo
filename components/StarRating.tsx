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

	// Función para crear el path de una estrella SVG
	const createStarPath = (size: number) => {
		const centerX = size / 2;
		const centerY = size / 2;
		const outerRadius = size * 0.4;
		const innerRadius = size * 0.15;

		let path = '';
		const angleStep = Math.PI / 5;

		for (let i = 0; i < 10; i++) {
			const angle = i * angleStep - Math.PI / 2;
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const x = centerX + Math.cos(angle) * radius;
			const y = centerY + Math.sin(angle) * radius;

			if (i === 0) {
				path += `M ${x} ${y}`;
			} else {
				path += ` L ${x} ${y}`;
			}
		}
		path += ' Z';
		return path;
	};

	const renderPreciseStar = (index: number) => {
		const starValue = index + 1;

		if (normalizedRating >= starValue) {
			// Estrella completamente llena
			return (
				<Ionicons
					key={index}
					name="star"
					size={size}
					color={color}
					style={{ marginHorizontal: 1 }}
				/>
			);
		} else if (normalizedRating > starValue - 1) {
			// Estrella parcialmente llena
			const fillPercentage = normalizedRating - (starValue - 1);

			if (fillPercentage >= 0.7) {
				return (
					<Ionicons
						key={index}
						name="star"
						size={size}
						color={color}
						style={{ marginHorizontal: 1 }}
					/>
				);
			} else if (fillPercentage >= 0.3) {
				return (
					<Ionicons
						key={index}
						name="star-half"
						size={size}
						color={color}
						style={{ marginHorizontal: 1 }}
					/>
				);
			} else {
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
		} else {
			// Estrella vacía
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

	// Fallback usando Ionicons para casos donde SVG no esté disponible
	const renderIoniconStar = (index: number) => {
		const starValue = index + 1;

		if (normalizedRating >= starValue) {
			// Estrella completa
			return (
				<Ionicons
					key={index}
					name="star"
					size={size}
					color={color}
					style={{ marginHorizontal: 1 }}
				/>
			);
		} else if (
			normalizedRating > starValue - 1 &&
			normalizedRating < starValue
		) {
			// Determinar qué tipo de estrella mostrar basado en decimales
			const fillPercentage = normalizedRating - (starValue - 1);

			if (fillPercentage >= 0.1 && fillPercentage <= 0.2) {
				// 10-20% -> estrella muy poco llena (outline)
				return (
					<Ionicons
						key={index}
						name="star-outline"
						size={size}
						color={emptyColor}
						style={{ marginHorizontal: 1 }}
					/>
				);
			} else if (fillPercentage >= 0.3 && fillPercentage <= 0.7) {
				// 30-70% -> media estrella
				return (
					<Ionicons
						key={index}
						name="star-half"
						size={size}
						color={color}
						style={{ marginHorizontal: 1 }}
					/>
				);
			} else if (fillPercentage >= 0.8) {
				// 80%+ -> estrella casi completa
				return (
					<Ionicons
						key={index}
						name="star"
						size={size}
						color={color}
						style={{ marginHorizontal: 1 }}
					/>
				);
			} else {
				// Menos del 30% -> estrella vacía
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
		} else {
			// Estrella vacía
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

	// Usar Ionicons directamente para mejor compatibilidad
	const useSVG = false;

	return (
		<View style={styles.container}>
			{Array.from({ length: maxStars }, (_, index) =>
				useSVG ? renderPreciseStar(index) : renderIoniconStar(index),
			)}
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
});
