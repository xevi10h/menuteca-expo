// api/supabaseAddress.ts
import { supabase } from '@/lib/supabase';
import { Address, Language } from '@/shared/types';
import { getLocalizedText } from '@/shared/functions/utils';

// Database types
interface AddressRow {
	id: string;
	street: { [key: string]: string };
	number: string;
	additional_information?: string;
	postal_code: string;
	city: { [key: string]: string };
	country: { [key: string]: string };
	coordinates: { latitude: number; longitude: number };
	formatted_address?: string;
	created_at: string;
	updated_at: string;
}

// Localized address for frontend
interface LocalizedAddress {
	id: string;
	street: string;
	number: string;
	additional_information?: string;
	postal_code: string;
	city: string;
	country: string;
	coordinates: { latitude: number; longitude: number };
	formatted_address?: string;
}

export class SupabaseAddressService {
	/**
	 * Get user's language from user store or default
	 */
	private static getCurrentLanguage(): Language {
		try {
			const { useUserStore } = require('@/zustand/UserStore');
			const userState = useUserStore.getState();
			return userState.user.language || 'es_ES';
		} catch (error) {
			return 'es_ES';
		}
	}

	/**
	 * Helper method to get localized text
	 */
	private static getLocalizedText(
		translatedText: any,
		userLanguage: Language,
		fallbackLanguage: Language = 'es_ES',
	): string {
		if (!translatedText) return '';

		let text = translatedText[userLanguage];

		if (!text && fallbackLanguage !== userLanguage) {
			text = translatedText[fallbackLanguage];
		}

		if (!text) {
			text =
				translatedText.es_ES ||
				translatedText.en_US ||
				translatedText.ca_ES ||
				translatedText.fr_FR ||
				'';
		}

		return text;
	}

	/**
	 * Convert degrees to radians
	 */
	private static deg2rad(deg: number): number {
		return deg * (Math.PI / 180);
	}

	/**
	 * Calculate distance between two coordinates
	 */
	static calculateDistance(
		address1: LocalizedAddress,
		address2: LocalizedAddress,
	): number {
		const lat1 = address1.coordinates.latitude;
		const lon1 = address1.coordinates.longitude;
		const lat2 = address2.coordinates.latitude;
		const lon2 = address2.coordinates.longitude;

		const R = 6371; // Radius of the Earth in kilometers
		const dLat = this.deg2rad(lat2 - lat1);
		const dLon = this.deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.deg2rad(lat1)) *
				Math.cos(this.deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in kilometers

		return Math.round(distance * 100) / 100; // Round to 2 decimal places
	}

	/**
	 * Format address for display
	 */
	static formatAddress(address: LocalizedAddress): string {
		if (address.formatted_address) {
			return address.formatted_address;
		}

		const parts: string[] = [];

		// Street and number
		if (address.street) {
			let streetPart = address.street;
			if (address.number) {
				streetPart += ` ${address.number}`;
			}
			if (address.additional_information) {
				streetPart += `, ${address.additional_information}`;
			}
			parts.push(streetPart);
		}

		// City and postal code
		if (address.city) {
			if (address.postal_code) {
				parts.push(`${address.postal_code} ${address.city}`);
			} else {
				parts.push(address.city);
			}
		}

		// Country
		if (address.country) {
			parts.push(address.country);
		}

		return parts.join(', ');
	}

	/**
	 * Convert AddressRow to LocalizedAddress
	 */
	private static localizeAddress(
		address: AddressRow,
		userLanguage: Language,
	): LocalizedAddress {
		return {
			id: address.id,
			street: this.getLocalizedText(address.street, userLanguage),
			number: address.number,
			additional_information: address.additional_information,
			postal_code: address.postal_code,
			city: this.getLocalizedText(address.city, userLanguage),
			country: this.getLocalizedText(address.country, userLanguage),
			coordinates: address.coordinates,
			formatted_address: address.formatted_address,
		};
	}

	/**
	 * Convert LocalizedAddress to Address (frontend type)
	 */
	private static convertToAddress(localizedAddress: LocalizedAddress): Address {
		return {
			street: localizedAddress.street,
			number: localizedAddress.number,
			additional_information: localizedAddress.additional_information || '',
			postal_code: localizedAddress.postal_code,
			city: localizedAddress.city,
			country: localizedAddress.country,
			coordinates: localizedAddress.coordinates,
			formatted_address: localizedAddress.formatted_address,
		};
	}

