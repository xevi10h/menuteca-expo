import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Address, createEmptyAddress, formatAddress } from '@/shared/types';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AddressSearchInput from './AddressSearchInput';
import HeaderModal from './HeaderModal';

interface AddressEditModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (address: Address) => void;
	initialAddress?: Address;
}

export default function AddressEditModal({
	visible,
	onClose,
	onSave,
	initialAddress,
}: AddressEditModalProps) {
	const { t } = useTranslation();
	const [isManualMode, setIsManualMode] = useState(false);
	const [currentAddress, setCurrentAddress] = useState<Address>(
		createEmptyAddress(),
	);
	const [mapRef, setMapRef] = useState<MapView | null>(null);
	const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false);

	// Centrar mapa en coordenadas
	const centerMapOnCoordinates = (latitude: number, longitude: number) => {
		if (mapRef) {
			mapRef.animateToRegion(
				{
					latitude,
					longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				},
				1000,
			);
		}
	};

	React.useEffect(() => {
		if (visible) {
			if (initialAddress) {
				setCurrentAddress(initialAddress);
				setHasSelectedSuggestion(!!initialAddress.formattedAddress);
			} else {
				resetForm();
			}
		}
	}, [visible, initialAddress]);

	const resetForm = () => {
		setCurrentAddress(createEmptyAddress());
		setIsManualMode(false);
		setHasSelectedSuggestion(false);
	};

	const handleAddressSelected = (address: Address) => {
		setCurrentAddress(address);
		setHasSelectedSuggestion(true);

		// Center map on coordinates
		if (address.coordinates.latitude && address.coordinates.longitude) {
			centerMapOnCoordinates(
				address.coordinates.latitude,
				address.coordinates.longitude,
			);
		}
	};

	const handleMapPress = async (event: any) => {
		const { latitude, longitude } = event.nativeEvent.coordinate;

		// Update coordinates
		setCurrentAddress((prev) => ({
			...prev,
			coordinates: { latitude, longitude },
		}));

		try {
			const addresses = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			});
			if (addresses.length > 0) {
				const address = addresses[0];
				const formattedAddress = `${address.street || ''} ${
					address.streetNumber || ''
				}, ${address.city || ''}, ${address.country || ''}`.trim();

				setCurrentAddress((prev) => ({
					...prev,
					street: address.street || '',
					number: address.streetNumber || '',
					city: address.city || '',
					postalCode: address.postalCode || '',
					country: address.country || '',
					formattedAddress: formattedAddress,
				}));
			}
		} catch (error) {
			console.error('Error reverse geocoding:', error);
		}
	};

	const updateAddressField = (
		field: keyof Omit<Address, 'coordinates'>,
		value: string,
	) => {
		setCurrentAddress((prev) => {
			const updated = { ...prev, [field]: value };
			const formatted = formatAddress(updated);
			return {
				...updated,
				formattedAddress: formatted,
			};
		});
	};

	const handleSave = () => {
		// Validate address
		const hasRequiredFields =
			currentAddress.street ||
			currentAddress.city ||
			currentAddress.formattedAddress;

		if (!hasRequiredFields) {
			Alert.alert(
				t('registerRestaurant.error'),
				t('registerRestaurant.addressRequired'),
			);
			return;
		}

		// Ensure formatted address is up to date
		const finalAddress: Address = {
			...currentAddress,
			formattedAddress:
				currentAddress.formattedAddress || formatAddress(currentAddress),
		};

		onSave(finalAddress);
		onClose();
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<HeaderModal
					title={t('registerRestaurant.editAddress')}
					handleClose={handleCancel}
					handleSave={handleSave}
					hasBorderBottom={true}
				/>

				<ScrollView
					style={styles.modalContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Mode Toggle */}
					<View style={styles.modeToggle}>
						<TouchableOpacity
							style={[
								styles.modeButton,
								!isManualMode && styles.modeButtonActive,
							]}
							onPress={() => setIsManualMode(false)}
						>
							<Text
								style={[
									styles.modeButtonText,
									!isManualMode && styles.modeButtonTextActive,
								]}
							>
								{t('registerRestaurant.searchMode')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.modeButton,
								isManualMode && styles.modeButtonActive,
							]}
							onPress={() => setIsManualMode(true)}
						>
							<Text
								style={[
									styles.modeButtonText,
									isManualMode && styles.modeButtonTextActive,
								]}
							>
								{t('registerRestaurant.manualMode')}
							</Text>
						</TouchableOpacity>
					</View>

					{!isManualMode ? (
						<>
							{/* Search Mode */}
							<Text style={styles.label}>
								{t('registerRestaurant.searchAddress')}
							</Text>
							<AddressSearchInput
								onAddressSelected={handleAddressSelected}
								placeholder={t('registerRestaurant.searchAddressPlaceholder')}
								initialValue={currentAddress.formattedAddress || ''}
							/>
						</>
					) : (
						<>
							{/* Manual Mode */}
							<Text style={styles.label}>
								{t('registerRestaurant.manualAddressEntry')}
							</Text>

							<View>
								<View style={styles.row}>
									<View style={[styles.inputContainer, { flex: 2 }]}>
										<Text style={styles.inputLabel}>
											{t('registerRestaurant.street')}
										</Text>
										<TextInput
											style={styles.input}
											placeholder={t('registerRestaurant.streetPlaceholder')}
											value={currentAddress.street}
											onChangeText={(text) =>
												updateAddressField('street', text)
											}
										/>
									</View>
									<View style={[styles.inputContainer, { flex: 1 }]}>
										<Text style={styles.inputLabel}>
											{t('registerRestaurant.number')}
										</Text>
										<TextInput
											style={styles.input}
											placeholder="123"
											value={currentAddress.number}
											onChangeText={(text) =>
												updateAddressField('number', text)
											}
										/>
									</View>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>
										{t('registerRestaurant.additionalNumber')}
									</Text>
									<TextInput
										style={styles.input}
										placeholder={t(
											'registerRestaurant.additionalNumberPlaceholder',
										)}
										value={currentAddress.additionalInformation}
										onChangeText={(text) =>
											updateAddressField('additionalInformation', text)
										}
									/>
								</View>

								<View style={styles.row}>
									<View style={[styles.inputContainer, { flex: 2 }]}>
										<Text style={styles.inputLabel}>
											{t('registerRestaurant.city')}
										</Text>
										<TextInput
											style={styles.input}
											placeholder={t('registerRestaurant.cityPlaceholder')}
											value={currentAddress.city}
											onChangeText={(text) => updateAddressField('city', text)}
										/>
									</View>
									<View style={[styles.inputContainer, { flex: 1 }]}>
										<Text style={styles.inputLabel}>
											{t('registerRestaurant.postalCode')}
										</Text>
										<TextInput
											style={styles.input}
											placeholder="08001"
											value={currentAddress.postalCode}
											onChangeText={(text) =>
												updateAddressField('postalCode', text)
											}
										/>
									</View>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>
										{t('registerRestaurant.country')}
									</Text>
									<TextInput
										style={styles.input}
										placeholder={t('registerRestaurant.countryPlaceholder')}
										value={currentAddress.country}
										onChangeText={(text) => updateAddressField('country', text)}
									/>
								</View>
							</View>
						</>
					)}

					{/* Map */}
					<Text style={styles.label}>
						{t('registerRestaurant.mapTapInstruction')}
					</Text>
					<MapView
						ref={setMapRef}
						style={styles.fullMap}
						initialRegion={{
							latitude: currentAddress.coordinates.latitude || 41.3851,
							longitude: currentAddress.coordinates.longitude || 2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
						onPress={handleMapPress}
					>
						{(currentAddress.coordinates.latitude !== 0 ||
							currentAddress.coordinates.longitude !== 0) && (
							<Marker
								coordinate={currentAddress.coordinates}
								title={t('registerRestaurant.selectedLocation')}
								description={
									currentAddress.formattedAddress ||
									formatAddress(currentAddress)
								}
							/>
						)}
					</MapView>

					{/* Preview */}
					{(currentAddress.formattedAddress || currentAddress.street) && (
						<View style={styles.previewContainer}>
							<Text style={styles.previewLabel}>
								{t('registerRestaurant.addressPreview')}
							</Text>
							<Text style={styles.previewText}>
								{currentAddress.formattedAddress ||
									formatAddress(currentAddress)}
							</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	modeToggle: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		padding: 2,
		marginBottom: 20,
	},
	modeButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		borderRadius: 6,
	},
	modeButtonActive: {
		backgroundColor: colors.primary,
	},
	modeButtonText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	modeButtonTextActive: {
		color: colors.quaternary,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 10,
		marginTop: 10,
	},
	additionalInfoSection: {
		marginTop: 20,
		backgroundColor: colors.quaternary,
		padding: 15,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	helperText: {
		fontSize: 11,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 5,
		fontStyle: 'italic',
	},

	row: {
		flexDirection: 'row',
		gap: 10,
	},
	inputContainer: {
		marginBottom: 15,
	},
	inputLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 5,
	},
	input: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	fullMap: {
		height: 200,
		borderRadius: 10,
		marginBottom: 20,
		overflow: 'hidden',
	},
	previewContainer: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		padding: 15,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: colors.primary,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
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
});
