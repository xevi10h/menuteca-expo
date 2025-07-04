import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface PhotosSectionProps {
	images?: string[];
	onImagesAdded: (imageUris: string[]) => void;
	onImageRemoved: (index: number) => void;
	showTitle?: boolean; // Nueva prop para controlar si mostrar el título
}

export default function PhotosSection({
	images = [],
	onImagesAdded,
	onImageRemoved,
	showTitle = false,
}: PhotosSectionProps) {
	const { t } = useTranslation();

	const handlePickImages = async () => {
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
			allowsMultipleSelection: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			const imageUris = result.assets.map((asset) => asset.uri);
			onImagesAdded(imageUris);
		}
	};

	return (
		<View style={styles.photosSection}>
			{showTitle && (
				<Text style={styles.sectionTitle}>
					{t('registerRestaurant.uploadPhotos')}
				</Text>
			)}
			<Text style={styles.sectionSubtitle}>
				{t('registerRestaurant.uploadPhotosDescription')}
			</Text>

			{images.length > 0 && (
				<ScrollView
					horizontal
					style={styles.imagesContainer}
					showsHorizontalScrollIndicator={false}
				>
					{images.map((image, index) => (
						<View key={index} style={styles.imageWrapper}>
							<Image source={{ uri: image }} style={styles.uploadedImage} />
							<TouchableOpacity
								style={styles.removeImageButton}
								onPress={() => onImageRemoved(index)}
							>
								<Ionicons name="close" size={16} color={colors.quaternary} />
							</TouchableOpacity>
						</View>
					))}
				</ScrollView>
			)}

			<TouchableOpacity style={styles.uploadButton} onPress={handlePickImages}>
				<Text style={styles.uploadButtonText}>
					{t('registerRestaurant.uploadPhotos')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	photosSection: {
		paddingVertical: 0, // Removed vertical padding since parent handles it
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 10,
	},
	sectionSubtitle: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginBottom: 10,
	},
	imagesContainer: {
		paddingTop: 15,
		marginBottom: 15,
	},
	imageWrapper: {
		marginRight: 10,
		position: 'relative',
	},
	uploadedImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	removeImageButton: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: colors.primary,
		borderRadius: 10,
		width: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	uploadButton: {
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 24,
		alignSelf: 'center',
		borderWidth: 1,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		width: '100%',
		marginTop: 10,
		alignItems: 'center',
	},
	uploadButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
	},
});
