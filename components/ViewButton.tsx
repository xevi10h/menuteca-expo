import { colors } from '@/assets/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ViewButtonProps {
	onPress: () => void;
	iconName: keyof typeof Ionicons.glyphMap;
	additionalBottom?: number;
	active?: boolean;
}

export default function ViewButton({
	onPress,
	iconName,
	additionalBottom = 0,
	active = false,
}: ViewButtonProps) {
	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					bottom: useSafeAreaInsets().bottom + 50 + additionalBottom,
					backgroundColor: active ? colors.primary : colors.secondary,
				},
			]}
			onPress={onPress}
			disabled={active}
		>
			<Ionicons
				name={iconName}
				size={32}
				color={active ? colors.secondary : colors.primary}
			/>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		width: 48,
		height: 48,
		borderRadius: 10,
		right: 20,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 4,
	},
});
