import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfilePhotoButton() {
	const handlePress = () => {
		router.push('/profile/register-restaurant');
	};

	return (
		<TouchableOpacity onPress={handlePress}>
			<View>
				<Image
					source={require('@/assets/images/default_user_avatar.png')}
					style={styles.profilePhoto}
				/>
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
	profileInitialPhotoSubstitute: {
		fontSize: 55,
		alignSelf: 'center',
		color: '#3F713B',
		fontFamily: 'Montserrat-Regular',
		fontWeight: '400',
	},
	addButtonContainer: {
		width: 30,
		height: 30,
		borderRadius: 30,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		top: -5,
		right: -5,
	},
	backgroundButton: {
		width: 25,
		height: 25,
		borderRadius: 30,
		backgroundColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
	},
	horizontalLine: {
		width: 15,
		height: 3,
		backgroundColor: 'white',
		borderRadius: 10,
		top: 7.5,
	},
	verticalLine: {
		width: 3,
		height: 15,
		backgroundColor: 'white',
		borderRadius: 10,
		top: -1.5,
	},
});
