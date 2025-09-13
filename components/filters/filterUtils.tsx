import { colors } from '@/assets/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

// Helper function to create time from string
export const createTimeFromString = (timeString: string) => {
	const [hours, minutes] = timeString
		.split(':')
		.map((num) => parseInt(num, 10));
	const date = new Date();
	date.setHours(hours, minutes, 0, 0);
	return date;
};

// Helper function to format time from date
export const formatTimeFromDate = (date: Date) => {
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
};

// Format time for display
export const formatTime = (time: string) => {
	if (!time) return '';
	return time.length === 5 ? time : time + ':00';
};

// Helper function to render stars
export const renderStars = (rating: number) => {
	const stars = [];
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 !== 0;

	// Full stars
	for (let i = 0; i < fullStars; i++) {
		stars.push(
			<Ionicons
				key={`full-${i}`}
				name="star"
				size={14}
				color={colors.primary}
			/>,
		);
	}

	// Half star
	if (hasHalfStar) {
		stars.push(
			<Ionicons
				key="half"
				name="star-half"
				size={14}
				color={colors.primary}
			/>,
		);
	}

	// Empty stars (para completar hasta 5)
	const emptyStars = 5 - Math.ceil(rating);
	for (let i = 0; i < emptyStars; i++) {
		stars.push(
			<Ionicons
				key={`empty-${i}`}
				name="star-outline"
				size={14}
				color={colors.primaryLight}
			/>,
		);
	}

	return stars;
};