import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Address } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface AddressSectionProps {
	address?: Address;
	restaurant_name: string;
	onEditPress: () => void;
}

export default function AddressSection({
	address,
	restaurant_name,
	onEditPress,
}: AddressSectionProps) {
	const { t } = useTranslation();

	const displayAddress =
		address?.formatted_address || t('registerRestaurant.noAddressSelected');

	return (
		<View>
			{address &&
			address.coordinates.latitude &&
			address.coordinates.longitude ? (
				<TouchableOpacity onPress={onEditPress}>
					<MapView
						style={styles.miniMap}
						initialRegion={{
							latitude: address.coordinates.latitude,
							longitude: address.coordinates.longitude,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
						scrollEnabled={false}
						zoomEnabled={false}
					>
						<Marker
							coordinate={{
								latitude: address.coordinates.latitude,
								longitude: address.coordinates.longitude,
							}}
							title={restaurant_name}
							description={address?.formatted_address}
						/>
					</MapView>
					<Text style={styles.addressText}>{displayAddress}</Text>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					style={styles.emptyAddressContainer}
					onPress={onEditPress}
				>
					<Ionicons
						name="location-outline"
						size={24}
						color={colors.primaryLight}
					/>
					<Text style={styles.emptyAddressText}>{displayAddress}</Text>
					<Text style={styles.emptyAddressSubtext}>
						{t('registerRestaurant.tapToAddAddress')}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
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
		lineHeight: 20,
	},
	emptyAddressContainer: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderStyle: 'dashed',
		paddingVertical: 40,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyAddressText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		marginTop: 10,
		textAlign: 'center',
	},
	emptyAddressSubtext: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 5,
		textAlign: 'center',
	},
});
