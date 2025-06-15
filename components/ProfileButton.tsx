import { colors } from '@/assets/styles/colors';
import { useUserStore } from '@/zustand/UserStore';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfilePhotoButton() {
	const user = useUserStore((state) => state.user);
	const isLoggedIn = Boolean(user.token && user.id);

	const handlePress = () => {
		if (isLoggedIn) {
			router.push('/profile');
		} else {
			router.push('/auth/login');
		}
	};

	const renderProfileContent = () => {
		if (isLoggedIn) {
			if (user.photo) {
				return (
					<Image source={{ uri: user.photo }} style={styles.profilePhoto} />
				);
			} else {
				// Mostrar inicial del username
				const initial = user.username
					? user.username.charAt(0).toUpperCase()
					: 'U';
				return (
					<View style={styles.initialContainer}>
						<Text style={styles.initialText}>{initial}</Text>
					</View>
				);
			}
		} else {
			return (
				<Image
					source={require('@/assets/images/default_user_avatar.png')}
					style={styles.profilePhoto}
				/>
			);
		}
	};

	return (
		<TouchableOpacity onPress={handlePress} style={styles.container}>
			{renderProfileContent()}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profilePhoto: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	initialContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	initialText: {
		fontSize: 14,
		fontFamily: 'Montserrat-Regular',
		fontWeight: '600',
		color: colors.quaternary,
	},
});
