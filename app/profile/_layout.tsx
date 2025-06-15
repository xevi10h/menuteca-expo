import { Stack } from 'expo-router';

export default function ProfileLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Main profile screen */}
			<Stack.Screen name="index" />

			{/* Authentication screens */}
			<Stack.Screen
				name="auth/login"
				options={{
					presentation: 'modal',
					animation: 'slide_from_bottom',
				}}
			/>
			<Stack.Screen
				name="auth/register"
				options={{
					presentation: 'modal',
					animation: 'slide_from_right',
				}}
			/>

			{/* Profile management screens */}
			<Stack.Screen
				name="edit-profile"
				options={{
					presentation: 'modal',
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="change-password"
				options={{
					presentation: 'modal',
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="my-reviews"
				options={{
					presentation: 'card',
					animation: 'slide_from_right',
				}}
			/>
			<Stack.Screen
				name="my-restaurants"
				options={{
					presentation: 'card',
					animation: 'slide_from_right',
				}}
			/>

			{/* Restaurant registration flow */}
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
		</Stack>
	);
}
