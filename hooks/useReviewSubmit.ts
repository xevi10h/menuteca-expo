import { ReviewService } from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

interface ReviewSubmitData {
	restaurant_id: string;
	rating: number;
	comment: string;
	photos?: ImagePicker.ImagePickerAsset[];
	photoUris?: string[];
}

interface UseReviewSubmitReturn {
	handleSubmit: (data: ReviewSubmitData) => Promise<{ success: boolean; data?: any; error?: string }>;
	isSubmitting: boolean;
}

export function useReviewSubmit(): UseReviewSubmitReturn {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (data: ReviewSubmitData): Promise<{ success: boolean; data?: any; error?: string }> => {
		if (data.rating === 0) {
			Alert.alert(t('reviews.error'), t('reviews.ratingRequired'), [
				{ text: t('general.ok'), style: 'default' },
			]);
			return { success: false, error: t('reviews.ratingRequired') };
		}

		setIsSubmitting(true);

		try {
			const reviewData = {
				rating: data.rating,
				comment: data.comment.trim(),
				photos: data.photoUris || [],
				photo_files: data.photos || [],
			};

			const result = await ReviewService.createReview(data.restaurant_id, reviewData);

			if (result.success) {
				Alert.alert(
					t('addReview.reviewSent'), 
					t('addReview.thankYouMessage'),
					[{ text: t('general.ok'), style: 'default' }]
				);
				return { success: true, data: result.data };
			} else {
				Alert.alert(t('reviews.error'), result.error || t('addReview.couldNotSend'), [
					{ text: t('general.ok'), style: 'default' },
				]);
				return { success: false, error: result.error };
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : t('addReview.couldNotSend');
			Alert.alert(t('reviews.error'), errorMessage, [
				{ text: t('general.ok'), style: 'default' },
			]);
			return { success: false, error: errorMessage };
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		handleSubmit,
		isSubmitting,
	};
}