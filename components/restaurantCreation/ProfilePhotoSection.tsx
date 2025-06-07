import { colors } from '@/assets/styles/colors';
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
	profileImage?: string;
	onImageSelected: (imageUri: string) => void;
}

export default function ProfilePhotoSection({
	profileImage,
	onImageSelected,
}: ProfilePhotoSectionProps) {
	const { t } = useTranslation();

	const handlePickProfileImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				t('registerRestaurant.permissionsRequired'),
				t('registerRestaurant.photoPermissionMessage'),
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			onImageSelected(result.assets[0].uri);
		}
	};

	return (
		<View style={styles.photoSection}>
			<Text style={styles.photoLabel}>
				{t('registerRestaurant.selectPhoto')}
			</Text>
			<TouchableOpacity
				style={styles.photoPlaceholder}
				onPress={handlePickProfileImage}
			>
				{profileImage ? (
					<Image
						source={{ uri: profileImage }}
						style={styles.profileImage}
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
	photoLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
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
	profileImage: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},
});
