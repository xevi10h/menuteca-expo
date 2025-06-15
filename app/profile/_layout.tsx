import { colors } from '@/assets/styles/colors';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: colors.secondary },
				animation: 'slide_from_right',
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="register-restaurant" />
		</Stack>
	);
}
