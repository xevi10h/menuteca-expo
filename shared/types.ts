import { DishCategory } from './enums';

export type Language = 'en_US' | 'es_ES' | 'ca_ES' | 'fr_FR';

export type Restaurant = {
	id: string;
	name: string;
	minimumPrice: number;
	cuisine: string;
	rating: number;
	mainImage: string;
	profileImage?: string;
	images: string[];
	distance: number;
	address: string;
	tags?: string[]; // Nueva propiedad para las categorías/tags
	coordinates: {
		latitude: number;
		longitude: number;
	};
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
