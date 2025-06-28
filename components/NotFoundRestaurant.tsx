import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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

interface NotFoundRestaurantProps {
	restaurant_id?: string;
}

export default function NotFoundRestaurant({
	restaurant_id,
}: NotFoundRestaurantProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const handleGoBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace('/');
		}
	};

	const handleGoHome = () => {
		router.replace('/');
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header with back button */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{/* Content */}
			<View style={styles.content}>
				{/* Background illustration */}
				<View style={styles.illustrationContainer}>
					<Image
						source={require('@/assets/images/background_cutlery.png')}
						style={styles.backgroundIllustration}
						resizeMode="contain"
					/>
				</View>

				{/* Main content */}
				<View style={styles.mainContent}>
					{/* Logo */}
					<Image
						source={require('@/assets/images/logo_small_primary.png')}
						style={styles.logo}
						resizeMode="contain"
					/>

					{/* Error icon */}
					<View style={styles.errorIconContainer}>
						<Ionicons
							name="restaurant-outline"
							size={80}
							color={colors.primaryLight}
						/>
						<View style={styles.errorBadge}>
							<Ionicons name="close" size={24} color={colors.quaternary} />
						</View>
					</View>

					{/* Error message */}
					<Text style={styles.title}>{t('notFound.restaurant.title')}</Text>

					<Text style={styles.description}>
						{t('notFound.restaurant.description')}
					</Text>

					{/* Restaurant ID if provided */}
					{restaurant_id && (
						<View style={styles.idContainer}>
							<Text style={styles.idLabel}>ID:</Text>
							<Text style={styles.idValue}>{restaurant_id}</Text>
						</View>
					)}

					{/* Action buttons */}
					<View style={styles.buttonsContainer}>
						<TouchableOpacity
							style={styles.primaryButton}
							onPress={handleGoHome}
						>
							<Ionicons
								name="home-outline"
								size={20}
								color={colors.quaternary}
							/>
							<Text style={styles.primaryButtonText}>
								{t('notFound.restaurant.goHome')}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButton}
							onPress={handleGoBack}
						>
							<Text style={styles.secondaryButtonText}>
								{t('notFound.restaurant.goBack')}
							</Text>
						</TouchableOpacity>
					</View>

					{/* Help text */}
					<Text style={styles.helpText}>
						{t('notFound.restaurant.helpText')}
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
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
		position: 'relative',
	},
	illustrationContainer: {
		position: 'absolute',
		top: height * 0.1,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 0,
	},
	backgroundIllustration: {
		width: width * 0.6,
		opacity: 0.1,
	},
	mainContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 40,
		zIndex: 1,
	},
	logo: {
		width: 36,
		height: 29,
		marginBottom: 40,
	},
	errorIconContainer: {
		position: 'relative',
		marginBottom: 30,
	},
	errorBadge: {
		position: 'absolute',
		top: -5,
		right: -5,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#D32F2F',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: colors.secondary,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 15,
	},
	description: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 20,
	},
	idContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		marginBottom: 30,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	idLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primaryLight,
		marginRight: 6,
	},
	idValue: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	buttonsContainer: {
		width: '100%',
		gap: 15,
		marginBottom: 30,
	},
	primaryButton: {
		backgroundColor: colors.primary,
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 25,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	primaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	helpText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
		fontStyle: 'italic',
	},
});
