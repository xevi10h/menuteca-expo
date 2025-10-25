import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { useFilterStore } from '@/zustand/FilterStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import DistanceFilterModal from './filters/DistanceFilterModal';
import FilterButton from './filters/FilterButton';
import PriceFilterModal from './filters/PriceFilterModal';
import RatingFilterModal from './filters/RatingFilterModal';
import ScheduleFilterModal from './filters/ScheduleFilterModal';
import SortButton from './filters/SortButton';
import TagsFilterModal from './filters/TagsFilterModal';
import {
	createTimeFromString,
	formatTime,
	formatTimeFromDate,
} from './filters/filterUtils';

// Type for filter modal
type FilterModalType =
	| 'price'
	| 'rating'
	| 'tags'
	| 'schedule'
	| 'distance'
	| null;

export default function ListFilter() {
	const { t } = useTranslation();
	const [activeModal, setActiveModal] = useState<FilterModalType>(null);

	// Get filter state
	const {
		main: filters,
		setPriceRange,
		setRatingRange,
		setTags,
		setTimeRange,
		setDistance,
		resetRemovableFilters,
	} = useFilterStore();

	// Local state for modals
	const [tempPriceMin, setTempPriceMin] = useState('0');
	const [tempPriceMax, setTempPriceMax] = useState('1000');
	const [tempRating, setTempRating] = useState('0');
	const [tempSelectedTags, setTempSelectedTags] = useState<RestaurantTag[]>([]);
	const [tempDistance, setTempDistance] = useState('');

	// Estados para rating personalizado
	const [customRating, setCustomRating] = useState('');
	const [isCustomRatingSelected, setIsCustomRatingSelected] = useState(false);

	// Time picker states
	const [activeTimePicker, setActiveTimePicker] = useState<
		'start' | 'end' | null
	>(null);
	const [start_time, setStartTime] = useState(new Date());
	const [end_time, setEndTime] = useState(new Date());

	// Check if specific filter types are active (excluding sort and cuisines)
	const hasPriceFilter =
		filters.priceRange.min > 0 || filters.priceRange.max < 1000;
	const hasRatingFilter = filters.ratingRange.min > 0;
	const hasTagsFilter = filters.tags && filters.tags.length > 0;
	const hasScheduleFilter = filters.timeRange !== null;
	const hasDistanceFilter = filters.distance !== null;
	const hasCuisinesFilter = filters.cuisines && filters.cuisines.length > 0;

	// Check if any non-persistent filters are active (excludes sort and cuisines)
	const hasActiveFilters =
		hasPriceFilter ||
		hasRatingFilter ||
		hasTagsFilter ||
		hasScheduleFilter ||
		hasDistanceFilter ||
		hasCuisinesFilter;

	// Modal handlers
	const openModal = (type: FilterModalType) => {
		// Reset temp values to current filter values
		setTempPriceMin(filters.priceRange.min.toString());
		setTempPriceMax(filters.priceRange.max.toString());
		setTempRating(filters.ratingRange.min.toString());
		setTempSelectedTags(filters.tags || []);
		setTempDistance(filters.distance?.toString() || '');

		// Para rating modal, configurar valores por defecto
		if (type === 'rating') {
			const currentRating = filters.ratingRange.min;
			// Verificar si es una opción predefinida
			if ([4, 4.5, 3, 3.5].includes(currentRating)) {
				setTempRating(currentRating.toString());
				setIsCustomRatingSelected(false);
				setCustomRating('');
			} else if (currentRating > 0) {
				// Es una valoración personalizada
				setTempRating('custom');
				setIsCustomRatingSelected(true);
				setCustomRating(currentRating.toString());
			} else {
				// Si no hay filtro activo, usar 4 por defecto
				setTempRating('4');
				setIsCustomRatingSelected(false);
			}
		}

		// Set up time pickers
		if (type === 'schedule') {
			const startTimeObj = createTimeFromString(
				filters.timeRange?.start || '12:00',
			);
			const endTimeObj = createTimeFromString(
				filters.timeRange?.end || '14:00',
			);
			setStartTime(startTimeObj);
			setEndTime(endTimeObj);
		}

		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal(null);
		setActiveTimePicker(null);
		setIsCustomRatingSelected(false);
		setCustomRating('');
	};

	// Apply filters handlers
	const applyPriceFilter = () => {
		const min = Math.max(0, parseInt(tempPriceMin) || 0);
		const max = Math.min(1000, parseInt(tempPriceMax) || 1000);
		setPriceRange({ min, max });
		closeModal();
	};

	const applyRatingFilter = () => {
		let minRating = 0;

		if (isCustomRatingSelected) {
			// Usar valoración personalizada
			minRating = Math.max(0, Math.min(5, parseFloat(customRating) || 0));
		} else {
			// Usar valoración predefinida
			minRating = Math.max(0, Math.min(5, parseFloat(tempRating) || 0));
		}

		setRatingRange({ min: minRating, max: 5 });
		closeModal();
	};

	const applyTagsFilter = () => {
		setTags(tempSelectedTags.length > 0 ? tempSelectedTags : null);
		closeModal();
	};

	const applyScheduleFilter = () => {
		const startTimeStr = formatTimeFromDate(start_time);
		const endTimeStr = formatTimeFromDate(end_time);

		setTimeRange({ start: startTimeStr, end: endTimeStr });
		closeModal();
	};

	const applyDistanceFilter = () => {
		const dist = parseInt(tempDistance) || null;
		setDistance(dist);
		closeModal();
	};

	// Time picker handlers
	const handleTimeChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setActiveTimePicker(null);
		}
		if (selectedDate) {
			if (activeTimePicker === 'start') {
				setStartTime(selectedDate);
			} else if (activeTimePicker === 'end') {
				setEndTime(selectedDate);
			}
		}
	};

	const confirmTime = () => {
		setActiveTimePicker(null);
	};

	// Toggle tag selection
	const toggleTag = (tag: RestaurantTag) => {
		setTempSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	// Rating option handlers
	const selectRatingOption = (rating: string) => {
		if (rating === 'custom') {
			setIsCustomRatingSelected(true);
			setTempRating('custom');
		} else {
			setIsCustomRatingSelected(false);
			setTempRating(rating);
			setCustomRating('');
		}
	};

	// Render active filters (excluding sort and cuisines)
	const renderActiveFilters = () => {
		const activeFilters = [];

		// Price filter
		if (hasPriceFilter) {
			activeFilters.push(
				<TouchableOpacity
					key="price"
					style={styles.activeFilterPill}
					onPress={() => openModal('price')}
				>
					<Text style={styles.activeFilterText}>
						{filters.priceRange.min}€ - {filters.priceRange.max}€
					</Text>
					<TouchableOpacity
						onPress={() => setPriceRange({ min: 0, max: 1000 })}
						style={styles.removeFilterButton}
					>
						<Ionicons name="close" size={12} color={colors.quaternary} />
					</TouchableOpacity>
				</TouchableOpacity>,
			);
		}

		// Rating filter
		if (hasRatingFilter) {
			const ratingText = `${filters.ratingRange.min}+ ★`;

			activeFilters.push(
				<TouchableOpacity
					key="rating"
					style={styles.activeFilterPill}
					onPress={() => openModal('rating')}
				>
					<Text style={styles.activeFilterText}>{ratingText}</Text>
					<TouchableOpacity
						onPress={() => setRatingRange({ min: 0, max: 5 })}
						style={styles.removeFilterButton}
					>
						<Ionicons name="close" size={12} color={colors.quaternary} />
					</TouchableOpacity>
				</TouchableOpacity>,
			);
		}

		// Tags filter
		if (hasTagsFilter) {
			activeFilters.push(
				<TouchableOpacity
					key="tags"
					style={styles.activeFilterPill}
					onPress={() => openModal('tags')}
				>
					<Text style={styles.activeFilterText}>
						{filters.tags!.length} {t('filters.categories')}
					</Text>
					<TouchableOpacity
						onPress={() => setTags(null)}
						style={styles.removeFilterButton}
					>
						<Ionicons name="close" size={12} color={colors.quaternary} />
					</TouchableOpacity>
				</TouchableOpacity>,
			);
		}

		// Schedule filter
		if (hasScheduleFilter) {
			activeFilters.push(
				<TouchableOpacity
					key="schedule"
					style={styles.activeFilterPill}
					onPress={() => openModal('schedule')}
				>
					<Text style={styles.activeFilterText}>
						{formatTime(filters.timeRange!.start)} -{' '}
						{formatTime(filters.timeRange!.end)}
					</Text>
					<TouchableOpacity
						onPress={() => setTimeRange(null)}
						style={styles.removeFilterButton}
					>
						<Ionicons name="close" size={12} color={colors.quaternary} />
					</TouchableOpacity>
				</TouchableOpacity>,
			);
		}

		// Distance filter
		if (hasDistanceFilter) {
			activeFilters.push(
				<TouchableOpacity
					key="distance"
					style={styles.activeFilterPill}
					onPress={() => openModal('distance')}
				>
					<Text style={styles.activeFilterText}>{filters.distance}km</Text>
					<TouchableOpacity
						onPress={() => setDistance(null)}
						style={styles.removeFilterButton}
					>
						<Ionicons name="close" size={12} color={colors.quaternary} />
					</TouchableOpacity>
				</TouchableOpacity>,
			);
		}

		return activeFilters;
	};

	// Render default filter options (only show if not already applied)
	const renderDefaultFilters = () => {
		const availableFilters = [];

		if (!hasPriceFilter) {
			availableFilters.push(
				<FilterButton
					key="price"
					label={t('filters.price')}
					iconName="pricetag-outline"
					onPress={() => openModal('price')}
				/>,
			);
		}

		if (!hasRatingFilter) {
			availableFilters.push(
				<FilterButton
					key="rating"
					label={t('filters.rating')}
					iconName="star-outline"
					onPress={() => openModal('rating')}
				/>,
			);
		}

		if (!hasTagsFilter) {
			availableFilters.push(
				<FilterButton
					key="tags"
					label={t('filters.categories')}
					iconName="grid-outline"
					onPress={() => openModal('tags')}
				/>,
			);
		}

		if (!hasScheduleFilter) {
			availableFilters.push(
				<FilterButton
					key="schedule"
					label={t('filters.schedule')}
					iconName="time-outline"
					onPress={() => openModal('schedule')}
				/>,
			);
		}

		if (!hasDistanceFilter) {
			availableFilters.push(
				<FilterButton
					key="distance"
					label={t('filters.distance')}
					iconName="location-outline"
					onPress={() => openModal('distance')}
				/>,
			);
		}

		return availableFilters;
	};

	return (
		<View style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Clear all filters button (only show if removable filters are active) */}
				{hasActiveFilters && (
					<>
						<TouchableOpacity
							style={styles.clearAllButton}
							onPress={resetRemovableFilters}
						>
							<Ionicons name="close-circle" size={16} color={colors.primary} />
							<Text style={styles.clearAllText}>{t('filters.clearAll')}</Text>
						</TouchableOpacity>

						<SortButton />
					</>
				)}

				{/* Active filters */}
				{renderActiveFilters()}

				{/* Default filter options */}
				{renderDefaultFilters()}
			</ScrollView>

			<PriceFilterModal
				visible={activeModal === 'price'}
				tempPriceMin={tempPriceMin}
				tempPriceMax={tempPriceMax}
				onMinChange={setTempPriceMin}
				onMaxChange={setTempPriceMax}
				onApply={applyPriceFilter}
				onClose={closeModal}
			/>

			<RatingFilterModal
				visible={activeModal === 'rating'}
				tempRating={tempRating}
				isCustomRatingSelected={isCustomRatingSelected}
				customRating={customRating}
				onSelectRating={selectRatingOption}
				onCustomRatingChange={(text) => {
					const regex = /^[0-5]?(\.[0-9]?)?$/;
					if (regex.test(text) || text === '') {
						setCustomRating(text);
					}
				}}
				onApply={applyRatingFilter}
				onClose={closeModal}
			/>

			<TagsFilterModal
				visible={activeModal === 'tags'}
				tempSelectedTags={tempSelectedTags}
				onToggleTag={toggleTag}
				onApply={applyTagsFilter}
				onClose={closeModal}
			/>

			<ScheduleFilterModal
				visible={activeModal === 'schedule'}
				startTime={start_time}
				endTime={end_time}
				activeTimePicker={activeTimePicker}
				onStartTimePress={() => setActiveTimePicker('start')}
				onEndTimePress={() => setActiveTimePicker('end')}
				onTimeChange={handleTimeChange}
				onConfirmTime={confirmTime}
				onApply={applyScheduleFilter}
				onClose={closeModal}
			/>

			<DistanceFilterModal
				visible={activeModal === 'distance'}
				tempDistance={tempDistance}
				onDistanceChange={setTempDistance}
				onApply={applyDistanceFilter}
				onClose={closeModal}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		minHeight: 32,
		width: '100%',
		paddingVertical: 8,
	},
	scrollContent: {
		paddingHorizontal: 10,
		gap: 8,
	},
	clearAllButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	clearAllText: {
		color: colors.primary,
		fontSize: 12,
		fontFamily: fonts.medium,
	},
	activeFilterPill: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	activeFilterText: {
		color: colors.quaternary,
		fontSize: 12,
		fontFamily: fonts.medium,
	},
	removeFilterButton: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.3)',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
