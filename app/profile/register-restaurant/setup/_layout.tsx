import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegisterRestaurantStore } from '@/zustand/RegisterRestaurantStore';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EditTab from './edit';
import PreviewTab from './preview';

const Tab = createMaterialTopTabNavigator();

export default function SetupLayout() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const provisionalRegisterRestaurant = useRegisterRestaurantStore(
		(store) => store.registerRestaurant,
	);

	const handleBack = () => {
		router.back();
	};

	const handleSave = () => {
		// Aquí guardarías toda la información del restaurante
		// y navegarías de vuelta a la pantalla principal
		router.dismissAll();
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
				// sceneContainerStyle={styles.sceneContainer}
			>
				<Tab.Screen
					name="edit"
					options={{
						tabBarLabel: t('general.edit') || 'Editar',
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
	tabBar: {
		backgroundColor: colors.secondary,
		elevation: 0,
		shadowOpacity: 0,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
		marginHorizontal: 50,
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
		backgroundColor: colors.secondary,
	},
});
