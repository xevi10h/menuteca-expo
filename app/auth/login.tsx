import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
	const { t } = useTranslation();
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const setUser = useUserStore((state) => state.setUser);
	const insets = useSafeAreaInsets();

	const handleAuth = async () => {
		if (!email || !password) {
			Alert.alert(t('validation.error'), t('validation.completeAllFields'));
			return;
		}

		if (!isLogin && (!username || !name)) {
			Alert.alert(t('validation.error'), t('validation.completeAllFields'));
			return;
		}

		setLoading(true);

		try {
			// Aquí iría la lógica real de autenticación
			// Por ahora simulamos una respuesta exitosa
			await new Promise((resolve) => setTimeout(resolve, 1000));

			if (isLogin) {
				// Simular login exitoso
				const userData = {
					id: '123',
					email,
					username: email.split('@')[0],
					name: 'Usuario Test',
					token: 'fake-jwt-token',
					photo: '',
					googleId: '',
					hasPassword: true,
					language: 'es_ES' as Language,
					createdAt: new Date().toISOString(),
				};
				setUser(userData);
			} else {
				// Simular registro exitoso
				const userData = {
					id: '123',
					email,
					username,
					name,
					token: 'fake-jwt-token',
					photo: '',
					googleId: '',
					hasPassword: true,
					language: 'es_ES' as Language,
					createdAt: new Date().toISOString(),
				};
				setUser(userData);
			}

			router.replace('/profile');
		} catch (error) {
			Alert.alert(t('validation.error'), t('auth.errorOccurred'));
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<KeyboardAvoidingView
			style={[styles.container, { paddingTop: insets.top }]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>
					{isLogin ? t('auth.login') : t('auth.register')}
				</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.form}>
					<Text style={styles.title}>
						{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
					</Text>
					<Text style={styles.subtitle}>
						{isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
					</Text>

					{!isLogin && (
						<>
							<View style={styles.inputContainer}>
								<Text style={styles.label}>{t('auth.fullName')}</Text>
								<TextInput
									style={styles.input}
									value={name}
									onChangeText={setName}
									placeholder={t('auth.enterFullName')}
									placeholderTextColor={colors.primaryLight}
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>{t('auth.username')}</Text>
								<TextInput
									style={styles.input}
									value={username}
									onChangeText={setUsername}
									placeholder={t('auth.enterUsername')}
									placeholderTextColor={colors.primaryLight}
									autoCapitalize="none"
								/>
							</View>
						</>
					)}

					<View style={styles.inputContainer}>
						<Text style={styles.label}>{t('auth.email')}</Text>
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							placeholder={t('auth.enterEmail')}
							placeholderTextColor={colors.primaryLight}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.label}>{t('auth.password')}</Text>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							placeholder={t('auth.enterPassword')}
							placeholderTextColor={colors.primaryLight}
							secureTextEntry
						/>
					</View>

					<TouchableOpacity
						style={[styles.authButton, loading && styles.authButtonDisabled]}
						onPress={handleAuth}
						disabled={loading}
					>
						<Text style={styles.authButtonText}>
							{loading
								? t('auth.processing')
								: isLogin
								? t('auth.login')
								: t('auth.register')}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.switchModeButton}
						onPress={() => setIsLogin(!isLogin)}
					>
						<Text style={styles.switchModeText}>
							{isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
						</Text>
					</TouchableOpacity>
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
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
	},
	placeholder: {
		width: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	form: {
		paddingTop: 40,
		paddingBottom: 40,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 40,
		lineHeight: 22,
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
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
		paddingVertical: 15,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	authButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 20,
	},
	authButtonDisabled: {
		opacity: 0.6,
	},
	authButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	switchModeButton: {
		alignItems: 'center',
		paddingVertical: 12,
	},
	switchModeText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
