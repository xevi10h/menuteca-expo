import { getRestaurantById } from '@/api/responses';
import { colors } from '@/assets/styles/colors';
import RestaurantBasicInformation from '@/components/RestaurantBasicInformation';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
	Image,
	ImageBackground,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RestaurantInformationPage from './information';
import RestaurantMenuPage from './menu';

const Tab = createMaterialTopTabNavigator();

export default function RestaurantDetailLayout() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const restaurant = getRestaurantById(id!);

	return (
		<View style={styles.container}>
			{/* Header Image */}
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: restaurant.mainImage }}
					style={[styles.headerImage, { height: 250 + insets.top }]}
					resizeMode="cover"
				/>
				<View style={styles.imageOverlay} />

				{/* Back Button */}
				<TouchableOpacity
					style={[styles.backButton, { top: insets.top + 10 }]}
					onPress={() => router.back()}
				>
					<Ionicons name="chevron-back" size={24} color={colors.quaternary} />
				</TouchableOpacity>

				{/* Share Button */}
				<TouchableOpacity
					style={[styles.shareButton, { top: insets.top + 10 }]}
					onPress={() => {
						/* Handle share */
					}}
				>
					<Ionicons name="share-outline" size={24} color={colors.quaternary} />
				</TouchableOpacity>

				<View style={styles.restaurantInfo}>
					<RestaurantBasicInformation
						restaurant={restaurant}
						color={colors.quaternary}
					/>
				</View>
			</View>

			{/* Content with Background Image */}
			<ImageBackground
				source={require('@/assets/images/background_food.png')}
				style={styles.contentBackground}
				imageStyle={styles.backgroundImage}
			>
				{/* Tab Navigator */}
				<Tab.Navigator
					screenOptions={{
						tabBarStyle: styles.tabBar,
						tabBarIndicatorStyle: styles.tabIndicator,
						tabBarLabelStyle: styles.tabLabel,
						tabBarActiveTintColor: colors.primary,
						tabBarInactiveTintColor: colors.primaryLight,
						tabBarPressColor: 'transparent',
						swipeEnabled: true,
						animationEnabled: true,
					}}
					initialRouteName="information"
				>
					<Tab.Screen
						name="information"
						options={{
							tabBarLabel: t('restaurant.information'),
						}}
						component={RestaurantInformationPage}
					/>
					<Tab.Screen
						name="menu"
						options={{
							tabBarLabel: t('restaurant.menu'),
						}}
						component={RestaurantMenuPage}
					/>
				</Tab.Navigator>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	imageContainer: {
		position: 'relative',
	},
	headerImage: {
		width: '100%',
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
	},
	backButton: {
		position: 'absolute',
		left: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	shareButton: {
		position: 'absolute',
		right: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	restaurantInfo: {
		position: 'absolute',
		bottom: 50,
		width: '100%',
	},
	contentBackground: {
		flex: 1,
		backgroundColor: colors.secondary,
		marginTop: -30,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	backgroundImage: {
		opacity: 1,
	},
	tabBar: {
		backgroundColor: 'transparent',
		elevation: 0,
		shadowOpacity: 0,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
		marginHorizontal: 80,
		marginTop: 20,
	},
	tabIndicator: {
		backgroundColor: colors.primary,
		height: 2,
		borderRadius: 1,
	},
	tabLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textTransform: 'none',
	},
	sceneContainer: {
		backgroundColor: 'transparent',
	},
});
