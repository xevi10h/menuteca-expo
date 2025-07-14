// hooks/useAvailabilityCheck.ts
import { SupabaseAuthService } from '@/api/supabaseAuth';
import { useUserStore } from '@/zustand/UserStore';
import { useCallback, useEffect, useState } from 'react';

interface AvailabilityState {
	isChecking: boolean;
	isAvailable: boolean | null;
	error: string | null;
}

/**
 * Hook para verificar disponibilidad de username en tiempo real
 */
export const useUsernameAvailability = (
	username: string,
	debounceMs: number = 500,
) => {
	const [state, setState] = useState<AvailabilityState>({
		isChecking: false,
		isAvailable: null,
		error: null,
	});

	const currentUserId = useUserStore((state) => state.user.id);

	const checkAvailability = useCallback(
		async (usernameToCheck: string) => {
			if (!usernameToCheck || usernameToCheck.length < 3) {
				setState({
					isChecking: false,
					isAvailable: null,
					error: 'Username must be at least 3 characters',
				});
				return;
			}

			setState((prev) => ({ ...prev, isChecking: true, error: null }));

			try {
				let result;

				if (currentUserId) {
					// Para usuarios autenticados, excluir su propio username
					result = await SupabaseAuthService.checkUsernameAvailabilityForUpdate(
						usernameToCheck,
						currentUserId,
					);
				} else {
					// Para nuevos usuarios
					result = await SupabaseAuthService.checkUsernameAvailability(
						usernameToCheck,
					);
				}

				if (result.success) {
					setState({
						isChecking: false,
						isAvailable: result.data?.available ?? false,
						error: null,
					});
				} else {
					setState({
						isChecking: false,
						isAvailable: null,
						error: result.error || 'Failed to check username availability',
					});
				}
			} catch (error) {
				setState({
					isChecking: false,
					isAvailable: null,
					error:
						error instanceof Error ? error.message : 'Failed to check username',
				});
			}
		},
		[currentUserId],
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			checkAvailability(username);
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [username, checkAvailability, debounceMs]);

	return {
		...state,
		checkNow: () => checkAvailability(username),
	};
};

/**
 * Hook para verificar disponibilidad de email en tiempo real
 */
export const useEmailAvailability = (
	email: string,
	debounceMs: number = 500,
) => {
	const [state, setState] = useState<AvailabilityState>({
		isChecking: false,
		isAvailable: null,
		error: null,
	});

	const checkAvailability = useCallback(async (emailToCheck: string) => {
		// Validación básica de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailToCheck || !emailRegex.test(emailToCheck)) {
			setState({
				isChecking: false,
				isAvailable: null,
				error: 'Please enter a valid email address',
			});
			return;
		}

		setState((prev) => ({ ...prev, isChecking: true, error: null }));

		try {
			const result = await SupabaseAuthService.checkEmailAvailability(
				emailToCheck,
			);

			if (result.success) {
				setState({
					isChecking: false,
					isAvailable: result.data?.available ?? false,
					error: null,
				});
			} else {
				setState({
					isChecking: false,
					isAvailable: null,
					error: result.error || 'Failed to check email availability',
				});
			}
		} catch (error) {
			setState({
				isChecking: false,
				isAvailable: null,
				error: error instanceof Error ? error.message : 'Failed to check email',
			});
		}
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			checkAvailability(email);
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [email, checkAvailability, debounceMs]);

	return {
		...state,
		checkNow: () => checkAvailability(email),
	};
};

/**
 * Utilidades para mostrar mensajes de estado
 */
export const getAvailabilityMessage = (
	isChecking: boolean,
	isAvailable: boolean | null,
	error: string | null,
	fieldName: string = 'Field',
) => {
	if (error) {
		return { type: 'error', message: error };
	}

	if (isChecking) {
		return {
			type: 'loading',
			message: `Checking ${fieldName.toLowerCase()} availability...`,
		};
	}

	if (isAvailable === true) {
		return { type: 'success', message: `${fieldName} is available!` };
	}

	if (isAvailable === false) {
		return { type: 'error', message: `${fieldName} is already taken` };
	}

	return null;
};

/**
 * Ejemplo de uso en un componente:
 *
 * const [username, setUsername] = useState('');
 * const { isChecking, isAvailable, error } = useUsernameAvailability(username);
 * const message = getAvailabilityMessage(isChecking, isAvailable, error, 'Username');
 *
 * return (
 *   <View>
 *     <TextInput
 *       value={username}
 *       onChangeText={setUsername}
 *       placeholder="Username"
 *     />
 *     {message && (
 *       <Text style={{ color: message.type === 'error' ? 'red' : 'green' }}>
 *         {message.message}
 *       </Text>
 *     )}
 *   </View>
 * );
 */
