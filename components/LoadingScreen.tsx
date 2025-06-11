import { colors } from '@/assets/styles/colors';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoadingScreenProps {
	onLoadingComplete?: () => void;
	duration?: number; // Duración total del loading en ms
}

export default function LoadingScreen({
	onLoadingComplete,
	duration = 3000,
}: LoadingScreenProps) {
	const insets = useSafeAreaInsets();
	const [currentFrame, setCurrentFrame] = useState(0);

	// Valores animados
	const opacity = useSharedValue(0);
	const scale = useSharedValue(0.8);

	// Array con los paths de las imágenes del logo con diferentes barras
	// TODO: Reemplazar con tus assets reales
	const logoFrames = [
		require('@/assets/images/logo_loading_0_bars.png'), // 0 barras (temporal)
		require('@/assets/images/logo_loading_1_bars.png'), // 1 barra (temporal)
		require('@/assets/images/logo_loading_2_bars.png'), // 2 barras (temporal)
		require('@/assets/images/logo_loading_3_bars.png'), // 3 barras (temporal)
		require('@/assets/images/logo_loading_4_bars.png'), // 4 barras (temporal)
	];

	useEffect(() => {
		// Animación inicial de entrada
		opacity.value = withTiming(1, { duration: 500 });
		scale.value = withTiming(1, { duration: 500 });

		// Configurar la animación de las barras
		const frameInterval = 300; // Tiempo entre frames en ms
		const totalCycles = Math.floor(duration / (frameInterval * 5)); // Cuántos ciclos completos

		let frameCount = 0;
		const maxFrames = totalCycles * 5;

		const frameTimer = setInterval(() => {
			frameCount++;

			if (frameCount >= maxFrames) {
				clearInterval(frameTimer);
				// Animación de salida
				opacity.value = withTiming(0, { duration: 500 }, () => {
					if (onLoadingComplete) {
						runOnJS(onLoadingComplete)();
					}
				});
				return;
			}

			// Calcular el frame actual (0-4, luego vuelve a 0)
			const newFrame = frameCount % 5;
			runOnJS(setCurrentFrame)(newFrame);
		}, frameInterval);

		return () => {
			clearInterval(frameTimer);
		};
	}, [duration, onLoadingComplete]);

	const containerStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Background con gradiente sutil */}
			<View style={styles.background} />

			{/* Logo animado */}
			<Animated.View style={[styles.logoContainer, containerStyle]}>
				<Image
					source={logoFrames[currentFrame]}
					style={styles.logo}
					resizeMode="contain"
				/>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	background: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.primary,
	},
	logoContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 60,
	},
	logo: {
		width: 120,
		height: 96,
	},
});
