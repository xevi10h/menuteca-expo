import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserRestaurant {
	id: string;
	name: string;
	address: string;
	profileImage?: string;
	phone?: string;
	cuisineType?: string;
}

interface UserReview {
	id: string;
	restaurantId: string;
	restaurantName: string;
	rating: number;
	comment: string;
	date: string;
}

interface UserRestaurantsState {
	restaurants: UserRestaurant[];
	reviews: UserReview[];
	addRestaurant: (restaurant: UserRestaurant) => void;
	updateRestaurant: (id: string, updates: Partial<UserRestaurant>) => void;
	removeRestaurant: (id: string) => void;
	addReview: (review: UserReview) => void;
	removeReview: (id: string) => void;
	clearUserData: () => void;
}

export const useUserRestaurantsStore = create<UserRestaurantsState>()(
	persist(
		(set, get) => ({
			restaurants: [],
			reviews: [],

			addRestaurant: (restaurant: UserRestaurant) => {
				set((state) => ({
					restaurants: [...state.restaurants, restaurant],
				}));
			},

			updateRestaurant: (id: string, updates: Partial<UserRestaurant>) => {
				set((state) => ({
					restaurants: state.restaurants.map((restaurant) =>
						restaurant.id === id ? { ...restaurant, ...updates } : restaurant,
					),
				}));
			},

			removeRestaurant: (id: string) => {
				set((state) => ({
					restaurants: state.restaurants.filter(
						(restaurant) => restaurant.id !== id,
					),
				}));
			},

			addReview: (review: UserReview) => {
				set((state) => ({
					reviews: [...state.reviews, review],
				}));
			},

			removeReview: (id: string) => {
				set((state) => ({
					reviews: state.reviews.filter((review) => review.id !== id),
				}));
			},

			clearUserData: () => {
				set({
					restaurants: [],
					reviews: [],
				});
			},
		}),
		{
			name: 'user-restaurants-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
