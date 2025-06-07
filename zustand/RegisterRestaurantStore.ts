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

interface RegisterRestaurantState {
	registerRestaurant: Restaurant;
	setRegisterRestaurantCuisine: (cuisine: string | null) => void;
	setRegisterRestaurantAddress: (address: string) => void;
	setRegisterRestaurantName: (name: string) => void;
	setRegisterRestaurantProfileImage: (image: string) => void;
	addRegisterRestaurantImage: (image: string) => void;
	removeRegisterRestaurantImage: (index: number) => void;
	addRegisterRestaurantMenu: (menu: MenuData) => void;
	updateRegisterRestaurantMenu: (index: number, menu: MenuData) => void;
	removeRegisterRestaurantMenu: (index: number) => void;
	setRegisterRestaurantTags: (tags: string[]) => void; // Nueva función para tags
	setRegisterRestaurantCoordinates: (coordinates: {
		latitude: number;
		longitude: number;
	}) => void;
	resetRegisterRestaurant: () => void;
}

export const useRegisterRestaurantStore = create<RegisterRestaurantState>(
	(set) => ({
		registerRestaurant: defaultRegisterRestaurant,
		setRegisterRestaurantName: (name: string) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					name,
				},
			}));
		},
		setRegisterRestaurantAddress: (address: string) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					address,
				},
			}));
		},
		setRegisterRestaurantCuisine: (cuisine: string | null) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					cuisineId: cuisine || undefined,
				},
			}));
		},
		setRegisterRestaurantProfileImage: (image: string) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					profileImage: image,
				},
			}));
		},
		addRegisterRestaurantImage: (image: string) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					images: [...(state.registerRestaurant.images || []), image],
				},
			}));
		},
		removeRegisterRestaurantImage: (index: number) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					images:
						state.registerRestaurant.images?.filter((_, i) => i !== index) ||
						[],
				},
			}));
		},
		addRegisterRestaurantMenu: (menu: MenuData) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					menus: [...(state.registerRestaurant.menus || []), menu],
				},
			}));
		},
		updateRegisterRestaurantMenu: (index: number, menu: MenuData) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					menus:
						state.registerRestaurant.menus?.map((m, i) =>
							i === index ? menu : m,
						) || [],
				},
			}));
		},
		removeRegisterRestaurantMenu: (index: number) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					menus:
						state.registerRestaurant.menus?.filter((_, i) => i !== index) || [],
				},
			}));
		},
		setRegisterRestaurantTags: (tags: string[]) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					tags,
				},
			}));
		},
		setRegisterRestaurantCoordinates: (coordinates: {
			latitude: number;
			longitude: number;
		}) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					coordinates,
				},
			}));
		},
		resetRegisterRestaurant: () => {
			set({
				registerRestaurant: defaultRegisterRestaurant,
			});
		},
	}),
);
