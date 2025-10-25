import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Address, createEmptyAddress } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

// TODO: Add your Google Places API Key here
const GOOGLE_PLACES_API_KEY = 'AIzaSyBcxDX2wGSzlkbmVa83je1_hRqQEOMnC7Q';

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

interface AddressSearchInputProps {
	onAddressSelected: (address: Address) => void;
	placeholder?: string;
	initialValue?: string;
}

export default function AddressSearchInput({
	onAddressSelected,
	placeholder,
	initialValue = '',
}: AddressSearchInputProps) {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState(initialValue);
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSearchRef = useRef<string>('');
	const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
				formatted_address: result.formatted_address,
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
			additional_information: '',
			postal_code: '',
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
				result.postal_code = component.long_name;
			} else if (types.includes('country')) {
				result.country = component.long_name;
			} else if (types.includes('subpremise')) {
				result.additional_information = component.long_name;
			}
		});

		return result;
	};

	// Función principal de búsqueda
	const searchAddresses = useCallback(async (query: string) => {
		if (query.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		setIsSearching(true);
		setShowSuggestions(true);

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

	const handleSearchInputChange = (text: string) => {
		setSearchQuery(text);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		if (text.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		searchTimeoutRef.current = setTimeout(() => {
			searchAddresses(text);
		}, 500);
	};

	const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
		// Clear any pending hide timeout
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}

		setIsSearching(true);

		// Hide keyboard immediately
		Keyboard.dismiss();

		// Immediately hide suggestions to prevent multiple taps
		setShowSuggestions(false);

		// Get detailed information about the selected place
		const addressDetails = await getPlaceDetails(suggestion.placeId);

		if (addressDetails) {
			setSearchQuery(
				addressDetails.formatted_address || suggestion.description,
			);
			setSuggestions([]);
			onAddressSelected(addressDetails);
		} else {
			// Fallback to basic suggestion info
			setSearchQuery(suggestion.description);
			setSuggestions([]);

			// Create a basic address from the suggestion
			const basicAddress: Address = {
				...createEmptyAddress(),
				formatted_address: suggestion.description,
			};
			onAddressSelected(basicAddress);
		}

		setIsSearching(false);
	};

	const handleInputFocus = () => {
		if (suggestions.length > 0) {
			setShowSuggestions(true);
		}
	};

	const handleInputBlur = () => {
		// Clear any existing timeout
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
		}

		// Delay hiding suggestions to allow tap on suggestion
		hideTimeoutRef.current = setTimeout(() => {
			setShowSuggestions(false);
		}, 150);
	};

	const renderSuggestion = (item: AddressSuggestion) => (
		<TouchableOpacity
			key={item.id}
			style={styles.suggestionItem}
			onPress={() => handleSuggestionSelect(item)}
			activeOpacity={0.7}
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
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Search Input */}
			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder={
						placeholder || t('registerRestaurant.searchAddressPlaceholder')
					}
					placeholderTextColor={colors.primaryLight}
					value={searchQuery}
					onChangeText={handleSearchInputChange}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
				/>
				{isSearching && (
					<ActivityIndicator
						size="small"
						color={colors.primary}
						style={styles.searchLoader}
					/>
				)}
			</View>

			{/* Suggestions - Positioned absolutely */}
			{showSuggestions && (
				<View style={styles.suggestionsContainer}>
					{suggestions.length > 0 ? (
						<ScrollView
							style={styles.suggestionsScrollView}
							showsVerticalScrollIndicator={true}
							nestedScrollEnabled={true}
							keyboardShouldPersistTaps="handled"
							scrollEventThrottle={16}
						>
							{suggestions.map(renderSuggestion)}
						</ScrollView>
					) : (
						!isSearching &&
						searchQuery.length >= 3 && (
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
									{t('registerRestaurant.noResultsSubtextAddressScreen')}
								</Text>
							</View>
						)
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		position: 'relative',
		zIndex: 1000,
	},
	searchContainer: {
		position: 'relative',
	},
	searchInput: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: fonts.regular,
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
		position: 'absolute',
		top: '100%',
		left: 0,
		right: 0,
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		maxHeight: 250,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
		zIndex: 1001,
	},
	suggestionsScrollView: {
		maxHeight: 250,
	},
	suggestionItem: {
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
		fontFamily: fonts.medium,
		color: colors.primary,
		marginBottom: 2,
	},
	suggestionSubtitle: {
		fontSize: 12,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		lineHeight: 16,
	},
	noResultsContainer: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	noResultsText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 5,
	},
	noResultsSubtext: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
	},
});
