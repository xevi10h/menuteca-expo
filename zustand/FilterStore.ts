import { create } from 'zustand';

export interface IFilter {
	textSearch: string;
	cuisines: string[] | null;
	orderBy: 'recommended' | 'price' | 'value' | 'distance';
	orderDirection: 'asc' | 'desc';
	priceRange: {
		min: number;
		max: number;
	};
	ratingRange: {
		min: number;
		max: number;
	};
}

export const defaultFilter: IFilter = {
	textSearch: '',
	cuisines: null,
	orderBy: 'recommended',
	orderDirection: 'desc',
	priceRange: {
		min: 0,
		max: 1000,
	},
	ratingRange: {
		min: 0,
		max: 5,
	},
};

interface FilterState {
	main: IFilter;
	setCuisines: (cuisines: string[] | null) => void;
	setTextSearch: (textSearch: string) => void;
	setOrderBy: (orderBy: 'recommended' | 'price' | 'value' | 'distance') => void;
	setOrderDirection: (orderDirection: 'asc' | 'desc') => void;
	setPriceRange: (priceRange: { min: number; max: number }) => void;
	setRatingRange: (ratingRange: { min: number; max: number }) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
	main: defaultFilter,
	setCuisines: (cuisines: string[] | null) => {
		set((state) => ({ main: { ...state.main, cuisines } }));
	},
	setTextSearch: (textSearch: string) => {
		set((state) => ({ main: { ...state.main, textSearch } }));
	},
	setOrderBy: (orderBy: 'recommended' | 'price' | 'value' | 'distance') => {
		set((state) => ({ main: { ...state.main, orderBy } }));
	},
	setOrderDirection: (orderDirection: 'asc' | 'desc') => {
		set((state) => ({ main: { ...state.main, orderDirection } }));
	},
	setPriceRange: (priceRange: { min: number; max: number }) => {
		set((state) => ({ main: { ...state.main, priceRange } }));
	},
	setRatingRange: (ratingRange: { min: number; max: number }) => {
		set((state) => ({ main: { ...state.main, ratingRange } }));
	},
}));
