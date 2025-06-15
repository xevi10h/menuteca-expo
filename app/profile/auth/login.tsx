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

export default function LoginScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const login = useUserStore((state) => state.login);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert(t('auth.error'), t('auth.fillAllFields'), [
				{ text: t('general.ok') },
			]);
			return;
		}

		setIsLoading(true);

		// Simulate API call - replace with actual authentication
		setTimeout(() => {
			// Mock successful login
			const mockUser = {
				id: '1',
				email: email,
				username: email.split('@')[0],
				createdAt: new Date().toISOString(),
				name: email.split('@')[0],
				photo: '',
				googleId: '',
				token: 'mock-token-12345',
				hasPassword: true,
				language: 'es_ES' as const,
			};

			login(mockUser);
			setIsLoading(false);
			router.replace('/profile');
		}, 1500);
	};

	const handleRegister = () => {
		router.push('/profile/auth/register');
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
						<Ionicons name="close" size={24} color={colors.primary} />
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
					<Text style={styles.title}>{t('auth.welcomeBack')}</Text>
					<Text style={styles.subtitle}>{t('auth.loginToContinue')}</Text>

					{/* Form */}
					<View style={styles.form}>
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

						{/* Forgot Password */}
						<TouchableOpacity style={styles.forgotPassword}>
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
								<Text style={styles.loginButtonText}>
									{t('auth.loggingIn')}
								</Text>
							) : (
								<Text style={styles.loginButtonText}>{t('auth.login')}</Text>
							)}
						</TouchableOpacity>

						{/* Divider */}
						<View style={styles.divider}>
							<View style={styles.dividerLine} />
							<Text style={styles.dividerText}>{t('auth.or')}</Text>
							<View style={styles.dividerLine} />
						</View>

						{/* Social Login */}
						<TouchableOpacity style={styles.socialButton}>
							<Ionicons name="logo-google" size={20} color={colors.primary} />
							<Text style={styles.socialButtonText}>
								{t('auth.continueWithGoogle')}
							</Text>
						</TouchableOpacity>

						{/* Register Link */}
						<View style={styles.registerContainer}>
							<Text style={styles.registerText}>
								{t('auth.dontHaveAccount')}
							</Text>
							<TouchableOpacity onPress={handleRegister}>
								<Text style={styles.registerLink}>{t('auth.register')}</Text>
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
		paddingTop: 40,
	},
	logo: {
		width: 60,
		height: 48,
		marginBottom: 40,
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
		marginBottom: 40,
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
	forgotPassword: {
		alignSelf: 'flex-end',
		marginBottom: 24,
	},
	forgotPasswordText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	loginButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	loginButtonDisabled: {
		opacity: 0.7,
	},
	loginButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: colors.primaryLight,
		opacity: 0.3,
	},
	dividerText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginHorizontal: 16,
	},
	socialButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 25,
		paddingVertical: 16,
		marginBottom: 32,
		borderWidth: 1,
		borderColor: colors.primary,
		gap: 12,
	},
	socialButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
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
