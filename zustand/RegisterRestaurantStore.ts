import { RestaurantTag } from '@/shared/enums';
import { MenuData, Restaurant } from '@/shared/types';
import { create } from 'zustand';

export const defaultRegisterRestaurant: Restaurant = {
	id: '',
	name: '',
	address: '',
	cuisine: '',
	profileImage: undefined,
	images: [],
	menus: [],
	tags: [],
	minimumPrice: 0,
	rating: undefined,
	mainImage: '',
	distance: 0,
	coordinates: {
		latitude: 41.3851,
		longitude: 2.1734,
	},
};

interface RegisterRestaurantValidation {
	isValid: boolean;
	errors: {
		hasPhotos: boolean;
		hasMenus: boolean;
		hasCuisine: boolean;
		tooManyTags: boolean;
	};
}

interface RegisterRestaurantState {
	registerRestaurant: Restaurant;
	validation: RegisterRestaurantValidation;
	setRegisterRestaurantCuisine: (cuisine: string | null) => void;
	setRegisterRestaurantAddress: (address: string) => void;
	setRegisterRestaurantName: (name: string) => void;
	setRegisterRestaurantProfileImage: (image: string) => void;
	addRegisterRestaurantImage: (image: string) => void;
	removeRegisterRestaurantImage: (index: number) => void;
	addRegisterRestaurantMenu: (menu: MenuData) => void;
	updateRegisterRestaurantMenu: (index: number, menu: MenuData) => void;
	removeRegisterRestaurantMenu: (index: number) => void;
	setRegisterRestaurantTags: (tags: RestaurantTag[]) => void;
	setRegisterRestaurantCoordinates: (coordinates: {
		latitude: number;
		longitude: number;
	}) => void;
	resetRegisterRestaurant: () => void;
	validateRestaurant: () => RegisterRestaurantValidation;
}

const validateRestaurant = (
	restaurant: Restaurant,
): RegisterRestaurantValidation => {
	const hasPhotos = restaurant.images && restaurant.images.length > 0;
	const hasMenus = restaurant.menus && restaurant.menus.length > 0;
	const hasCuisine =
		restaurant.cuisine !== '' &&
		restaurant.cuisine !== null &&
		restaurant.cuisine !== undefined;
	const tooManyTags = restaurant.tags && restaurant.tags.length > 3;

	const errors = {
		hasPhotos: !hasPhotos,
		hasMenus: !hasMenus,
		hasCuisine: !hasCuisine,
		tooManyTags: tooManyTags || false,
	};

	const isValid = hasPhotos && hasMenus && hasCuisine && !tooManyTags;

	return {
		isValid,
		errors,
	};
};

export const useRegisterRestaurantStore = create<RegisterRestaurantState>(
	(set, get) => ({
		registerRestaurant: defaultRegisterRestaurant,
		validation: validateRestaurant(defaultRegisterRestaurant),

		setRegisterRestaurantName: (name: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					name,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantAddress: (address: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					address,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantCuisine: (cuisine: string | null) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					cuisine: cuisine || '',
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantProfileImage: (image: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					profileImage: image,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		addRegisterRestaurantImage: (image: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					images: [...(state.registerRestaurant.images || []), image],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		removeRegisterRestaurantImage: (index: number) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					images:
						state.registerRestaurant.images?.filter((_, i) => i !== index) ||
						[],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		addRegisterRestaurantMenu: (menu: MenuData) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					menus: [...(state.registerRestaurant.menus || []), menu],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		updateRegisterRestaurantMenu: (index: number, menu: MenuData) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					menus:
						state.registerRestaurant.menus?.map((m, i) =>
							i === index ? menu : m,
						) || [],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		removeRegisterRestaurantMenu: (index: number) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					menus:
						state.registerRestaurant.menus?.filter((_, i) => i !== index) || [],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantTags: (tags: RestaurantTag[]) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					tags,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantCoordinates: (coordinates: {
			latitude: number;
			longitude: number;
		}) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					coordinates,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		resetRegisterRestaurant: () => {
			set({
				registerRestaurant: defaultRegisterRestaurant,
				validation: validateRestaurant(defaultRegisterRestaurant),
			});
		},

		validateRestaurant: () => {
			const state = get();
			return validateRestaurant(state.registerRestaurant);
		},
	}),
);
