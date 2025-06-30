import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

interface ErrorModalProps {
	visible: boolean;
	title?: string;
	message: string;
	onClose: () => void;
	onRetry?: () => void;
	type?: 'error' | 'warning' | 'info';
	autoHide?: boolean;
	autoHideDelay?: number;
}

export default function ErrorModal({
	visible,
	title,
	message,
	onClose,
	onRetry,
	type = 'error',
	autoHide = false,
	autoHideDelay = 5000,
}: ErrorModalProps) {
	const { t } = useTranslation();
	const scale = useSharedValue(0);
	const opacity = useSharedValue(0);

	// Auto hide functionality
	useEffect(() => {
		if (visible && autoHide) {
			const timer = setTimeout(() => {
				onClose();
			}, autoHideDelay);

			return () => clearTimeout(timer);
		}
	}, [visible, autoHide, autoHideDelay, onClose]);

	// Animation effects
	useEffect(() => {
		if (visible) {
			opacity.value = withTiming(1, { duration: 200 });
			scale.value = withSpring(1, {
				damping: 15,
				stiffness: 150,
			});
		} else {
			opacity.value = withTiming(0, { duration: 150 });
			scale.value = withTiming(0.8, { duration: 150 });
		}
	}, [visible]);

	const animatedBackdropStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const animatedModalStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	const getIconConfig = () => {
		switch (type) {
			case 'warning':
				return {
					name: 'warning' as const,
					color: '#FF9800',
					backgroundColor: '#FFF3E0',
				};
			case 'info':
				return {
					name: 'information-circle' as const,
					color: '#2196F3',
					backgroundColor: '#E3F2FD',
				};
			case 'error':
			default:
				return {
					name: 'alert-circle' as const,
					color: '#D32F2F',
					backgroundColor: '#FFEBEE',
				};
		}
	};

	const iconConfig = getIconConfig();

	const handleBackdropPress = () => {
		onClose();
	};

	const getDefaultTitle = () => {
		switch (type) {
			case 'warning':
				return t('validation.warning');
			case 'info':
				return t('validation.info');
			case 'error':
			default:
				return t('validation.error');
		}
	};

	if (!visible) return null;

	return (
		<>
			<StatusBar
				backgroundColor="rgba(0, 0, 0, 0.6)"
				barStyle="light-content"
			/>
			<Modal
				transparent
				visible={visible}
				animationType="none"
				statusBarTranslucent
				onRequestClose={onClose}
			>
				<TouchableWithoutFeedback onPress={handleBackdropPress}>
					<Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
						<TouchableWithoutFeedback>
							<Animated.View
								style={[styles.modalContainer, animatedModalStyle]}
							>
								{/* Icon Section */}
								<View
									style={[
										styles.iconContainer,
										{ backgroundColor: iconConfig.backgroundColor },
									]}
								>
									<Ionicons
										name={iconConfig.name}
										size={32}
										color={iconConfig.color}
									/>
								</View>

								{/* Content Section */}
								<View style={styles.contentContainer}>
									<Text style={styles.title}>{title || getDefaultTitle()}</Text>
									<Text style={styles.message}>{message}</Text>
								</View>

								{/* Actions Section */}
								<View style={styles.actionsContainer}>
									{onRetry && (
										<TouchableOpacity
											style={[styles.button, styles.retryButton]}
											onPress={() => {
												onRetry();
												onClose();
											}}
											activeOpacity={0.8}
										>
											<Ionicons
												name="refresh-outline"
												size={12}
												color={colors.primary}
											/>
											<Text style={styles.retryButtonText}>
												{t('general.retry')}
											</Text>
										</TouchableOpacity>
									)}

									<TouchableOpacity
										style={[
											styles.button,
											styles.closeButton,
											!onRetry && styles.closeButtonFull,
										]}
										onPress={onClose}
										activeOpacity={0.8}
									>
										<Text style={styles.closeButtonText}>
											{t('general.ok')}
										</Text>
									</TouchableOpacity>
								</View>

								{/* Close X Button */}
								<TouchableOpacity
									style={styles.closeIconButton}
									onPress={onClose}
								>
									<Ionicons
										name="close"
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</Animated.View>
						</TouchableWithoutFeedback>
					</Animated.View>
				</TouchableWithoutFeedback>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	modalContainer: {
		backgroundColor: colors.quaternary,
		borderRadius: 20,
		width: '100%',
		maxWidth: 400,
		paddingVertical: 30,
		paddingHorizontal: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 10,
		position: 'relative',
	},
	iconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		marginBottom: 20,
	},
	contentContainer: {
		marginBottom: 30,
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 12,
	},
	message: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: 10,
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	button: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
		minHeight: 48,
	},
	retryButton: {
		backgroundColor: colors.quaternary,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	retryButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	closeButton: {
		backgroundColor: colors.primary,
	},
	closeButtonFull: {
		flex: 1,
	},
	closeButtonText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	closeIconButton: {
		position: 'absolute',
		top: 12,
		right: 12,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
	},
});
