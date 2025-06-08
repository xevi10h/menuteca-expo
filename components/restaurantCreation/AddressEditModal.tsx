import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
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

interface AddressEditModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (
		address: string,
		coordinates?: { latitude: number; longitude: number },
		addressComponents?: AddressComponents,
	) => void;
	initialAddress?: string;
	initialCoordinates?: { latitude: number; longitude: number };
}

interface AddressComponents {
	street: string;
	number: string;
	additionalNumber: string;
	city: string;
	postalCode: string;
	country: string;
}

interface AddressSuggestion {
	id: string;
	description: string;
	placeId?: string;
	coordinates?: { latitude: number; longitude: number };
	subtitle?: string;
	addressComponents?: AddressComponents;
	importance?: number;
	addressType?: string;
}

interface NominatimResult {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
	class: string;
	type: string;
	importance: number;
	name?: string;
	addresstype: string;
	place_rank: number;
	address: {
		road?: string;
		house_number?: string;
		postcode?: string;
		city?: string;
		town?: string;
		village?: string;
		hamlet?: string;
		neighbourhood?: string;
		suburb?: string;
		city_district?: string;
		county?: string;
		province?: string;
		state?: string;
		country?: string;
		country_code?: string;
		residential?: string;
		[key: string]: string | undefined;
	};
}

const defaultAddressComponents: AddressComponents = {
	street: '',
	number: '',
	additionalNumber: '',
	city: '',
	postalCode: '',
	country: '',
};

