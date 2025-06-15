import { colors } from '@/assets/styles/colors';
import { useUserStore } from '@/zustand/UserStore';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfilePhotoButton() {
	const { user, isAuthenticated } = useUserStore();

	const handlePress = () => {
		if (isAuthenticated) {
			// User is logged in, go to profile
			router.push('/profile');
		} else {
			// User is not logged in, go to login screen
			router.push('/profile/auth/login');
		}
	};

	const getInitials = (username: string) => {
		if (!username) return '?';
		const words = username.trim().split(' ');
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return username.slice(0, 2).toUpperCase();
	};

	return (
		<TouchableOpacity onPress={handlePress}>
			<View style={styles.container}>
				{isAuthenticated && user.photo ? (
					<Image source={{ uri: user.photo }} style={styles.profilePhoto} />
				) : isAuthenticated && user.username ? (
					<View style={styles.initialsContainer}>
						<Text style={styles.initialsText}>
							{getInitials(user.username)}
						</Text>
					</View>
				) : (
					<Image
						source={require('@/assets/images/default_user_avatar.png')}
						style={styles.profilePhoto}
					/>
				)}
			</View>
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
	initialsContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	initialsText: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
});
