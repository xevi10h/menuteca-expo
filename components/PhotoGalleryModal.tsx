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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
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

	// Animated values for zoom and pan
	const scale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);

	// Carousel progress
	const progressValue = useSharedValue(0);

	// Reset values when modal opens
	React.useEffect(() => {
		if (visible) {
			setCurrentIndex(initialIndex);
			scale.value = 1;
			translateX.value = 0;
			translateY.value = 0;
			opacity.value = 1;
			progressValue.value = initialIndex;
		}
	}, [visible, initialIndex]);

	// Pinch gesture for zoom using new API
	const pinchGesture = Gesture.Pinch()
		.onUpdate((event) => {
			scale.value = Math.max(1, Math.min(4, event.scale));
		})
		.onEnd(() => {
			if (scale.value < 1.2) {
				scale.value = withSpring(1, { damping: 20, stiffness: 300 });
				translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
				translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
			} else if (scale.value > 3.5) {
				scale.value = withSpring(3.5, { damping: 20, stiffness: 300 });
			}
		});

	// Pan gesture for moving zoomed image
	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			if (scale.value > 1.1) {
				// Calculate boundaries to prevent panning too far
				const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
				const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;

				translateX.value = Math.max(
					-maxTranslateX,
					Math.min(maxTranslateX, event.translationX),
				);
				translateY.value = Math.max(
					-maxTranslateY,
					Math.min(maxTranslateY, event.translationY),
				);
			}
		})
		.onEnd(() => {
			// Smooth return to bounds if needed
			const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
			const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;

			if (Math.abs(translateX.value) > maxTranslateX) {
				translateX.value = withSpring(
					Math.sign(translateX.value) * maxTranslateX,
					{ damping: 20, stiffness: 300 },
				);
			}
			if (Math.abs(translateY.value) > maxTranslateY) {
				translateY.value = withSpring(
					Math.sign(translateY.value) * maxTranslateY,
					{ damping: 20, stiffness: 300 },
				);
			}
		});

	// Tap gesture for toggling controls and double tap for zoom
	const tapGesture = Gesture.Tap()
		.numberOfTaps(1)
		.onEnd(() => {
			runOnJS(toggleControls)();
		});

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			if (scale.value > 1.1) {
				// Reset zoom
				scale.value = withSpring(1, { damping: 20, stiffness: 300 });
				translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
				translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
			} else {
				// Zoom to 2x
				scale.value = withSpring(2.5, { damping: 20, stiffness: 300 });
			}
		});

	// Combine gestures
	const composedGestures = Gesture.Simultaneous(
		Gesture.Race(doubleTapGesture, tapGesture),
		Gesture.Simultaneous(pinchGesture, panGesture),
	);

	const toggleControls = () => {
		setIsControlsVisible(!isControlsVisible);
	};

	const handleClose = () => {
		scale.value = withTiming(0.8, { duration: 200 });
		opacity.value = withTiming(0, { duration: 300 }, () => {
			runOnJS(onClose)();
		});
	};

	const resetZoom = () => {
		scale.value = withSpring(1, { damping: 20, stiffness: 300 });
		translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
		translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
	};

	// Animated styles for individual image zoom and pan
	const imageAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: scale.value },
			{ translateX: translateX.value },
			{ translateY: translateY.value },
		],
	}));

	const modalAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const renderCarouselItem = ({ index }: { index: number }) => (
		<View style={styles.carouselItem}>
			<GestureDetector gesture={composedGestures}>
				<Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
					<Image
						source={{ uri: photos[index] }}
						style={styles.photo}
						resizeMode="contain"
					/>
				</Animated.View>
			</GestureDetector>
		</View>
	);

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			animationType="fade"
		>
			<StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
			<Animated.View style={[styles.container, modalAnimatedStyle]}>
				{/* Background */}
				<TouchableOpacity
					style={styles.background}
					activeOpacity={1}
					onPress={toggleControls}
				/>

				{/* Carousel Container */}
				<View style={styles.carouselContainer}>
					<Carousel
						data={photos}
						renderItem={renderCarouselItem}
						width={screenWidth}
						height={screenHeight}
						defaultIndex={initialIndex}
						enabled={scale.value <= 1.1} // Disable carousel swipe when zoomed
						onSnapToItem={(index) => {
							setCurrentIndex(index);
							// Reset zoom when changing images
							resetZoom();
						}}
						onProgressChange={progressValue}
						scrollAnimationDuration={400}
						mode="parallax"
						modeConfig={{
							parallaxScrollingScale: 0.9,
							parallaxScrollingOffset: 50,
						}}
					/>
				</View>

				{/* Controls Overlay */}
				{isControlsVisible && (
					<>
						{/* Header */}
						<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
							<TouchableOpacity
								onPress={handleClose}
								style={styles.controlButton}
							>
								<Ionicons name="close" size={28} color={colors.quaternary} />
							</TouchableOpacity>

							<View style={styles.counter}>
								<Text style={styles.counterText}>
									{currentIndex + 1} / {photos.length}
								</Text>
							</View>

							<TouchableOpacity
								onPress={resetZoom}
								style={[
									styles.controlButton,
									scale.value <= 1.1 && styles.controlButtonDisabled,
								]}
								disabled={scale.value <= 1.1}
							>
								<Ionicons
									name="contract"
									size={24}
									color={
										scale.value > 1.1
											? colors.quaternary
											: 'rgba(255,255,255,0.5)'
									}
								/>
							</TouchableOpacity>
						</View>

						{/* Bottom Controls */}
						<View
							style={[
								styles.bottomControls,
								{ paddingBottom: insets.bottom + 20 },
							]}
						>
							{/* Pagination Dots */}
							{photos.length > 1 && scale.value <= 1.1 && (
								<Pagination.Basic
									progress={progressValue}
									data={photos}
									dotStyle={styles.paginationDot}
									activeDotStyle={styles.paginationActiveDot}
									containerStyle={styles.paginationContainer}
									horizontal
								/>
							)}

							{/* Instructions */}
							<View style={styles.instructionsContainer}>
								{scale.value <= 1.1 ? (
									<Text style={styles.instructionsText}>
										Doble toque para zoom • Desliza para navegar
									</Text>
								) : (
									<Text style={styles.instructionsText}>
										Pellizca para zoom • Arrastra para mover
									</Text>
								)}
							</View>
						</View>
					</>
				)}
			</Animated.View>
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
	carouselContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	carouselItem: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: screenWidth,
		height: screenHeight,
	},
	imageContainer: {
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
	controlButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	controlButtonDisabled: {
		opacity: 0.5,
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
	bottomControls: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 1000,
	},
	paginationContainer: {
		marginBottom: 10,
	},
	paginationDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
	},
	paginationActiveDot: {
		backgroundColor: colors.quaternary,
		width: 20,
		height: 8,
		borderRadius: 4,
	},
	instructionsContainer: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginHorizontal: 20,
	},
	instructionsText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 13,
		fontFamily: 'Manrope',
		fontWeight: '400',
		textAlign: 'center',
	},
});
