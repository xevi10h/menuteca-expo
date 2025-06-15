import { colors } from '@/assets/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

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
	color = '#FFD700',
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
		let fillPercentage = 0;

		if (normalizedRating >= starValue) {
			// Estrella completamente llena
			fillPercentage = 1;
		} else if (normalizedRating > starValue - 1) {
			// Estrella parcialmente llena
			fillPercentage = normalizedRating - (starValue - 1);
		}

		// Redondear a la décima más cercana para mejor precisión visual
		fillPercentage = Math.round(fillPercentage * 10) / 10;

		const starPath = createStarPath(size);
		const gradientId = `star-gradient-${index}-${fillPercentage}`;

		return (
			<View key={index} style={{ marginHorizontal: 1 }}>
				<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					<Defs>
						<LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
							<Stop
								offset={`${fillPercentage * 100}%`}
								stopColor={color}
								stopOpacity="1"
							/>
							<Stop
								offset={`${fillPercentage * 100}%`}
								stopColor={emptyColor}
								stopOpacity="1"
							/>
						</LinearGradient>
					</Defs>
					<Path
						d={starPath}
						fill={`url(#${gradientId})`}
						stroke={fillPercentage > 0 ? color : emptyColor}
						strokeWidth="0.5"
					/>
				</Svg>
			</View>
		);
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

	// Intentar usar SVG primero, fallback a Ionicons
	const useSVG = true; // Puedes cambiar esto a false si prefieres usar Ionicons

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
	color = '#FFD700',
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
