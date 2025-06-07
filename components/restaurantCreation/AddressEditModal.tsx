import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import HeaderModal from './HeaderModal';

interface AddressEditModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (
		address: string,
		coordinates?: { latitude: number; longitude: number },
	) => void;
	initialAddress?: string;
	initialCoordinates?: { latitude: number; longitude: number };
}

export default function AddressEditModal({
	visible,
	onClose,
	onSave,
	initialAddress = '',
	initialCoordinates,
}: AddressEditModalProps) {
	const { t } = useTranslation();
	const [tempAddress, setTempAddress] = useState(initialAddress);
	const [tempCoordinates, setTempCoordinates] = useState<{
		latitude: number;
		longitude: number;
	} | null>(initialCoordinates || null);

	React.useEffect(() => {
		if (visible) {
			setTempAddress(initialAddress);
			setTempCoordinates(initialCoordinates || null);
		}
	}, [visible, initialAddress, initialCoordinates]);

	const handleMapPress = (event: any) => {
		const { latitude, longitude } = event.nativeEvent.coordinate;
		setTempCoordinates({ latitude, longitude });

		// Reverse geocoding para obtener la dirección
		Location.reverseGeocodeAsync({ latitude, longitude })
			.then((addresses) => {
				if (addresses.length > 0) {
					const address = addresses[0];
					const formattedAddress = `${address.street || ''} ${
						address.streetNumber || ''
					}, ${address.city || ''}, ${address.country || ''}`.trim();
					setTempAddress(formattedAddress);
				}
			})
			.catch(() => {
				// Si falla el reverse geocoding, solo usar las coordenadas
				setTempAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
			});
	};

	const handleSave = () => {
		onSave(tempAddress, tempCoordinates || undefined);
		onClose();
	};

	const handleCancel = () => {
		setTempAddress(initialAddress);
		setTempCoordinates(initialCoordinates || null);
		onClose();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={styles.modalContainer}>
				<HeaderModal
					title={t('registerRestaurant.address')}
					handleClose={handleCancel}
					handleSave={handleSave}
				/>
				<View style={styles.modalContent}>
					<Text style={styles.label}>
						{t('registerRestaurant.mapTapInstruction')}
					</Text>
					<MapView
						style={styles.fullMap}
						initialRegion={{
							latitude:
								tempCoordinates?.latitude ||
								initialCoordinates?.latitude ||
								41.3851,
							longitude:
								tempCoordinates?.longitude ||
								initialCoordinates?.longitude ||
								2.1734,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						}}
						onPress={handleMapPress}
					>
						{tempCoordinates && (
							<Marker
								coordinate={tempCoordinates}
								title={t('registerRestaurant.newLocation')}
								description={tempAddress}
							/>
						)}
					</MapView>
					<Text style={styles.label}>
						{t('registerRestaurant.addressSubtitle')}
					</Text>
					<TextInput
						style={styles.input}
						placeholder={t('registerRestaurant.addressPlaceholder')}
						value={tempAddress}
						onChangeText={setTempAddress}
						multiline
					/>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	label: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 10,
	},
	fullMap: {
		height: 300,
		borderRadius: 10,
		marginBottom: 20,
	},
	input: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		textAlignVertical: 'top',
		minHeight: 100,
	},
});
