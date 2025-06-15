import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const login = useUserStore((state) => state.login);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = async () => {
		if (!name || !email || !password || !confirmPassword) {
			Alert.alert(t('auth.error'), t('auth.fillAllFields'), [
				{ text: t('general.ok') },
			]);
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert(t('auth.error'), t('auth.passwordsDontMatch'), [
				{ text: t('general.ok') },
			]);
			return;
		}

		if (password.length < 6) {
			Alert.alert(t('auth.error'), t('auth.passwordTooShort'), [
				{ text: t('general.ok') },
			]);
			return;
		}

		setIsLoading(true);

		// Simulate API call - replace with actual registration
		setTimeout(() => {
			// Mock successful registration
			const mockUser = {
				id: Date.now().toString(),
				email: email,
				username: name,
				createdAt: new Date().toISOString(),
				name: name,
				photo: '',
				googleId: '',
				token: 'mock-token-' + Date.now(),
				hasPassword: true,
				language: 'es_ES' as const,
			};

			login(mockUser);
			setIsLoading(false);
			router.replace('/profile');
		}, 1500);
	};

	const handleLogin = () => {
		router.back();
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={[styles.header, { paddingTop: insets.top }]}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={24} color={colors.primary} />
					</TouchableOpacity>
				</View>

				<View style={styles.content}>
					{/* Logo */}
					<Image
						source={require('@/assets/images/logo_small_primary.png')}
						style={styles.logo}
						resizeMode="contain"
					/>

					{/* Title */}
					<Text style={styles.title}>{t('auth.createAccount')}</Text>
					<Text style={styles.subtitle}>{t('auth.registerToContinue')}</Text>

					{/* Form */}
					<View style={styles.form}>
						{/* Name Input */}
						<View style={styles.inputContainer}>
							<Ionicons
								name="person-outline"
								size={20}
								color={colors.primaryLight}
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder={t('auth.fullName')}
								placeholderTextColor={colors.primaryLight}
								value={name}
								onChangeText={setName}
								autoCapitalize="words"
							/>
						</View>

						{/* Email Input */}
						<View style={styles.inputContainer}>
							<Ionicons
								name="mail-outline"
								size={20}
								color={colors.primaryLight}
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder={t('auth.email')}
								placeholderTextColor={colors.primaryLight}
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
							/>
						</View>

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<Ionicons
								name="lock-closed-outline"
								size={20}
								color={colors.primaryLight}
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder={t('auth.password')}
								placeholderTextColor={colors.primaryLight}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								onPress={() => setShowPassword(!showPassword)}
								style={styles.eyeButton}
							>
								<Ionicons
									name={showPassword ? 'eye-outline' : 'eye-off-outline'}
									size={20}
									color={colors.primaryLight}
								/>
							</TouchableOpacity>
						</View>

						{/* Confirm Password Input */}
						<View style={styles.inputContainer}>
							<Ionicons
								name="lock-closed-outline"
								size={20}
								color={colors.primaryLight}
								style={styles.inputIcon}
							/>
							<TextInput
								style={styles.input}
								placeholder={t('auth.confirmPassword')}
								placeholderTextColor={colors.primaryLight}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry={!showConfirmPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								style={styles.eyeButton}
							>
								<Ionicons
									name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
									size={20}
									color={colors.primaryLight}
								/>
							</TouchableOpacity>
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
								<Text style={styles.registerButtonText}>
									{t('auth.registering')}
								</Text>
							) : (
								<Text style={styles.registerButtonText}>
									{t('auth.register')}
								</Text>
							)}
						</TouchableOpacity>

						{/* Terms */}
						<Text style={styles.termsText}>{t('auth.byRegistering')}</Text>

						{/* Login Link */}
						<View style={styles.loginContainer}>
							<Text style={styles.loginText}>
								{t('auth.alreadyHaveAccount')}
							</Text>
							<TouchableOpacity onPress={handleLogin}>
								<Text style={styles.loginLink}>{t('auth.login')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		height: 60,
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 40,
		paddingTop: 20,
	},
	logo: {
		width: 60,
		height: 48,
		marginBottom: 30,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginBottom: 30,
	},
	form: {
		width: '100%',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		marginBottom: 16,
		paddingHorizontal: 16,
		height: 56,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
	},
	eyeButton: {
		padding: 8,
	},
	registerButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	registerButtonDisabled: {
		opacity: 0.7,
	},
	registerButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	termsText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 18,
	},
	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		marginBottom: 40,
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
