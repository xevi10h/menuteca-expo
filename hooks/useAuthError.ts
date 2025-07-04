import { useCallback, useState } from 'react';

interface AuthErrorState {
	isVisible: boolean;
	title?: string;
	message: string;
	type: 'error' | 'warning' | 'info';
	onRetry?: () => void;
}

interface UseAuthErrorReturn {
	error: AuthErrorState;
	showError: (message: string, options?: Partial<AuthErrorState>) => void;
	showWarning: (message: string, options?: Partial<AuthErrorState>) => void;
	showInfo: (message: string, options?: Partial<AuthErrorState>) => void;
	hideError: () => void;
	isErrorVisible: boolean;
}

// Estado inicial constante para evitar recreación
const INITIAL_ERROR_STATE: AuthErrorState = {
	isVisible: false,
	message: '',
	type: 'error',
};

export const useAuthError = (): UseAuthErrorReturn => {
	const [error, setError] = useState<AuthErrorState>(INITIAL_ERROR_STATE);

	const showError = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError((prevError) => ({
				...prevError,
				isVisible: true,
				message,
				type: 'error',
				...options,
			}));
		},
		[],
	);

	const showWarning = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError((prevError) => ({
				...prevError,
				isVisible: true,
				message,
				type: 'warning',
				...options,
			}));
		},
		[],
	);

	const showInfo = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError((prevError) => ({
				...prevError,
				isVisible: true,
				message,
				type: 'info',
				...options,
			}));
		},
		[],
	);

	const hideError = useCallback(() => {
		setError((prevError) => ({
			...prevError,
			isVisible: false,
		}));
	}, []);

	return {
		error,
		showError,
		showWarning,
		showInfo,
		hideError,
		isErrorVisible: error.isVisible,
	};
};
