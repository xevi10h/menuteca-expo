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

export const useAuthError = (): UseAuthErrorReturn => {
	const [error, setError] = useState<AuthErrorState>({
		isVisible: false,
		message: '',
		type: 'error',
	});

	const showError = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError({
				isVisible: true,
				message,
				type: 'error',
				...options,
			});
		},
		[],
	);

	const showWarning = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError({
				isVisible: true,
				message,
				type: 'warning',
				...options,
			});
		},
		[],
	);

	const showInfo = useCallback(
		(message: string, options?: Partial<AuthErrorState>) => {
			setError({
				isVisible: true,
				message,
				type: 'info',
				...options,
			});
		},
		[],
	);

	const hideError = useCallback(() => {
		setError((prev) => ({
			...prev,
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
