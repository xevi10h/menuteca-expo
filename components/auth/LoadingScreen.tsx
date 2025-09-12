import { colors } from '@/assets/styles/colors';
import React, { useEffect, useRef } from 'react';
import {
	Animated,
	Dimensions,
	Easing,
	Image,
	StyleSheet,
	Text,
	View,
} from 'react-native';

interface LoadingScreenProps {
	onLoadingComplete?: () => void;
	duration?: number;
	showLogo?: boolean;
	message?: string;
	showProgress?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function LoadingScreen({
	onLoadingComplete,
	duration = 2000,
	showLogo = true,
	message = 'Loading...',
	showProgress = false,
}: LoadingScreenProps) {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const spinValue = useRef(new Animated.Value(0)).current;
	const progressAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		// Logo animation
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 800,
				easing: Easing.out(Easing.back(1.5)),
				useNativeDriver: true,
			}),
		]).start();

		// Spinner animation
		const spin = Animated.loop(
			Animated.timing(spinValue, {
				toValue: 1,
				duration: 1000,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		);
		spin.start();

		// Progress animation (if enabled)
		if (showProgress && duration) {
			Animated.timing(progressAnim, {
				toValue: 1,
				duration: duration,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start();
		}

		// Auto complete after duration
		if (duration && onLoadingComplete) {
			const timer = setTimeout(onLoadingComplete, duration);
			return () => {
				clearTimeout(timer);
				spin.stop();
			};
		}

		return () => {
			spin.stop();
		};
	}, [
		fadeAnim,
		scaleAnim,
		spinValue,
		progressAnim,
		duration,
		onLoadingComplete,
		showProgress,
	]);

	const spinInterpolate = spinValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	const progressWidth = progressAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	});

	return (
		<View style={styles.container}>
			{/* Background Gradient Effect */}
			<View style={styles.backgroundGradient} />

			{/* Logo Section */}
			{showLogo && (
				<Animated.View
					style={[
						styles.logoContainer,
						{
							opacity: fadeAnim,
							transform: [{ scale: scaleAnim }],
						},
					]}
				>
					<View style={styles.logoWrapper}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.appName}>Menuteca</Text>
					<Text style={styles.tagline}>Discover amazing restaurants</Text>
				</Animated.View>
			)}

			{/* Loading Section */}
			<View style={styles.loadingSection}>
				{/* Custom Spinner */}
				<View style={styles.spinnerContainer}>
					<Animated.View
						style={[
							styles.spinner,
							{
								transform: [{ rotate: spinInterpolate }],
							},
						]}
					>
						<View style={styles.spinnerRing} />
					</Animated.View>
				</View>

				{/* Loading Message */}
				<Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
					{message}
				</Animated.Text>

				{/* Progress Bar */}
				{showProgress && (
					<View style={styles.progressContainer}>
						<View style={styles.progressBackground}>
							<Animated.View
								style={[styles.progressBar, { width: progressWidth }]}
							/>
						</View>
					</View>
				)}
			</View>

			{/* Decorative Elements */}
			<View style={styles.decorativeElements}>
				<View style={[styles.circle, styles.circle1]} />
				<View style={[styles.circle, styles.circle2]} />
				<View style={[styles.circle, styles.circle3]} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	backgroundGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.secondary,
		opacity: 0.95,
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 80,
	},
	logoWrapper: {
		width: 120,
		height: 120,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.quaternary,
		borderRadius: 24,
		marginBottom: 20,
		shadowColor: colors.primary,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
	},
	logo: {
		width: 80,
		height: 64,
	},
	appName: {
		fontSize: 32,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
		textAlign: 'center',
	},
	tagline: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		textAlign: 'center',
	},
	loadingSection: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	spinnerContainer: {
		position: 'relative',
		marginBottom: 40,
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
	},
	spinner: {
		width: 50,
		height: 50,
		position: 'absolute',
	},
	spinnerRing: {
		width: 50,
		height: 50,
		borderRadius: 25,
		borderWidth: 4,
		borderColor: 'transparent',
		borderTopColor: colors.primary,
		borderRightColor: colors.primary,
	},
	loadingText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		textAlign: 'center',
		marginBottom: 20,
	},
	progressContainer: {
		width: width * 0.6,
		alignItems: 'center',
	},
	progressBackground: {
		width: '100%',
		height: 4,
		backgroundColor: colors.primaryLight,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		backgroundColor: colors.primary,
		borderRadius: 2,
	},
	decorativeElements: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: -1,
	},
	circle: {
		position: 'absolute',
		borderRadius: 100,
		backgroundColor: colors.primary,
		opacity: 0.05,
	},
	circle1: {
		width: 200,
		height: 200,
		top: height * 0.1,
		right: -100,
	},
	circle2: {
		width: 150,
		height: 150,
		bottom: height * 0.2,
		left: -75,
	},
	circle3: {
		width: 100,
		height: 100,
		top: height * 0.3,
		left: width * 0.2,
	},
});
