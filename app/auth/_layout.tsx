import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function AuthLayout() {
	return (
		<>
			<StatusBar translucent backgroundColor="transparent" style="dark" />
			<Stack
				screenOptions={{
					headerShown: false,
					statusBarTranslucent: true,
					animation: 'slide_from_right',
				}}
				initialRouteName="index"
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="login" />
				<Stack.Screen name="register" />
				<Stack.Screen name="forgot-password" />
				<Stack.Screen
					name="reset-password"
					options={{
						presentation: 'modal',
					}}
				/>
			</Stack>
		</>
	);
}
