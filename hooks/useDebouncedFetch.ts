import { useCallback, useRef, useState } from 'react';

interface UseDebouncedFetchOptions {
	delay?: number;
	onError?: (error: Error) => void;
}

export function useDebouncedFetch<T>(
	fetchFunction: (...args: any[]) => Promise<T>,
	options: UseDebouncedFetchOptions = {},
) {
	const { delay = 300, onError } = options;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastCallRef = useRef<number>(0);

	const debouncedFetch = useCallback(
		async (...args: Parameters<typeof fetchFunction>) => {
			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Check if we're calling too frequently
			const now = Date.now();
			const timeSinceLastCall = now - lastCallRef.current;

			if (timeSinceLastCall < delay) {
				// Wait before making the call
				return new Promise<T>((resolve, reject) => {
					timeoutRef.current = setTimeout(async () => {
						try {
							setIsLoading(true);
							setError(null);
							lastCallRef.current = Date.now();
							const result = await fetchFunction(...args);
							resolve(result);
						} catch (err) {
							const error =
								err instanceof Error ? err : new Error('Unknown error');
							setError(error);
							onError?.(error);
							reject(error);
						} finally {
							setIsLoading(false);
						}
					}, delay - timeSinceLastCall);
				});
			} else {
				// Execute immediately
				try {
					setIsLoading(true);
					setError(null);
					lastCallRef.current = Date.now();
					const result = await fetchFunction(...args);
					return result;
				} catch (err) {
					const error = err instanceof Error ? err : new Error('Unknown error');
					setError(error);
					onError?.(error);
					throw error;
				} finally {
					setIsLoading(false);
				}
			}
		},
		[fetchFunction, delay, onError],
	);

	const cancel = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	return {
		fetch: debouncedFetch,
		isLoading,
		error,
		cancel,
	};
}
