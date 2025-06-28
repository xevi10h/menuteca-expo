import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
	const error = useUserStore((state) => state.error);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
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
		}

		if (hasErrors) return;

		try {
			const success = await login(email.trim(), password);

			if (success) {
				// Navigation will be handled by the authentication state change
				router.replace('/');
			} else {
				// Error is handled by the store
				if (error) {
					Alert.alert(t('auth.loginError'), error);
				}
			}
		} catch (err) {
			Alert.alert(t('auth.loginError'), t('auth.loginFailed'));
		}
	};

	const handleForgotPassword = () => {
		// TODO: Implement forgot password
		Alert.alert(t('auth.forgotPassword'), t('auth.forgotPasswordMessage'));
	};

	const handleGoToRegister = () => {
		// router.push('/auth/register');
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
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity onPress={handleBack} style={styles.backButton}>
							<Ionicons name="chevron-back" size={24} color={colors.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{t('auth.login')}</Text>
					</View>

					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={{ width: 100, height: 80, marginBottom: 5 }}
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
								isLoading && styles.loginButtonDisabled,
							]}
							onPress={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={colors.quaternary} />
							) : (
								<Text style={styles.loginButtonText}>{t('auth.login')}</Text>
							)}
						</TouchableOpacity>

						{/* Register Link */}
						<View style={styles.registerContainer}>
							<Text style={styles.registerText}>{t('auth.noAccount')}</Text>
							<TouchableOpacity
								onPress={handleGoToRegister}
								disabled={isLoading}
							>
								<Text style={styles.registerLink}>{t('auth.register')}</Text>
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
		marginLeft: 10,
	},
	logoContainer: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	logoText: {
		fontSize: 60,
		marginBottom: 10,
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
	forgotPasswordButton: {
		alignSelf: 'flex-end',
		marginBottom: 30,
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
	},
	loginButtonDisabled: {
		opacity: 0.6,
	},
	loginButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	registerContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
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
	},
});
