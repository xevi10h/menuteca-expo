import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HasMenuScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		router.push('/profile/register-restaurant/restaurant-name');
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="close" size={24} color={colors.secondary} />
				</TouchableOpacity>
			</View>
			<View style={styles.iconContainer}>
				<Image
					source={require('@/assets/images/background_cutlery.png')}
					style={styles.menuIcon}
					resizeMode="contain"
				/>
			</View>

			<View style={styles.content}>
				<Image
					source={require('@/assets/images/logo_small_secondary.png')}
					style={{ width: 36, height: 29, marginBottom: 5 }}
					resizeMode="contain"
				/>
				<View style={styles.questionContainer}>
					<Text style={styles.question}>
						{t('registerRestaurant.hasMenu')}
						<Text style={styles.questionMenu}>
							{t('registerRestaurant.questionMenu')}
						</Text>
					</Text>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[styles.button, styles.noButton]}
						onPress={handleBack}
					>
						<Text style={styles.noButtonText}>{t('general.no')}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.yesButton]}
						onPress={handleNext}
					>
						<Text style={styles.yesButtonText}>{t('general.yes')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary,
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
		position: 'absolute',
		top: height * 0.35,
		alignItems: 'center',
		paddingHorizontal: 40,
		justifyContent: 'center',
		marginBottom: 100,
	},
	iconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		width: '100%',
	},
	menuIcon: {
		width: width * 0.6,
	},
	questionContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	question: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.secondary,
		textAlign: 'center',
	},
	questionMenu: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.secondary,
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 20,
		marginTop: 40,
	},
	button: {
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 25,
		minWidth: 80,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	noButton: {
		backgroundColor: colors.primary,
		borderWidth: 1,
		borderColor: colors.secondary,
	},
	yesButton: {
		backgroundColor: colors.secondary,
	},
	noButtonText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		textAlign: 'center',
	},
	yesButtonText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		textAlign: 'center',
	},
});
