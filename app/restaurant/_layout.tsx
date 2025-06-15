import { Stack } from 'expo-router';

export default function RestaurantLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen
				name="reviews"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
		</Stack>
	);
}
