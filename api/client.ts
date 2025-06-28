import { useUserStore } from '@/zustand/UserStore';

const API_BASE_URL = __DEV__
	? 'http://localhost:3000/api'
	: 'https://your-production-api.com/api';

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private getAuthToken(): string | null {
		const userStore = useUserStore.getState();
		return userStore.user.token || null;
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

		const response = await fetch(`${this.baseURL}${endpoint}`, config);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new ApiError(
				errorData.error || 'Network error',
				response.status,
				errorData.errors,
			);
		}

		const data = await response.json();
		return data;
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
