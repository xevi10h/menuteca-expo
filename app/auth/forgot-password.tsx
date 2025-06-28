import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
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

export default function ForgotPasswordScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [emailError, setEmailError] = useState('');

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSendResetEmail = async () => {
		// Reset errors
		setEmailError('');

		// Validate email
		if (!email.trim()) {
			setEmailError(t('validation.emailRequired'));
			return;
		}

		if (!validateEmail(email)) {
			setEmailError(t('validation.emailInvalid'));
			return;
		}

		setIsLoading(true);

		try {
			// TODO: Implement forgot password API call
			// const response = await AuthService.forgotPassword(email.trim());

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			Alert.alert(t('auth.resetEmailSent'), t('auth.resetEmailSentMessage'), [
				{
					text: t('general.ok'),
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert(t('auth.resetEmailError'), t('auth.resetEmailErrorMessage'));
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		router.back();
	};

	const handleGoToLogin = () => {
		router.push('/auth/login');
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
						<Text style={styles.headerTitle}>{t('auth.forgotPassword')}</Text>
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
									name="mail-outline"
									size={48}
									color={colors.primary}
								/>
							</View>
						</View>

						{/* Text */}
						<View style={styles.textContainer}>
							<Text style={styles.title}>{t('auth.resetPassword')}</Text>
							<Text style={styles.subtitle}>
								{t('auth.resetPasswordMessage')}
							</Text>
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

							{/* Send Reset Email Button */}
							<TouchableOpacity
								style={[
									styles.sendButton,
									isLoading && styles.sendButtonDisabled,
								]}
								onPress={handleSendResetEmail}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator size="small" color={colors.quaternary} />
								) : (
									<Text style={styles.sendButtonText}>
										{t('auth.sendResetEmail')}
									</Text>
								)}
							</TouchableOpacity>

							{/* Back to Login */}
							<TouchableOpacity
								style={styles.backToLoginButton}
								onPress={handleGoToLogin}
								disabled={isLoading}
							>
								<Ionicons
									name="arrow-back"
									size={16}
									color={colors.primary}
									style={styles.backIcon}
								/>
								<Text style={styles.backToLoginText}>
									{t('auth.backToLogin')}
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
		marginBottom: 30,
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
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: '#D32F2F',
		marginTop: 4,
	},
	sendButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 20,
	},
	sendButtonDisabled: {
		opacity: 0.6,
	},
	sendButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
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
});
