import { Restaurant } from '@/shared/types';
import { IFilter } from '@/zustand/FilterStore';
import { useMemo } from 'react';

/**
 * Aplica todos los filtros a una lista de restaurantes
 */
export const applyFiltersToRestaurants = (
	restaurants: Restaurant[],
	filters: IFilter,
): Restaurant[] => {
	let filteredRestaurants = [...restaurants];

	// 1. Filtro de texto
	if (filters.textSearch.trim()) {
		const searchTerm = filters.textSearch.toLowerCase();
		filteredRestaurants = filteredRestaurants.filter(
			(restaurant) =>
				restaurant.name.toLowerCase().includes(searchTerm) ||
				restaurant.menus.some(
					(menu) =>
						menu.name.toLowerCase().includes(searchTerm) ||
						menu.dishes.some(
							(dish) =>
								dish.name.toLowerCase().includes(searchTerm) ||
								dish.description.toLowerCase().includes(searchTerm),
						),
				),
		);
	}

	// 2. Filtro de cocinas
	if (filters.cuisines && filters.cuisines.length > 0) {
		filteredRestaurants = filteredRestaurants.filter((restaurant) =>
			filters.cuisines!.includes(restaurant.cuisineId),
		);
	}

	// 3. Filtro de precio
	if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
		filteredRestaurants = filteredRestaurants.filter(
			(restaurant) =>
				restaurant.minimum_price >= filters.priceRange.min &&
				restaurant.minimum_price <= filters.priceRange.max,
		);
	}

	// 4. Filtro de valoración
	if (filters.ratingRange.min > 0) {
		filteredRestaurants = filteredRestaurants.filter(
			(restaurant) =>
				restaurant.rating && restaurant.rating >= filters.ratingRange.min,
		);
	}

	// 5. Filtro de tags (al menos uno debe coincidir)
	if (filters.tags && filters.tags.length > 0) {
		filteredRestaurants = filteredRestaurants.filter(
			(restaurant) =>
				restaurant.tags &&
				restaurant.tags.some((tag) => filters.tags!.includes(tag)),
		);
	}

	// 6. Filtro de horario
	if (filters.timeRange) {
		const { start, end } = filters.timeRange;
		filteredRestaurants = filteredRestaurants.filter((restaurant) =>
			restaurant.menus.some((menu) => {
				// Verificar si el menú está disponible en el rango de tiempo especificado
				const menuStart = timeStringToMinutes(menu.start_time);
				const menuEnd = timeStringToMinutes(menu.end_time);
				const filterStart = timeStringToMinutes(start);
				const filterEnd = timeStringToMinutes(end);

				// El menú debe tener al menos alguna superposición con el rango solicitado
				return menuStart <= filterEnd && menuEnd >= filterStart;
			}),
		);
	}

	// 7. Filtro de distancia
	if (filters.distance) {
		filteredRestaurants = filteredRestaurants.filter(
			(restaurant) => restaurant.distance <= filters.distance!,
		);
	}

	// 8. Ordenamiento
	filteredRestaurants = sortRestaurants(
		filteredRestaurants,
		filters.orderBy,
		filters.orderDirection,
	);

	return filteredRestaurants;
};

/**
 * Convierte una cadena de tiempo (HH:MM) a minutos desde medianoche
 */
const timeStringToMinutes = (timeString: string): number => {
	if (!timeString) return 0;

	const [hours, minutes] = timeString.split(':').map(Number);
	return hours * 60 + minutes;
};

/**
 * Ordena los restaurantes según el criterio especificado
 */
const sortRestaurants = (
	restaurants: Restaurant[],
	orderBy: string,
	direction: 'asc' | 'desc',
): Restaurant[] => {
	const sorted = [...restaurants].sort((a, b) => {
		let comparison = 0;

		switch (orderBy) {
			case 'price':
				comparison = a.minimum_price - b.minimum_price;
				break;
			case 'distance':
				comparison = a.distance - b.distance;
				break;
			case 'recommended':
			default:
				// Algoritmo de recomendación personalizado
				const aScore = calculateRecommendationScore(a);
				const bScore = calculateRecommendationScore(b);
				comparison = bScore - aScore; // Mayor score primero por defecto
				// Para recommended, ignoramos la dirección y siempre mostramos mejor primero
				return comparison;
		}

		return direction === 'desc' ? -comparison : comparison;
	});

	return sorted;
};

/**
 * Calcula un score de recomendación basado en múltiples factores
 */
const calculateRecommendationScore = (restaurant: Restaurant): number => {
	const rating = restaurant.rating || 0;
	const maxDistance = 50; // km
	const distanceScore = Math.max(
		0,
		(maxDistance - restaurant.distance) / maxDistance,
	);

	// Factores de peso
	const ratingWeight = 0.5;
	const distanceWeight = 0.3;
	const priceWeight = 0.2;

	// Score normalizado de precio (precios más bajos tienen mayor score)
	const maxPrice = 100; // €
	const priceScore = Math.max(
		0,
		(maxPrice - restaurant.minimum_price) / maxPrice,
	);

	const totalScore =
		(rating / 5) * ratingWeight +
		distanceScore * distanceWeight +
		priceScore * priceWeight;

	return totalScore;
};

/**
 * Hook personalizado para usar filtros con restaurantes
 */
export const useFilteredRestaurants = (
	restaurants: Restaurant[],
	filters: IFilter,
) => {
	return useMemo(() => {
		return applyFiltersToRestaurants(restaurants, filters);
	}, [restaurants, filters]);
};