	/**
	 * Create a new address
	 */
	static async createAddress(addressData: {
		street: { [key: string]: string };
		number: string;
		additional_information?: string;
		postal_code: string;
		city: { [key: string]: string };
		country: { [key: string]: string };
		coordinates: {
			latitude: number;
			longitude: number;
		};
		formatted_address?: string;
	}) {
		try {
			const { data, error } = await supabase
				.from('addresses')
				.insert(addressData)
				.select()
				.single();

			if (error) {
				throw error;
			}

			const userLanguage = this.getCurrentLanguage();
			const localizedAddress = this.localizeAddress(data as AddressRow, userLanguage);
			const address = this.convertToAddress(localizedAddress);

			return {
				success: true,
				data: address,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create address',
			};
		}
	}

	/**
	 * Get address by ID
	 */
	static async getAddressById(id: string) {
		try {
			if (!id) {
				return {
					success: false,
					error: 'Address ID is required',
				};
			}

			const { data, error } = await supabase
				.from('addresses')
				.select('*')
				.eq('id', id)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Address not found',
					};
				}
				throw error;
			}

			const userLanguage = this.getCurrentLanguage();
			const localizedAddress = this.localizeAddress(data as AddressRow, userLanguage);
			const address = this.convertToAddress(localizedAddress);

			return {
				success: true,
				data: address,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch address',
			};
		}
	}

	/**
	 * Update address
	 */
	static async updateAddress(
		id: string,
		updateData: Partial<{
			street: { [key: string]: string };
			number: string;
			additional_information?: string;
			postal_code: string;
			city: { [key: string]: string };
			country: { [key: string]: string };
			coordinates: {
				latitude: number;
				longitude: number;
			};
			formatted_address?: string;
		}>,
	) {
		try {
			if (!id) {
				return {
					success: false,
					error: 'Address ID is required',
				};
			}

			const { data, error } = await supabase
				.from('addresses')
				.update({
					...updateData,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)
				.select()
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					return {
						success: false,
						error: 'Address not found',
					};
				}
				throw error;
			}

			const userLanguage = this.getCurrentLanguage();
			const localizedAddress = this.localizeAddress(data as AddressRow, userLanguage);
			const address = this.convertToAddress(localizedAddress);

			return {
				success: true,
				data: address,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update address',
			};
		}
	}

	/**
	 * Delete address
	 */
	static async deleteAddress(id: string) {
		try {
			if (!id) {
				return {
					success: false,
					error: 'Address ID is required',
				};
			}

			// Check if address is being used by any restaurants
			const { data: restaurants, error: checkError } = await supabase
				.from('restaurants')
				.select('id')
				.eq('address_id', id)
				.limit(1);

			if (checkError) {
				throw checkError;
			}

			if (restaurants && restaurants.length > 0) {
				return {
					success: false,
					error: 'Cannot delete address that is being used by restaurants',
				};
			}

			const { error } = await supabase
				.from('addresses')
				.delete()
				.eq('id', id);

			if (error) {
				throw error;
			}

			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete address',
			};
		}
	}

	/**
	 * Search addresses by city or street
	 */
	static async searchAddresses(query: string, limit?: number) {
		try {
			if (!query || query.length < 2) {
				return {
					success: false,
					error: 'Search query must be at least 2 characters long',
				};
			}

			const searchLimit = limit || 20;
			if (searchLimit < 1 || searchLimit > 50) {
				return {
					success: false,
					error: 'Limit must be a number between 1 and 50',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			// Get all addresses since we need to search in translated text
			const { data, error } = await supabase
				.from('addresses')
				.select('*')
				.limit(searchLimit * 2); // Get more to account for filtering

			if (error) {
				throw error;
			}

			const searchTerm = query.toLowerCase();

			const filteredAddresses = data
				.filter((address: AddressRow) => {
					const localizedStreet = this.getLocalizedText(
						address.street,
						userLanguage,
					).toLowerCase();
					const localizedCity = this.getLocalizedText(
						address.city,
						userLanguage,
					).toLowerCase();
					const localizedCountry = this.getLocalizedText(
						address.country,
						userLanguage,
					).toLowerCase();

					return (
						localizedStreet.includes(searchTerm) ||
						localizedCity.includes(searchTerm) ||
						localizedCountry.includes(searchTerm) ||
						(address.formatted_address &&
							address.formatted_address.toLowerCase().includes(searchTerm))
					);
				})
				.slice(0, searchLimit);

			const addresses = filteredAddresses.map((address: AddressRow) => {
				const localizedAddress = this.localizeAddress(address, userLanguage);
				return this.convertToAddress(localizedAddress);
			});

			return {
				success: true,
				data: addresses,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to search addresses',
			};
		}
	}

	/**
	 * Get nearby addresses
	 */
	static async getNearbyAddresses(
		latitude: number,
		longitude: number,
		radius?: number,
		limit?: number,
	) {
		try {
			const searchRadius = radius || 10;
			const searchLimit = limit || 20;

			if (isNaN(latitude) || latitude < -90 || latitude > 90) {
				return {
					success: false,
					error: 'Invalid latitude (must be between -90 and 90)',
				};
			}

			if (isNaN(longitude) || longitude < -180 || longitude > 180) {
				return {
					success: false,
					error: 'Invalid longitude (must be between -180 and 180)',
				};
			}

			if (searchRadius < 0.1 || searchRadius > 100) {
				return {
					success: false,
					error: 'Invalid radius (must be between 0.1 and 100 km)',
				};
			}

			if (searchLimit < 1 || searchLimit > 50) {
				return {
					success: false,
					error: 'Invalid limit (must be between 1 and 50)',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			// Try using PostGIS function first (if available)
			const { data, error } = await supabase.rpc('get_addresses_within_radius', {
				center_lat: latitude,
				center_lng: longitude,
				radius_km: searchRadius,
				max_results: searchLimit,
			});

			if (!error && data) {
				const addresses = data.map((address: AddressRow) => {
					const localizedAddress = this.localizeAddress(address, userLanguage);
					return this.convertToAddress(localizedAddress);
				});

				return {
					success: true,
					data: addresses,
				};
			}

			// Fallback to simple query if PostGIS function doesn't exist
			const { data: fallbackData, error: fallbackError } = await supabase
				.from('addresses')
				.select('*')
				.limit(searchLimit);

			if (fallbackError) {
				throw fallbackError;
			}

			// Calculate distances manually and filter
			const userCoords = { latitude, longitude };
			const addressesWithDistance = fallbackData
				.map((address: AddressRow) => {
					const localizedAddress = this.localizeAddress(address, userLanguage);
					const distance = this.calculateDistance(
						{ ...localizedAddress, coordinates: userCoords },
						localizedAddress,
					);
					return {
						address: this.convertToAddress(localizedAddress),
						distance,
					};
				})
				.filter(item => item.distance <= searchRadius)
				.sort((a, b) => a.distance - b.distance)
				.slice(0, searchLimit)
				.map(item => item.address);

			return {
				success: true,
				data: addressesWithDistance,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch nearby addresses',
			};
		}
	}

	/**
	 * Format address for display
	 */
	static formatAddressDisplay(id: string) {
		return this.getAddressById(id).then(result => {
			if (!result.success || !result.data) {
				return {
					success: false,
					error: 'Address not found',
				};
			}

			const userLanguage = this.getCurrentLanguage();
			const addressRow = result.data as any; // Cast to access raw data
			const localizedAddress = this.localizeAddress(addressRow, userLanguage);
			const formattedAddress = this.formatAddress(localizedAddress);

			return {
				success: true,
				data: { formattedAddress },
			};
		}).catch(error => ({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to format address',
		}));
	}

	/**
	 * Calculate distance between two addresses by ID
	 */
	static async calculateDistanceBetweenAddresses(
		address1Id: string,
		address2Id: string,
	) {
		try {
			if (!address1Id || !address2Id) {
				return {
					success: false,
					error: 'Both address IDs are required',
				};
			}

			const userLanguage = this.getCurrentLanguage();

			const [result1, result2] = await Promise.all([
				this.getAddressById(address1Id),
				this.getAddressById(address2Id),
			]);

			if (!result1.success || !result1.data) {
				return {
					success: false,
					error: 'First address not found',
				};
			}

			if (!result2.success || !result2.data) {
				return {
					success: false,
					error: 'Second address not found',
				};
			}

			// Convert to localized addresses for distance calculation
			const { data: address1Raw } = await supabase
				.from('addresses')
				.select('*')
				.eq('id', address1Id)
				.single();

			const { data: address2Raw } = await supabase
				.from('addresses')
				.select('*')
				.eq('id', address2Id)
				.single();

			if (!address1Raw || !address2Raw) {
				return {
					success: false,
					error: 'Failed to fetch address details',
				};
			}

			const localizedAddress1 = this.localizeAddress(address1Raw as AddressRow, userLanguage);
			const localizedAddress2 = this.localizeAddress(address2Raw as AddressRow, userLanguage);

			const distance = this.calculateDistance(localizedAddress1, localizedAddress2);

			return {
				success: true,
				data: { distance },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to calculate distance',
			};
		}
	}
}