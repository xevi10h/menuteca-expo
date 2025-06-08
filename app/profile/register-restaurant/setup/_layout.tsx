import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import type {
	MaterialTopTabBarProps,
	MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type {
	NavigationHelpers,
	ParamListBase,
	TabNavigationState,
} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	Animated,
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditTab from './edit';
import PreviewTab from './preview';

const Tab = createMaterialTopTabNavigator();

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 40; // 20px on each side
const TAB_CONTAINER_WIDTH = screenWidth - HORIZONTAL_PADDING;
const TAB_BUTTON_WIDTH = (TAB_CONTAINER_WIDTH - 8) / 2; // 8px total for padding (4px on each side)

// Types for Custom Tab Bar
interface CustomTabBarProps extends MaterialTopTabBarProps {
	state: TabNavigationState<ParamListBase>;
	descriptors: Record<string, any>;
	navigation: NavigationHelpers<
		ParamListBase,
		MaterialTopTabNavigationEventMap
	>;
	position: Animated.AnimatedAddition<number>;
}

// Custom Tab Bar Component
function CustomTabBar({
	state,
	descriptors,
	navigation,
	position,
}: CustomTabBarProps) {
	const { t } = useTranslation();
	const validation = useRegisterRestaurantStore((store) => store.validation);

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
		if (validation.errors.tooManyTags) {
			errors.push(t('registerRestaurant.validation.tooManyTags'));
		}

		Alert.alert(
			t('registerRestaurant.validation.incomplete'),
			errors.join('\n'),
			[{ text: t('general.ok'), style: 'default' }],
		);
	};

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
									translateX: position.interpolate({
										inputRange: state.routes.map((_: any, i: number) => i),
										outputRange: state.routes.map(
											(_: any, i: number) => i * TAB_BUTTON_WIDTH,
										),
										extrapolate: 'clamp',
									}),
								},
							],
						},
					]}
				/>

				{/* Tab Buttons */}
				{state.routes.map((route, index: number) => {
					const { options } = descriptors[route.key];
					const label: string =
						options.tabBarLabel || options.title || route.name;
					const isFocused: boolean = state.index === index;

					// Check if preview tab and validation fails
					const isPreviewTab = route.name === 'preview';

					const onPress = (): void => {
						// Show alert if trying to go to preview with validation errors
						if (isPreviewTab && !validation.isValid) {
							showValidationAlert();
							return;
						}

						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					return (
						<TouchableOpacity
							key={route.key}
							style={styles.tabButton}
							onPress={onPress}
							activeOpacity={0.7}
						>
							<Animated.Text
								style={[
									styles.tabText,
									{ fontWeight: isFocused ? '500' : '300' },
								]}
							>
								{label}
							</Animated.Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

export default function SetupLayout(): React.JSX.Element {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);

	const validation = useRegisterRestaurantStore((store) => store.validation);
	const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');

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

	// Handle tab state change
	const handleTabStateChange = (state: any) => {
		const currentRouteName = state.routes[state.index]?.name;
		if (currentRouteName) {
			setCurrentTab(currentRouteName as 'edit' | 'preview');
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
					<Text style={styles.cancelText}>{t('general.cancel')}</Text>
				</TouchableOpacity>
				<View style={{ flex: 2 }}>
					<Text style={styles.title} numberOfLines={1}>
						{provisionalRegisterRestaurant.name}
					</Text>
				</View>
				<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
					<Text style={styles.saveText}>{t('general.save')}</Text>
				</TouchableOpacity>
			</View>

			{/* Validation Status Indicator - Removed */}

			{/* Tab Navigator with Custom Tab Bar */}
			<Tab.Navigator
				tabBar={(props: MaterialTopTabBarProps) => <CustomTabBar {...props} />}
				screenOptions={{
					swipeEnabled: true, // Always enable swipe
					animationEnabled: true,
					lazy: true,
					lazyPreloadDistance: 1,
				}}
				screenListeners={{
					state: (e) => {
						handleTabStateChange(e.data.state);
					},
				}}
			>
				<Tab.Screen
					name="edit"
					options={{
						tabBarLabel: t('general.edit') || 'Editor',
					}}
					component={EditTab}
				/>
				<Tab.Screen
					name="preview"
					options={{
						tabBarLabel: t('general.preview') || 'Visualizar',
					}}
					component={PreviewTab}
				/>
			</Tab.Navigator>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		gap: 10,
		width: '100%',
	},
	cancelButton: {
		flex: 1,
	},
	cancelText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
	},
	title: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
	},
	saveButton: {
		flex: 1,
	},
	saveText: {
		color: colors.primary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		textAlign: 'right',
	},
	validationContainer: {
		backgroundColor: '#FFE5E5',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#FFB3B3',
	},
	validationText: {
		color: '#D32F2F',
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textAlign: 'center',
	},
	tabContainer: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		backgroundColor: colors.secondary,
	},
	tabBackground: {
		backgroundColor: '#7878801F',
		borderRadius: 9,
		height: 36,
		flexDirection: 'row',
		position: 'relative',
	},
	tabIndicator: {
		position: 'absolute',
		top: 4,
		left: 4,
		width: TAB_BUTTON_WIDTH,
		height: 28,
		backgroundColor: colors.secondary,
		borderRadius: 7,
		shadowColor: colors.primary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 4,
	},
	tabButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 21,
		zIndex: 1,
	},
	tabText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.tertiary,
	},
	sceneContainer: {
		backgroundColor: colors.secondary,
	},
});
