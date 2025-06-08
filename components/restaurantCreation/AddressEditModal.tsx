import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Address, createEmptyAddress, formatAddress } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useRef, useState } from 'react';
import {
	ActivityIndicator,
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
import HeaderModal from './HeaderModal';

// TODO: Add your Google Places API Key here
const GOOGLE_PLACES_API_KEY = 'AIzaSyBcxDX2wGSzlkbmVa83je1_hRqQEOMnC7Q';

interface AddressEditModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (address: Address) => void;
	initialAddress?: Address;
}

interface GooglePlacesPrediction {
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
		main_text_matched_substrings: {
			offset: number;
			length: number;
		}[];
	};
	types: string[];
}

interface GooglePlacesAutocompleteResponse {
	predictions: GooglePlacesPrediction[];
	status: string;
}

interface GooglePlaceDetailsResponse {
	result: {
		place_id: string;
		formatted_address: string;
		geometry: {
			location: {
				lat: number;
				lng: number;
			};
			viewport: {
				northeast: { lat: number; lng: number };
				southwest: { lat: number; lng: number };
			};
		};
		address_components: {
			long_name: string;
			short_name: string;
			types: string[];
		}[];
		name: string;
		types: string[];
	};
	status: string;
}

interface AddressSuggestion {
	id: string;
	description: string;
	mainText: string;
	subtitle: string;
	placeId: string;
}

