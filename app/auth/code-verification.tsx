import { AuthService } from '@/api/services';
import { colors } from '@/assets/styles/colors';
import ErrorDisplay from '@/components/auth/ErrorDisplay';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export default function CodeVerificationScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { email } = useLocalSearchParams();

	const [code, setCode] = useState('');
	const [status, setStatus] = useState<VerificationStatus>('idle');
	const [error, setError] = useState('');
	const [codeError, setCodeError] = useState('');
	const [counter, setCounter] = useState(0);
	const [isResendDisabled, setIsResendDisabled] = useState(false);

	// Refs for code inputs
	const inputRefs = useRef<TextInput[]>([]);

	// Auto-focus first input on mount
	useEffect(() => {
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, []);

	// Reset errors when code changes
	useEffect(() => {
		if (codeError) setCodeError('');
		if (error) setError('');
	}, [code]);

	// Counter for resend button
	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		if (counter > 0) {
			intervalId = setInterval(() => {
				setCounter((prevCounter) => prevCounter - 1);
			}, 1000);
		} else {
			setIsResendDisabled(false);
		}

		return () => clearInterval(intervalId);
	}, [counter]);

	const startCounter = () => {
		setCounter(60);
		setIsResendDisabled(true);
	};

	const handleCodeChange = (value: string, index: number) => {
		// Only allow digits
		const digit = value.replace(/[^0-9]/g, '');

		if (digit.length <= 1) {
			const newCode = code.split('');
			newCode[index] = digit;
			const updatedCode = newCode.join('');
			setCode(updatedCode);

			// Move to next input if digit entered
			if (digit && index < 5) {
				inputRefs.current[index + 1]?.focus();
			}
		}
	};

	const handleKeyPress = (index: number, key: string) => {
		// Move to previous input on backspace if current input is empty
		if (key === 'Backspace' && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const getCodeArray = () => {
		const codeArray = code.split('');
		while (codeArray.length < 6) {
			codeArray.push('');
		}
		return codeArray.slice(0, 6);
	};

	const isFormValid = code.length === 6 && status !== 'loading';

	const handleVerifyCode = async () => {
		// Reset errors
		setCodeError('');
		setError('');

		// Validate code
		if (code.length !== 6) {
			setCodeError(t('validation.codeRequired'));
			return;
		}

		if (!/^\d{6}$/.test(code)) {
			setCodeError(t('validation.codeInvalid'));
			return;
		}

		setStatus('loading');

		try {
			const response = await AuthService.verifyPasswordResetCode(
				email as string,
				code,
			);

			if (response.success) {
				setStatus('success');

				// Navigate to new password screen with token
				router.push({
					pathname: '/auth/new-password',
					params: {
						token: response.data.token,
					},
				});
			} else {
				throw new Error('Verification failed');
			}
		} catch (error) {
			console.error('Code verification error:', error);
			setStatus('error');

			setError(t('auth.verificationError'));
		}
	};

	const handleResendCode = async () => {
		startCounter();
		setError('');

		try {
			await AuthService.sendPasswordResetCode(email as string);

			Alert.alert(t('auth.codeResent'), t('auth.codeResentMessage'), [
				{ text: t('general.ok') },
			]);
		} catch (error) {
			console.error('Resend code error:', error);
			setError(t('auth.resendCodeError'));
		}
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
						<Text style={styles.headerTitle}>{t('auth.verification')}</Text>
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
									name="mail-outline"
									size={48}
									color={colors.primary}
								/>
							</View>
						</View>

						{/* Text */}
						<View style={styles.textContainer}>
							<Text style={styles.title}>{t('auth.verification')}</Text>
							<Text style={styles.subtitle}>
								{t('auth.verificationMessage')}{' '}
								<Text style={styles.emailText}>{email}</Text>
							</Text>
						</View>

						{/* Form */}
						<View style={styles.form}>
							{/* Code Input */}
							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>
									{t('auth.verificationCode')}
								</Text>
								<View style={styles.codeInputContainer}>
									{getCodeArray().map((digit, index) => (
										<TextInput
											key={index}
											ref={(ref) => {
												if (ref) {
													inputRefs.current[index] = ref;
												}
											}}
											style={[
												styles.codeInput,
												codeError ? styles.codeInputError : null,
												digit ? styles.codeInputFilled : null,
											]}
											value={digit}
											onChangeText={(value) => handleCodeChange(value, index)}
											onKeyPress={({ nativeEvent }) =>
												handleKeyPress(index, nativeEvent.key)
											}
											keyboardType="numeric"
											maxLength={1}
											editable={status !== 'loading'}
											selectTextOnFocus
										/>
									))}
								</View>
								{codeError ? (
									<Text style={styles.errorText}>{codeError}</Text>
								) : null}
							</View>

							{/* Resend Code */}
							<View style={styles.resendContainer}>
								<Text style={styles.resendText}>
									{t('auth.didntReceiveCode')}
								</Text>
								<TouchableOpacity
									style={styles.resendButton}
									onPress={handleResendCode}
									disabled={isResendDisabled || status === 'loading'}
								>
									<Text
										style={[
											styles.resendButtonText,
											(isResendDisabled || status === 'loading') &&
												styles.textDisabled,
										]}
									>
										{isResendDisabled
											? `${t('auth.resendIn')} ${counter}s`
											: t('auth.resendCode')}
									</Text>
								</TouchableOpacity>
							</View>

							{/* Verify Button */}
							<TouchableOpacity
								style={[
									styles.verifyButton,
									!isFormValid && styles.verifyButtonDisabled,
								]}
								onPress={handleVerifyCode}
								disabled={!isFormValid}
								activeOpacity={0.8}
							>
								{status === 'loading' ? (
									<ActivityIndicator size="small" color={colors.quaternary} />
								) : (
									<Text
										style={[
											styles.verifyButtonText,
											!isFormValid && styles.verifyButtonTextDisabled,
										]}
									>
										{t('auth.verify')}
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
					{/* Error Display */}
					{status === 'error' && error && (
						<View
							style={{
								position: 'absolute',
								alignItems: 'center',
								justifyContent: 'center',
								flex: 1,
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
					)}
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
	emailText: {
		fontWeight: '600',
		color: colors.primary,
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
		marginBottom: 12,
		textAlign: 'center',
	},
	codeInputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	codeInput: {
		width: 45,
		height: 55,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: colors.primaryLight,
		backgroundColor: colors.quaternary,
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	codeInputFilled: {
		borderColor: colors.primary,
		backgroundColor: colors.quaternary,
	},
	codeInputError: {
		borderColor: '#D32F2F',
	},
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 8,
		textAlign: 'center',
	},
	resendContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	resendText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginBottom: 8,
	},
	resendButton: {
		padding: 8,
	},
	resendButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textDecorationLine: 'underline',
	},
	verifyButton: {
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
	verifyButtonDisabled: {
		backgroundColor: colors.primaryLight,
		shadowOpacity: 0,
		elevation: 0,
	},
	verifyButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	verifyButtonTextDisabled: {
		opacity: 0.7,
	},
	textDisabled: {
		opacity: 0.6,
	},
});
