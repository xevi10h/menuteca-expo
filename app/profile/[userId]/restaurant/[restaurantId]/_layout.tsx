import { Stack } from 'expo-router';

export default function UserRestaurantLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="preview" />
			<Stack.Screen name="edit" />
		</Stack>
	);
}
