import { colors } from '@/assets/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CenterLocationMapButtonProps {
	onPress: () => void;
	additionalBottom: number;
}

export default function CenterLocationMapButton({
	onPress,
	additionalBottom,
}: CenterLocationMapButtonProps) {
	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					bottom: useSafeAreaInsets().bottom + 50 + additionalBottom,
				},
			]}
			onPress={onPress}
		>
			<MaterialIcons name="my-location" size={28} color={colors.primary} />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		width: 48,
		height: 48,
		borderRadius: 24,
		right: 20,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 4,
		backgroundColor: colors.secondary,
	},
});
