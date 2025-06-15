import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { user, isAuthenticated, updatePhoto, logout, userRestaurants } =
		useUserStore();

	useEffect(() => {
		// Redirect to login if not authenticated
		if (true) {
			router.replace('/profile/auth/login');
		}
	}, [isAuthenticated]);

	const handleLogout = () => {
		Alert.alert(t('profile.logoutTitle'), t('profile.logoutMessage'), [
			{ text: t('general.cancel'), style: 'cancel' },
			{
				text: t('profile.logout'),
				style: 'destructive',
				onPress: () => {
					logout();
					router.replace('/');
				},
			},
		]);
	};

	const handleEditProfile = () => {
		router.push('/profile/edit-profile');
	};

	const handleChangePassword = () => {
		router.push('/profile/change-password');
	};

	const handleMyReviews = () => {
		router.push('/profile/my-reviews');
	};

	const handleMyRestaurants = () => {
		router.push('/profile/my-restaurants');
	};

	const handleChangePhoto = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				t('profile.permissionsRequired'),
				t('profile.photoPermissionMessage'),
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			updatePhoto(result.assets[0].uri);
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

	if (!isAuthenticated) {
		return null;
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color={colors.primary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('profile.myProfile')}</Text>
				<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
					<Ionicons name="log-out-outline" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Profile Info */}
				<View style={styles.profileSection}>
					<TouchableOpacity
						onPress={handleChangePhoto}
						style={styles.photoContainer}
					>
						{user.photo ? (
							<Image source={{ uri: user.photo }} style={styles.profilePhoto} />
						) : (
							<View style={styles.initialsContainer}>
								<Text style={styles.initialsText}>
									{getInitials(user.username || user.name)}
								</Text>
							</View>
						)}
						<View style={styles.cameraIconContainer}>
							<Ionicons name="camera" size={20} color={colors.quaternary} />
						</View>
					</TouchableOpacity>

					<Text style={styles.userName}>{user.name || user.username}</Text>
					<Text style={styles.userEmail}>{user.email}</Text>
				</View>

				{/* Menu Options */}
				<View style={styles.menuSection}>
					{/* Edit Profile */}
					<TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
						<View style={styles.menuItemLeft}>
							<Ionicons
								name="person-outline"
								size={24}
								color={colors.primary}
							/>
							<Text style={styles.menuItemText}>
								{t('profile.editProfile')}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.primaryLight}
						/>
					</TouchableOpacity>

					{/* Change Password */}
					{user.hasPassword && (
						<TouchableOpacity
							style={styles.menuItem}
							onPress={handleChangePassword}
						>
							<View style={styles.menuItemLeft}>
								<Ionicons
									name="lock-closed-outline"
									size={24}
									color={colors.primary}
								/>
								<Text style={styles.menuItemText}>
									{t('profile.changePassword')}
								</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={colors.primaryLight}
							/>
						</TouchableOpacity>
					)}

					{/* My Reviews */}
					<TouchableOpacity style={styles.menuItem} onPress={handleMyReviews}>
						<View style={styles.menuItemLeft}>
							<Ionicons name="star-outline" size={24} color={colors.primary} />
							<Text style={styles.menuItemText}>{t('profile.myReviews')}</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.primaryLight}
						/>
					</TouchableOpacity>

					{/* My Restaurants */}
					<TouchableOpacity
						style={styles.menuItem}
						onPress={handleMyRestaurants}
					>
						<View style={styles.menuItemLeft}>
							<Ionicons
								name="restaurant-outline"
								size={24}
								color={colors.primary}
							/>
							<View style={styles.menuItemContent}>
								<Text style={styles.menuItemText}>
									{t('profile.myRestaurants')}
								</Text>
								<Text style={styles.restaurantCount}>
									{userRestaurants.length}/10
								</Text>
							</View>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.primaryLight}
						/>
					</TouchableOpacity>
				</View>

				{/* Stats Section */}
				<View style={styles.statsSection}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{userRestaurants.length}</Text>
						<Text style={styles.statLabel}>{t('profile.restaurants')}</Text>
					</View>
					<View style={styles.divider} />
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>0</Text>
						<Text style={styles.statLabel}>{t('profile.reviews')}</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	logoutButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileSection: {
		alignItems: 'center',
		paddingVertical: 30,
	},
	photoContainer: {
		position: 'relative',
		marginBottom: 20,
	},
	profilePhoto: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	initialsContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	initialsText: {
		fontSize: 36,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.quaternary,
	},
	cameraIconContainer: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: colors.primary,
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: colors.secondary,
	},
	userName: {
		fontSize: 24,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 5,
	},
	userEmail: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	menuSection: {
		paddingHorizontal: 20,
		marginBottom: 30,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	menuItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	menuItemContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	menuItemText: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginLeft: 16,
	},
	restaurantCount: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginRight: 10,
	},
	statsSection: {
		flexDirection: 'row',
		backgroundColor: colors.quaternary,
		marginHorizontal: 20,
		borderRadius: 16,
		padding: 20,
		marginBottom: 30,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 28,
		fontFamily: 'Manrope',
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 5,
	},
	statLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
	},
	divider: {
		width: 1,
		backgroundColor: colors.primaryLight,
		opacity: 0.3,
		marginHorizontal: 20,
	},
});
