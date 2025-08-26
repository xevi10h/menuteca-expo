import { DishCategory, DrinkType, RestaurantTag } from './enums';

export type Language = 'en_US' | 'es_ES' | 'ca_ES' | 'fr_FR';

export type User = {
	id: string;
	email: string;
	username: string;
	created_at: string;
	name: string;
	photo: string;
	google_id: string;
	token: string;
	has_password: boolean;
	language: Language;
};

export type UserRestaurant = {
	id: string;
	name: string;
	address: string;
	profile_image?: string;
	phone?: string;
	cuisine_type?: string;
	user_id: string;
	created_at: string;
	updated_at: string;
};

export type UserReview = {
	id: string;
	restaurant_id: string;
	restaurant_name: string;
	user_id: string;
	rating: number;
	comment: string;
	created_at: string;
	updated_at: string;
};

export type Address = {
	street: string;
	number: string;
	additional_information: string; // Pis/Porta, etc.
	postal_code: string;
	city: string;
	country: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
	formatted_address?: string; // Human readable full address
};

export type Review = {
	id: string;
	user_id: string;
	user_name: string;
	user_avatar: string;
	rating: number; // 1-5
	comment: string;
	date: string; // ISO date string
	photos: string[]; // Array of image URLs
	restaurant_response?: {
		message: string;
		date: string; // ISO date string
	};
	restaurant_id: string;
	restaurant_name: string;
	restaurant_image: string;
	created_at: string;
	updated_at: string;
};

export type Restaurant = {
	id: string;
	name: string;
	minimum_price: number;
	cuisineId: string;
	rating?: number;
	main_image: string;
	profile_image?: string;
	images: string[];
	distance: number;
	address: Address;
	tags?: RestaurantTag[];
	menus: MenuData[];
	phone?: string;
	reservation_link?: string;
	is_active: boolean;
	cuisine: Cuisine;
	reviews?: Review[];
	created_at: string;
	updated_at: string;
};

// FIXED: Cuisine ahora viene traducido del backend según el token del usuario
export type Cuisine = {
	id: string;
	name: string;
	image: string;
};

// Cuisine database row with translations
export type CuisineRow = {
	id: string;
	name: { [key: string]: string }; // Translations object
	image: string;
	created_at: string;
	updated_at: string;
};

// Localized cuisine
export type LocalizedCuisine = {
	id: string;
	name: string;
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

export type MenuItem = {
	id: string;
	name: string;
	description: string;
	extraPrice?: number;
	category: string;
	is_vegetarian?: boolean;
	is_vegan?: boolean;
	is_gluten_free?: boolean;
	is_lactose_free?: boolean;
	is_spicy?: boolean;
};

export interface DrinkInclusion {
	water: boolean;
	wine: boolean;
	soft_drinks: boolean;
	beer: boolean;
}

export type MenuData = {
	id: string;
	name: string;
	days: string[];
	start_time: string;
	end_time: string;
	price: number;
	dishes: Dish[];
	first_courses_to_share?: boolean;
	second_courses_to_share?: boolean;
	desserts_to_share?: boolean;
	includes_bread?: boolean;
	drinks?: DrinkInclusion;
	includes_coffee_and_dessert?: 'none' | 'coffee' | 'dessert' | 'both';
	minimum_people?: number;
	has_minimum_people?: boolean;
};

export type Dish = {
	id: string;
	name: string;
	description: string;
	extraPrice: number;
	is_vegetarian: boolean;
	is_lactose_free: boolean;
	is_spicy: boolean;
	is_gluten_free: boolean;
	is_vegan: boolean;
	category: DishCategory;
};

// Utility functions for Address handling
export const formatAddress = (address: Address): string => {
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
	additional_information: '',
	postal_code: '',
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
	let postal_code = '';
	let country = 'España'; // Default

	if (parts.length > 1) {
		// Look for postal code pattern (5 digits)
		const postalMatch = parts.find((part) => /^\d{5}$/.test(part.trim()));
		if (postalMatch) {
			postal_code = postalMatch.trim();
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
		additional_information: additionalInfo,
		postal_code,
		city,
		country,
		coordinates: coordinates || { latitude: 0, longitude: 0 },
		formatted_address: addressString,
	};
};

// NUEVAS UTILIDADES PARA BEBIDAS

// Crear configuración vacía de bebidas
export const createEmptyDrinks = (): DrinkInclusion => ({
	water: false,
	wine: false,
	soft_drinks: false,
	beer: false,
});

// Verificar si incluye alguna bebida
export const hasDrinks = (drinks?: DrinkInclusion): boolean => {
	if (!drinks) return false;
	return drinks.water || drinks.wine || drinks.soft_drinks || drinks.beer;
};

// Obtener bebidas seleccionadas como array
export const getSelectedDrinks = (drinks?: DrinkInclusion): DrinkType[] => {
	if (!drinks) return [];
	const selected: DrinkType[] = [];

	if (drinks.water) selected.push(DrinkType.WATER);
	if (drinks.wine) selected.push(DrinkType.WINE);
	if (drinks.soft_drinks) selected.push(DrinkType.SOFT_DRINKS);
	if (drinks.beer) selected.push(DrinkType.BEER);

	return selected;
};

// Crear DrinkInclusion desde array de DrinkType
export const createDrinksFromArray = (
	drinkTypes: DrinkType[],
): DrinkInclusion => {
	return {
		water: drinkTypes.includes(DrinkType.WATER),
		wine: drinkTypes.includes(DrinkType.WINE),
		soft_drinks: drinkTypes.includes(DrinkType.SOFT_DRINKS),
		beer: drinkTypes.includes(DrinkType.BEER),
	};
};

// Formatear bebidas para mostrar
export const formatDrinksDisplay = (drinks?: DrinkInclusion): string => {
	if (!drinks || !hasDrinks(drinks)) return '';

	const selectedDrinks = getSelectedDrinks(drinks);
	return selectedDrinks.join(', ');
};

export interface AuthResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
}