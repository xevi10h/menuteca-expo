import { Restaurant } from '@/components/list/ScrollHorizontalResturant';
import { MenuData } from '@/components/restaurantDetail/Menu';

export const allRestaurants: Restaurant[] = [
	{
		id: 1,
		name: 'Sant Francesc Restaurant',
		minimumPrice: 15,
		cuisine: 'mediterranean',
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
		address: 'Rector Ubach 50, Barcelona',
		coordinates: {
			latitude: 41.3951,
			longitude: 2.1834,
		},
	},
	{
		id: 2,
		name: 'Tika Tacos',
		minimumPrice: 12,
		cuisine: 'mexican',
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
		address: 'Rector Ubach 50, Barcelona',
		coordinates: {
			latitude: 41.4051,
			longitude: 2.1934,
		},
	},
	{
		id: 3,
		name: 'El gran sol',
		minimumPrice: 10,
		cuisine: 'chinese',
		rating: 4.8,
		mainImage:
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',

		images: [
			'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
			'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
			'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg',
		],
		distance: 1.5,
		address: 'Rector Ubach 50, Barcelona',
		coordinates: {
			latitude: 41.3851,
			longitude: 2.1734,
		},
	},
];

// Mock data - en producción esto vendría de una API
export const getRestaurantById = (id: string): Restaurant => {
	return allRestaurants.find((r) => r.id === parseInt(id)) || allRestaurants[0];
};

// Mock data para múltiples menús - en producción esto vendría de una API
export const getMenusByRestaurantId = (id: string): MenuData[] => {
	return [
		{
			id: 1,
			name: 'Menú mediodía',
			subtitle: 'des de 12,95€',
			price: '12,95€',
			categories: [
				{
					id: 1,
					name: 'PRIMEROS',
					items: [
						{
							id: 1,
							name: 'Ensalada César',
							description:
								'Lechuga romana y trozos de pan tostado con jugo de limón, aceite de oliva, huevo, salsa Worcestershire, anchoas, ajo, mostaza de Dijón, queso parmesano y pimienta negra.',
							category: 'PRIMEROS',
							isVegetarian: true,
						},
						{
							id: 2,
							name: 'Gazpacho',
							description:
								'Piña, jícama y mango, jugo de limón, cebolla, chile verde picado, jugo de naranja, un toque de vinagre y sal al gusto.',

							category: 'PRIMEROS',
							isVegetarian: true,
							isVegan: true,
							isLactoseFree: true,
						},
						{
							id: 3,
							name: 'Ensalada tradicional',
							description:
								'Tomates, cebollas, papas y atún, con el toque picante de la Pimienta Negra molida Alicante y los sabores algo alimonados y herbáceos del Tomillo, el Perejil deshidratado y el Romero Alicante.',

							category: 'PRIMEROS',
						},
						{
							id: 4,
							name: 'Sopa de cebolla',
							description:
								'Cebolla, vino blanco, mantequilla, harina de trigo, queso emmental rallado, pan baguette.',
							extraPrice: 1.5,
							category: 'PRIMEROS',
							isVegetarian: true,
						},
					],
				},
				{
					id: 2,
					name: 'SEGUNDOS',
					items: [
						{
							id: 5,
							name: 'Salmón a la plancha',
							description:
								'Salmón fresco a la plancha con verduras de temporada y salsa de limón.',
							category: 'SEGUNDOS',
						},
						{
							id: 6,
							name: 'Paella Valenciana',
							description:
								'Arroz bomba, pollo, conejo, judía verde, garrofón, tomate, azafrán.',
							extraPrice: 3.0,
							category: 'SEGUNDOS',
						},
					],
				},
				{
					id: 3,
					name: 'POSTRES',
					items: [
						{
							id: 7,
							name: 'Crema Catalana',
							description: 'Postre tradicional catalán con crema quemada.',
							category: 'POSTRES',
							isVegetarian: true,
						},
						{
							id: 8,
							name: 'Tiramisú',
							description: 'Postre italiano con café, mascarpone y cacao.',
							category: 'POSTRES',
							isVegetarian: true,
						},
					],
				},
			],
		},
		{
			id: 2,
			name: 'Menú cena',
			subtitle: 'des de 18,95€',
			price: '18,95€',
			categories: [
				{
					id: 4,
					name: 'APERITIVOS',
					items: [
						{
							id: 9,
							name: 'Selección de tapas',
							description:
								'Selección variada de tapas tradicionales españolas y mediterráneas.',
							extraPrice: 2,
							category: 'APERITIVOS',
						},
						{
							id: 10,
							name: 'Tabla de quesos',
							description:
								'Selección de quesos artesanos españoles con frutos secos y mermeladas.',
							category: 'APERITIVOS',
							isVegetarian: true,
						},
					],
				},
				{
					id: 5,
					name: 'PRINCIPALES',
					items: [
						{
							id: 11,
							name: 'Carré de cordero',
							description:
								'Carré de cordero con hierbas de Provenza y patatas confitadas.',
							extraPrice: 3.0,
							category: 'PRINCIPALES',
							isSpicy: true,
						},
						{
							id: 12,
							name: 'Lubina',
							description: 'Lubina salvaje a la sal con verduras de temporada.',
							category: 'PRINCIPALES',
						},
					],
				},
			],
		},
		{
			id: 3,
			name: 'Especial fin de semana',
			subtitle: 'des de 22,95€',
			price: '22,95€',
			categories: [
				{
					id: 6,
					name: 'PRIMEROS ESPECIALES',
					items: [
						{
							id: 13,
							name: 'Ostras',
							description: 'Ostras frescas de la costa con limón y chalota.',
							extraPrice: 4,
							category: 'PRIMEROS ESPECIALES',
						},
					],
				},
				{
					id: 7,
					name: 'PRINCIPALES PREMIUM',
					items: [
						{
							id: 14,
							name: 'Langosta',
							description:
								'Langosta de la costa con mantequilla de hierbas aromáticas.',
							extraPrice: 5,
							category: 'PRINCIPALES PREMIUM',
						},
					],
				},
			],
		},
	];
};
