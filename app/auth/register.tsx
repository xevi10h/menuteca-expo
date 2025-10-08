import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
	const { t, locale } = useTranslation();
	const router = useRouter();
	const register = useUserStore((state) => state.register);
	const checkEmailAvailability = useUserStore(
		(state) => state.checkEmailAvailability,
	);
	const checkUsernameAvailability = useUserStore(
		(state) => state.checkUsernameAvailability,
	);
	const isLoading = useUserStore((state) => state.isLoading);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const error = useUserStore((state) => state.error);

	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);

	// Field errors
	const [emailError, setEmailError] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [nameError, setNameError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [termsError, setTermsError] = useState('');

	// If already authenticated, redirect to main app
	if (isAuthenticated) {
		return <Redirect href="/" />;
	}

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password: string) => {
		return password.length >= 6;
	};

	const validateUsername = (username: string) => {
		const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
		return usernameRegex.test(username);
	};

	const handleRegister = async () => {
		// Reset all errors
		setEmailError('');
		setUsernameError('');
		setNameError('');
		setPasswordError('');
		setConfirmPasswordError('');
		setTermsError('');

		let hasErrors = false;

		// Validate name
		if (!name.trim()) {
			setNameError(t('validation.nameRequired'));
			hasErrors = true;
		} else if (name.trim().length < 2) {
			setNameError(t('validation.nameMinLength'));
			hasErrors = true;
		}

		// Validate email
		if (!email.trim()) {
			setEmailError(t('validation.emailRequired'));
			hasErrors = true;
		} else if (!validateEmail(email)) {
			setEmailError(t('validation.emailInvalid'));
			hasErrors = true;
		}

		// Validate username
		if (!username.trim()) {
			setUsernameError(t('validation.usernameRequired'));
			hasErrors = true;
		} else if (!validateUsername(username)) {
			setUsernameError(t('validation.usernameInvalid'));
			hasErrors = true;
		}

		// Validate password
		if (!password.trim()) {
			setPasswordError(t('validation.passwordRequired'));
			hasErrors = true;
		} else if (!validatePassword(password)) {
			setPasswordError(t('validation.passwordMinLength'));
			hasErrors = true;
		}

		// Validate confirm password
		if (!confirmPassword.trim()) {
			setConfirmPasswordError(t('validation.confirmPasswordRequired'));
			hasErrors = true;
		} else if (password !== confirmPassword) {
			setConfirmPasswordError(t('validation.passwordsDontMatch'));
			hasErrors = true;
		}

		// Validate terms
		if (!acceptTerms) {
			setTermsError(t('validation.acceptTermsRequired'));
			hasErrors = true;
		}

		if (hasErrors) return;

		try {
			// Check email availability
			const emailAvailable = await checkEmailAvailability(email.trim());
			if (!emailAvailable) {
				setEmailError(t('validation.emailNotAvailable'));
				return;
			}

			// Check username availability
			const usernameAvailable = await checkUsernameAvailability(
				username.trim(),
			);
			if (!usernameAvailable) {
				setUsernameError(t('validation.usernameNotAvailable'));
				return;
			}

			const success = await register({
				email: email.trim(),
				username: username.trim(),
				name: name.trim(),
				password,
				language: 'es_ES', // Default language
			});

			if (success) {
				// Navigation will be handled automatically by the authentication state change
				// The user will be redirected to the main app through the index.tsx redirect
				router.replace('/');
			} else {
				if (error) {
					Alert.alert(t('auth.registerError'), error);
				}
			}
		} catch (err) {
			Alert.alert(t('auth.registerError'), t('auth.registerFailed'));
		}
	};

	const handleGoToLogin = () => {
		router.push('/auth/login');
	};

	const handleBack = () => {
		router.back();
	};

	const handleTermsPress = () => {
		const validLocales = ['ca_ES', 'es_ES', 'en_US', 'fr_FR'];
		const currentLocale = validLocales.includes(locale) ? locale : 'en_US';
		const url = `https://menutecaapp.com/${currentLocale}/terms`;
		Linking.openURL(url);
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
			>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>{t('auth.register')}</Text>
						<TouchableOpacity onPress={handleBack} style={styles.backButton}>
							<Ionicons name="chevron-back" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={{ width: 100, height: 80, marginBottom: 5 }}
							resizeMode="contain"
						/>
						<Text style={styles.appName}>Menuteca</Text>
						<Text style={styles.subtitle}>{t('auth.createAccount')}</Text>
					</View>

					{/* Form */}
					<View style={styles.form}>
						{/* Name Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.fullName')}</Text>
							<TextInput
								style={[styles.input, nameError ? styles.inputError : null]}
								value={name}
								onChangeText={(text) => {
									setName(text);
									if (nameError) setNameError('');
								}}
								placeholder={t('auth.enterFullName')}
								placeholderTextColor={colors.primaryLight}
								autoCapitalize="words"
								editable={!isLoading}
							/>
							{nameError ? (
								<Text style={styles.errorText}>{nameError}</Text>
							) : null}
						</View>

						{/* Email Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.email')}</Text>
							<TextInput
								style={[styles.input, emailError ? styles.inputError : null]}
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (emailError) setEmailError('');
								}}
								placeholder={t('auth.enterEmail')}
								placeholderTextColor={colors.primaryLight}
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								editable={!isLoading}
							/>
							{emailError ? (
								<Text style={styles.errorText}>{emailError}</Text>
							) : null}
						</View>

						{/* Username Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.username')}</Text>
							<TextInput
								style={[styles.input, usernameError ? styles.inputError : null]}
								value={username}
								onChangeText={(text) => {
									setUsername(text);
									if (usernameError) setUsernameError('');
								}}
								placeholder={t('auth.enterUsername')}
								placeholderTextColor={colors.primaryLight}
								autoCapitalize="none"
								autoCorrect={false}
								editable={!isLoading}
							/>
							{usernameError ? (
								<Text style={styles.errorText}>{usernameError}</Text>
							) : null}
						</View>

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.password')}</Text>
							<View style={styles.passwordContainer}>
								<TextInput
									style={[
										styles.passwordInput,
										passwordError ? styles.inputError : null,
									]}
									value={password}
									onChangeText={(text) => {
										setPassword(text);
										if (passwordError) setPasswordError('');
									}}
									placeholder={t('auth.enterPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showPassword}
									editable={!isLoading}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setShowPassword(!showPassword)}
									disabled={isLoading}
								>
									<Ionicons
										name={showPassword ? 'eye-off' : 'eye'}
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</View>
							{passwordError ? (
								<Text style={styles.errorText}>{passwordError}</Text>
							) : null}
						</View>

						{/* Confirm Password Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.confirmPassword')}</Text>
							<View style={styles.passwordContainer}>
								<TextInput
									style={[
										styles.passwordInput,
										confirmPasswordError ? styles.inputError : null,
									]}
									value={confirmPassword}
									onChangeText={(text) => {
										setConfirmPassword(text);
										if (confirmPasswordError) setConfirmPasswordError('');
									}}
									placeholder={t('auth.enterConfirmPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showConfirmPassword}
									editable={!isLoading}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
									disabled={isLoading}
								>
									<Ionicons
										name={showConfirmPassword ? 'eye-off' : 'eye'}
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</View>
							{confirmPasswordError ? (
								<Text style={styles.errorText}>{confirmPasswordError}</Text>
							) : null}
						</View>

						{/* Terms and Conditions */}
						<View style={styles.termsContainer}>
							<TouchableOpacity
								style={styles.checkboxContainer}
								onPress={() => {
									setAcceptTerms(!acceptTerms);
									if (termsError) setTermsError('');
								}}
								disabled={isLoading}
							>
								<View
									style={[
										styles.checkbox,
										acceptTerms && styles.checkboxChecked,
									]}
								>
									{acceptTerms && (
										<Ionicons
											name="checkmark"
											size={16}
											color={colors.quaternary}
										/>
									)}
								</View>
								<View style={styles.termsTextContainer}>
									<Text style={styles.termsText}>{t('auth.iAccept')} </Text>
									<TouchableOpacity onPress={handleTermsPress}>
										<Text style={styles.termsLink}>
											{t('auth.termsAndConditions')}
										</Text>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
							{termsError ? (
								<Text style={styles.errorText}>{termsError}</Text>
							) : null}
						</View>

						{/* Register Button */}
						<TouchableOpacity
							style={[
								styles.registerButton,
								isLoading && styles.registerButtonDisabled,
							]}
							onPress={handleRegister}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={colors.quaternary} />
							) : (
								<Text style={styles.registerButtonText}>
									{t('auth.register')}
								</Text>
							)}
						</TouchableOpacity>

						{/* Login Link */}
						<View style={styles.loginContainer}>
							<Text style={styles.loginText}>
								{t('auth.alreadyHaveAccount')}
							</Text>
							<TouchableOpacity onPress={handleGoToLogin} disabled={isLoading}>
								<Text style={styles.loginLink}>{t('auth.login')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		right: 0,
		left: 0,
		position: 'absolute',
	},
	logoContainer: {
		alignItems: 'center',
		paddingVertical: 30,
	},
	appName: {
		fontSize: 32,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
	form: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 8,
	},
	input: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	inputError: {
		borderColor: '#D32F2F',
	},
	passwordContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
	},
	eyeButton: {
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 4,
	},
	termsContainer: {
		marginBottom: 30,
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: colors.primaryLight,
		backgroundColor: colors.quaternary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
		marginTop: 2,
	},
	checkboxChecked: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	termsTextContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	termsText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		lineHeight: 20,
	},
	termsLink: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	registerButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 30,
	},
	registerButtonDisabled: {
		opacity: 0.6,
	},
	registerButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	loginText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	loginLink: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
});
