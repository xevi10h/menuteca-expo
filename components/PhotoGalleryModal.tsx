import { colors } from '@/assets/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Dimensions,
	Image,
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PhotoGalleryModalProps {
	visible: boolean;
	photos: string[];
	initialIndex: number;
	onClose: () => void;
}

export default function PhotoGalleryModal({
	visible,
	photos,
	initialIndex,
	onClose,
}: PhotoGalleryModalProps) {
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isControlsVisible, setIsControlsVisible] = useState(true);

	// Animated values
	const translateX = useSharedValue(-initialIndex * screenWidth);
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	// Reset values when modal opens
	React.useEffect(() => {
		if (visible) {
			setCurrentIndex(initialIndex);
			translateX.value = -initialIndex * screenWidth;
			scale.value = 1;
			opacity.value = 1;
		}
	}, [visible, initialIndex]);

	// Pan gesture handler for swiping between images
	const panGestureHandler = useAnimatedGestureHandler({
		onStart: () => {
			// Store the starting position
		},
		onActive: (event) => {
			translateX.value = -currentIndex * screenWidth + event.translationX;
		},
		onEnd: (event) => {
			const shouldMoveToNext =
				event.translationX < -50 && currentIndex < photos.length - 1;
			const shouldMoveToPrev = event.translationX > 50 && currentIndex > 0;

			if (shouldMoveToNext) {
				const newIndex = Math.min(currentIndex + 1, photos.length - 1);
				translateX.value = withSpring(-newIndex * screenWidth);
				runOnJS(setCurrentIndex)(newIndex);
			} else if (shouldMoveToPrev) {
				const newIndex = Math.max(currentIndex - 1, 0);
				translateX.value = withSpring(-newIndex * screenWidth);
				runOnJS(setCurrentIndex)(newIndex);
			} else {
				// Snap back to current position
				translateX.value = withSpring(-currentIndex * screenWidth);
			}
		},
	});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { scale: scale.value }],
		opacity: opacity.value,
	}));

	const toggleControls = () => {
		setIsControlsVisible(!isControlsVisible);
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			const newIndex = currentIndex - 1;
			setCurrentIndex(newIndex);
			translateX.value = withSpring(-newIndex * screenWidth);
		}
	};

	const handleNext = () => {
		if (currentIndex < photos.length - 1) {
			const newIndex = currentIndex + 1;
			setCurrentIndex(newIndex);
			translateX.value = withSpring(-newIndex * screenWidth);
		}
	};

	const handleClose = () => {
		scale.value = withTiming(0.8);
		opacity.value = withTiming(0, undefined, () => {
			runOnJS(onClose)();
		});
	};

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			animationType="fade"
		>
			<StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
			<View style={styles.container}>
				{/* Background */}
				<TouchableOpacity
					style={styles.background}
					activeOpacity={1}
					onPress={toggleControls}
				/>

				{/* Photos Container */}
				<PanGestureHandler onGestureEvent={panGestureHandler}>
					<Animated.View style={[styles.photosContainer, animatedStyle]}>
						{photos.map((photo, index) => (
							<View key={index} style={styles.photoWrapper}>
								<TouchableOpacity
									style={styles.photoTouchable}
									onPress={toggleControls}
									activeOpacity={1}
								>
									<Image
										source={{ uri: photo }}
										style={styles.photo}
										resizeMode="contain"
									/>
								</TouchableOpacity>
							</View>
						))}
					</Animated.View>
				</PanGestureHandler>

				{/* Controls Overlay */}
				{isControlsVisible && (
					<>
						{/* Header */}
						<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
							<TouchableOpacity
								onPress={handleClose}
								style={styles.closeButton}
							>
								<Ionicons name="close" size={28} color={colors.quaternary} />
							</TouchableOpacity>
							<View style={styles.counter}>
								<Text style={styles.counterText}>
									{currentIndex + 1} / {photos.length}
								</Text>
							</View>
							<View style={styles.placeholder} />
						</View>

						{/* Navigation Arrows */}
						{photos.length > 1 && (
							<>
								{currentIndex > 0 && (
									<TouchableOpacity
										style={[styles.navButton, styles.prevButton]}
										onPress={handlePrevious}
									>
										<Ionicons
											name="chevron-back"
											size={32}
											color={colors.quaternary}
										/>
									</TouchableOpacity>
								)}

								{currentIndex < photos.length - 1 && (
									<TouchableOpacity
										style={[styles.navButton, styles.nextButton]}
										onPress={handleNext}
									>
										<Ionicons
											name="chevron-forward"
											size={32}
											color={colors.quaternary}
										/>
									</TouchableOpacity>
								)}
							</>
						)}

						{/* Dots Indicator */}
						{photos.length > 1 && (
							<View
								style={[
									styles.dotsContainer,
									{ paddingBottom: insets.bottom + 20 },
								]}
							>
								{photos.map((_, index) => (
									<TouchableOpacity
										key={index}
										style={[
											styles.dot,
											index === currentIndex && styles.activeDot,
										]}
										onPress={() => {
											setCurrentIndex(index);
											translateX.value = withSpring(-index * screenWidth);
										}}
									/>
								))}
							</View>
						)}
					</>
				)}
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.95)',
	},
	background: {
		...StyleSheet.absoluteFillObject,
	},
	photosContainer: {
		flex: 1,
		flexDirection: 'row',
		width: screenWidth * 10, // Adjust based on max photos you expect
	},
	photoWrapper: {
		width: screenWidth,
		height: screenHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	photoTouchable: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	photo: {
		width: screenWidth - 40,
		height: screenHeight - 200,
		maxWidth: screenWidth - 40,
		maxHeight: screenHeight - 200,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		zIndex: 1000,
	},
	closeButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	counter: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	counterText: {
		color: colors.quaternary,
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
	},
	placeholder: {
		width: 44,
		height: 44,
	},
	navButton: {
		position: 'absolute',
		top: '50%',
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		transform: [{ translateY: -30 }],
		zIndex: 1000,
	},
	prevButton: {
		left: 20,
	},
	nextButton: {
		right: 20,
	},
	dotsContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 20,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
	},
	activeDot: {
		backgroundColor: colors.quaternary,
		width: 10,
		height: 10,
		borderRadius: 5,
	},
});
