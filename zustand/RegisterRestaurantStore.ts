import { RestaurantTag } from '@/shared/enums';
import {
	Address,
	MenuData,
	Restaurant,
	createEmptyAddress,
	createEmptyDrinks,
} from '@/shared/types';
import { create } from 'zustand';

export const defaultRegisterRestaurant: Restaurant = {
	id: '',
	name: '',
	address: createEmptyAddress(),
	cuisineId: '',
	profile_image: undefined,
	images: [],
	menus: [],
	tags: [],
	minimum_price: 0,
	rating: undefined,
	main_image: '',
	distance: 0,
	phone: '',
	reservation_link: '',
	is_active: true,
	cuisine: {
		id: '',
		name: '',
		image: '',
	},
	created_at: '',
	updated_at: '',
};

interface RegisterRestaurantValidation {
	isValid: boolean;
	errors: {
		hasProfileImage: boolean;
		hasPhotos: boolean;
		hasMenus: boolean;
		hasCuisine: boolean;
		hasAddress: boolean; // AHORA OBLIGATORIO
		tooManyTags: boolean;
	};
}

interface RegisterRestaurantState {
	registerRestaurant: Restaurant;
	validation: RegisterRestaurantValidation;
	setRegisterRestaurantCuisineId: (cuisineId: string | null) => void;
	setRegisterRestaurantAddress: (address: Address) => void;
	setRegisterRestaurantName: (name: string) => void;
	setRegisterRestaurantprofile_image: (image: string) => void;
	addRegisterRestaurantImage: (image: string) => void;
	removeRegisterRestaurantImage: (index: number) => void;
	addRegisterRestaurantMenu: (menu: MenuData) => void;
	updateRegisterRestaurantMenu: (index: number, menu: MenuData) => void;
	removeRegisterRestaurantMenu: (index: number) => void;
	setRegisterRestaurantTags: (tags: RestaurantTag[]) => void;
	resetRegisterRestaurant: () => void;
	validateRestaurant: () => RegisterRestaurantValidation;
	setRegisterRestaurantPhone: (phone: string) => void;
	setRegisterRestaurantReservationLink: (link: string) => void;
}

const validateRestaurant = (
	restaurant: Restaurant,
): RegisterRestaurantValidation => {
	// Convertir explícitamente a boolean para evitar errores de tipo
	const hasProfileImage = Boolean(restaurant.profile_image);
	const hasPhotos = Boolean(restaurant.images && restaurant.images.length > 0);
	const hasMenus = Boolean(restaurant.menus && restaurant.menus.length > 0);
	const hasCuisine = Boolean(
		restaurant.cuisineId !== '' &&
			restaurant.cuisineId !== null &&
			restaurant.cuisineId !== undefined,
	);
	const tooManyTags = Boolean(restaurant.tags && restaurant.tags.length > 5);

	// VALIDACIÓN DE DIRECCIÓN MEJORADA - Ahora más estricta
	const hasValidAddress = Boolean(
		restaurant.address &&
			// Debe tener al menos una dirección formateada O street + city
			((restaurant.address.formatted_address &&
				restaurant.address.formatted_address.trim() !== '') ||
				(restaurant.address.street &&
					restaurant.address.street.trim() !== '' &&
					restaurant.address.city &&
					restaurant.address.city.trim() !== '')) &&
			// Debe tener coordenadas válidas
			restaurant.address.coordinates &&
			restaurant.address.coordinates.latitude !== 0 &&
			restaurant.address.coordinates.longitude !== 0,
	);

	const errors = {
		hasProfileImage: !hasProfileImage,
		hasPhotos: !hasPhotos,
		hasMenus: !hasMenus,
		hasCuisine: !hasCuisine,
		hasAddress: !hasValidAddress, // AHORA OBLIGATORIO
		tooManyTags: tooManyTags,
	};

	// DIRECCIÓN AHORA ES REQUERIDA PARA VALIDACIÓN COMPLETA
	const isValid = Boolean(
		hasProfileImage &&
			hasPhotos &&
			hasMenus &&
			hasCuisine &&
			hasValidAddress && // AÑADIDO A LA VALIDACIÓN
			!tooManyTags,
	);

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

		setRegisterRestaurantprofile_image: (image: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					profile_image: image,
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
				const menuWithDrinks = {
					...menu,
					drinks: menu.drinks || createEmptyDrinks(),
				};

				const newRestaurant = {
					...state.registerRestaurant,
					menus: [...(state.registerRestaurant.menus || []), menuWithDrinks],
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		updateRegisterRestaurantMenu: (index: number, menu: MenuData) => {
			set((state) => {
				const menuWithDrinks = {
					...menu,
					drinks: menu.drinks || createEmptyDrinks(),
				};

				const newRestaurant = {
					...state.registerRestaurant,
					menus:
						state.registerRestaurant.menus?.map((m, i) =>
							i === index ? menuWithDrinks : m,
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

		setRegisterRestaurantPhone: (phone: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					phone,
				};
				return {
					registerRestaurant: newRestaurant,
					validation: validateRestaurant(newRestaurant),
				};
			});
		},

		setRegisterRestaurantReservationLink: (reservation_link: string) => {
			set((state) => {
				const newRestaurant = {
					...state.registerRestaurant,
					reservation_link,
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
