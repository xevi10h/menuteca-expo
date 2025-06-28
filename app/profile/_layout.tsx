import { Stack } from 'expo-router';

export default function ProfileLayout() {
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
			<Stack.Screen
				name="register-restaurant/index"
				options={{
					presentation: 'modal',
					gestureEnabled: true,
					animation: 'slide_from_bottom',
				}}
			/>
			<Stack.Screen
				name="register-restaurant/has-menu"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="register-restaurant/restaurant-name"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="register-restaurant/address"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="register-restaurant/cuisine-types"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="register-restaurant/setup"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			{/* User Restaurant Routes */}
			<Stack.Screen
				name="[user_id]/restaurant/[restaurant_id]/preview"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="[user_id]/restaurant/[restaurant_id]/edit"
				options={{
					presentation: 'card',
					gestureEnabled: true,
					animation: 'slide_from_right',
				}}
			/>
		</Stack>
	);
}
