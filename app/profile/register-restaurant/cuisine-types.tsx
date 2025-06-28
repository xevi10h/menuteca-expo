import { RestaurantService } from '@/api/services';
import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import { useTranslation } from '@/hooks/useTranslation';
import { Cuisine } from '@/shared/types';
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

export default function CuisineTypesScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [cuisines, setCuisines] = useState<Cuisine[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
	const [isNextDisabled, setIsNextDisabled] = useState(true);
	const setRegisterRestaurantCuisineId = useRegisterRestaurantStore(
		(state) => state.setRegisterRestaurantCuisineId,
	);

	// Load cuisines data
	useEffect(() => {
		const loadCuisines = async () => {
			try {
				setLoading(true);
				// Since there's no specific cuisine endpoint in the services,
				// we'll use a general approach or create a mock endpoint
				// For now, we'll simulate getting cuisines from a restaurant query
				const response = await RestaurantService.getAllRestaurants({
					page: 1,
					limit: 1,
				});

				// In a real implementation, you'd have a dedicated cuisine endpoint
				// For now, we'll use a fallback with common cuisines
				const mockCuisines: Cuisine[] = [
					{ id: '1', name: 'Italian', description: 'Italian cuisine' },
					{
						id: '2',
						name: 'Mediterranean',
						description: 'Mediterranean cuisine',
					},
					{ id: '3', name: 'Spanish', description: 'Spanish cuisine' },
					{ id: '4', name: 'Asian', description: 'Asian cuisine' },
					{ id: '5', name: 'Mexican', description: 'Mexican cuisine' },
					{ id: '6', name: 'French', description: 'French cuisine' },
					{ id: '7', name: 'American', description: 'American cuisine' },
					{ id: '8', name: 'Japanese', description: 'Japanese cuisine' },
					{ id: '9', name: 'Chinese', description: 'Chinese cuisine' },
					{ id: '10', name: 'Indian', description: 'Indian cuisine' },
					{ id: '11', name: 'Thai', description: 'Thai cuisine' },
					{ id: '12', name: 'Greek', description: 'Greek cuisine' },
					{ id: '13', name: 'Turkish', description: 'Turkish cuisine' },
					{ id: '14', name: 'Lebanese', description: 'Lebanese cuisine' },
					{ id: '15', name: 'Moroccan', description: 'Moroccan cuisine' },
					{ id: '16', name: 'Vegetarian', description: 'Vegetarian cuisine' },
					{ id: '17', name: 'Vegan', description: 'Vegan cuisine' },
					{ id: '18', name: 'Fusion', description: 'Fusion cuisine' },
				];

				setCuisines(mockCuisines);
			} catch (error) {
				console.error('Error loading cuisines:', error);
				// Set fallback cuisines in case of error
				const fallbackCuisines: Cuisine[] = [
					{ id: '1', name: 'Italian', description: 'Italian cuisine' },
					{
						id: '2',
						name: 'Mediterranean',
						description: 'Mediterranean cuisine',
					},
					{ id: '3', name: 'Spanish', description: 'Spanish cuisine' },
					{ id: '4', name: 'Asian', description: 'Asian cuisine' },
					{ id: '5', name: 'Mexican', description: 'Mexican cuisine' },
				];
				setCuisines(fallbackCuisines);
			} finally {
				setLoading(false);
			}
		};

		loadCuisines();
	}, []);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		setRegisterRestaurantCuisineId(selectedCuisine);
		router.push('/profile/register-restaurant/setup/edit');
	};

	const handleCuisineToggle = (cuisineId: string) => {
		setSelectedCuisine((prev) => (prev === cuisineId ? null : cuisineId));
	};

	useEffect(() => {
		if (selectedCuisine) {
			setIsNextDisabled(false);
		} else {
			setIsNextDisabled(true);
		}
	}, [selectedCuisine]);

	if (loading) {
		return <LoadingScreen />;
	}

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
					{cuisines.map((cuisine) => (
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
