import { AuthService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import ErrorDisplay from '@/components/auth/ErrorDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
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

type ResetStatus = 'idle' | 'loading' | 'success' | 'error';

export default function NewPasswordScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { token } = useLocalSearchParams();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [status, setStatus] = useState<ResetStatus>('idle');
	const [error, setError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');

	// Validate token on mount
	useEffect(() => {
		if (!token) {
			Alert.alert(t('auth.invalidToken'), t('auth.invalidTokenMessage'), [
				{
					text: t('general.ok'),
					onPress: () => router.replace('/auth/login'),
				},
			]);
		}
	}, [token, t, router]);

	// Reset errors when passwords change
	useEffect(() => {
		if (passwordError) setPasswordError('');
		if (error) setError('');
	}, [password]);

	useEffect(() => {
		if (confirmPasswordError) setConfirmPasswordError('');
		if (error) setError('');
	}, [confirmPassword]);

	const validatePassword = (password: string) => {
		const minLength = password.length >= 8;
		const hasLower = /[a-z]/.test(password);
		const hasUpper = /[A-Z]/.test(password);
		const hasNumber = /\d/.test(password);

		return minLength && hasLower && hasUpper && hasNumber;
	};

	const getPasswordStrength = (password: string) => {
		if (password.length === 0) return null;
		if (password.length < 8) return 'weak';

		const hasLower = /[a-z]/.test(password);
		const hasUpper = /[A-Z]/.test(password);
		const hasNumber = /\d/.test(password);
		const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

		const criteriaMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
			Boolean,
		).length;

		if (criteriaMet < 3) return 'weak';
		if (criteriaMet === 3) return 'medium';
		return 'strong';
	};

	const passwordStrength = getPasswordStrength(password);
	const isFormValid =
		validatePassword(password) &&
		password === confirmPassword &&
		status !== 'loading';

	const handleResetPassword = async () => {
		// Reset errors
		setPasswordError('');
		setConfirmPasswordError('');
		setError('');

		let hasErrors = false;

		// Validate password
		if (!password.trim()) {
			setPasswordError(t('validation.passwordRequired'));
			hasErrors = true;
		} else if (!validatePassword(password)) {
			setPasswordError(t('validation.passwordWeak'));
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

		if (hasErrors) return;

		if (!token) {
			Alert.alert(t('auth.invalidToken'), t('auth.invalidTokenMessage'));
			return;
		}

		setStatus('loading');

		try {
			const response = await AuthService.resetPasswordWithToken(
				token as string,
				password,
			);

			if (response.success) {
				setStatus('success');

				// Navigate to password changed screen
				router.replace('/auth/password-changed');
			} else {
				throw new Error('Password reset failed');
			}
		} catch (error) {
			console.error('Password reset error:', error);
			setStatus('error');

			const errorMessage =
				error instanceof Error ? error.message : t('auth.passwordResetError');

			setError(errorMessage);
		}
	};

	const handleBack = () => {
		router.replace('/auth/login');
	};

	const getStrengthColor = () => {
		switch (passwordStrength) {
			case 'weak':
				return '#D32F2F';
			case 'medium':
				return '#FF9800';
			case 'strong':
				return '#4CAF50';
			default:
				return colors.primaryLight;
		}
	};

	const getStrengthText = () => {
		switch (passwordStrength) {
			case 'weak':
				return t('auth.passwordWeak');
			case 'medium':
				return t('auth.passwordMedium');
			case 'strong':
				return t('auth.passwordStrong');
			default:
				return '';
		}
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
						<Text style={styles.headerTitle}>{t('auth.newPassword')}</Text>
						<TouchableOpacity
							onPress={handleBack}
							style={styles.backButton}
							disabled={status === 'loading'}
						>
							<Ionicons name="chevron-back" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Content */}
					<View style={styles.content}>
						{/* Icon */}
						<View style={styles.iconContainer}>
							<View style={styles.iconCircle}>
								<Ionicons
									name="lock-closed-outline"
									size={48}
									color={colors.primary}
								/>
							</View>
						</View>

						{/* Text */}
						<View style={styles.textContainer}>
							<Text style={styles.title}>{t('auth.newPassword')}</Text>
							<Text style={styles.subtitle}>
								{t('auth.newPasswordMessage')}
							</Text>
						</View>

						{/* Error Display */}
						{status === 'error' && error && (
							<ErrorDisplay
								message={error}
								type="network"
								onRetry={() => setStatus('idle')}
								variant="inline"
								animated={true}
							/>
						)}

						{/* Form */}
						<View style={styles.form}>
							{/* Password Input */}
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>{t('auth.newPassword')}</Text>
								<View style={styles.passwordContainer}>
									<TextInput
										style={[
											styles.passwordInput,
											passwordError ? styles.inputError : null,
										]}
										value={password}
										onChangeText={setPassword}
										placeholder={t('auth.enterNewPassword')}
										placeholderTextColor={colors.primaryLight}
										secureTextEntry={!showPassword}
										editable={status !== 'loading'}
										autoComplete="new-password"
									/>
									<TouchableOpacity
										style={styles.eyeButton}
										onPress={() => setShowPassword(!showPassword)}
										disabled={status === 'loading'}
									>
										<Ionicons
											name={showPassword ? 'eye-off' : 'eye'}
											size={20}
											color={colors.primaryLight}
										/>
									</TouchableOpacity>
								</View>

								{/* Password Strength Indicator */}
								{password.length > 0 && (
									<View style={styles.strengthContainer}>
										<View style={styles.strengthBar}>
											<View
												style={[
													styles.strengthFill,
													{
														width:
															passwordStrength === 'weak'
																? '33%'
																: passwordStrength === 'medium'
																? '66%'
																: '100%',
														backgroundColor: getStrengthColor(),
													},
												]}
											/>
										</View>
										<Text
											style={[
												styles.strengthText,
												{ color: getStrengthColor() },
											]}
										>
											{getStrengthText()}
										</Text>
									</View>
								)}

								{passwordError ? (
									<Text style={styles.errorText}>{passwordError}</Text>
								) : null}
							</View>

							{/* Confirm Password Input */}
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>
									{t('auth.confirmNewPassword')}
								</Text>
								<View style={styles.passwordContainer}>
									<TextInput
										style={[
											styles.passwordInput,
											confirmPasswordError ? styles.inputError : null,
										]}
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										placeholder={t('auth.enterConfirmNewPassword')}
										placeholderTextColor={colors.primaryLight}
										secureTextEntry={!showConfirmPassword}
										editable={status !== 'loading'}
										autoComplete="new-password"
									/>
									<TouchableOpacity
										style={styles.eyeButton}
										onPress={() => setShowConfirmPassword(!showConfirmPassword)}
										disabled={status === 'loading'}
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

							{/* Reset Password Button */}
							<TouchableOpacity
								style={[
									styles.resetButton,
									!isFormValid && styles.resetButtonDisabled,
								]}
								onPress={handleResetPassword}
								disabled={!isFormValid}
								activeOpacity={0.8}
							>
								{status === 'loading' ? (
									<ActivityIndicator size="small" color={colors.quaternary} />
								) : (
									<Text
										style={[
											styles.resetButtonText,
											!isFormValid && styles.resetButtonTextDisabled,
										]}
									>
										{t('auth.updatePassword')}
									</Text>
								)}
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
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	iconContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	iconCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: colors.quaternary,
		borderWidth: 2,
		borderColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: 20,
	},
	form: {
		flex: 1,
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
	inputError: {
		borderColor: '#D32F2F',
		borderWidth: 2,
	},
	eyeButton: {
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	strengthContainer: {
		marginTop: 8,
	},
	strengthBar: {
		height: 4,
		backgroundColor: colors.primaryLight,
		borderRadius: 2,
		marginBottom: 4,
	},
	strengthFill: {
		height: '100%',
		borderRadius: 2,
	},
	strengthText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 4,
	},
	resetButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 20,
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
	resetButtonDisabled: {
		backgroundColor: colors.primaryLight,
		shadowOpacity: 0,
		elevation: 0,
	},
	resetButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	resetButtonTextDisabled: {
		opacity: 0.7,
	},
});
