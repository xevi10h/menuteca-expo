import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantTag } from '@/shared/enums';
import { useFilterStore } from '@/zustand/FilterStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterButton from './filters/FilterButton';
import SortButton from './filters/SortButton';

// Type for filter modal
type FilterModalType =
	| 'price'
	| 'rating'
	| 'tags'
	| 'schedule'
	| 'distance'
	| null;

// Component for individual tag selection
const TagButton = ({
	tag,
	isSelected,
	onToggle,
}: {
	tag: RestaurantTag;
	isSelected: boolean;
	onToggle: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
			onPress={onToggle}
		>
			<Text
				style={[
					styles.tagButtonText,
					isSelected && styles.tagButtonTextSelected,
				]}
			>
				{t(`restaurantTags.${tag}`)}
			</Text>
		</TouchableOpacity>
	);
};

export default function ListFilter() {
	const { t } = useTranslation();
	const [activeModal, setActiveModal] = useState<FilterModalType>(null);
	const { bottom } = useSafeAreaInsets();

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

	// Time picker states
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);
	const [startTime, setStartTime] = useState(new Date());
	const [endTime, setEndTime] = useState(new Date());

	// Check if specific filter types are active (excluding sort and cuisines)
	const hasPriceFilter =
		filters.priceRange.min > 0 || filters.priceRange.max < 1000;
	const hasRatingFilter = filters.ratingRange.min > 0;
	const hasTagsFilter = filters.tags && filters.tags.length > 0;
	const hasScheduleFilter = filters.timeRange !== null;
	const hasDistanceFilter = filters.distance !== null;

	// Check if any non-persistent filters are active (excludes sort and cuisines)
	const hasActiveFilters =
		hasPriceFilter ||
		hasRatingFilter ||
		hasTagsFilter ||
		hasScheduleFilter ||
		hasDistanceFilter;

	// Helper function to create time from string
	const createTimeFromString = (timeString: string) => {
		const [hours, minutes] = timeString
			.split(':')
			.map((num) => parseInt(num, 10));
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	};

	// Helper function to format time from date
	const formatTimeFromDate = (date: Date) => {
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	};

	// Format time for display
	const formatTime = (time: string) => {
		if (!time) return '';
		return time.length === 5 ? time : time + ':00';
	};

	// Modal handlers
	const openModal = (type: FilterModalType) => {
		// Reset temp values to current filter values
		setTempPriceMin(filters.priceRange.min.toString());
		setTempPriceMax(filters.priceRange.max.toString());
		setTempRating(filters.ratingRange.min.toString());
		setTempSelectedTags(filters.tags || []);
		setTempDistance(filters.distance?.toString() || '');

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
		setShowStartTimePicker(false);
		setShowEndTimePicker(false);
	};

	// Apply filters handlers
	const applyPriceFilter = () => {
		const min = Math.max(0, parseInt(tempPriceMin) || 0);
		const max = Math.min(1000, parseInt(tempPriceMax) || 1000);
		setPriceRange({ min, max });
		closeModal();
	};

	const applyRatingFilter = () => {
		const min = Math.max(0, Math.min(5, parseFloat(tempRating) || 0));
		setRatingRange({ min, max: 5 });
		closeModal();
	};

	const applyTagsFilter = () => {
		setTags(tempSelectedTags.length > 0 ? tempSelectedTags : null);
		closeModal();
	};

	const applyScheduleFilter = () => {
		const startTimeStr = formatTimeFromDate(startTime);
		const endTimeStr = formatTimeFromDate(endTime);

		setTimeRange({ start: startTimeStr, end: endTimeStr });
		closeModal();
	};

	const applyDistanceFilter = () => {
		const dist = parseInt(tempDistance) || null;
		setDistance(dist);
		closeModal();
	};

	// Time picker handlers
	const handleStartTimeChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShowStartTimePicker(false);
		}
		if (selectedDate) {
			setStartTime(selectedDate);
		}
	};

	const handleEndTimeChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShowEndTimePicker(false);
		}
		if (selectedDate) {
			setEndTime(selectedDate);
		}
	};

	const confirmStartTime = () => {
		setShowStartTimePicker(false);
	};

	const confirmEndTime = () => {
		setShowEndTimePicker(false);
	};

	// Toggle tag selection
	const toggleTag = (tag: RestaurantTag) => {
		setTempSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
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
			activeFilters.push(
				<TouchableOpacity
					key="rating"
					style={styles.activeFilterPill}
					onPress={() => openModal('rating')}
				>
					<Text style={styles.activeFilterText}>
						+{filters.ratingRange.min}★
					</Text>
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
				{/* Sort Button - Always first and always visible */}
				<SortButton />

				{/* Clear all filters button (only show if removable filters are active) */}
				{hasActiveFilters && (
					<TouchableOpacity
						style={styles.clearAllButton}
						onPress={resetRemovableFilters}
					>
						<Ionicons name="close-circle" size={16} color={colors.primary} />
						<Text style={styles.clearAllText}>{t('filters.clearAll')}</Text>
					</TouchableOpacity>
				)}

				{/* Active filters */}
				{renderActiveFilters()}

				{/* Default filter options */}
				{renderDefaultFilters()}
			</ScrollView>

			{/* Price Filter Modal */}
			<Modal
				visible={activeModal === 'price'}
				transparent
				animationType="slide"
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={closeModal}
				>
					<TouchableOpacity
						style={[styles.modalContent, { paddingBottom: bottom + 20 }]}
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<Text style={styles.modalTitle}>{t('filters.priceRange')}</Text>

						<View style={styles.priceInputContainer}>
							<View style={styles.priceInputWrapper}>
								<Text style={styles.inputLabel}>{t('filters.from')}</Text>
								<TextInput
									style={styles.priceInput}
									value={tempPriceMin}
									onChangeText={setTempPriceMin}
									keyboardType="numeric"
									placeholder="0"
								/>
								<Text style={styles.currencyLabel}>€</Text>
							</View>

							<Text style={styles.priceSeparator}>-</Text>

							<View style={styles.priceInputWrapper}>
								<Text style={styles.inputLabel}>{t('filters.to')}</Text>
								<TextInput
									style={styles.priceInput}
									value={tempPriceMax}
									onChangeText={setTempPriceMax}
									keyboardType="numeric"
									placeholder="1000"
								/>
								<Text style={styles.currencyLabel}>€</Text>
							</View>
						</View>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={closeModal}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={applyPriceFilter}
							>
								<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>

			{/* Rating Filter Modal */}
			<Modal
				visible={activeModal === 'rating'}
				transparent
				animationType="slide"
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={closeModal}
				>
					<TouchableOpacity
						style={[styles.modalContent, { paddingBottom: bottom + 20 }]}
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<Text style={styles.modalTitle}>{t('filters.minimumRating')}</Text>

						<View style={styles.ratingContainer}>
							<TextInput
								style={styles.ratingInput}
								value={tempRating}
								onChangeText={setTempRating}
								keyboardType="numeric"
								placeholder="0"
							/>
							<Text style={styles.ratingLabel}>★ {t('filters.orMore')}</Text>
						</View>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={closeModal}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={applyRatingFilter}
							>
								<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>

			{/* Tags Filter Modal */}
			<Modal visible={activeModal === 'tags'} transparent animationType="slide">
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={closeModal}
				>
					<TouchableOpacity
						style={[styles.modalContent, { paddingBottom: bottom + 20 }]}
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<Text style={styles.modalTitle}>{t('filters.categories')}</Text>
						<Text style={styles.modalSubtitle}>
							{t('filters.categoriesSubtitle')}
						</Text>

						<ScrollView style={styles.tagsScrollView}>
							<View style={styles.tagsGrid}>
								{Object.values(RestaurantTag).map((tag) => (
									<TagButton
										key={tag}
										tag={tag}
										isSelected={tempSelectedTags.includes(tag)}
										onToggle={() => toggleTag(tag)}
									/>
								))}
							</View>
						</ScrollView>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={closeModal}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={applyTagsFilter}
							>
								<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>

			{/* Schedule Filter Modal */}
			<Modal
				visible={activeModal === 'schedule'}
				transparent
				animationType="slide"
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={closeModal}
				>
					<TouchableOpacity
						style={[styles.modalContent, { paddingBottom: bottom + 20 }]}
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<Text style={styles.modalTitle}>{t('filters.schedule')}</Text>

						<View style={styles.timeInputContainer}>
							<View style={styles.timeInputWrapper}>
								<Text style={styles.inputLabel}>{t('filters.from')}</Text>
								<TouchableOpacity
									style={styles.timePickerButton}
									onPress={() => setShowStartTimePicker(true)}
								>
									<Text style={styles.timePickerText}>
										{formatTimeFromDate(startTime)}
									</Text>
									<Ionicons
										name="time-outline"
										size={16}
										color={colors.primary}
									/>
								</TouchableOpacity>
							</View>

							<Text style={styles.timeSeparator}>-</Text>

							<View style={styles.timeInputWrapper}>
								<Text style={styles.inputLabel}>{t('filters.to')}</Text>
								<TouchableOpacity
									style={styles.timePickerButton}
									onPress={() => setShowEndTimePicker(true)}
								>
									<Text style={styles.timePickerText}>
										{formatTimeFromDate(endTime)}
									</Text>
									<Ionicons
										name="time-outline"
										size={16}
										color={colors.primary}
									/>
								</TouchableOpacity>
							</View>
						</View>

						{/* Start Time Picker */}
						{showStartTimePicker && (
							<View style={styles.timePickerContainer}>
								<DateTimePicker
									value={startTime}
									mode="time"
									is24Hour={true}
									display={Platform.OS === 'ios' ? 'spinner' : 'default'}
									onChange={handleStartTimeChange}
									style={styles.timePicker}
								/>
								{Platform.OS === 'ios' && (
									<TouchableOpacity
										style={styles.timePickerConfirm}
										onPress={confirmStartTime}
									>
										<Text style={styles.timePickerConfirmText}>
											{t('general.ok')}
										</Text>
									</TouchableOpacity>
								)}
							</View>
						)}

						{/* End Time Picker */}
						{showEndTimePicker && (
							<View style={styles.timePickerContainer}>
								<DateTimePicker
									value={endTime}
									mode="time"
									is24Hour={true}
									display={Platform.OS === 'ios' ? 'spinner' : 'default'}
									onChange={handleEndTimeChange}
									style={styles.timePicker}
								/>
								{Platform.OS === 'ios' && (
									<TouchableOpacity
										style={styles.timePickerConfirm}
										onPress={confirmEndTime}
									>
										<Text style={styles.timePickerConfirmText}>
											{t('general.ok')}
										</Text>
									</TouchableOpacity>
								)}
							</View>
						)}

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={closeModal}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={applyScheduleFilter}
							>
								<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>

			{/* Distance Filter Modal */}
			<Modal
				visible={activeModal === 'distance'}
				transparent
				animationType="slide"
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={closeModal}
				>
					<TouchableOpacity
						style={[styles.modalContent, { paddingBottom: bottom + 20 }]}
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<Text style={styles.modalTitle}>{t('filters.maxDistance')}</Text>

						<View style={styles.distanceContainer}>
							<TextInput
								style={styles.distanceInput}
								value={tempDistance}
								onChangeText={setTempDistance}
								keyboardType="numeric"
								placeholder="10"
							/>
							<Text style={styles.distanceLabel}>km</Text>
						</View>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={closeModal}
							>
								<Text style={styles.cancelButtonText}>
									{t('general.cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={applyDistanceFilter}
							>
								<Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
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
		fontFamily: 'Manrope',
		fontWeight: '500',
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
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	removeFilterButton: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.3)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: colors.quaternary,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
		maxHeight: '70%',
	},
	modalTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	modalSubtitle: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		marginBottom: 15,
	},
	priceInputContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	priceInputWrapper: {
		flex: 1,
		alignItems: 'center',
	},
	inputLabel: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 8,
	},
	priceInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 80,
	},
	currencyLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginTop: 4,
	},
	priceSeparator: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginHorizontal: 10,
		marginBottom: 12,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 30,
	},
	ratingInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 60,
	},
	ratingLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	tagsScrollView: {
		maxHeight: 300,
		marginBottom: 20,
	},
	tagsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	tagButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: 'transparent',
	},
	tagButtonSelected: {
		backgroundColor: colors.primary,
	},
	tagButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	tagButtonTextSelected: {
		color: colors.quaternary,
	},
	timeInputContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	timeInputWrapper: {
		flex: 1,
		alignItems: 'center',
	},
	timePickerButton: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 80,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	timePickerText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
	},
	timePickerContainer: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		padding: 10,
		marginVertical: 10,
		alignItems: 'center',
	},
	timePicker: {
		width: 200,
		height: 100,
	},
	timePickerConfirm: {
		backgroundColor: colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 6,
		marginTop: 10,
	},
	timePickerConfirmText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
	timeSeparator: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginHorizontal: 10,
		marginBottom: 12,
	},
	distanceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 30,
	},
	distanceInput: {
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
		minWidth: 80,
	},
	distanceLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 10,
	},
	cancelButton: {
		flex: 1,
		padding: 12,
		backgroundColor: colors.secondary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	cancelButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		textAlign: 'center',
	},
	applyButton: {
		flex: 1,
		padding: 12,
		backgroundColor: colors.primary,
		borderRadius: 8,
	},
	applyButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.quaternary,
		textAlign: 'center',
	},
});
