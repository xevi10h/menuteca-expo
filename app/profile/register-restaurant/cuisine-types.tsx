import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function cuisine_typesScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
	const [isNextDisabled, setIsNextDisabled] = useState(true);
	const setRegisterRestaurantCuisineId = useRegisterRestaurantStore(
		(state) => state.setRegisterRestaurantCuisineId,
	);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		setRegisterRestaurantCuisineId(selectedCuisine);
		router.push('/profile/register-restaurant/setup/edit');
	};

	const handleCuisineToggle = (cuisine: string) => {
		setSelectedCuisine((prev) => (prev === cuisine ? null : cuisine));
	};

	useEffect(() => {
		if (selectedCuisine) {
			setIsNextDisabled(false);
		} else {
			setIsNextDisabled(true);
		}
	}, [selectedCuisine]);

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
						{t('registerRestaurant.cuisine_types')}
					</Text>
				</View>

				<View style={styles.labelContainer}>
					<Text style={styles.label}>
						{t('registerRestaurant.cuisine_typesSubtitle')}
					</Text>
				</View>

				<View style={styles.cuisineGrid}>
					{allCuisines.map((cuisine) => (
						<TouchableOpacity
							key={cuisine.id}
							style={[
								styles.cuisineButton,
								selectedCuisine === cuisine.id && styles.cuisineButtonSelected,
							]}
							onPress={() => handleCuisineToggle(cuisine.id)}
						>
							<Text
								style={[
									styles.cuisineButtonText,
									selectedCuisine === cuisine.id &&
										styles.cuisineButtonTextSelected,
								]}
							>
								{cuisine.name}
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
				style={[
					styles.nextButton,
					{ bottom: insets.bottom + 40, opacity: isNextDisabled ? 0.5 : 1 },
				]}
				onPress={handleNext}
				disabled={isNextDisabled}
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
		top: height * 0.3,
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
		marginTop: -height * 0.05,
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
