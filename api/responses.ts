import { DishCategory, RestaurantTag } from '@/shared/enums';
import { Cuisine, MenuData, Restaurant } from '@/shared/types';

export const allRestaurants: Restaurant[] = [
	{
		id: '1',
		name: 'Sant Francesc Restaurant',
		minimumPrice: 15,
		cuisineId: '1', // Mediterranean
		rating: 4.5,
		mainImage:
			'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
		profileImage:
			'https://visitbegur.cat/wp-content/uploads/2021/06/mooma-1024x813.jpg',
		images: [
			'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
		],
		distance: 2.5,
		address: {
			street: 'Carrer Rector Ubach',
			number: '50',
			additionalInformation: '2º A',
			postalCode: '08006',
			city: 'Barcelona',
			country: 'España',
			coordinates: {
				latitude: 41.3951,
				longitude: 2.1834,
			},
			formattedAddress:
				'Carrer Rector Ubach, 50, 2º A, 08006 Barcelona, España',
		},
		tags: [
			RestaurantTag.AIR_CONDITIONING,
			RestaurantTag.VEGETARIAN,
			RestaurantTag.FAMILY_FRIENDLY,
		],
		menus: [],
	},
	{
		id: '2',
		name: 'Tika Tacos',
		minimumPrice: 12,
		cuisineId: '4', // Mexican
		rating: 4.0,
		mainImage:
			'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
		profileImage:
			'https://visitbegur.cat/wp-content/uploads/2021/06/mooma-1024x813.jpg',
		images: [
			'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
		],
		distance: 3.0,
		address: {
			street: 'Carrer de la Pau',
			number: '25',
			additionalInformation: 'Local 3',
			postalCode: '08001',
			city: 'Barcelona',
			country: 'España',
			coordinates: {
				latitude: 41.4051,
				longitude: 2.1934,
			},
			formattedAddress:
				'Carrer de la Pau, 25, Local 3, 08001 Barcelona, España',
		},
		tags: [
			RestaurantTag.AIR_CONDITIONING,
			RestaurantTag.GLUTEN_FREE,
			RestaurantTag.LIVE_MUSIC,
		],
		menus: [],
	},
	{
		id: '3',
		name: 'El gran sol',
		minimumPrice: 10,
		cuisineId: '6', // Chinese
		rating: 4.8,
		mainImage:
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
		profileImage:
			'https://visitbegur.cat/wp-content/uploads/2021/06/mooma-1024x813.jpg',
		images: [
			'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
		],
		distance: 1.5,
		address: {
			street: 'Avinguda Diagonal',
			number: '123',
			additionalInformation: 'Baix B',
			postalCode: '08028',
			city: 'Barcelona',
			country: 'España',
			coordinates: {
				latitude: 41.3851,
				longitude: 2.1734,
			},
			formattedAddress:
				'Avinguda Diagonal, 123, Baix B, 08028 Barcelona, España',
		},
		tags: [
			RestaurantTag.AIR_CONDITIONING,
			RestaurantTag.RESERVATIONS,
			RestaurantTag.PET_FRIENDLY,
		],
		menus: [],
	},
];

export const allCuisines: Cuisine[] = [
	{
		id: '1',
		name: {
			en_US: 'Mediterranean',
			es_ES: 'Mediterráneo',
			ca_ES: 'Mediterrani',
			fr_FR: 'Méditerranéen',
		},
		image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
	},
	{
		id: '2',
		name: {
			en_US: 'Japanese',
			es_ES: 'Japonés',
			ca_ES: 'Japonès',
			fr_FR: 'Japonais',
		},
		image:
			'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		id: '3',
		name: {
			en_US: 'Italian',
			es_ES: 'Italiano',
			ca_ES: 'Italià',
			fr_FR: 'Italien',
		},
		image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
	},
	{
		id: '4',
		name: {
			en_US: 'Mexican',
			es_ES: 'Mexicano',
			ca_ES: 'Mexicà',
			fr_FR: 'Mexicain',
		},
		image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
	},
	{
		id: '5',
		name: {
			en_US: 'American',
			es_ES: 'Americano',
			ca_ES: 'Americà',
			fr_FR: 'Américain',
		},
		image:
			'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		id: '6',
		name: {
			en_US: 'Chinese',
			es_ES: 'Chino',
			ca_ES: 'Xinès',
			fr_FR: 'Chinois',
		},
		image:
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
	},
	{
		id: '7',
		name: {
			en_US: 'Indian',
			es_ES: 'Indio',
			ca_ES: 'Indi',
			fr_FR: 'Indien',
		},
		image:
			'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
	},
	{
		id: '8',
		name: {
			en_US: 'Thai',
			es_ES: 'Tailandés',
			ca_ES: 'Tailandès',
			fr_FR: 'Thaïlandais',
		},
		image:
			'https://images.pexels.com/photos/12153467/pexels-photo-12153467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		id: '9',
		name: {
			en_US: 'Korean',
			es_ES: 'Coreano',
			ca_ES: 'Coreà',
			fr_FR: 'Coréen',
		},
		image:
			'https://images.pexels.com/photos/12973148/pexels-photo-12973148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
	},
	{
		id: '10',
		name: {
			en_US: 'Haute cuisine',
			es_ES: 'Alta cocina',
			ca_ES: 'Alta cuina',
			fr_FR: 'Haute cuisine',
		},
		image:
			'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?fm=jpg&q=60&w=3000',
	},
];

