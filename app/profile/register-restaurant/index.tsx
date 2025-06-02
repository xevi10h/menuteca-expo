import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RegisterRestaurantIndex() {
	const router = useRouter();

	useEffect(() => {
		// Redirigir inmediatamente a la primera pantalla del flujo
		router.replace('/profile/register-restaurant/has-menu');
	}, []);

	return null;
}
