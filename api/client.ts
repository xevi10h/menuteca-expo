// api/client.ts - Fixed to avoid circular dependency
const API_BASE_URL = __DEV__
	? 'http://localhost:3000/api'
	: 'https://your-production-api.com/api';

// Token storage - evitamos el ciclo usando una referencia directa
let authToken: string | null = null;

// Función para actualizar el token desde el store
export const setAuthToken = (token: string | null) => {
	authToken = token;
};

// Función para obtener el token actual
export const getAuthToken = (): string | null => {
	return authToken;
};

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private getAuthToken(): string | null {
		return authToken;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const token = this.getAuthToken();

		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
		};

		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new ApiError(
					errorData.error || `HTTP ${response.status}: ${response.statusText}`,
					response.status,
					errorData.errors,
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			// Si es un error de red/conectividad
			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new ApiError('Network error: Could not connect to server', 0, {
					network: 'Connection failed',
				});
			}

			// Re-lanzar ApiError
			if (error instanceof ApiError) {
				throw error;
			}

			// Error desconocido
			throw new ApiError('Unknown error occurred', 500, {
				unknown: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'GET' });
	}

	async post<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}
}

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public errors?: Record<string, string>,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
