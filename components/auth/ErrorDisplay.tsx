import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface ErrorDisplayProps {
	message: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	type?: 'network' | 'validation' | 'authentication' | 'general';
	title?: string;
	showIcon?: boolean;
	retryText?: string;
	dismissText?: string;
	variant?: 'inline' | 'fullscreen' | 'banner';
	animated?: boolean;
}

export default function ErrorDisplay({
	message,
	onRetry,
	onDismiss,
	type = 'general',
	title,
	showIcon = true,
	retryText,
	dismissText,
	variant = 'inline',
	animated = true,
}: ErrorDisplayProps) {
	const { t } = useTranslation();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	useEffect(() => {
		if (animated) {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [fadeAnim, slideAnim, animated]);

	const getIcon = () => {
		switch (type) {
			case 'network':
				return 'wifi-outline';
			case 'validation':
				return 'alert-circle-outline';
			case 'authentication':
				return 'lock-closed-outline';
			default:
				return 'information-circle-outline';
		}
	};

	const getIconColor = () => {
		switch (type) {
			case 'network':
				return '#FF9800';
			case 'validation':
				return '#D32F2F';
			case 'authentication':
				return '#9C27B0';
			default:
				return colors.primary;
		}
	};

	const getTitle = () => {
		if (title) return title;

		switch (type) {
			case 'network':
				return t('errors.network.title') || 'Connection Error';
			case 'validation':
				return t('errors.validation.title') || 'Validation Error';
			case 'authentication':
				return t('errors.auth.title') || 'Authentication Error';
			default:
				return t('errors.general.title') || 'Error';
		}
	};

	const containerStyle = [
		styles.container,
		variant === 'fullscreen' && styles.fullscreenContainer,
		variant === 'banner' && styles.bannerContainer,
		animated && {
			opacity: fadeAnim,
			transform: [{ translateY: slideAnim }],
		},
	];

	const content = (
		<>
			{showIcon && (
				<View style={styles.iconContainer}>
					<Ionicons
						name={getIcon()}
						size={variant === 'banner' ? 24 : 48}
						color={getIconColor()}
					/>
				</View>
			)}

			<View style={styles.textContainer}>
				<Text
					style={[styles.title, variant === 'banner' && styles.bannerTitle]}
				>
					{getTitle()}
				</Text>
				<Text
					style={[styles.message, variant === 'banner' && styles.bannerMessage]}
				>
					{message}
				</Text>
			</View>

			{(onRetry || onDismiss) && (
				<View
					style={[
						styles.buttonsContainer,
						variant === 'banner' && styles.bannerButtons,
					]}
				>
					{onRetry && (
						<TouchableOpacity
							style={[
								styles.retryButton,
								variant === 'banner' && styles.bannerRetryButton,
							]}
							onPress={onRetry}
						>
							<Ionicons
								name="refresh-outline"
								size={16}
								color={colors.quaternary}
								style={styles.buttonIcon}
							/>
							<Text style={styles.retryText}>
								{retryText || t('general.retry') || 'Retry'}
							</Text>
						</TouchableOpacity>
					)}

					{onDismiss && (
						<TouchableOpacity
							style={[
								styles.dismissButton,
								variant === 'banner' && styles.bannerDismissButton,
							]}
							onPress={onDismiss}
						>
							<Text style={styles.dismissText}>
								{dismissText || t('general.dismiss') || 'Dismiss'}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			)}
		</>
	);

	if (animated) {
		return <Animated.View style={containerStyle}>{content}</Animated.View>;
	}

	return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 20,
		margin: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	fullscreenContainer: {
		flex: 1,
		justifyContent: 'center',
		margin: 20,
		padding: 40,
	},
	bannerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 0,
		borderRadius: 0,
		padding: 12,
		backgroundColor: '#FFF3E0',
		borderLeftColor: '#FF9800',
	},
	iconContainer: {
		marginBottom: 16,
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 20,
		flex: 1,
	},
	title: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 8,
	},
	bannerTitle: {
		fontSize: 14,
		marginBottom: 2,
	},
	message: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
		lineHeight: 20,
	},
	bannerMessage: {
		fontSize: 12,
		textAlign: 'left',
	},
	buttonsContainer: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
		justifyContent: 'center',
	},
	bannerButtons: {
		width: 'auto',
		marginLeft: 12,
	},
	retryButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		minWidth: 100,
	},
	bannerRetryButton: {
		flex: 0,
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	buttonIcon: {
		marginRight: 6,
	},
	retryText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	dismissButton: {
		backgroundColor: 'transparent',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		paddingVertical: 12,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		minWidth: 100,
	},
	bannerDismissButton: {
		flex: 0,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderWidth: 0,
	},
	dismissText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
