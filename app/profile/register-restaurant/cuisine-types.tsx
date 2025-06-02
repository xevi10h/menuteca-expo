import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CUISINE_TYPES = [
	'mediterranean',
	'japanese',
	'italian',
	'american',
	'hauteCuisine',
	'asian',
	'mexican',
	'vegetarian',
	'vegan',
	'traditional',
	'glutenFree',
	'homemade',
];

export default function CuisineTypesScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		// Aquí podrías guardar los tipos de cocina en el contexto/estado global
		router.push('/profile/register-restaurant/setup');
	};

	const handleCuisineToggle = (cuisine: string) => {
		setSelectedCuisines((prev) =>
			prev.includes(cuisine)
				? prev.filter((c) => c !== cuisine)
				: prev.length < 3
				? [...prev, cuisine]
				: prev,
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.secondary} />
				</TouchableOpacity>
			</View>

			<View style={styles.iconContainer}>
				<Image
					source={require('@/assets/images/background_cutlery.png')}
					style={styles.backgroundIcon}
					resizeMode="contain"
				/>
			</View>

			<View style={styles.content}>
				<Image
					source={require('@/assets/images/logo_small_secondary.png')}
					style={{ width: 36, height: 29, marginBottom: 5 }}
					resizeMode="contain"
				/>

				<View style={styles.questionContainer}>
					<Text style={styles.question}>
						{t('registerRestaurant.cuisineTypes')}
					</Text>
				</View>

				<View style={styles.labelContainer}>
					<Text style={styles.label}>
						{t('registerRestaurant.cuisineTypesSubtitle')}
					</Text>
				</View>

				<View style={styles.cuisineGrid}>
					{CUISINE_TYPES.map((cuisine) => (
						<TouchableOpacity
							key={cuisine}
							style={[
								styles.cuisineButton,
								selectedCuisines.includes(cuisine) &&
									styles.cuisineButtonSelected,
							]}
							onPress={() => handleCuisineToggle(cuisine)}
						>
							<Text
								style={[
									styles.cuisineButtonText,
									selectedCuisines.includes(cuisine) &&
										styles.cuisineButtonTextSelected,
								]}
							>
								{t(`registerRestaurant.cuisineOptions.${cuisine}`)}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<TouchableOpacity onPress={handleNext}>
					<Text style={styles.skipButtonText}>
						{t('registerRestaurant.configureLater')}
					</Text>
				</TouchableOpacity>
			</View>
			<TouchableOpacity
				style={[styles.nextButton, { bottom: insets.bottom + 40 }]}
				onPress={handleNext}
			>
				<Text style={styles.nextButtonText}>
					{t('registerRestaurant.stepIndicator.finish')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary,
	},
	header: {
		height: 60,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		position: 'absolute',
		top: height * 0.35,
		alignItems: 'center',
		paddingHorizontal: 40,
		justifyContent: 'center',
		marginBottom: 100,
	},
	iconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		width: '100%',
	},
	backgroundIcon: {
		width: width * 0.7,
	},
	questionContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 40,
	},
	question: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.secondary,
		textAlign: 'center',
	},
	labelContainer: {
		width: '100%',
		alignItems: 'flex-start',
		marginBottom: 20,
	},
	label: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.secondary,
	},
	cuisineGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 40,
		maxWidth: '100%',
	},
	cuisineButton: {
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: 'transparent',
		borderWidth: 0.5,
		borderColor: colors.secondary,
		borderRadius: 12,
	},
	cuisineButtonSelected: {
		backgroundColor: colors.secondary,
	},
	cuisineButtonText: {
		color: colors.secondary,
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	cuisineButtonTextSelected: {
		color: colors.primary,
	},
	skipButtonText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	nextButton: {
		position: 'absolute',
		right: 40,
	},
	nextButtonText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textAlign: 'center',
	},
});
