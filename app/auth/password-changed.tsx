import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordChangedScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	const handleGoToLogin = () => {
		router.replace('/auth/login');
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* Success Content */}
				<View style={styles.successContainer}>
					{/* Success Icon */}
					<View style={styles.successIconContainer}>
						<View style={styles.successIconCircle}>
							<Ionicons name="checkmark" size={60} color={colors.quaternary} />
						</View>
					</View>

					{/* Success Text */}
					<View style={styles.textContainer}>
						<Text style={styles.title}>{t('auth.passwordChangedTitle')}</Text>
						<Text style={styles.subtitle}>
							{t('auth.passwordChangedMessage')}
						</Text>
					</View>

					{/* Continue Button */}
					<TouchableOpacity
						style={styles.continueButton}
						onPress={handleGoToLogin}
						activeOpacity={0.8}
					>
						<Text style={styles.continueButtonText}>
							{t('auth.passwordChangedButton')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		justifyContent: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 60,
	},
	logo: {
		width: 100,
		height: 80,
		marginBottom: 5,
	},
	appName: {
		fontSize: 32,
		fontFamily: fonts.bold,
		color: colors.primary,
	},
	successContainer: {
		alignItems: 'center',
	},
	successIconContainer: {
		marginBottom: 40,
	},
	successIconCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: '#10B981',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#10B981',
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 12,
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 50,
	},
	title: {
		fontSize: 24,
		fontFamily: fonts.bold,
		color: colors.primary,
		marginBottom: 16,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: 20,
	},
	continueButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: 'center',
		shadowColor: colors.primary,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
		minWidth: 200,
		minHeight: 56,
		justifyContent: 'center',
	},
	continueButtonText: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.quaternary,
	},
});
