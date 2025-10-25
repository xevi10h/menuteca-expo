import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	Dimensions,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

interface ChangePasswordPopupProps {
	visible: boolean;
	onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChangePasswordPopup({
	visible,
	onClose,
}: ChangePasswordPopupProps) {
	const { t } = useTranslation();
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const resetForm = () => {
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setShowConfirmPassword(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert(t('validation.error'), t('auth.completeAllFields'));
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert(
				t('validation.error'),
				t('changePassword.passwordsDontMatch'),
			);
			return;
		}

		if (newPassword.length < 6) {
			Alert.alert(t('validation.error'), t('changePassword.minimumLength'));
			return;
		}

		setIsChangingPassword(true);

		try {
			// Simular llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1500));

			Alert.alert(
				t('changePassword.success'),
				t('changePassword.passwordChanged'),
				[{ text: 'OK', onPress: handleClose }],
			);
		} catch (error) {
			Alert.alert(t('validation.error'), t('changePassword.couldNotChange'));
		} finally {
			setIsChangingPassword(false);
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity
					style={styles.backdrop}
					activeOpacity={1}
					onPress={handleClose}
				/>

				<View style={styles.popup}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>{t('profile.changePassword')}</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Content */}
					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>
								{t('changePassword.currentPassword')}
							</Text>
							<View style={styles.passwordInputContainer}>
								<TextInput
									style={styles.passwordInput}
									value={currentPassword}
									onChangeText={setCurrentPassword}
									placeholder={t('changePassword.enterCurrentPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showCurrentPassword}
									autoCapitalize="none"
								/>
								<TouchableOpacity
									onPress={() => setShowCurrentPassword(!showCurrentPassword)}
									style={styles.passwordToggle}
								>
									<Ionicons
										name={showCurrentPassword ? 'eye-off' : 'eye'}
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>
								{t('changePassword.newPassword')}
							</Text>
							<View style={styles.passwordInputContainer}>
								<TextInput
									style={styles.passwordInput}
									value={newPassword}
									onChangeText={setNewPassword}
									placeholder={t('changePassword.enterNewPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showNewPassword}
									autoCapitalize="none"
								/>
								<TouchableOpacity
									onPress={() => setShowNewPassword(!showNewPassword)}
									style={styles.passwordToggle}
								>
									<Ionicons
										name={showNewPassword ? 'eye-off' : 'eye'}
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</View>
							<Text style={styles.inputHelper}>
								{t('changePassword.minimumChars')}
							</Text>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>
								{t('changePassword.confirmPassword')}
							</Text>
							<View style={styles.passwordInputContainer}>
								<TextInput
									style={styles.passwordInput}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									placeholder={t('changePassword.confirmNewPassword')}
									placeholderTextColor={colors.primaryLight}
									secureTextEntry={!showConfirmPassword}
									autoCapitalize="none"
								/>
								<TouchableOpacity
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
									style={styles.passwordToggle}
								>
									<Ionicons
										name={showConfirmPassword ? 'eye-off' : 'eye'}
										size={20}
										color={colors.primaryLight}
									/>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>

					{/* Footer */}
					<View style={styles.footer}>
						<TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
							<Text style={styles.cancelButtonText}>{t('general.cancel')}</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.saveButton,
								isChangingPassword && styles.saveButtonDisabled,
							]}
							onPress={handleChangePassword}
							disabled={isChangingPassword}
						>
							<Text
								style={[
									styles.saveButtonText,
									isChangingPassword && styles.saveButtonTextDisabled,
								]}
							>
								{isChangingPassword
									? t('changePassword.saving')
									: t('general.save')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	popup: {
		backgroundColor: colors.quaternary,
		borderRadius: 20,
		width: screenWidth * 0.9,
		maxWidth: 400,
		maxHeight: screenHeight * 0.8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 10,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	title: {
		fontSize: 18,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	closeButton: {
		padding: 4,
	},
	content: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		maxHeight: screenHeight * 0.5,
	},
	inputContainer: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
		marginBottom: 8,
	},
	passwordInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.secondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 15,
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
	},
	passwordToggle: {
		paddingHorizontal: 16,
		paddingVertical: 15,
	},
	inputHelper: {
		fontSize: 12,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		marginTop: 4,
	},
	footer: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: 12,
		backgroundColor: colors.secondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primary,
		alignItems: 'center',
	},
	cancelButtonText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	saveButton: {
		flex: 1,
		paddingVertical: 12,
		backgroundColor: colors.primary,
		borderRadius: 12,
		alignItems: 'center',
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.quaternary,
	},
	saveButtonTextDisabled: {
		color: colors.quaternary,
	},
});
