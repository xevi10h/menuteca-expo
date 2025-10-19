import { AuthService } from '@/api/index';
import { colors } from '@/assets/styles/colors';
import ErrorDisplay from '@/components/auth/ErrorDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
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

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function PasswordRecoveryScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<RequestStatus>('idle');
	const [error, setError] = useState('');
	const [emailError, setEmailError] = useState('');

	// Reset errors when email changes
	useEffect(() => {
		if (emailError) setEmailError('');
		if (error) setError('');
	}, [email]);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const isFormValid =
		email.trim() !== '' && validateEmail(email) && status !== 'loading';

	const handleSendResetCode = async () => {
		// Reset errors
		setEmailError('');
		setError('');

		// Validate email
		if (!email.trim()) {
			setEmailError(t('validation.emailRequired'));
			return;
		}

		if (!validateEmail(email)) {
			setEmailError(t('validation.emailInvalid'));
			return;
		}

		setStatus('loading');

		try {
			const response = await AuthService.sendPasswordResetCode(
				email.trim().toLowerCase(),
			);

			if (response.success) {
				setStatus('success');

				// Navigate to code verification with email
				router.push({
					pathname: '/auth/code-verification',
					params: { email: email.trim().toLowerCase() },
				});
			} else {
				throw new Error('Failed to send reset code');
			}
		} catch (error) {
			console.error('Send reset code error:', error);
			setStatus('error');

			// Handle specific errors from the API
			let translatedError = t('auth.resetEmailErrorMessage');

			if (error instanceof Error) {
				const errorLower = error.message.toLowerCase();

				if (errorLower.includes('failed to send') && errorLower.includes('reset code')) {
					translatedError = t('auth.errors.failedToSendResetCode');
				}
				else if (errorLower.includes('email') && errorLower.includes('not found')) {
					translatedError = t('auth.errors.failedToCheckEmail');
				}
			}

			setError(translatedError);
		}
	};

	const handleRetry = () => {
		setStatus('idle');
		setError('');
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<>
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
							<Text style={styles.headerTitle}>
								{t('auth.passwordRecovery')}
							</Text>
							<TouchableOpacity
								onPress={handleBack}
								style={styles.backButton}
								disabled={status === 'loading'}
							>
								<Ionicons
									name="chevron-back"
									size={24}
									color={colors.primary}
								/>
							</TouchableOpacity>
						</View>

						{/* Content */}
						<View style={styles.content}>
							{/* Icon */}
							<View style={styles.iconContainer}>
								<View style={styles.iconCircle}>
									<Ionicons
										name="mail-outline"
										size={48}
										color={colors.primary}
									/>
								</View>
							</View>

							{/* Text */}
							<View style={styles.textContainer}>
								<Text style={styles.title}>
									{t('auth.passwordRecoveryTitle')}
								</Text>
								<Text style={styles.subtitle}>
									{t('auth.passwordRecoveryText')}
								</Text>
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
											onChangeText={setEmail}
											placeholder={t('auth.enterEmail')}
											placeholderTextColor={colors.primaryLight}
											keyboardType="email-address"
											autoCapitalize="none"
											autoCorrect={false}
											editable={status !== 'loading'}
											autoComplete="email"
											autoFocus
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

								{/* Send Reset Code Button */}
								<TouchableOpacity
									style={[
										styles.sendButton,
										!isFormValid && styles.sendButtonDisabled,
									]}
									onPress={handleSendResetCode}
									disabled={!isFormValid}
									activeOpacity={0.8}
								>
									{status === 'loading' ? (
										<ActivityIndicator size="small" color={colors.quaternary} />
									) : (
										<Text
											style={[
												styles.sendButtonText,
												!isFormValid && styles.sendButtonTextDisabled,
											]}
										>
											{t('auth.resetPassword')}
										</Text>
									)}
								</TouchableOpacity>

								{/* Back to Login */}
								<TouchableOpacity
									style={styles.backToLoginButton}
									onPress={() => router.push('/auth/login')}
									disabled={status === 'loading'}
								>
									<Ionicons
										name="arrow-back"
										size={16}
										color={colors.primary}
										style={styles.backIcon}
									/>
									<Text
										style={[
											styles.backToLoginText,
											status === 'loading' && styles.textDisabled,
										]}
									>
										{t('auth.backToLogin')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
			{/* Error Display */}
			{status === 'error' && error && (
				<View
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0, 0, 0, 0.3)',
					}}
				>
					<View
						style={{
							position: 'absolute',
							top: '45%',
							left: 20,
							right: 20,
							transform: [{ translateY: -100 }],
							zIndex: 1000,
						}}
					>
						<ErrorDisplay
							message={error}
							type="validation"
							onRetry={() => setStatus('idle')}
							variant="inline"
							animated={true}
						/>
					</View>
				</View>
			)}
		</>
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
		marginBottom: 30,
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
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 4,
		marginLeft: 4,
	},
	sendButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 20,
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
	sendButtonDisabled: {
		backgroundColor: colors.primaryLight,
		shadowOpacity: 0,
		elevation: 0,
	},
	sendButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	sendButtonTextDisabled: {
		opacity: 0.7,
	},
	backToLoginButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
	},
	backIcon: {
		marginRight: 8,
	},
	backToLoginText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	textDisabled: {
		opacity: 0.6,
	},
});
