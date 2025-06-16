import { colors } from '@/assets/styles/colors';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	Dimensions,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

interface ChangeUsernamePopupProps {
	visible: boolean;
	onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChangeUsernamePopup({
	visible,
	onClose,
}: ChangeUsernamePopupProps) {
	const user = useUserStore((state) => state.user);
	const updateUsername = useUserStore((state) => state.updateUsername);
	const [newUsername, setNewUsername] = useState('');
	const [isChangingUsername, setIsChangingUsername] = useState(false);

	const resetForm = () => {
		setNewUsername('');
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	// Initialize with current username when modal opens
	React.useEffect(() => {
		if (visible) {
			setNewUsername(user.username);
		}
	}, [visible, user.username]);

	const handleChangeUsername = async () => {
		if (!newUsername.trim()) {
			Alert.alert('Error', 'Por favor, ingresa un nombre de usuario válido');
			return;
		}

		if (newUsername.trim().length < 3) {
			Alert.alert(
				'Error',
				'El nombre de usuario debe tener al menos 3 caracteres',
			);
			return;
		}

		if (newUsername.trim() === user.username) {
			handleClose();
			return;
		}

		setIsChangingUsername(true);

		try {
			// Simular llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1500));

			updateUsername(newUsername.trim());

			Alert.alert('Éxito', 'Nombre de usuario cambiado correctamente', [
				{ text: 'OK', onPress: handleClose },
			]);
		} catch (error) {
			Alert.alert(
				'Error',
				'No se pudo cambiar el nombre de usuario. Inténtalo de nuevo.',
			);
		} finally {
			setIsChangingUsername(false);
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
						<Text style={styles.title}>Cambiar Usuario</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Content */}
					<View style={styles.content}>
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Nombre de usuario</Text>
							<TextInput
								style={styles.input}
								value={newUsername}
								onChangeText={setNewUsername}
								placeholder="Ingresa tu nuevo nombre de usuario"
								placeholderTextColor={colors.primaryLight}
								autoCapitalize="none"
								autoCorrect={false}
							/>
							<Text style={styles.inputHelper}>
								Mínimo 3 caracteres, sin espacios
							</Text>
						</View>
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						<TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
							<Text style={styles.cancelButtonText}>Cancelar</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.saveButton,
								isChangingUsername && styles.saveButtonDisabled,
							]}
							onPress={handleChangeUsername}
							disabled={isChangingUsername}
						>
							<Text
								style={[
									styles.saveButtonText,
									isChangingUsername && styles.saveButtonTextDisabled,
								]}
							>
								{isChangingUsername ? 'Guardando...' : 'Guardar'}
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
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	title: {
		fontSize: 18,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	closeButton: {
		padding: 4,
	},
	content: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	inputContainer: {
		marginBottom: 8,
	},
	inputLabel: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
		marginBottom: 8,
	},
	input: {
		backgroundColor: colors.secondary,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 15,
		fontSize: 16,
		fontFamily: 'Manrope',
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	inputHelper: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primaryLight,
		marginTop: 4,
	},
	footer: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: colors.primaryLight,
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
		fontFamily: 'Manrope',
		fontWeight: '500',
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
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.quaternary,
	},
	saveButtonTextDisabled: {
		color: colors.quaternary,
	},
});
