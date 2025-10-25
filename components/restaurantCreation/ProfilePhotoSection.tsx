import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface ProfilePhotoSectionProps {
	profile_image?: string;
	onImageSelected: (imageAsset: ImagePicker.ImagePickerAsset) => void;
	required?: boolean;
}

export default function ProfilePhotoSection({
	profile_image,
	onImageSelected,
	required,
}: ProfilePhotoSectionProps) {
	const { t } = useTranslation();

	const handlePickprofile_image = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				t('registerRestaurant.permissionsRequired'),
				t('registerRestaurant.photoPermissionMessage'),
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled && result.assets[0]) {
			onImageSelected(result.assets[0]);
		}
	};

	return (
		<View style={styles.photoSection}>
			<Text style={styles.photoLabel}>
				{t('registerRestaurant.selectPhoto')}
				{required && <Text style={styles.requiredAsterisk}> *</Text>}
			</Text>
			<TouchableOpacity
				style={styles.photoPlaceholder}
				onPress={handlePickprofile_image}
			>
				{profile_image ? (
					<Image
						source={{ uri: profile_image }}
						style={styles.profile_image}
						resizeMode="cover"
					/>
				) : (
					<Ionicons name="image-outline" size={40} color={colors.primary} />
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	photoSection: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	requiredAsterisk: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: '#D32F2F',
	},
	photoLabel: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	photoPlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	profile_image: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},
});
