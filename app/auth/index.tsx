import { SupabaseAuthService } from '@/api/supabaseAuth';
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
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
	const setUser = useUserStore((state) => state.setUser);
	const isLoading = useUserStore((state) => state.isLoading);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	// If already authenticated, redirect to main app
	if (isAuthenticated) {
		return <Redirect href="/" />;
	}

	const handleLogin = () => {
		router.push('/auth/login');
	};

	const handleRegister = () => {
		router.push('/auth/register');
	};

	const handleGoogleAuth = async () => {
		setIsGoogleLoading(true);

		try {
			console.log('Starting Google sign in...');
			const result = await SupabaseAuthService.signInWithGoogle();

			console.log('Google sign in result:', result);

			if (result.success && result.data) {
				setUser(result.data);
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

				{/* Buttons Section */}
				<View style={styles.buttonsSection}>
					{/* Google Sign In Button */}
					<TouchableOpacity
						style={[
							styles.googleButton,
							(isLoading || isGoogleLoading) && styles.buttonDisabled,
						]}
						onPress={handleGoogleAuth}
						disabled={isLoading || isGoogleLoading}
						activeOpacity={0.8}
					>
						<View style={styles.googleButtonContent}>
							{isGoogleLoading ? (
								<ActivityIndicator size="small" color={colors.primary} />
							) : (
								<>
									<Ionicons
										name="logo-google"
										size={20}
										color={colors.primary}
									/>
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
							style={[styles.appleButton, isLoading && styles.buttonDisabled]}
							onPress={() => {
								// TODO: Implement Apple Sign In
								Alert.alert(t('auth.appleAuth'), t('auth.appleAuthMessage'));
							}}
							disabled={isLoading}
							activeOpacity={0.8}
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
						style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={isLoading}
						activeOpacity={0.8}
					>
						{isLoading ? (
							<ActivityIndicator size="small" color={colors.quaternary} />
						) : (
							<Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
						onPress={handleRegister}
						disabled={isLoading}
						activeOpacity={0.8}
					>
						<Text
							style={[
								styles.secondaryButtonText,
								isLoading && styles.textDisabled,
							]}
						>
							{t('auth.register')}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Terms and Privacy */}
				<View style={styles.termsContainer}>
					<Text style={styles.termsText}>
						{t('auth.byCreatingAccount')}{' '}
						<Text
							style={styles.termsLink}
							onPress={() => {
								// TODO: Open terms
								Alert.alert(t('auth.terms'), t('auth.termsMessage'));
							}}
						>
							{t('auth.termsOfService')}
						</Text>{' '}
						{t('auth.and')}{' '}
						<Text
							style={styles.termsLink}
							onPress={() => {
								// TODO: Open privacy policy
								Alert.alert(t('auth.privacy'), t('auth.privacyMessage'));
							}}
						>
							{t('auth.privacyPolicy')}
						</Text>
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
		paddingBottom: height * 0.05,
	},
	logo: {
		width: 120,
		height: 96,
		marginBottom: 20,
	},
	appName: {
		fontSize: 36,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 12,
	},
	tagline: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		paddingHorizontal: 20,
		lineHeight: 22,
	},
	buttonsSection: {
		paddingBottom: 20,
	},
	googleButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		paddingVertical: 16,
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
		gap: 12,
		minHeight: 24,
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
		paddingVertical: 16,
		marginBottom: 12,
	},
	appleButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		minHeight: 24,
	},
	appleButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
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
		opacity: 0.3,
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
		shadowColor: colors.primary,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
		minHeight: 56,
		justifyContent: 'center',
	},
	primaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 20,
		minHeight: 56,
		justifyContent: 'center',
	},
	secondaryButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	textDisabled: {
		opacity: 0.6,
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
		textDecorationLine: 'underline',
	},
});
