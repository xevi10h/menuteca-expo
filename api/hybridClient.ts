// api/hybridClient.ts
import { supabase } from '@/lib/supabase';

const API_BASE_URL = __DEV__
	? 'http://localhost:3000/api'
	: 'https://your-production-api.com/api';

/**
 * Cliente híbrido que combina Supabase Auth con tu API actual
 */
class HybridApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	/**
	 * Obtiene el token de Supabase para autenticar con tu API
	 */
	private async getSupabaseToken(): Promise<string | null> {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return session?.access_token || null;
	}

	/**
	 * Realiza requests a tu API actual usando token de Supabase
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const token = await this.getSupabaseToken();

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
			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new ApiError('Network error: Could not connect to server', 0, {
					network: 'Connection failed',
				});
			}

			if (error instanceof ApiError) {
				throw error;
			}

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

export const hybridApiClient = new HybridApiClient(API_BASE_URL);
