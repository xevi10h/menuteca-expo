import { colors } from '@/assets/styles/colors';
import React, { useEffect, useState } from 'react';
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalWrapperProps {
	children: React.ReactNode;
	onClose: () => void;
	hasNumericInputs?: boolean;
}

export function ModalWrapper({ children, onClose, hasNumericInputs = false }: ModalWrapperProps) {
	const { bottom } = useSafeAreaInsets();
	const [slideAnimation] = useState(new Animated.Value(0));

	useEffect(() => {
		// Animate in
		slideAnimation.setValue(0);
		Animated.timing(slideAnimation, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();

		return () => {
			// Animate out
			Animated.timing(slideAnimation, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}).start();
		};
	}, []);

	const slideTransform = {
		transform: [
			{
				translateY: slideAnimation.interpolate({
					inputRange: [0, 1],
					outputRange: [300, 0],
				}),
			},
		],
	};

	return (
		<TouchableOpacity
			style={styles.modalOverlay}
			activeOpacity={1}
			onPress={onClose}
		>
			{hasNumericInputs ? (
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.keyboardAvoidingView}
				>
					<Animated.View
						style={[
							styles.modalContent,
							{ paddingBottom: bottom + 20 },
							slideTransform,
						]}
					>
						<TouchableOpacity
							activeOpacity={1}
							onPress={(e) => e.stopPropagation()}
						>
							{children}
						</TouchableOpacity>
					</Animated.View>
				</KeyboardAvoidingView>
			) : (
				<Animated.View
					style={[
						styles.modalContent,
						{ paddingBottom: bottom + 20 },
						slideTransform,
					]}
				>
					<TouchableOpacity
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						{children}
					</TouchableOpacity>
				</Animated.View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	keyboardAvoidingView: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: colors.quaternary,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
		maxHeight: '60%',
	},
});