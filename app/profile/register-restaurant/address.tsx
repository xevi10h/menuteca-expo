import { colors } from '@/assets/styles/colors';
import AddressSearchInput from '@/components/restaurantCreation/AddressSearchInput';
import { useTranslation } from '@/hooks/useTranslation';
import { Address } from '@/shared/types';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function AddressScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
	const [additionalInfo, setAdditionalInfo] = useState('');
	const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false);
	const setRegisterRestaurantAddress = useRegisterRestaurantStore(
		(state) => state.setRegisterRestaurantAddress,
	);
	const currentAddress = useRegisterRestaurantStore(
		(state) => state.registerRestaurant.address,
	);
	const [isNextDisabled, setIsNextDisabled] = useState(true);

	const handleBack = () => {
		router.back();
	};

	const handleNext = () => {
		if (selectedAddress) {
			// Update the address with additional information if provided
			const finalAddress: Address = {
				...selectedAddress,
				additional_information: additionalInfo,
			};
			setRegisterRestaurantAddress(finalAddress);
		}
		router.push('/profile/register-restaurant/cuisine-types');
	};

	const handleSkip = () => {
		router.push('/profile/register-restaurant/cuisine-types');
	};

	const handleAddressSelected = (address: Address) => {
		setSelectedAddress(address);
		setHasSelectedSuggestion(true);
	};

	useEffect(() => {
		// Enable next button if we have a selected address
		if (selectedAddress) {
			setIsNextDisabled(false);
		} else {
			setIsNextDisabled(true);
		}
	}, [selectedAddress]);

	// Initialize with current address if exists
	useEffect(() => {
		if (currentAddress?.formatted_address) {
			setSelectedAddress(currentAddress);
			setAdditionalInfo(currentAddress.additional_information || '');
			setHasSelectedSuggestion(true);
		}
	}, [currentAddress]);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color={colors.secondary} />
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
					<Text style={styles.question}>{t('registerRestaurant.whereIs')}</Text>
				</View>

				<View style={styles.labelContainer}>
					<Text style={styles.label}>
						{t('registerRestaurant.addressSubtitle')}
					</Text>
				</View>

				{/* Address Search Input */}
				<AddressSearchInput
					onAddressSelected={handleAddressSelected}
					placeholder={t('registerRestaurant.addressPlaceholder')}
					initialValue={currentAddress?.formatted_address || ''}
				/>

				{/* Selected Address Preview */}
				{selectedAddress && (
					<View style={styles.previewContainer}>
						<Text style={styles.previewLabel}>
							{t('registerRestaurant.addressPreview')}
						</Text>
						<Text style={styles.previewText}>
							{selectedAddress.formatted_address}
							{additionalInfo ? `, ${additionalInfo}` : ''}
						</Text>
					</View>
				)}

				<TouchableOpacity onPress={handleSkip}>
					<Text style={styles.skipButtonText}>
						{t('registerRestaurant.configureLater')}
					</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={[
					styles.nextButton,
					{ bottom: insets.bottom + 40, opacity: isNextDisabled ? 0.5 : 1 },
				]}
				onPress={handleNext}
				disabled={isNextDisabled}
			>
				<Text style={styles.nextButtonText}>
					{t('registerRestaurant.stepIndicator.next2')}
				</Text>
			</TouchableOpacity>
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
	additionalInfoSection: {
		marginTop: 20,
		backgroundColor: colors.secondary,
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.secondary,
		borderLeftWidth: 4,
		borderLeftColor: colors.secondary,
		width: '100%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	additionalInfoLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 10,
	},
	additionalInfoInput: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	helperText: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 5,
		fontStyle: 'italic',
	},
	previewContainer: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		padding: 15,
		marginTop: 20,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: colors.secondary,
		borderLeftWidth: 4,
		borderLeftColor: colors.secondary,
		width: '100%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	previewLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 5,
	},
	previewText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
		lineHeight: 20,
		marginBottom: 5,
	},
	coordinatesText: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		fontStyle: 'italic',
	},
	skipButtonText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		marginTop: 20,
	},
	nextButton: {
		position: 'absolute',
		right: 40,
		bottom: 0,
	},
	nextButtonText: {
		color: colors.secondary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textAlign: 'center',
	},
});
