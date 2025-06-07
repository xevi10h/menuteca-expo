import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface AddressSectionProps {
	address?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	restaurantName: string;
	onEditPress: () => void;
}

export default function AddressSection({
	address,
	coordinates,
	restaurantName,
	onEditPress,
}: AddressSectionProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.addressSection}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>
					{t('registerRestaurant.address')}
				</Text>
				<TouchableOpacity style={styles.editButton} onPress={onEditPress}>
					<Ionicons name="pencil-outline" size={16} color={colors.primary} />
				</TouchableOpacity>
			</View>
			<MapView
				style={styles.miniMap}
				initialRegion={{
					latitude: coordinates?.latitude || 41.3851,
					longitude: coordinates?.longitude || 2.1734,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				}}
				scrollEnabled={false}
				zoomEnabled={false}
			>
				<Marker
					coordinate={{
						latitude: coordinates?.latitude || 41.3851,
						longitude: coordinates?.longitude || 2.1734,
					}}
					title={restaurantName}
					description={address}
				/>
			</MapView>
			{address && <Text style={styles.addressText}>{address}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	addressSection: {
		paddingVertical: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	editButton: {
		padding: 5,
	},
	miniMap: {
		height: 150,
		borderRadius: 10,
		overflow: 'hidden',
		marginBottom: 10,
	},
	addressText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
	},
});
