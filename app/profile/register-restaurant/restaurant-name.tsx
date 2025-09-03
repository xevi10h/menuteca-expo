import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function RestaurantNameScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [restaurant_name, setRestaurantName] = useState('');
	const [isNextDisabled, setIsNextDisabled] = useState(true);
	const setRegisterRestaurantName = useRegisterRestaurantStore(
		(state) => state.setRegisterRestaurantName,
	);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		setRegisterRestaurantName(restaurant_name);
		router.push('/profile/register-restaurant/address');
	};

	useEffect(() => {
		if (restaurant_name.trim().length > 0) {
			setIsNextDisabled(false);
		} else {
			setIsNextDisabled(true);
		}
	}, [restaurant_name]);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={20} color={colors.secondary} />
				</TouchableOpacity>
				<TouchableOpacity
					onPress={handleNext}
					style={styles.nextButton}
					disabled={isNextDisabled}
				>
					<Text
						disabled={isNextDisabled}
						style={[
							styles.nextButtonText,
							{ opacity: isNextDisabled ? 0.5 : 1 },
						]}
					>
						{t('registerRestaurant.stepIndicator.next1')}
					</Text>
					<Ionicons
						name="chevron-forward"
						size={20}
						color={colors.secondary}
						style={{ opacity: isNextDisabled ? 0.5 : 1 }}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.iconContainer}>
				<Image
					source={require('@/assets/images/background_cutlery.png')}
					style={styles.backgroundIcon}
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
						{t('registerRestaurant.restaurant_name')}
					</Text>
				</View>
				<View style={styles.labelContainer}>
					<Text style={styles.label}>
						{t('registerRestaurant.restaurantNameSubtitle')}
					</Text>
				</View>
				<TextInput
					style={styles.textInput}
					placeholder={t('registerRestaurant.restaurantNamePlaceholder')}
					placeholderTextColor={colors.primaryLight}
					value={restaurant_name}
					onChangeText={setRestaurantName}
				/>
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
		paddingHorizontal: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	nextButton: {
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	nextButtonText: {
		color: colors.secondary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textAlign: 'center',
	},
	content: {
		flex: 1,
		position: 'absolute',
		top: height * 0.3,
		alignItems: 'center',
		paddingHorizontal: 40,
		justifyContent: 'center',
		marginBottom: 100,
		width: '100%',
	},
	iconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		width: '100%',
		marginTop: -height * 0.05,
	},
	backgroundIcon: {
		width: width * 0.7,
	},
	questionContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 40,
	},
	question: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.secondary,
		textAlign: 'center',
	},
	labelContainer: {
		width: '100%',
		alignItems: 'flex-start',
		marginBottom: 10,
	},
	label: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.secondary,
	},
	textInput: {
		width: '100%',
		height: 50,
		backgroundColor: colors.secondary,
		borderRadius: 12,
		paddingHorizontal: 20,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		marginBottom: 40,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
});
