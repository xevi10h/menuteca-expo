import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Review } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
	Alert,
	Dimensions,
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
import HeaderModal from './restaurantCreation/HeaderModal';

const { width: screenWidth } = Dimensions.get('window');

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
	size = 40,
}) => {
	const { t } = useTranslation();

	const getRatingLabel = (stars: number): string => {
		switch (stars) {
			case 1:
				return t('reviews.ratingLabels.1');
			case 2:
				return t('reviews.ratingLabels.2');
			case 3:
				return t('reviews.ratingLabels.3');
			case 4:
				return t('reviews.ratingLabels.4');
			case 5:
				return t('reviews.ratingLabels.5');
			default:
				return '';
		}
	};

	return (
		<View style={styles.starsInputContainer}>
			<View style={styles.starsRow}>
				{[1, 2, 3, 4, 5].map((star) => (
					<TouchableOpacity
						key={star}
						onPress={() => onRatingChange(star)}
						style={styles.starButton}
						activeOpacity={0.7}
					>
						<Ionicons
							name={star <= rating ? 'star' : 'star-outline'}
							size={size}
							color={star <= rating ? '#FFD700' : colors.primaryLight}
						/>
					</TouchableOpacity>
				))}
			</View>
			{rating > 0 && (
				<Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
			)}
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
				t('reviews.permissionsRequired'),
				t('reviews.photoPermissionMessage'),
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 0.8,
			selectionLimit: 5 - photos.length,
		});

		if (!result.canceled) {
			const newPhotos = result.assets.map((asset) => asset.uri);
			setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
		}
	};

	const handleRemovePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		if (rating === 0) {
			Alert.alert(t('reviews.error'), t('reviews.ratingRequired'), [
				{ text: t('general.ok'), style: 'default' },
			]);
			return;
		}

		// Los comentarios ahora son opcionales - no validamos que estén llenos

		setIsSubmitting(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const newReview: Omit<Review, 'id' | 'date'> = {
				userId: 'current_user',
				userName: 'Tu Usuario',
				userAvatar: 'https://randomuser.me/api/portraits/men/10.jpg',
				rating,
				comment: comment.trim() || '', // Permitir comentarios vacíos
				photos,
				restaurantId,
				restaurantName,
				restaurantImage: 'https://example.com/restaurant.jpg',
			};

			onSubmit(newReview);

			Alert.alert('¡Opinión enviada!', 'Gracias por compartir tu experiencia', [
				{ text: t('general.ok'), onPress: handleClose },
			]);
		} catch (error) {
			Alert.alert(
				t('reviews.error'),
				'No se pudo enviar tu opinión. Inténtalo de nuevo.',
				[{ text: t('general.ok'), style: 'default' }],
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Solo validamos que tenga rating - comentario es opcional
	const isFormValid = rating > 0;

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View style={[styles.container]}>
				<HeaderModal
					title={t('reviews.writeReview')}
					handleClose={handleClose}
					handleSave={handleSubmit}
					hasBorderBottom={true}
					saveDisabled={!isFormValid || isSubmitting}
				/>

				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Restaurant Info Card */}
					<View style={styles.restaurantCard}>
						<View style={styles.restaurantIconContainer}>
							<Ionicons name="restaurant" size={24} color={colors.primary} />
						</View>
						<View style={styles.restaurantInfo}>
							<Text style={styles.restaurantName}>{restaurantName}</Text>
							<Text style={styles.reviewPrompt}>
								{t('reviews.writeComment')}
							</Text>
						</View>
					</View>

					{/* Rating Section */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('reviews.yourRating')}</Text>
						<View style={styles.ratingCard}>
							<StarRatingInput rating={rating} onRatingChange={setRating} />
						</View>
					</View>

					{/* Comment Section - Ahora opcional */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{t('reviews.yourComment')}
							<Text style={styles.optionalText}> (opcional)</Text>
						</Text>
						<View style={styles.commentCard}>
							<TextInput
								style={styles.commentInput}
								placeholder={t('reviews.commentPlaceholder')}
								placeholderTextColor={colors.primaryLight}
								multiline
								numberOfLines={6}
								value={comment}
								onChangeText={setComment}
								textAlignVertical="top"
								maxLength={500}
							/>
							<View style={styles.characterCount}>
								<Text style={styles.characterCountText}>
									{comment.length}/500
								</Text>
							</View>
						</View>
					</View>

					{/* Photos Section */}
					<View style={styles.section}>
						<View style={styles.photosHeader}>
							<Text style={styles.sectionTitle}>{t('reviews.addPhotos')}</Text>
							<View style={styles.photosBadge}>
								<Text style={styles.photosBadgeText}>{photos.length}/5</Text>
							</View>
						</View>

						{photos.length > 0 && (
							<ScrollView
								horizontal
								style={styles.photosContainer}
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.photosContent}
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
												size={14}
												color={colors.quaternary}
											/>
										</TouchableOpacity>
									</View>
								))}

								{photos.length < 5 && (
									<TouchableOpacity
										style={styles.addPhotoCard}
										onPress={handlePickImages}
									>
										<Ionicons
											name="camera-outline"
											size={24}
											color={colors.primaryLight}
										/>
									</TouchableOpacity>
								)}
							</ScrollView>
						)}

						{photos.length === 0 && (
							<TouchableOpacity
								style={styles.addPhotosButton}
								onPress={handlePickImages}
							>
								<Ionicons
									name="camera-outline"
									size={20}
									color={colors.primary}
								/>
								<Text style={styles.addPhotosText}>
									{t('reviews.addPhotos')}
								</Text>
								<Text style={styles.addPhotosSubtext}>
									{t('reviews.photosOptional')}
								</Text>
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
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
		backgroundColor: colors.quaternary,
	},
	headerButton: {
		minWidth: 60,
	},
	headerButtonDisabled: {
		opacity: 0.5,
	},
	headerTitleContainer: {
		flex: 1,
		alignItems: 'center',
	},
	cancelText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	submitText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'right',
	},
	submitTextDisabled: {
		color: colors.primaryLight,
	},
	content: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	restaurantCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	restaurantIconContainer: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: colors.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	restaurantInfo: {
		flex: 1,
	},
	restaurantName: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 4,
	},
	reviewPrompt: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 12,
	},
	optionalText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		fontStyle: 'italic',
	},
	ratingCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	starsInputContainer: {
		alignItems: 'center',
	},
	starsRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 12,
	},
	starButton: {
		padding: 4,
	},
	ratingLabel: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
	commentCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	commentInput: {
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		minHeight: 120,
		textAlignVertical: 'top',
		lineHeight: 22,
	},
	characterCount: {
		alignItems: 'flex-end',
		marginTop: 8,
	},
	characterCountText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	photosHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	photosBadge: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	photosBadgeText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	photosContainer: {
		marginBottom: 12,
	},
	photosContent: {
		paddingRight: 16,
		paddingTop: -10,
		marginTop: 10,
	},
	photoWrapper: {
		marginRight: 12,
		position: 'relative',
	},
	photo: {
		width: 80,
		height: 80,
		borderRadius: 12,
	},
	removePhotoButton: {
		position: 'absolute',
		top: -6,
		right: -6,
		backgroundColor: colors.primary,
		borderRadius: 12,
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
	addPhotoCard: {
		width: 80,
		height: 80,
		borderRadius: 12,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
	},
	addPhotosButton: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: colors.primaryLight,
		borderStyle: 'dashed',
		paddingVertical: 24,
		paddingHorizontal: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	addPhotosText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginTop: 8,
	},
	addPhotosSubtext: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 4,
	},
	bottomContainer: {
		paddingHorizontal: 20,
		paddingTop: 16,
		backgroundColor: colors.quaternary,
		borderTopWidth: 1,
		borderTopColor: '#E5E5E5',
	},
	submitButton: {
		backgroundColor: colors.primary,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	submitButtonDisabled: {
		backgroundColor: colors.primaryLight,
		opacity: 0.6,
	},
	submitButtonText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
});
