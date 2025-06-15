import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
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
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
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

interface ZoomableImageProps {
	source: string;
	onToggleControls: () => void;
}

// Componente separado para manejar el zoom de cada imagen
function ZoomableImage({ source, onToggleControls }: ZoomableImageProps) {
	const scale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const originX = useSharedValue(0);
	const originY = useSharedValue(0);

	const resetTransform = () => {
		'worklet';
		scale.value = withSpring(1);
		translateX.value = withSpring(0);
		translateY.value = withSpring(0);
	};

	const clampTranslation = () => {
		'worklet';
		const maxTranslateX = Math.max(
			0,
			((screenWidth - 40) * scale.value - screenWidth + 40) / 2,
		);
		const maxTranslateY = Math.max(
			0,
			((screenHeight - 200) * scale.value - screenHeight + 200) / 2,
		);

		translateX.value = withSpring(
			Math.min(Math.max(translateX.value, -maxTranslateX), maxTranslateX),
		);
		translateY.value = withSpring(
			Math.min(Math.max(translateY.value, -maxTranslateY), maxTranslateY),
		);
	};

	const pinchGesture = Gesture.Pinch()
		.onStart(() => {
			originX.value = translateX.value;
			originY.value = translateY.value;
		})
		.onUpdate((event) => {
			const newScale = Math.min(Math.max(event.scale, 0.5), 5);
			scale.value = newScale;

			// Calcular traducción basada en el punto focal del pinch
			const focalX = event.focalX - screenWidth / 2;
			const focalY = event.focalY - screenHeight / 2;

			translateX.value = originX.value + focalX * (newScale - 1);
			translateY.value = originY.value + focalY * (newScale - 1);
		})
		.onEnd(() => {
			// Si el zoom es muy pequeño, resetear
			if (scale.value < 1) {
				resetTransform();
			} else {
				// Limitar la traducción para mantener la imagen en pantalla
				clampTranslation();
			}
		});

	const panGesture = Gesture.Pan()
		.enabled(scale.value > 1)
		.onUpdate((event) => {
			translateX.value = event.translationX + originX.value;
			translateY.value = event.translationY + originY.value;
		})
		.onStart(() => {
			originX.value = translateX.value;
			originY.value = translateY.value;
		})
		.onEnd(() => {
			clampTranslation();
		});

	const tapGesture = Gesture.Tap()
		.numberOfTaps(1)
		.onEnd(() => {
			if (scale.value === 1) {
				runOnJS(onToggleControls)();
			}
		});

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd((event) => {
			if (scale.value > 1) {
				resetTransform();
			} else {
				// Zoom a 2x en el punto tocado
				const focalX = event.x - screenWidth / 2;
				const focalY = event.y - screenHeight / 2;

				scale.value = withSpring(2);
				translateX.value = withSpring(-focalX);
				translateY.value = withSpring(-focalY);
			}
		});

	const composedGesture = Gesture.Simultaneous(
		Gesture.Race(doubleTapGesture, tapGesture),
		Gesture.Simultaneous(pinchGesture, panGesture),
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translateX.value },
			{ translateY: translateY.value },
			{ scale: scale.value },
		],
	}));

	return (
		<GestureDetector gesture={composedGesture}>
			<Animated.View style={[styles.carouselItem, animatedStyle]}>
				<Image
					source={{ uri: source }}
					style={styles.photo}
					resizeMode="contain"
					onError={(error) => {
						console.warn('Error loading image:', error);
					}}
				/>
			</Animated.View>
		</GestureDetector>
	);
}

export default function PhotoGalleryModal({
	visible,
	photos,
	initialIndex,
	onClose,
}: PhotoGalleryModalProps) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isControlsVisible, setIsControlsVisible] = useState(true);

	// Carousel progress for pagination
	const progressValue = useSharedValue(initialIndex);

	// Reset state when modal opens
	React.useEffect(() => {
		if (visible) {
			setCurrentIndex(initialIndex);
			progressValue.value = initialIndex;
			setIsControlsVisible(true);
		}
	}, [visible, initialIndex]);

	const toggleControls = () => {
		setIsControlsVisible(!isControlsVisible);
	};

	const handleSnapToItem = (index: number) => {
		setCurrentIndex(index);
	};

	const renderCarouselItem = ({
		item,
		index,
	}: {
		item: string;
		index: number;
	}) => <ZoomableImage source={item} onToggleControls={toggleControls} />;

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			animationType="fade"
		>
			<StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.container}>
					{/* Background */}
					<View style={styles.background} />

					{/* Header Controls */}
					{isControlsVisible && (
						<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
							<TouchableOpacity onPress={onClose} style={styles.closeButton}>
								<Ionicons name="close" size={28} color={colors.quaternary} />
							</TouchableOpacity>

							<View style={styles.counter}>
								<Text style={styles.counterText}>
									{currentIndex + 1} / {photos.length}
								</Text>
							</View>

							<View style={styles.placeholder} />
						</View>
					)}

					{/* Carousel Container */}
					<View style={styles.carouselContainer}>
						<Carousel
							data={photos}
							renderItem={renderCarouselItem}
							width={screenWidth}
							height={screenHeight}
							defaultIndex={initialIndex}
							onSnapToItem={handleSnapToItem}
							onProgressChange={progressValue}
							scrollAnimationDuration={400}
							mode="parallax"
							modeConfig={{
								parallaxScrollingScale: 0.9,
								parallaxScrollingOffset: 50,
							}}
						/>
					</View>

					{/* Bottom Controls */}
					{isControlsVisible && (
						<View
							style={[
								styles.bottomControls,
								{ paddingBottom: insets.bottom + 20 },
							]}
						>
							{/* Pagination Dots */}
							{photos.length > 1 && (
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
								<Text style={styles.instructionsText}>
									{t('photoGallery.pinchToZoom')} •{' '}
									{t('photoGallery.swipeToNavigate')}
								</Text>
							</View>
						</View>
					)}
				</View>
			</GestureHandlerRootView>
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
		backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
	photo: {
		width: screenWidth - 40,
		height: screenHeight - 200,
		maxWidth: screenWidth - 40,
		maxHeight: screenHeight - 200,
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
		marginHorizontal: 4,
	},
	paginationActiveDot: {
		backgroundColor: colors.quaternary,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginHorizontal: 0,
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