export default function AddressEditModal({
	visible,
	onClose,
	onSave,
	initialAddress,
}: AddressEditModalProps) {
	const { t } = useTranslation();
	const [isManualMode, setIsManualMode] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [currentAddress, setCurrentAddress] = useState<Address>(
		createEmptyAddress(),
	);
	const [mapRef, setMapRef] = useState<MapView | null>(null);
	const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSearchRef = useRef<string>('');

	// Rate limiting simple
	const rateLimits = useRef<
		Map<string, { requests: number; resetTime: number }>
	>(new Map());

	const checkRateLimit = (
		apiName: string,
		maxRequests: number,
		windowMs: number,
	): boolean => {
		const now = Date.now();
		const current = rateLimits.current.get(apiName);

		if (!current || now > current.resetTime) {
			rateLimits.current.set(apiName, {
				requests: 1,
				resetTime: now + windowMs,
			});
			return true;
		}

		if (current.requests >= maxRequests) {
			return false;
		}

		current.requests++;
		return true;
	};

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

	// Google Places Autocomplete API
	const searchAddressesGoogle = async (
		query: string,
	): Promise<AddressSuggestion[]> => {
		// Evitar búsquedas duplicadas
		if (query === lastSearchRef.current) {
			return suggestions;
		}
		lastSearchRef.current = query;

		// Rate limiting for Google Places API
		if (!checkRateLimit('GOOGLE_PLACES', 30, 60 * 1000)) {
			console.warn('⚠️ Rate limit exceeded for Google Places API');
			return [];
		}

		const params = new URLSearchParams({
			input: query,
			key: GOOGLE_PLACES_API_KEY,
			types: 'address',
			components: 'country:es',
			language: 'es',
		});

		const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Google Places API error: ${response.status}`);
			}

			const data: GooglePlacesAutocompleteResponse = await response.json();

			if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
				console.error('Google Places API error:', data.status);
				return [];
			}

			const processedResults: AddressSuggestion[] = data.predictions
				.map((prediction: GooglePlacesPrediction) => {
					return {
						id: prediction.place_id,
						description: prediction.description,
						mainText: prediction.structured_formatting.main_text,
						subtitle: prediction.structured_formatting.secondary_text || '',
						placeId: prediction.place_id,
					};
				})
				.slice(0, 5);

			return processedResults;
		} catch (error) {
			console.error('❌ Error searching addresses with Google Places:', error);
			return [];
		}
	};

	// Google Places Details API
	const getPlaceDetails = async (placeId: string): Promise<Address | null> => {
		const params = new URLSearchParams({
			place_id: placeId,
			key: GOOGLE_PLACES_API_KEY,
			fields: 'geometry,address_components,formatted_address',
			language: 'es',
		});

		const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Google Places Details API error: ${response.status}`);
			}

			const data: GooglePlaceDetailsResponse = await response.json();

			if (data.status !== 'OK') {
				console.error('Google Places Details API error:', data.status);
				return null;
			}

			const result = data.result;

			// Extract coordinates
			const coordinates = {
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
			};

			// Parse address components
			const addressComponents = parseGoogleAddressComponents(
				result.address_components,
			);

			return {
				...addressComponents,
				coordinates,
				formattedAddress: result.formatted_address,
			};
		} catch (error) {
			console.error('❌ Error getting place details:', error);
			return null;
		}
	};

	// Parse Google address components to our format
	const parseGoogleAddressComponents = (
		components: {
			long_name: string;
			short_name: string;
			types: string[];
		}[],
	): Omit<Address, 'coordinates'> => {
		const result: Omit<Address, 'coordinates'> = {
			street: '',
			number: '',
			additionalInformation: '',
			postalCode: '',
			city: '',
			country: '',
		};

		components.forEach((component) => {
			const types = component.types;

			if (types.includes('street_number')) {
				result.number = component.long_name;
			} else if (types.includes('route')) {
				result.street = component.long_name;
			} else if (
				types.includes('locality') ||
				types.includes('administrative_area_level_3')
			) {
				result.city = component.long_name;
			} else if (types.includes('postal_code')) {
				result.postalCode = component.long_name;
			} else if (types.includes('country')) {
				result.country = component.long_name;
			}
		});

		return result;
	};

	// Función principal de búsqueda
	const searchAddresses = useCallback(async (query: string) => {
		if (query.length < 3) {
			setSuggestions([]);
			return;
		}

		setIsSearching(true);

		try {
			const results = await searchAddressesGoogle(query);
			setSuggestions(results);
		} catch (error) {
			console.error('Search failed:', error);
			setSuggestions([]);
		} finally {
			setIsSearching(false);
		}
	}, []);

	React.useEffect(() => {
		if (visible) {
			if (initialAddress) {
				setCurrentAddress(initialAddress);
				setSearchQuery(
					initialAddress.formattedAddress || formatAddress(initialAddress),
				);
			} else {
				resetForm();
			}
		}
	}, [visible, initialAddress]);

	const resetForm = () => {
		setSearchQuery('');
		setSuggestions([]);
		setCurrentAddress(createEmptyAddress());
		setIsManualMode(false);
		setHasSelectedSuggestion(false);
		lastSearchRef.current = '';
	};

	const handleSearchInputChange = (text: string) => {
		setSearchQuery(text);
		setHasSelectedSuggestion(false);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			searchAddresses(text);
		}, 500);
	};

	const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
		setIsSearching(true);

		// Get detailed information about the selected place
		const addressDetails = await getPlaceDetails(suggestion.placeId);

		if (addressDetails) {
			setCurrentAddress(addressDetails);
			setSearchQuery(addressDetails.formattedAddress || suggestion.description);
			setSuggestions([]);
			setHasSelectedSuggestion(true);

			// Center map on coordinates
			centerMapOnCoordinates(
				addressDetails.coordinates.latitude,
				addressDetails.coordinates.longitude,
			);
		} else {
			// Fallback to basic suggestion info
			setSearchQuery(suggestion.description);
			setSuggestions([]);
			setHasSelectedSuggestion(true);
		}

		setIsSearching(false);
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

				setSearchQuery(formattedAddress);
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
			setSearchQuery(formatted);
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

	const renderSuggestion = (item: AddressSuggestion) => (
		<TouchableOpacity
			key={item.id}
			style={styles.enhancedSuggestionItem}
			onPress={() => handleSuggestionSelect(item)}
		>
			<View style={styles.suggestionIcon}>
				<Ionicons name="location-outline" size={16} color={colors.primary} />
			</View>
			<View style={styles.suggestionContent}>
				<Text style={styles.suggestionMainText} numberOfLines={1}>
					{item.mainText}
				</Text>
				{item.subtitle && (
					<Text style={styles.suggestionSubtitle} numberOfLines={1}>
						{item.subtitle}
					</Text>
				)}
			</View>
			<View style={styles.relevanceIndicator}>
				<Ionicons name="business" size={12} color={colors.primary} />
			</View>
		</TouchableOpacity>
	);

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
							<View style={styles.searchContainer}>
								<TextInput
									style={styles.searchInput}
									placeholder={t('registerRestaurant.searchAddressPlaceholder')}
									value={searchQuery}
									onChangeText={handleSearchInputChange}
								/>
								{isSearching && (
									<ActivityIndicator
										size="small"
										color={colors.primary}
										style={styles.searchLoader}
									/>
								)}
							</View>

							{/* Suggestions */}
							{suggestions.length > 0 && (
								<View style={styles.suggestionsContainer}>
									<ScrollView
										style={styles.suggestionsScrollView}
										showsVerticalScrollIndicator={true}
										nestedScrollEnabled={true}
									>
										{suggestions.map(renderSuggestion)}
									</ScrollView>
								</View>
							)}

							{/* Additional Information Field - IMPROVEMENT */}
							{hasSelectedSuggestion && (
								<View style={styles.additionalInfoSection}>
									<Text style={styles.label}>
										{t('registerRestaurant.additionalNumber')} (opcional)
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
									<Text style={styles.helperText}>
										Añade información como piso, puerta, local, etc.
									</Text>
								</View>
							)}

							{/* No results message */}
							{!isSearching &&
								!hasSelectedSuggestion &&
								searchQuery.length >= 3 &&
								suggestions.length === 0 && (
									<View style={styles.noResultsContainer}>
										<Ionicons
											name="search-outline"
											size={24}
											color={colors.primaryLight}
										/>
										<Text style={styles.noResultsText}>
											{t('registerRestaurant.noResultsFound', {
												query: searchQuery,
											})}
										</Text>
										<Text style={styles.noResultsSubtext}>
											{t('registerRestaurant.noResultsSubtext')}
										</Text>
									</View>
								)}
						</>
					) : (
						<>
							{/* Manual Mode */}
							<Text style={styles.label}>
								{t('registerRestaurant.manualAddressEntry')}
							</Text>

							<View style={styles.manualForm}>
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
								description={searchQuery}
							/>
						)}
					</MapView>

					{/* Preview */}
					{searchQuery && (
						<View style={styles.previewContainer}>
							<Text style={styles.previewLabel}>
								{t('registerRestaurant.addressPreview')}
							</Text>
							<Text style={styles.previewText}>
								{currentAddress.formattedAddress ||
									formatAddress(currentAddress)}
							</Text>
							{(currentAddress.coordinates.latitude !== 0 ||
								currentAddress.coordinates.longitude !== 0) && (
								<Text style={styles.coordinatesText}>
									📍 {currentAddress.coordinates.latitude.toFixed(6)},{' '}
									{currentAddress.coordinates.longitude.toFixed(6)}
								</Text>
							)}
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
	},
	searchContainer: {
		position: 'relative',
		marginBottom: 10,
	},
	searchInput: {
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
	searchLoader: {
		position: 'absolute',
		right: 15,
		top: 15,
	},
	suggestionsContainer: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		marginBottom: 20,
		maxHeight: 250,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	suggestionsScrollView: {
		maxHeight: 250,
	},
	enhancedSuggestionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
		minHeight: 60,
	},
	suggestionIcon: {
		marginRight: 12,
		width: 24,
		alignItems: 'center',
	},
	suggestionContent: {
		flex: 1,
		marginRight: 8,
	},
	suggestionMainText: {
		fontSize: 15,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 2,
	},
	suggestionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		lineHeight: 16,
	},
	relevanceIndicator: {
		backgroundColor: colors.quaternary,
		borderRadius: 10,
		padding: 4,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	// NEW: Additional Information Section
	additionalInfoSection: {
		marginBottom: 20,
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
	noResultsContainer: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	noResultsText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 5,
	},
	noResultsSubtext: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
	},
	manualForm: {
		marginBottom: 20,
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
