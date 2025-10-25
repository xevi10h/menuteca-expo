import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import PhotoGalleryModal from '@/components/PhotoGalleryModal';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReviewPhotosProps {
	photos: string[];
}

export default function ReviewPhotos({ photos }: ReviewPhotosProps) {
	const [showGallery, setShowGallery] = useState(false);
	const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

	if (photos.length === 0) return null;

	const handlePhotoPress = (index: number) => {
		setSelectedPhotoIndex(index);
		setShowGallery(true);
	};

	const renderPhoto = (photo: string, index: number) => {
		const isLastItem = index === 2 && photos.length > 3;
		const remainingCount = photos.length - 3;

		return (
			<TouchableOpacity
				key={index}
				style={styles.reviewPhoto}
				onPress={() => handlePhotoPress(index)}
				activeOpacity={0.8}
			>
				<Image source={{ uri: photo }} style={styles.reviewPhotoImage} />
				{isLastItem && remainingCount > 0 && (
					<View style={styles.photoOverlay}>
						<Text style={styles.photoOverlayText}>+{remainingCount}</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<>
			<View style={styles.reviewPhotosContainer}>
				{photos.slice(0, 3).map(renderPhoto)}
			</View>

			{/* Photo Gallery Modal */}
			<PhotoGalleryModal
				visible={showGallery}
				photos={photos}
				initialIndex={selectedPhotoIndex}
				onClose={() => setShowGallery(false)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	reviewPhotosContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 15,
	},
	reviewPhoto: {
		position: 'relative',
	},
	reviewPhotoImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	photoOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	photoOverlayText: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.quaternary,
	},
});
