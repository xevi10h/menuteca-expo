import { getDeviceLanguage } from '@/shared/functions/utils';
import { Language, Restaurant, User } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
	user: User;
	isAuthenticated: boolean;
	userRestaurants: Restaurant[];
	setUser: (user: User) => void;
	updatePhoto: (photo: string) => void;
	updateUsername: (username: string) => void;
	setDefaultUser: () => void;
	setLanguage: (language: Language) => void;
	login: (user: User) => void;
	logout: () => void;
	setUserRestaurants: (restaurants: Restaurant[]) => void;
	addUserRestaurant: (restaurant: Restaurant) => void;
	updateUserRestaurant: (restaurantId: string, restaurant: Restaurant) => void;
	removeUserRestaurant: (restaurantId: string) => void;
	persist?: {
		clearStorage: () => void;
	};
}

export const undefinedUser: User = {
	id: '',
	email: '',
	username: '',
	createdAt: new Date().toISOString(),
	name: '',
	photo: '',
	googleId: '',
	token: '',
	hasPassword: false,
	language: getDeviceLanguage(),
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: undefinedUser,
			isAuthenticated: false,
			userRestaurants: [],

			setUser: (user: User) => {
				set((state) => ({
					user: { ...state.user, ...user },
					isAuthenticated: !!user.token && user.id !== '',
				}));
			},

			updatePhoto: (photo: string) => {
				set((state) => ({ user: { ...state.user, photo } }));
			},

			updateUsername: (username: string) => {
				set((state) => ({ user: { ...state.user, username } }));
			},

			setDefaultUser: () => {
				set({
					user: { ...undefinedUser, language: getDeviceLanguage() },
					isAuthenticated: false,
					userRestaurants: [],
				});
			},

			setLanguage: (language: Language) => {
				set((state) => ({ user: { ...state.user, language } }));
			},

			login: (user: User) => {
				set({
					user,
					isAuthenticated: true,
				});
			},

			logout: () => {
				set({
					user: { ...undefinedUser, language: getDeviceLanguage() },
					isAuthenticated: false,
					userRestaurants: [],
				});
			},

			setUserRestaurants: (restaurants: Restaurant[]) => {
				set({ userRestaurants: restaurants });
			},

			addUserRestaurant: (restaurant: Restaurant) => {
				set((state) => {
					if (state.userRestaurants.length >= 10) {
						// Max 10 restaurants per user
						return state;
					}
					return {
						userRestaurants: [...state.userRestaurants, restaurant],
					};
				});
			},

			updateUserRestaurant: (restaurantId: string, restaurant: Restaurant) => {
				set((state) => ({
					userRestaurants: state.userRestaurants.map((r) =>
						r.id === restaurantId ? restaurant : r,
					),
				}));
			},

			removeUserRestaurant: (restaurantId: string) => {
				set((state) => ({
					userRestaurants: state.userRestaurants.filter(
						(r) => r.id !== restaurantId,
					),
				}));
			},
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				userRestaurants: state.userRestaurants,
			}),
		},
	),
);
