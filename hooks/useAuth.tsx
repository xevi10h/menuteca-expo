// hooks/useAuth.ts (Mejorado basado en tu hook existente)
import { useUserRestaurantsStore } from '@/zustand/UserRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

// Mantengo tu hook original con mejoras
export const useAuth = () => {
	const user = useUserStore((state) => state.user);
	const setDefaultUser = useUserStore((state) => state.setDefaultUser);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const isLoading = useUserStore((state) => state.isLoading);
	const error = useUserStore((state) => state.error);
	const clearError = useUserStore((state) => state.clearError);
	const clearUserData = useUserRestaurantsStore((state) => state.clearUserData);

	// Uso tu lógica original mejorada
	const isLoggedIn = Boolean(user.token && user.id);

	const logout = () => {
		setDefaultUser();
		clearUserData();
	};

	return {
		user,
		isLoggedIn,
		isAuthenticated,
		isLoading,
		error,
		clearError,
		logout,
	};
};

// Nuevos hooks especializados basados en tu estructura
interface UseAuthGuardOptions {
	requireAuth?: boolean;
	redirectTo?: string;
	onAuthChange?: (isAuthenticated: boolean) => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
	const { requireAuth = false, redirectTo, onAuthChange } = options;

	const router = useRouter();
	const [hasRedirected, setHasRedirected] = useState(false);
	const { isLoggedIn, isAuthenticated, isLoading, user, error } = useAuth();
	const isInitialized = useUserStore((state) => state.isInitialized);

	// Handle authentication state changes
	useEffect(() => {
		if (!isInitialized || isLoading || hasRedirected) return;

		// Call onAuthChange callback if provided
		if (onAuthChange) {
			onAuthChange(isAuthenticated);
		}

		// Handle redirects based on authentication state
		if (requireAuth && !isAuthenticated) {
			// User needs to be authenticated but isn't
			const targetRoute = redirectTo || '/auth';
			router.replace(targetRoute);
			setHasRedirected(true);
		} else if (!requireAuth && isAuthenticated && redirectTo) {
			// User is authenticated but shouldn't be (e.g., on auth pages)
			router.replace(redirectTo);
			setHasRedirected(true);
		}
	}, [
		isAuthenticated,
		isLoading,
		isInitialized,
		requireAuth,
		redirectTo,
		router,
		onAuthChange,
		hasRedirected,
	]);

	// Reset redirect flag when authentication state changes
	useEffect(() => {
		setHasRedirected(false);
	}, [isAuthenticated]);

	return {
		isAuthenticated,
		isLoggedIn,
		isLoading: isLoading || !isInitialized,
		isInitialized,
		user,
		error,
	};
};

// Hook especializado para páginas que requieren autenticación
export const useRequireAuth = (redirectTo?: string) => {
	return useAuthGuard({
		requireAuth: true,
		redirectTo: redirectTo || '/auth',
	});
};

// Hook especializado para páginas solo para invitados (login, register, etc.)
export const useGuestOnly = (redirectTo?: string) => {
	return useAuthGuard({
		requireAuth: false,
		redirectTo: redirectTo || '/',
		onAuthChange: (isAuthenticated) => {
			// Si el usuario se autentica mientras está en una página de invitado,
			// será redirigido automáticamente
		},
	});
};

// Hook para obtener solo el estado de autenticación sin redirecciones
export const useAuthStatus = () => {
	const { isLoggedIn, isAuthenticated, isLoading, user } = useAuth();
	const isInitialized = useUserStore((state) => state.isInitialized);

	return {
		isAuthenticated,
		isLoggedIn,
		isLoading: isLoading || !isInitialized,
		isInitialized,
		user,
		isGuest: isInitialized && !isLoading && !isAuthenticated,
	};
};
