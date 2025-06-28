import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function AuthIndexScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const googleAuth = useUserStore((state) => state.googleAuth);
	const isLoading = useUserStore((state) => state.isLoading);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const handleLogin = () => {
		router.push('/auth/login');
	};

	const handleRegister = () => {
		router.push('/auth/register');
	};

	const handleGoogleAuth = async () => {
		setIsGoogleLoading(true);

		try {
			// TODO: Implement Google Auth with proper Google Sign-In
			// This is a placeholder - in real implementation you would use
			// @react-native-google-signin/google-signin or similar

			// Simulate Google auth flow
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Mock Google user data
			const mockGoogleData = {
				google_id: 'mock_google_id_' + Date.now(),
				email: 'user@gmail.com',
				name: 'John Doe',
				photo: 'https://via.placeholder.com/150',
				language: 'es_ES',
			};

			const success = await googleAuth(mockGoogleData);

			if (success) {
				// Navigation will be handled by the authentication state change
				router.replace('/');
			} else {
				Alert.alert(t('auth.googleAuthError'), t('auth.googleAuthFailed'));
			}
		} catch (error) {
			Alert.alert(t('auth.googleAuthError'), t('auth.googleAuthFailed'));
		} finally {
			setIsGoogleLoading(false);
		}
	};

	const handleGuestMode = () => {
		// TODO: Implement guest mode if needed
		Alert.alert(t('auth.guestMode'), t('auth.guestModeMessage'));
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* Logo Section */}
				<View style={styles.logoSection}>
					<Image
						source={require('@/assets/images/logo_large_primary.png')}
						style={styles.logo}
						resizeMode="contain"
					/>
					<Text style={styles.appName}>Menuteca</Text>
					<Text style={styles.tagline}>{t('auth.tagline')}</Text>
				</View>

				{/* Illustration */}
				<View style={styles.illustrationContainer}>
					{/* You can replace this with an actual illustration */}
					<View style={styles.illustrationPlaceholder}>
						<Ionicons
							name="restaurant-outline"
							size={80}
							color={colors.primary}
						/>
					</View>
				</View>

				{/* Buttons Section */}
				<View style={styles.buttonsSection}>
					{/* Google Sign In Button */}
					<TouchableOpacity
						style={styles.googleButton}
						onPress={handleGoogleAuth}
						disabled={isLoading || isGoogleLoading}
					>
						<View style={styles.googleButtonContent}>
							{isGoogleLoading ? (
								<ActivityIndicator size="small" color={colors.primary} />
							) : (
								<>
									{/* <Image
										source={require('@/assets/images/google_logo.png')}
										style={styles.googleIcon}
									/> */}
									<Text style={styles.googleButtonText}>
										{t('auth.continueWithGoogle')}
									</Text>
								</>
							)}
						</View>
					</TouchableOpacity>

					{/* Apple Sign In Button (iOS only) */}
					{Platform.OS === 'ios' && (
						<TouchableOpacity
							style={styles.appleButton}
							onPress={() => {
								// TODO: Implement Apple Sign In
								Alert.alert(t('auth.appleAuth'), t('auth.appleAuthMessage'));
							}}
							disabled={isLoading}
						>
							<View style={styles.appleButtonContent}>
								<Ionicons
									name="logo-apple"
									size={20}
									color={colors.quaternary}
								/>
								<Text style={styles.appleButtonText}>
									{t('auth.continueWithApple')}
								</Text>
							</View>
						</TouchableOpacity>
					)}

					{/* Divider */}
					<View style={styles.dividerContainer}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>{t('auth.or')}</Text>
						<View style={styles.dividerLine} />
					</View>

					{/* Email/Password Buttons */}
					<TouchableOpacity
						style={styles.primaryButton}
						onPress={handleLogin}
						disabled={isLoading}
					>
						<Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.secondaryButton}
						onPress={handleRegister}
						disabled={isLoading}
					>
						<Text style={styles.secondaryButtonText}>{t('auth.register')}</Text>
					</TouchableOpacity>

					{/* Guest Mode */}
					<TouchableOpacity
						style={styles.guestButton}
						onPress={handleGuestMode}
						disabled={isLoading}
					>
						<Text style={styles.guestButtonText}>
							{t('auth.continueAsGuest')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Terms and Privacy */}
				<View style={styles.termsContainer}>
					<Text style={styles.termsText}>
						{t('auth.byCreatingAccount')}{' '}
						<TouchableOpacity
							onPress={() => {
								// TODO: Open terms
								Alert.alert(t('auth.terms'), t('auth.termsMessage'));
							}}
						>
							<Text style={styles.termsLink}>{t('auth.termsOfService')}</Text>
						</TouchableOpacity>{' '}
						{t('auth.and')}{' '}
						<TouchableOpacity
							onPress={() => {
								// TODO: Open privacy policy
								Alert.alert(t('auth.privacy'), t('auth.privacyMessage'));
							}}
						>
							<Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
						</TouchableOpacity>
					</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		justifyContent: 'space-between',
	},
	logoSection: {
		alignItems: 'center',
		paddingTop: height * 0.08,
	},
	logo: {
		width: 120,
		height: 96,
		marginBottom: 16,
	},
	appName: {
		fontSize: 36,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
	},
	tagline: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		paddingHorizontal: 20,
	},
	illustrationContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	illustrationPlaceholder: {
		width: 160,
		height: 160,
		borderRadius: 80,
		backgroundColor: colors.quaternary,
		borderWidth: 2,
		borderColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonsSection: {
		paddingBottom: 20,
	},
	googleButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		paddingVertical: 14,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	googleButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	googleIcon: {
		width: 20,
		height: 20,
		marginRight: 12,
	},
	googleButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	appleButton: {
		backgroundColor: '#000',
		borderRadius: 12,
		paddingVertical: 14,
		marginBottom: 12,
	},
	appleButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	appleButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
		marginLeft: 8,
	},
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: colors.primaryLight,
	},
	dividerText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginHorizontal: 16,
	},
	primaryButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 12,
	},
	primaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	secondaryButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 20,
	},
	secondaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	guestButton: {
		paddingVertical: 12,
		alignItems: 'center',
	},
	guestButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
	},
	termsContainer: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	termsText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 18,
	},
	termsLink: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
