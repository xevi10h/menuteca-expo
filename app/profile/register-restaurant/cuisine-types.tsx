import { colors } from '@/assets/styles/colors';
import LoadingScreen from '@/components/LoadingScreen';
import { useTranslation } from '@/hooks/useTranslation';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
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

	// Zustand stores
	const { cuisines, isLoading, error, fetchCuisines } = useCuisineStore();

	const { setRegisterRestaurantCuisineId } = useRegisterRestaurantStore();

	// Local state
	const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
	const [isNextDisabled, setIsNextDisabled] = useState(true);

	// Load cuisines on component mount
	useEffect(() => {
		const loadCuisines = async () => {
			try {
				await fetchCuisines();
			} catch (err) {
				console.error('Error loading cuisines:', err);
				Alert.alert(
					t('validation.error'),
					t('registerRestaurant.errorLoadingCuisines') ||
						'Error loading cuisines. Please try again.',
					[
						{
							text: t('general.retry'),
							onPress: () => loadCuisines(),
						},
						{
							text: t('general.cancel'),
							style: 'cancel',
							onPress: () => router.back(),
						},
					],
				);
			}
		};

		loadCuisines();
	}, []);

	// Update next button state when cuisine selection changes
	useEffect(() => {
		setIsNextDisabled(!selectedCuisine);
	}, [selectedCuisine]);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		if (selectedCuisine) {
			setRegisterRestaurantCuisineId(selectedCuisine);
			router.push('/profile/register-restaurant/setup/edit');
		}
	};

	const handleSkip = () => {
		router.push('/profile/register-restaurant/setup/edit');
	};

	const handleCuisineToggle = (cuisineId: string) => {
		setSelectedCuisine((prev) => (prev === cuisineId ? null : cuisineId));
	};

	const handleRetry = async () => {
		try {
			await fetchCuisines();
		} catch (err) {
			console.error('Error retrying cuisines fetch:', err);
		}
	};

	// Show loading screen while fetching
	if (isLoading && cuisines.length === 0) {
		return <LoadingScreen />;
	}

	// Show error state with retry option
	if (error && cuisines.length === 0) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={24} color={colors.secondary} />
					</TouchableOpacity>
				</View>

				<View style={styles.errorContainer}>
					<Ionicons name="warning-outline" size={64} color={colors.secondary} />
					<Text style={styles.errorTitle}>
						{t('registerRestaurant.errorLoadingCuisines') ||
							'Error loading cuisines'}
					</Text>
					<Text style={styles.errorMessage}>{error}</Text>

					<View style={styles.errorActions}>
						<TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
							<Text style={styles.retryButtonText}>
								{t('general.retry') || 'Retry'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
							<Text style={styles.skipButtonText}>
								{t('registerRestaurant.configureLater') || 'Configure later'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
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

				{cuisines.length > 0 ? (
					<View style={styles.cuisineGrid}>
						{cuisines.map((cuisine) => (
							<TouchableOpacity
								key={cuisine.id}
								style={[
									styles.cuisineButton,
									selectedCuisine === cuisine.id &&
										styles.cuisineButtonSelected,
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
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateText}>
							{t('registerRestaurant.noCuisinesAvailable') ||
								'No cuisines available'}
						</Text>
					</View>
				)}

				<TouchableOpacity onPress={handleSkip}>
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
		width: '100%',
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
	emptyState: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	emptyStateText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.secondary,
		textAlign: 'center',
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
	// Error styles
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	errorTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.secondary,
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 10,
	},
	errorMessage: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.secondary,
		textAlign: 'center',
		marginBottom: 30,
		opacity: 0.8,
	},
	errorActions: {
		gap: 15,
		alignItems: 'center',
	},
	retryButton: {
		backgroundColor: colors.secondary,
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 25,
	},
	retryButtonText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	skipButton: {
		paddingHorizontal: 20,
		paddingVertical: 8,
	},
});