export default function AddressEditModal({
	visible,
	onClose,
	onSave,
	initialAddress = '',
	initialCoordinates,
}: AddressEditModalProps) {
	const { t } = useTranslation();
	const [isManualMode, setIsManualMode] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [addressComponents, setAddressComponents] = useState<AddressComponents>(
		defaultAddressComponents,
	);
	const [selectedCoordinates, setSelectedCoordinates] = useState<{
		latitude: number;
		longitude: number;
	} | null>(initialCoordinates || null);
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

	// Función para obtener la ciudad principal de un resultado de Nominatim
	const getPrimaryCity = (address: NominatimResult['address']): string => {
		return (
			address.city ||
			address.town ||
			address.village ||
			address.hamlet ||
			address.residential ||
			address.neighbourhood ||
			address.suburb ||
			''
		);
	};

	// Función para formatear la dirección de manera legible
	const formatNominatimAddress = (
		result: NominatimResult,
	): {
		mainText: string;
		subtitle: string;
		components: AddressComponents;
	} => {
		const { address } = result;
		const road = address.road || result.name || '';
		const houseNumber = address.house_number || '';
		const city = getPrimaryCity(address);
		const province = address.province || address.county || '';
		const postcode = address.postcode || '';
		const country = address.country || '';

		// Construir texto principal (calle + número si existe)
		let mainText = road;
		if (houseNumber) {
			mainText += ` ${houseNumber}`;
		}

		// Construir subtítulo con contexto geográfico
		const subtitleParts = [];

		if (city && city !== road) {
			subtitleParts.push(city);
		}

		if (address.city_district && address.city_district !== city) {
			subtitleParts.push(address.city_district);
		}

		if (province && province !== city) {
			subtitleParts.push(province);
		}

		if (postcode) {
			subtitleParts.push(postcode);
		}

		const subtitle = subtitleParts.join(', ');

		// Crear componentes estructurados
		const components: AddressComponents = {
			street: road,
			number: houseNumber,
			additionalNumber: '',
			city: city,
			postalCode: postcode,
			country: country,
		};

		return { mainText, subtitle, components };
	};

	// Función para determinar la relevancia de un resultado
	const calculateRelevance = (
		result: NominatimResult,
		query: string,
	): number => {
		let score = result.importance || 0;

		// Bonus por coincidencia exacta en el nombre
		if (
			result.name &&
			result.name.toLowerCase().includes(query.toLowerCase())
		) {
			score += 0.1;
		}

		// Bonus por tener número de casa
		if (result.address.house_number) {
			score += 0.05;
		}

		// Bonus por ser una carretera/calle
		if (result.addresstype === 'road' || result.class === 'highway') {
			score += 0.02;
		}

		// Penalty por resultados muy específicos (como amenities)
		if (result.class === 'amenity' || result.class === 'shop') {
			score -= 0.1;
		}

		return score;
	};

	// Función principal de búsqueda con Nominatim optimizada
	const searchAddressesNominatim = async (
		query: string,
	): Promise<AddressSuggestion[]> => {
		// Evitar búsquedas duplicadas
		if (query === lastSearchRef.current) {
			return suggestions;
		}
		lastSearchRef.current = query;

		// Rate limiting para Nominatim (1/second, 1000/day)
		if (!checkRateLimit('NOMINATIM', 45, 60 * 1000)) {
			console.warn('⚠️ Rate limit exceeded for Nominatim API');
			return [];
		}

		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
			query,
		)}&countrycodes=es&limit=8&addressdetails=1&extratags=1&namedetails=1`;

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Menuteca-App/1.0 (contact@menuteca.com)',
					'Accept-Language': 'es,ca,en',
				},
			});

			if (!response.ok) {
				throw new Error(`Nominatim API error: ${response.status}`);
			}

			const data: NominatimResult[] = await response.json();

			console.log('📍 Nominatim found:', data.length, 'results for:', query);

			// Procesar y mejorar los resultados
			const processedResults = data
				.map((item: NominatimResult) => {
					const { mainText, subtitle, components } =
						formatNominatimAddress(item);
					const relevance = calculateRelevance(item, query);

					return {
						id: item.place_id.toString(),
						description: mainText,
						subtitle: subtitle,
						coordinates: {
							latitude: parseFloat(item.lat),
							longitude: parseFloat(item.lon),
						},
						addressComponents: components,
						importance: relevance,
						addressType: item.addresstype,
					} as AddressSuggestion;
				})
				// Filtrar resultados duplicados o muy similares
				.filter((item, index, array) => {
					return (
						array.findIndex(
							(other) =>
								other.description.toLowerCase() ===
									item.description.toLowerCase() &&
								other.subtitle === item.subtitle,
						) === index
					);
				})
				// Ordenar por relevancia
				.sort((a, b) => (b.importance || 0) - (a.importance || 0))
				// Limitar a 5 resultados
				.slice(0, 5);

			console.log('✅ Processed to:', processedResults.length, 'suggestions');
			return processedResults;
		} catch (error) {
			console.error('❌ Error searching addresses with Nominatim:', error);
			return [];
		}
	};

	// Función principal de búsqueda
	const searchAddresses = useCallback(async (query: string) => {
		if (query.length < 3) {
			setSuggestions([]);
			return;
		}

		setIsSearching(true);

		try {
			const results = await searchAddressesNominatim(query);
			setSuggestions(results);
		} catch (error) {
			console.error('Search failed:', error);
			setSuggestions([]);
		} finally {
			setIsSearching(false);
		}
	}, []);

	// Parsear dirección inicial
	const parseAddressToComponents = (
		addressString: string,
	): AddressComponents => {
		const parts = addressString.split(',').map((part) => part.trim());
		const streetPart = parts[0] || '';
		const streetMatch = streetPart.match(/^(.+?)(?:\s+(\d+\w*))?$/);

		return {
			street: streetMatch?.[1] || streetPart,
			number: streetMatch?.[2] || '',
			additionalNumber: '',
			city: parts[1] || '',
			postalCode: parts.find((part) => /^\d{5}$/.test(part)) || '',
			country: parts[parts.length - 1] || 'España',
		};
	};

	React.useEffect(() => {
		if (visible) {
			if (initialAddress) {
				setSearchQuery(initialAddress);
				setAddressComponents(parseAddressToComponents(initialAddress));
			} else {
				resetForm();
			}
			setSelectedCoordinates(initialCoordinates || null);
		}
	}, [visible, initialAddress, initialCoordinates]);

	const resetForm = () => {
		setSearchQuery('');
		setSuggestions([]);
		setAddressComponents(defaultAddressComponents);
		setSelectedCoordinates(null);
		setIsManualMode(false);
		setHasSelectedSuggestion(false);
		lastSearchRef.current = '';
	};

	const handleSearchInputChange = (text: string) => {
		setSearchQuery(text);
		setHasSelectedSuggestion(false); // Reset cuando el usuario escribe

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			searchAddresses(text);
		}, 500);
	};

	const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
		// Construir dirección completa
		const fullAddress = suggestion.subtitle
			? `${suggestion.description}, ${suggestion.subtitle}`
			: suggestion.description;

		setSearchQuery(fullAddress);
		setSuggestions([]);
		setHasSelectedSuggestion(true); // Marcar que se ha seleccionado una sugerencia

		if (suggestion.coordinates) {
			setSelectedCoordinates(suggestion.coordinates);
			// Centrar el mapa en las coordenadas seleccionadas
			centerMapOnCoordinates(
				suggestion.coordinates.latitude,
				suggestion.coordinates.longitude,
			);
		}

		// Usar los componentes ya parseados si están disponibles
		if (suggestion.addressComponents) {
			setAddressComponents(suggestion.addressComponents);
		} else {
			// Fallback al parsing básico
			const components = parseAddressToComponents(fullAddress);
			setAddressComponents(components);
		}
	};

	const handleMapPress = async (event: any) => {
		const { latitude, longitude } = event.nativeEvent.coordinate;
		setSelectedCoordinates({ latitude, longitude });

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

				setAddressComponents({
					street: address.street || '',
					number: address.streetNumber || '',
					additionalNumber: '',
					city: address.city || '',
					postalCode: address.postalCode || '',
					country: address.country || '',
				});
			}
		} catch (error) {
			console.error('Error reverse geocoding:', error);
		}
	};

	const updateAddressComponent = (
		key: keyof AddressComponents,
		value: string,
	) => {
		setAddressComponents((prev) => ({ ...prev, [key]: value }));

		const components = { ...addressComponents, [key]: value };
		const manualAddress = buildAddressFromComponents(components);
		setSearchQuery(manualAddress);
	};

	const buildAddressFromComponents = (
		components: AddressComponents,
	): string => {
		const parts = [];

		if (components.street) {
			let streetPart = components.street;
			if (components.number) {
				streetPart += ` ${components.number}`;
			}
			if (components.additionalNumber) {
				streetPart += ` ${components.additionalNumber}`;
			}
			parts.push(streetPart);
		}

		if (components.city) parts.push(components.city);
		if (components.postalCode) parts.push(components.postalCode);
		if (components.country) parts.push(components.country);

		return parts.join(', ');
	};

	const handleSave = () => {
		const finalAddress = isManualMode
			? buildAddressFromComponents(addressComponents)
			: searchQuery;

		if (!finalAddress.trim()) {
			Alert.alert(
				t('registerRestaurant.error'),
				t('registerRestaurant.addressRequired'),
			);
			return;
		}

		onSave(finalAddress, selectedCoordinates || undefined, addressComponents);
		onClose();
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
		<TouchableOpacity
			style={styles.enhancedSuggestionItem}
			onPress={() => handleSuggestionSelect(item)}
		>
			<View style={styles.suggestionIcon}>
				<Ionicons
					name={
						item.addressType === 'road'
							? 'location-outline'
							: 'business-outline'
					}
					size={16}
					color={colors.primary}
				/>
			</View>
			<View style={styles.suggestionContent}>
				<Text style={styles.suggestionMainText} numberOfLines={1}>
					{item.description}
				</Text>
				{item.subtitle && (
					<Text style={styles.suggestionSubtitle} numberOfLines={1}>
						{item.subtitle}
					</Text>
				)}
			</View>
			{item.importance && item.importance > 0.1 && (
				<View style={styles.relevanceIndicator}>
					<Ionicons name="star" size={12} color={colors.primary} />
				</View>
			)}
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
									<FlatList
										data={suggestions}
										renderItem={renderSuggestion}
										keyExtractor={(item) => item.id}
										scrollEnabled={true}
										nestedScrollEnabled={true}
										showsVerticalScrollIndicator={true}
									/>
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
											value={addressComponents.street}
											onChangeText={(text) =>
												updateAddressComponent('street', text)
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
											value={addressComponents.number}
											onChangeText={(text) =>
												updateAddressComponent('number', text)
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
										value={addressComponents.additionalNumber}
										onChangeText={(text) =>
											updateAddressComponent('additionalNumber', text)
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
											value={addressComponents.city}
											onChangeText={(text) =>
												updateAddressComponent('city', text)
											}
										/>
									</View>
									<View style={[styles.inputContainer, { flex: 1 }]}>
										<Text style={styles.inputLabel}>
											{t('registerRestaurant.postalCode')}
										</Text>
										<TextInput
											style={styles.input}
											placeholder="08001"
											value={addressComponents.postalCode}
											onChangeText={(text) =>
												updateAddressComponent('postalCode', text)
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
										value={addressComponents.country}
										onChangeText={(text) =>
											updateAddressComponent('country', text)
										}
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
							latitude:
								selectedCoordinates?.latitude ||
								initialCoordinates?.latitude ||
								41.3851,
							longitude:
								selectedCoordinates?.longitude ||
								initialCoordinates?.longitude ||
								2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
						onPress={handleMapPress}
					>
						{selectedCoordinates && (
							<Marker
								coordinate={selectedCoordinates}
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
							<Text style={styles.previewText}>{searchQuery}</Text>
							{selectedCoordinates && (
								<Text style={styles.coordinatesText}>
									📍 {selectedCoordinates.latitude.toFixed(6)},{' '}
									{selectedCoordinates.longitude.toFixed(6)}
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
