import { colors } from '@/assets/styles/colors';
import ErrorDisplay from '@/components/auth/ErrorDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordScreen() {
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

	const handleSendResetEmail = async () => {
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
			// TODO: Implement forgot password API call
			// const response = await AuthService.forgotPassword(email.trim());

			// Simulate API call with potential failure
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					// Simulate 80% success rate for demo
					if (Math.random() > 0.2) {
						resolve(true);
					} else {
						reject(new Error('Network error occurred'));
					}
				}, 2000);
			});

			setStatus('success');

			// Show success message after a brief delay
			setTimeout(() => {
				Alert.alert(t('auth.resetEmailSent'), t('auth.resetEmailSentMessage'), [
					{
						text: t('general.ok'),
						onPress: () => router.back(),
					},
				]);
			}, 500);
		} catch (error) {
			console.error('Forgot password error:', error);
			setStatus('error');
			setError(
				error instanceof Error
					? error.message
					: t('auth.resetEmailErrorMessage'),
			);
		}
	};

	const handleRetry = () => {
		setStatus('idle');
		setError('');
	};

	const handleBack = () => {
		router.back();
	};

	const handleGoToLogin = () => {
		router.push('/auth/login');
	};

	const renderContent = () => {
		if (status === 'success') {
			return (
				<View style={styles.successContainer}>
					<View style={styles.successIconContainer}>
						<Ionicons name="checkmark-circle" size={80} color="#10B981" />
					</View>
					<Text style={styles.successTitle}>{t('auth.resetEmailSent')}</Text>
					<Text style={styles.successMessage}>
						{t('auth.resetEmailSentMessage')}
					</Text>
					<TouchableOpacity style={styles.successButton} onPress={handleBack}>
						<Text style={styles.successButtonText}>{t('general.ok')}</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<>
				{/* Icon */}
				<View style={styles.iconContainer}>
					<View style={styles.iconCircle}>
						<Ionicons name="mail-outline" size={48} color={colors.primary} />
					</View>
				</View>

				{/* Text */}
				<View style={styles.textContainer}>
					<Text style={styles.title}>{t('auth.resetPassword')}</Text>
					<Text style={styles.subtitle}>{t('auth.resetPasswordMessage')}</Text>
				</View>

				{/* Error Display */}
				{status === 'error' && error && (
					<ErrorDisplay
						message={error}
						type="network"
						onRetry={handleRetry}
						variant="inline"
						animated={true}
					/>
				)}

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

					{/* Send Reset Email Button */}
					<TouchableOpacity
						style={[
							styles.sendButton,
							!isFormValid && styles.sendButtonDisabled,
						]}
						onPress={handleSendResetEmail}
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
								{t('auth.sendResetEmail')}
							</Text>
						)}
					</TouchableOpacity>

					{/* Back to Login */}
					<TouchableOpacity
						style={styles.backToLoginButton}
						onPress={handleGoToLogin}
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
			</>
		);
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
						<TouchableOpacity
							onPress={handleBack}
							style={styles.backButton}
							disabled={status === 'loading'}
						>
							<Ionicons name="chevron-back" size={24} color={colors.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{t('auth.forgotPassword')}</Text>
					</View>

					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={styles.logo}
							resizeMode="contain"
						/>
						<Text style={styles.appName}>Menuteca</Text>
					</View>

					{/* Content */}
					<View style={styles.content}>{renderContent()}</View>
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
	// Success state styles
	successContainer: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	successIconContainer: {
		marginBottom: 30,
	},
	successTitle: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 12,
		textAlign: 'center',
	},
	successMessage: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 30,
		paddingHorizontal: 20,
	},
	successButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: 'center',
		minWidth: 120,
	},
	successButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
