import { DishCategory, RestaurantTag } from './enums';

export type Language = 'en_US' | 'es_ES' | 'ca_ES' | 'fr_FR';

// New Address interface
export interface Address {
	street: string;
	number: string;
	additionalInformation: string; // Pis/Porta, etc.
	postalCode: string;
	city: string;
	country: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
	formattedAddress?: string; // Human readable full address
}

export type Restaurant = {
	id: string;
	name: string;
	minimumPrice: number;
	cuisine: string;
	rating?: number;
	mainImage: string;
	profileImage?: string;
	images: string[];
	distance: number;
	address: Address; // Updated from string to Address interface
	tags?: RestaurantTag[];
	menus: MenuData[];
	// Removed coordinates as they're now part of address
};

export type Cuisine = {
	id: string;
	name: {
		en_US: string;
		es_ES: string;
		ca_ES: string;
		fr_FR: string;
	};
	image: string;
};

export type Days =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

export type User = {
	id?: string;
	email?: string;
	username?: string;
	createdAt: string;
	name?: string;
	photo?: string;
	hashedPassword?: string;
	googleId?: string;
	token?: string;
	language: Language;
	hasPassword?: boolean;
	deviceId?: string;
	thirdPartyAccount?: 'google' | 'apple';
	thirdPartyEmail?: string;
	websiteUrl?: string;
};

export type MenuItem = {
	id: string;
	name: string;
	description: string;
	extraPrice?: number;
	category: string;
	isVegetarian?: boolean;
	isVegan?: boolean;
	isGlutenFree?: boolean;
	isLactoseFree?: boolean;
	isSpicy?: boolean;
};

export type MenuData = {
	id: string;
	name: string;
	days: string[];
	startTime: string;
	endTime: string;
	subtitle?: string;
	price: number;
	dishes: Dish[];
	firstCoursesToShare?: boolean;
	secondCoursesToShare?: boolean;
	dessertsToShare?: boolean;
	includesBread?: boolean;
	includesDrink?: boolean;
	includesCoffeeAndDessert?: 'none' | 'coffee' | 'dessert' | 'both';
	minimumPeople?: number;
	hasMinimumPeople?: boolean;
};

export type Dish = {
	id: string;
	name: string;
	description: string;
	extraPrice: number;
	isVegetarian: boolean;
	isLactoseFree: boolean;
	isSpicy: boolean;
	isGlutenFree: boolean;
	isVegan: boolean;
	category: DishCategory;
};

// Utility functions for Address handling
export const formatAddress = (address: Address): string => {
	if (address.formattedAddress) {
		return address.formattedAddress;
	}

	const parts: string[] = [];

	// Street and number
	if (address.street) {
		let streetPart = address.street;
		if (address.number) {
			streetPart += ` ${address.number}`;
		}
		if (address.additionalInformation) {
			streetPart += `, ${address.additionalInformation}`;
		}
		parts.push(streetPart);
	}

	// City and postal code
	if (address.city) {
		if (address.postalCode) {
			parts.push(`${address.postalCode} ${address.city}`);
		} else {
			parts.push(address.city);
		}
	}

	// Country
	if (address.country) {
		parts.push(address.country);
	}

	return parts.join(', ');
};

export const getShortAddress = (address: Address): string => {
	const parts: string[] = [];

	if (address.street) {
		let streetPart = address.street;
		if (address.number) {
			streetPart += ` ${address.number}`;
		}
		parts.push(streetPart);
	}

	if (address.city) {
		parts.push(address.city);
	}

	return parts.join(', ');
};

export const createEmptyAddress = (): Address => ({
	street: '',
	number: '',
	additionalInformation: '',
	postalCode: '',
	city: '',
	country: '',
	coordinates: {
		latitude: 0,
		longitude: 0,
	},
});

// Helper to convert old string address to new Address format
export const parseStringToAddress = (
	addressString: string,
	coordinates?: { latitude: number; longitude: number },
): Address => {
	const parts = addressString.split(',').map((part) => part.trim());
	const streetPart = parts[0] || '';

	// Try to extract street number from the first part
	const streetMatch = streetPart.match(/^(.+?)\s+(\d+[\w]*)\s*(.*)$/);

	let street = '';
	let number = '';
	let additionalInfo = '';

	if (streetMatch) {
		street = streetMatch[1].trim();
		number = streetMatch[2].trim();
		additionalInfo = streetMatch[3].trim();
	} else {
		street = streetPart;
	}

	// Extract city and postal code
	let city = '';
	let postalCode = '';
	let country = 'España'; // Default

	if (parts.length > 1) {
		// Look for postal code pattern (5 digits)
		const postalMatch = parts.find((part) => /^\d{5}$/.test(part.trim()));
		if (postalMatch) {
			postalCode = postalMatch.trim();
		}

		// Get city (usually after street, before or with postal code)
		const cityPart = parts[1];
		if (cityPart && !cityPart.match(/^\d{5}$/)) {
			city = cityPart.replace(/^\d{5}\s*/, '').trim();
		}

		// Country is usually the last part
		if (parts.length > 2) {
			const lastPart = parts[parts.length - 1];
			if (!lastPart.match(/^\d{5}$/)) {
				country = lastPart;
			}
		}
	}

	return {
		street,
		number,
		additionalInformation: additionalInfo,
		postalCode,
		city,
		country,
		coordinates: coordinates || { latitude: 0, longitude: 0 },
		formattedAddress: addressString,
	};
};
