// components/AddReviewModal.tsx
import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddReviewModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (review: Omit<Review, 'id' | 'date'>) => void;
	restaurantId: string;
	restaurantName: string;
}

interface StarRatingInputProps {
	rating: number;
	onRatingChange: (rating: number) => void;
	size?: number;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
	rating,
	onRatingChange,
	size = 32,
}) => {
	return (
		<View style={styles.starsInputContainer}>
			{[1, 2, 3, 4, 5].map((star) => (
				<TouchableOpacity
					key={star}
					onPress={() => onRatingChange(star)}
					style={styles.starButton}
				>
					<Ionicons
						name={star <= rating ? 'star' : 'star-outline'}
						size={size}
						color={star <= rating ? '#FFD700' : colors.primaryLight}
					/>
				</TouchableOpacity>
			))}
		</View>
	);
};

export default function AddReviewModal({
	visible,
	onClose,
	onSubmit,
	restaurantId,
	restaurantName,
}: AddReviewModalProps) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [photos, setPhotos] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetForm = () => {
		setRating(0);
		setComment('');
		setPhotos([]);
		setIsSubmitting(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handlePickImages = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permisos requeridos',
				'Necesitamos acceso a tu galería para subir fotos',
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.8,
			selectionLimit: 5 - photos.length, // Máximo 5 fotos total
		});

		if (!result.canceled) {
			const newPhotos = result.assets.map((asset) => asset.uri);
			setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)); // Máximo 5 fotos
		}
	};

	const handleRemovePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		// Validaciones
		if (rating === 0) {
			Alert.alert('Valoración requerida', 'Selecciona una valoración');
			return;
		}

		if (comment.trim() === '') {
			Alert.alert(
				'Comentario requerido',
				'Escribe un comentario sobre tu experiencia',
			);
			return;
		}

		setIsSubmitting(true);

		try {
			// Simular envío a la API
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const newReview: Omit<Review, 'id' | 'date'> = {
				userId: 'current_user', // En una app real, esto vendría del sistema de auth
				userName: 'Tu Usuario', // En una app real, esto vendría del perfil del usuario
				userAvatar: 'https://randomuser.me/api/portraits/men/10.jpg', // Avatar del usuario actual
				rating,
				comment: comment.trim(),
				photos,
			};

			onSubmit(newReview);

			Alert.alert('Opinión enviada', 'Gracias por compartir tu experiencia', [
				{ text: 'OK', onPress: handleClose },
			]);
		} catch (error) {
			Alert.alert(
				'Error al enviar',
				'No se pudo enviar tu opinión. Inténtalo de nuevo.',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={[styles.container, { paddingTop: insets.top }]}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
						<Text style={styles.closeText}>Cancelar</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Escribir opinión</Text>
					<TouchableOpacity
						onPress={handleSubmit}
						disabled={isSubmitting}
						style={[
							styles.submitButton,
							isSubmitting && styles.submitButtonDisabled,
						]}
					>
						<Text
							style={[
								styles.submitText,
								isSubmitting && styles.submitTextDisabled,
							]}
						>
							{isSubmitting ? '...' : 'Enviar'}
						</Text>
					</TouchableOpacity>
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{/* Restaurant Info */}
					<View style={styles.restaurantInfo}>
						<Text style={styles.restaurantName}>{restaurantName}</Text>
						<Text style={styles.reviewPrompt}>{t('reviews.writeComment')}</Text>
					</View>

					{/* Rating Section */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Tu valoración</Text>
						<StarRatingInput rating={rating} onRatingChange={setRating} />
					</View>

					{/* Comment Section */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Escribe tu comentario</Text>
						<TextInput
							style={styles.commentInput}
							placeholder="Comparte tu experiencia en este restaurante..."
							placeholderTextColor={colors.primaryLight}
							multiline
							numberOfLines={6}
							value={comment}
							onChangeText={setComment}
							textAlignVertical="top"
						/>
					</View>

					{/* Photos Section */}
					<View style={styles.section}>
						<View style={styles.photosHeader}>
							<Text style={styles.sectionTitle}>Añadir fotos</Text>
							<Text style={styles.photosCount}>({photos.length}/5)</Text>
						</View>

						{photos.length > 0 && (
							<ScrollView
								horizontal
								style={styles.photosContainer}
								showsHorizontalScrollIndicator={false}
							>
								{photos.map((photo, index) => (
									<View key={index} style={styles.photoWrapper}>
										<Image source={{ uri: photo }} style={styles.photo} />
										<TouchableOpacity
											style={styles.removePhotoButton}
											onPress={() => handleRemovePhoto(index)}
										>
											<Ionicons
												name="close"
												size={16}
												color={colors.quaternary}
											/>
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}

						{photos.length < 5 && (
							<TouchableOpacity
								style={styles.addPhotosButton}
								onPress={handlePickImages}
							>
								<Ionicons
									name="camera-outline"
									size={24}
									color={colors.primary}
								/>
								<Text style={styles.addPhotosText}>Subir fotos</Text>
							</TouchableOpacity>
						)}
					</View>

					<View style={{ height: 50 }} />
				</ScrollView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	closeButton: {
		flex: 1,
	},
	closeText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	headerTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		flex: 2,
		textAlign: 'center',
	},
	submitButton: {
		flex: 1,
		alignItems: 'flex-end',
	},
	submitButtonDisabled: {
		opacity: 0.5,
	},
	submitText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	submitTextDisabled: {
		color: colors.primaryLight,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	restaurantInfo: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	restaurantName: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
		textAlign: 'center',
	},
	reviewPrompt: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 15,
	},
	starsInputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	starButton: {
		padding: 4,
	},
	commentInput: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 15,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		minHeight: 120,
	},
	photosHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 15,
	},
	photosCount: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	photosContainer: {
		marginBottom: 15,
	},
	photoWrapper: {
		marginRight: 10,
		position: 'relative',
	},
	photo: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	removePhotoButton: {
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
	addPhotosButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		borderStyle: 'dashed',
		paddingVertical: 20,
		paddingHorizontal: 15,
		alignItems: 'center',
		gap: 8,
	},
	addPhotosText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
