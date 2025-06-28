import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { token } = useLocalSearchParams();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');

	useEffect(() => {
		// Validate token on mount
		if (!token) {
			Alert.alert(t('auth.invalidToken'), t('auth.invalidTokenMessage'), [
				{
					text: t('general.ok'),
					onPress: () => router.replace('/auth/login'),
				},
			]);
		}
	}, [token, t, router]);

	const validatePassword = (password: string) => {
		return password.length >= 6;
	};

	const handleResetPassword = async () => {
		// Reset errors
		setPasswordError('');
		setConfirmPasswordError('');

		let hasErrors = false;

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

		if (hasErrors) return;

		if (!token) {
			Alert.alert(t('auth.invalidToken'), t('auth.invalidTokenMessage'));
			return;
		}

		setIsLoading(true);

		try {
			// TODO: Implement reset password API call
			// const response = await AuthService.resetPassword(token as string, password);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			Alert.alert(
				t('auth.passwordResetSuccess'),
				t('auth.passwordResetSuccessMessage'),
				[
					{
						text: t('general.ok'),
						onPress: () => router.replace('/auth/login'),
					},
				],
			);
		} catch (error) {
			Alert.alert(
				t('auth.resetPasswordError'),
				t('auth.resetPasswordErrorMessage'),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		router.replace('/auth/login');
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
						<Text style={styles.headerTitle}>{t('auth.resetPassword')}</Text>
					</View>

					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={{ width: 100, height: 80, marginBottom: 5 }}
							resizeMode="contain"
						/>
						<Text style={styles.appName}>Menuteca</Text>
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
										onChangeText={(text) => {
											setPassword(text);
											if (passwordError) setPasswordError('');
										}}
										placeholder={t('auth.enterNewPassword')}
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
										onChangeText={(text) => {
											setConfirmPassword(text);
											if (confirmPasswordError) setConfirmPasswordError('');
										}}
										placeholder={t('auth.enterConfirmNewPassword')}
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

							{/* Reset Password Button */}
							<TouchableOpacity
								style={[
									styles.resetButton,
									isLoading && styles.resetButtonDisabled,
								]}
								onPress={handleResetPassword}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator size="small" color={colors.quaternary} />
								) : (
									<Text style={styles.resetButtonText}>
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
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 40,
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
	resetButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 20,
	},
	resetButtonDisabled: {
		opacity: 0.6,
	},
	resetButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
