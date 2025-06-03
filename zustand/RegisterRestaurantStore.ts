import { create } from 'zustand';

export interface IRegisterRestaurant {
	name: string;
	address?: string;
	cuisinesIds?: string[];
}

export const defaultRegisterRestaurant: IRegisterRestaurant = {
	name: '',
	address: '',
	cuisinesIds: [],
};

interface RegisterRestaurantState {
	registerRestaurant: IRegisterRestaurant;
	setRegisterRestaurantCuisines: (cuisines: string[] | null) => void;
	setRegisterRestaurantAddress: (address: string) => void;
	setRegisterRestaurantName: (name: string) => void;
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
		setRegisterRestaurantCuisines: (cuisines: string[] | null) => {
			set((state) => ({
				registerRestaurant: {
					...state.registerRestaurant,
					cuisinesIds: cuisines || [],
				},
			}));
		},
	}),
);
