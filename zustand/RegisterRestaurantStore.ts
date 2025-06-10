import { RestaurantTag } from '@/shared/enums';
import {
	Address,
	MenuData,
	Restaurant,
	createEmptyAddress,
} from '@/shared/types';
import { create } from 'zustand';

export const defaultRegisterRestaurant: Restaurant = {
	id: '',
	name: '',
	address: createEmptyAddress(),
	cuisineId: '',
	profileImage: undefined,
	images: [],
	menus: [],
	tags: [],
	minimumPrice: 0,
	rating: undefined,
	mainImage: '',
	distance: 0,
};

interface RegisterRestaurantValidation {
	isValid: boolean;
	errors: {
		hasPhotos: boolean;
		hasMenus: boolean;
		hasCuisine: boolean;
		tooManyTags: boolean;
		hasAddress: boolean;
	};
}

interface RegisterRestaurantState {
	registerRestaurant: Restaurant;
	validation: RegisterRestaurantValidation;
	setRegisterRestaurantCuisineId: (cuisineId: string | null) => void;
	setRegisterRestaurantAddress: (address: Address) => void;
	setRegisterRestaurantName: (name: string) => void;
	setRegisterRestaurantProfileImage: (image: string) => void;
	addRegisterRestaurantImage: (image: string) => void;
	removeRegisterRestaurantImage: (index: number) => void;
	addRegisterRestaurantMenu: (menu: MenuData) => void;
	updateRegisterRestaurantMenu: (index: number, menu: MenuData) => void;
	removeRegisterRestaurantMenu: (index: number) => void;
	setRegisterRestaurantTags: (tags: RestaurantTag[]) => void;
	resetRegisterRestaurant: () => void;
	validateRestaurant: () => RegisterRestaurantValidation;
}

const validateRestaurant = (
	restaurant: Restaurant,
): RegisterRestaurantValidation => {
	const hasPhotos = restaurant.images && restaurant.images.length > 0;
	const hasMenus = restaurant.menus && restaurant.menus.length > 0;
	const hasCuisine =
		restaurant.cuisineId !== '' &&
		restaurant.cuisineId !== null &&
		restaurant.cuisineId !== undefined;
	const tooManyTags = restaurant.tags && restaurant.tags.length > 5; // Cambiado de 3 a 5
	const hasAddress =
		restaurant.address &&
		(restaurant.address.street !== '' ||
			restaurant.address.city !== '' ||
			restaurant.address.formattedAddress !== '');

	const errors = {
		hasPhotos: !hasPhotos,
		hasMenus: !hasMenus,
		hasCuisine: !hasCuisine,
		tooManyTags: tooManyTags || false,
		hasAddress: !hasAddress,
	};

	const isValid =
		hasPhotos && hasMenus && hasCuisine && !tooManyTags && hasAddress;

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

		setRegisterRestaurantAddress: (address: Address) => {
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

		setRegisterRestaurantCuisineId: (cuisineId: string | null) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					cuisineId: cuisineId || '',
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
