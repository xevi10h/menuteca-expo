import { useUserRestaurantsStore } from '@/zustand/UserRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';

export const useAuth = () => {
	const user = useUserStore((state) => state.user);
	const setDefaultUser = useUserStore((state) => state.setDefaultUser);
	const clearUserData = useUserRestaurantsStore((state) => state.clearUserData);

	const isLoggedIn = Boolean(user.token && user.id);

	const logout = () => {
		setDefaultUser();
		clearUserData();
	};

	return {
		user,
		isLoggedIn,
		logout,
	};
};
