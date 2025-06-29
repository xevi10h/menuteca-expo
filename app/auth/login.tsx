import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const login = useUserStore((state) => state.login);
	const isLoading = useUserStore((state) => state.isLoading);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const error = useUserStore((state) => state.error);
	const clearError = useUserStore((state) => state.clearError);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [isFormValid, setIsFormValid] = useState(false);

	// Clear errors when user starts typing
	useEffect(() => {
		if (error) {
			clearError();
		}
	}, [email, password]);

	// Validate form in real time
	useEffect(() => {
		const isEmailValid = validateEmail(email);
		const isPasswordValid = password.length >= 6;
		setIsFormValid(isEmailValid && isPasswordValid && !isLoading);
	}, [email, password, isLoading]);

	// If already authenticated, redirect to main app
	if (isAuthenticated) {
		return <Redirect href="/" />;
	}

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (text: string) => {
		setEmail(text);
		if (emailError) setEmailError('');
	};

	const handlePasswordChange = (text: string) => {
		setPassword(text);
		if (passwordError) setPasswordError('');
	};

	const handleLogin = async () => {
		// Reset errors
		setEmailError('');
		setPasswordError('');

		// Validate inputs
		let hasErrors = false;

		if (!email.trim()) {
			setEmailError(t('validation.emailRequired'));
			hasErrors = true;
		} else if (!validateEmail(email)) {
			setEmailError(t('validation.emailInvalid'));
			hasErrors = true;
		}

		if (!password.trim()) {
			setPasswordError(t('validation.passwordRequired'));
			hasErrors = true;
		} else if (password.length < 6) {
			setPasswordError(t('validation.passwordMinLength'));
			hasErrors = true;
		}

		if (hasErrors) return;

		try {
			const success = await login(email.trim(), password);

			if (success) {
				// Navigation will be handled automatically by the authentication state change
				router.replace('/');
			} else {
				// Error is handled by the store
				if (error) {
					Alert.alert(t('auth.loginError'), error);
				}
			}
		} catch (err) {
			console.error('Login error:', err);
			Alert.alert(t('auth.loginError'), t('auth.loginFailed'));
		}
	};

	const handleForgotPassword = () => {
		router.push('/auth/password-recovery');
	};

	const handleGoToRegister = () => {
		router.push('/auth/register');
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>{t('auth.login')}</Text>
						<TouchableOpacity
							onPress={handleBack}
							style={styles.backButton}
							disabled={isLoading}
						>
							<Ionicons name="chevron-back" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={styles.logo}
							resizeMode="contain"
						/>
						<Text style={styles.appName}>Menuteca</Text>
						<Text style={styles.subtitle}>{t('auth.welcomeBack')}</Text>
					</View>

					{/* Form */}
					<View style={styles.form}>
						{/* Email Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.email')}</Text>
							<View style={styles.inputWrapper}>
								<Ionicons
									name="mail-outline"
									size={20}
									color={colors.primaryLight}
									style={styles.inputIcon}
								/>
								<TextInput
									style={[
										styles.input,
										emailError ? styles.inputError : null,
										!validateEmail(email) && email.length > 0
											? styles.inputWarning
											: null,
									]}
									value={email}
									onChangeText={handleEmailChange}
									placeholder={t('auth.enterEmail')}
									placeholderTextColor={colors.primaryLight}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									editable={!isLoading}
									autoComplete="email"
								/>
								{validateEmail(email) && (
									<Ionicons
										name="checkmark-circle"
										size={20}
										color="#10B981"
										style={styles.validationIcon}
									/>
								)}
							</View>
							{emailError ? (
								<Text style={styles.errorText}>{emailError}</Text>
							) : null}
						</View>

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t('auth.password')}</Text>
							<View style={styles.inputWrapper}>
								<Ionicons
									name="lock-closed-outline"
									size={20}
									color={colors.primaryLight}
									style={styles.inputIcon}
								/>
								<TextInput
									style={[
										styles.input,
										passwordError ? styles.inputError : null,
									]}
									value={password}
									onChangeText={handlePasswordChange}
									placeholder={t('auth.enterPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showPassword}
									editable={!isLoading}
									autoComplete="password"
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

						{/* Forgot Password */}
						<TouchableOpacity
							style={styles.forgotPasswordButton}
							onPress={handleForgotPassword}
							disabled={isLoading}
						>
							<Text style={styles.forgotPasswordText}>
								{t('auth.forgotPassword')}
							</Text>
						</TouchableOpacity>

						{/* Login Button */}
						<TouchableOpacity
							style={[
								styles.loginButton,
								!isFormValid && styles.loginButtonDisabled,
							]}
							onPress={handleLogin}
							disabled={!isFormValid}
							activeOpacity={0.8}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={colors.quaternary} />
							) : (
								<Text
									style={[
										styles.loginButtonText,
										!isFormValid && styles.loginButtonTextDisabled,
									]}
								>
									{t('auth.login')}
								</Text>
							)}
						</TouchableOpacity>

						{/* Register Link */}
						<View style={styles.registerContainer}>
							<Text style={styles.registerText}>{t('auth.noAccount')}</Text>
							<TouchableOpacity
								onPress={handleGoToRegister}
								disabled={isLoading}
							>
								<Text
									style={[
										styles.registerLink,
										isLoading && styles.textDisabled,
									]}
								>
									{t('auth.register')}
								</Text>
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
		borderRadius: 20,
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
		paddingVertical: 40,
	},
	logo: {
		width: 100,
		height: 80,
		marginBottom: 5,
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
	inputWrapper: {
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputIcon: {
		position: 'absolute',
		left: 16,
		zIndex: 1,
	},
	input: {
		flex: 1,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 48,
		paddingVertical: 14,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	inputError: {
		borderColor: '#D32F2F',
		borderWidth: 2,
	},
	inputWarning: {
		borderColor: '#FF9800',
	},
	validationIcon: {
		position: 'absolute',
		right: 16,
		zIndex: 1,
	},
	eyeButton: {
		position: 'absolute',
		right: 16,
		padding: 4,
		zIndex: 1,
	},
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 4,
		marginLeft: 4,
	},
	forgotPasswordButton: {
		alignSelf: 'flex-end',
		marginBottom: 30,
		padding: 4,
	},
	forgotPasswordText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	loginButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 30,
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
	loginButtonDisabled: {
		backgroundColor: colors.primaryLight,
		shadowOpacity: 0,
		elevation: 0,
	},
	loginButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	loginButtonTextDisabled: {
		opacity: 0.7,
	},
	registerContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		paddingBottom: 20,
	},
	registerText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	registerLink: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textDecorationLine: 'underline',
	},
	textDisabled: {
		opacity: 0.6,
	},
});
