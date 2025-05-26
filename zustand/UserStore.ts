import { getDeviceLanguage } from '@/shared/functions/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import IUser from '../shared/interfaces/IUser';
import { Language } from '../shared/types/Language';

interface UserState {
	user: IUser;
	setUser: (user: IUser) => void;
	updatePhoto: (photo: string) => void;
	updateUsername: (username: string) => void;
	setDefaultUser: () => void;
	setLanguage: (language: Language) => void;
	persist?: {
		clearStorage: () => void;
	};
}

export const undefinedUser: IUser = {
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
			setUser: (user: IUser) => {
				set((state) => ({
					user: { ...state.user, ...user },
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
				});
			},
			setLanguage: (language: Language) => {
				set((state) => ({ user: { ...state.user, language } }));
			},
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ user: state.user }),
		},
	),
);
