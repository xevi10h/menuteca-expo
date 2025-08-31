import { colors } from '@/assets/styles/colors';
import HeaderModal from '@/components/restaurantCreation/HeaderModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	Animated,
	Dimensions,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditTab from './edit';
import PreviewTab from './preview';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 40; // 20px on each side
const TAB_CONTAINER_WIDTH = screenWidth - HORIZONTAL_PADDING;
const TAB_BUTTON_WIDTH = (TAB_CONTAINER_WIDTH - 8) / 2; // 8px total for padding (4px on each side)

export default function SetupLayout(): React.JSX.Element {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);

	const validation = useRegisterRestaurantStore((store) => store.validation);
	const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');

	// Animated value for tab transition
	const translateX = useState(() => new Animated.Value(0))[0];

	const handleBack = (): void => {
		router.back();
	};

	const handleSave = (): void => {
		if (!validation.isValid) {
			// Show validation errors
			const errors: string[] = [];

			if (validation.errors.hasPhotos) {
				errors.push(t('registerRestaurant.validation.needPhotos'));
			}
			if (validation.errors.hasMenus) {
				errors.push(t('registerRestaurant.validation.needMenus'));
			}
			if (validation.errors.hasCuisine) {
				errors.push(t('registerRestaurant.validation.needCuisine'));
			}
			if (validation.errors.hasAddress) {
				errors.push(t('registerRestaurant.validation.needAddress'));
			}
			if (validation.errors.tooManyTags) {
				errors.push(t('registerRestaurant.validation.tooManyTags'));
			}

			Alert.alert(
				t('registerRestaurant.validation.incomplete'),
				errors.join('\n'),
				[{ text: t('general.ok'), style: 'default' }],
			);
			return;
		}

		router.dismissAll();
	};

	const showValidationAlert = () => {
		const errors: string[] = [];

		if (validation.errors.hasPhotos) {
			errors.push(t('registerRestaurant.validation.needPhotos'));
		}
		if (validation.errors.hasMenus) {
			errors.push(t('registerRestaurant.validation.needMenus'));
		}
		if (validation.errors.hasCuisine) {
			errors.push(t('registerRestaurant.validation.needCuisine'));
		}
		if (validation.errors.hasAddress) {
			errors.push(t('registerRestaurant.validation.needAddress'));
		}
		if (validation.errors.tooManyTags) {
			errors.push(t('registerRestaurant.validation.tooManyTags'));
		}

		Alert.alert(
			t('registerRestaurant.validation.incomplete'),
			errors.join('\n'),
			[{ text: t('general.ok'), style: 'default' }],
		);
	};

	const handleTabPress = (tab: 'edit' | 'preview') => {
		if (tab === currentTab) return;

		// Check if preview tab and validation fails
		if (tab === 'preview' && !validation.isValid) {
			showValidationAlert();
			return;
		}

		const toIndex = tab === 'edit' ? 0 : 1;
		const targetTranslateX = -toIndex * screenWidth;

		Animated.timing(translateX, {
			toValue: targetTranslateX,
			duration: 300,
			useNativeDriver: true,
		}).start();

		setCurrentTab(tab);
	};

	// Custom Tab Bar Component
	const renderTabBar = () => {
		const tabIndex = currentTab === 'edit' ? 0 : 1;

		return (
			<View style={styles.tabContainer}>
				<View style={styles.tabBackground}>
					{/* Animated Indicator */}
					<Animated.View
						style={[
							styles.tabIndicator,
							{
								transform: [
									{
										translateX: translateX.interpolate({
											inputRange: [-screenWidth, 0],
											outputRange: [TAB_BUTTON_WIDTH, 0],
											extrapolate: 'clamp',
										}),
									},
								],
							},
						]}
					/>

					{/* Edit Tab Button */}
					<TouchableOpacity
						style={styles.tabButton}
						onPress={() => handleTabPress('edit')}
						activeOpacity={0.7}
					>
						<Animated.Text
							style={[
								styles.tabText,
								{ fontWeight: currentTab === 'edit' ? '500' : '300' },
							]}
						>
							{t('general.edit') || 'Editor'}
						</Animated.Text>
					</TouchableOpacity>

					{/* Preview Tab Button */}
					<TouchableOpacity
						style={styles.tabButton}
						onPress={() => handleTabPress('preview')}
						activeOpacity={0.7}
					>
						<Animated.Text
							style={[
								styles.tabText,
								{ fontWeight: currentTab === 'preview' ? '500' : '300' },
							]}
						>
							{t('general.preview') || 'Visualizar'}
						</Animated.Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<HeaderModal
				title={provisionalRegisterRestaurant.name}
				handleClose={handleBack}
				handleSave={handleSave}
				saveDisabled={!validation.isValid}
			/>

			{/* Custom Tab Bar */}
			{renderTabBar()}

			{/* Content Container */}
			<View style={styles.contentContainer}>
				<Animated.View
					style={[
						styles.slidingContent,
						{
							transform: [{ translateX }],
						},
					]}
				>
					{/* Edit Tab Content */}
					<View style={styles.tabContent}>
						<EditTab />
					</View>

					{/* Preview Tab Content */}
					<View style={styles.tabContent}>
						<PreviewTab />
					</View>
				</Animated.View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	tabContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	tabBackground: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		padding: 4,
		position: 'relative',
		height: 44,
	},
	tabIndicator: {
		position: 'absolute',
		top: 4,
		left: 4,
		bottom: 4,
		width: TAB_BUTTON_WIDTH,
		backgroundColor: colors.secondary,
		borderRadius: 6,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	tabButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
		zIndex: 1,
	},
	tabText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlign: 'center',
	},
	contentContainer: {
		flex: 1,
		overflow: 'hidden',
	},
	slidingContent: {
		flexDirection: 'row',
		width: screenWidth * 2,
		height: '100%',
	},
	tabContent: {
		width: screenWidth,
		flex: 1,
	},
});
