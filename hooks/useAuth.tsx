import { useUserRestaurantsStore } from '@/zustand/UserRestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

// Hook básico de autenticación
export const useAuth = () => {
	const user = useUserStore((state) => state.user);
	const setDefaultUser = useUserStore((state) => state.setDefaultUser);
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const isLoading = useUserStore((state) => state.isLoading);
	const error = useUserStore((state) => state.error);
	const clearError = useUserStore((state) => state.clearError);
	const clearUserData = useUserRestaurantsStore((state) => state.clearUserData);

	// Lógica de login mejorada
	const isLoggedIn = Boolean(user.token && user.id);

	const logout = useCallback(() => {
		setDefaultUser();
		clearUserData();
	}, [setDefaultUser, clearUserData]);

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

// Opciones para el guard de autenticación
interface UseAuthGuardOptions {
	requireAuth?: boolean;
	redirectTo?: Href;
	onAuthChange?: (isAuthenticated: boolean) => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
	const { requireAuth = false, redirectTo, onAuthChange } = options;

	const router = useRouter();
	const [hasRedirected, setHasRedirected] = useState(false);
	const { isLoggedIn, isAuthenticated, isLoading, user, error } = useAuth();
	const isInitialized = useUserStore((state) => state.isInitialized);

	// Usar refs para evitar dependencias que cambien constantemente
	const lastAuthState = useRef<boolean | null>(null);
	const redirectProcessed = useRef(false);

	// Callback para cambios de autenticación
	const handleAuthChange = useCallback(
		(authState: boolean) => {
			if (onAuthChange && lastAuthState.current !== authState) {
				lastAuthState.current = authState;
				onAuthChange(authState);
			}
		},
		[onAuthChange],
	);

	// Manejar cambios de estado de autenticación
	useEffect(() => {
		// No hacer nada si no está inicializado o está cargando
		if (!isInitialized || isLoading) return;

		// No hacer nada si ya hemos procesado un redirect
		if (redirectProcessed.current) return;

		// Llamar callback de cambio de autenticación
		handleAuthChange(isAuthenticated);

		// Manejar redirects basados en el estado de autenticación
		if (requireAuth && !isAuthenticated) {
			// Usuario necesita estar autenticado pero no lo está
			const targetRoute: Href = redirectTo || '/auth';
			console.log('🔄 Redirecting to auth:', targetRoute);
			router.replace(targetRoute);
			redirectProcessed.current = true;
			setHasRedirected(true);
		} else if (!requireAuth && isAuthenticated && redirectTo) {
			// Usuario está autenticado pero no debería estar (ej: páginas de auth)
			console.log('🔄 Redirecting authenticated user:', redirectTo);
			router.replace(redirectTo);
			redirectProcessed.current = true;
			setHasRedirected(true);
		}
	}, [
		isAuthenticated,
		isLoading,
		isInitialized,
		requireAuth,
		redirectTo,
		router,
		handleAuthChange,
	]);

	// Reset redirect flag cuando cambie el estado de autenticación
	useEffect(() => {
		if (
			lastAuthState.current !== null &&
			lastAuthState.current !== isAuthenticated
		) {
			redirectProcessed.current = false;
			setHasRedirected(false);
		}
	}, [isAuthenticated]);

	return {
		isAuthenticated,
		isLoggedIn,
		isLoading: isLoading || !isInitialized,
		isInitialized,
		user,
		error,
		hasRedirected,
	};
};

// Hook especializado para páginas que requieren autenticación
export const useRequireAuth = (redirectTo?: Href) => {
	return useAuthGuard({
		requireAuth: true,
		redirectTo: redirectTo || '/auth',
	});
};

// Hook especializado para páginas solo para invitados (login, register, etc.)
export const useGuestOnly = (redirectTo?: Href) => {
	return useAuthGuard({
		requireAuth: false,
		redirectTo: redirectTo || '/',
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