// Mock data - en producción esto vendría de una API
export const getCuisineById = (id: string): Cuisine | undefined => {
	return allCuisines.find((r) => r.id === id);
};

// Mock data - en producción esto vendría de una API
export const getRestaurantById = (id: string): Restaurant => {
	return allRestaurants.find((r) => r.id === id) || allRestaurants[0];
};

export const getMenusByRestaurantId = (id: string): MenuData[] => {
	return [
		{
			id: '1',
			name: 'Menú mediodía',
			subtitle: 'des de 12,95€',
			startTime: '12:00',
			endTime: '16:00',
			days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
			price: 12.95,
			dishes: [
				{
					id: '1',
					name: 'Ensalada César',
					description:
						'Lechuga romana y trozos de pan tostado con jugo de limón, aceite de oliva, huevo, salsa Worcestershire, anchoas, ajo, mostaza de Dijón, queso parmesano y pimienta negra.',
					extraPrice: 0,
					category: DishCategory.APPETIZERS,
					isVegetarian: true,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: true,
				},
				{
					id: '2',
					name: 'Gazpacho',
					description:
						'Piña, jícama y mango, jugo de limón, cebolla, chile verde picado, jugo de naranja, un toque de vinagre y sal al gusto.',
					extraPrice: 0,
					category: DishCategory.APPETIZERS,
					isVegetarian: true,
					isLactoseFree: true,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: true,
				},
				{
					id: '3',
					name: 'Ensalada tradicional',
					description:
						'Tomates, cebollas, papas y atún, con el toque picante de la Pimienta Negra molida Alicante y los sabores algo alimonados y herbáceos del Tomillo, el Perejil deshidratado y el Romero Alicante.',
					extraPrice: 0,
					category: DishCategory.APPETIZERS,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: true,
					isGlutenFree: false,
					isVegan: true,
				},
				{
					id: '4',
					name: 'Sopa de cebolla',
					description:
						'Cebolla, vino blanco, mantequilla, harina de trigo, queso emmental rallado, pan baguette.',
					extraPrice: 1.5,
					category: DishCategory.APPETIZERS,
					isVegetarian: true,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: false,
				},
				{
					id: '5',
					name: 'Salmón a la plancha',
					description:
						'Salmón fresco a la plancha con verduras de temporada y salsa de limón.',
					extraPrice: 0,
					category: DishCategory.SECOND_COURSES,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: false,
				},
				{
					id: '6',
					name: 'Paella Valenciana',
					description:
						'Arroz bomba, pollo, conejo, judía verde, garrofón, tomate, azafrán.',
					extraPrice: 3.0,
					category: DishCategory.SECOND_COURSES,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: false,
				},
				{
					id: '7',
					name: 'Crema Catalana',
					description: 'Postre tradicional catalán con crema quemada.',
					extraPrice: 0,
					category: DishCategory.DESSERTS,
					isVegetarian: true,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: false,
				},
				{
					id: '8',
					name: 'Tiramisú',
					description: 'Postre italiano con café, mascarpone y cacao.',
					extraPrice: 0,
					category: DishCategory.DESSERTS,
					isVegetarian: true,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: false,
				},
			],
		},
		{
			id: '2',
			name: 'Menú cena',
			subtitle: 'des de 18,95€',
			startTime: '19:00',
			endTime: '23:00',
			days: [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
			],
			price: 18.95,
			dishes: [
				{
					id: '9',
					name: 'Selección de tapas',
					description:
						'Selección variada de tapas tradicionales españolas y mediterráneas.',
					extraPrice: 2,
					category: DishCategory.APPETIZERS,
					isVegetarian: false,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: false,
				},
				{
					id: '10',
					name: 'Tabla de quesos',
					description:
						'Selección de quesos artesanos españoles con frutos secos y mermeladas.',
					extraPrice: 0,
					category: DishCategory.APPETIZERS,
					isVegetarian: true,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: false,
					isVegan: false,
				},
				{
					id: '11',
					name: 'Carré de cordero',
					description:
						'Carré de cordero con hierbas de Provenza y patatas confitadas.',
					extraPrice: 3.0,
					category: DishCategory.MAIN_COURSES,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: true,
					isGlutenFree: true,
					isVegan: false,
				},
				{
					id: '12',
					name: 'Lubina',
					description: 'Lubina salvaje a la sal con verduras de temporada.',
					extraPrice: 0,
					category: DishCategory.MAIN_COURSES,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: false,
				},
			],
		},
		{
			id: '3',
			name: 'Especial fin de semana',
			subtitle: 'des de 22,95€',
			startTime: '19:00',
			endTime: '23:30',
			days: ['saturday', 'sunday'],
			price: 22.95,
			dishes: [
				{
					id: '13',
					name: 'Ostras',
					description: 'Ostras frescas de la costa con limón y chalota.',
					extraPrice: 4,
					category: DishCategory.APPETIZERS,
					isVegetarian: false,
					isLactoseFree: true,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: false,
				},
				{
					id: '14',
					name: 'Langosta',
					description:
						'Langosta de la costa con mantequilla de hierbas aromáticas.',
					extraPrice: 5,
					category: DishCategory.MAIN_COURSES,
					isVegetarian: false,
					isLactoseFree: false,
					isSpicy: false,
					isGlutenFree: true,
					isVegan: false,
				},
			],
		},
	];
};
