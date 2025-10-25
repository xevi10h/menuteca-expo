import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/shared/types';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	Dimensions,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface LanguageSelectorPopupProps {
	visible: boolean;
	onClose: () => void;
}

interface LanguageOption {
	label: string;
	value: Language;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LanguageSelectorPopup({
	visible,
	onClose,
}: LanguageSelectorPopupProps) {
	const { t } = useTranslation();
	const user = useUserStore((state) => state.user);
	const setLanguage = useUserStore((state) => state.setLanguage);
	const [selectedLanguage, setSelectedLanguage] = useState<Language>(
		user.language,
	);
	const [isChangingLanguage, setIsChangingLanguage] = useState(false);

	// Initialize with current language when modal opens
	React.useEffect(() => {
		if (visible) {
			setSelectedLanguage(user.language);
		}
	}, [visible, user.language]);

	const availableLanguages: LanguageOption[] = [
		{ label: t('languages.en_US'), value: 'en_US' },
		{ label: t('languages.es_ES'), value: 'es_ES' },
		{ label: t('languages.ca_ES'), value: 'ca_ES' },
		{ label: t('languages.fr_FR'), value: 'fr_FR' },
	];

	const handleClose = () => {
		setSelectedLanguage(user.language);
		onClose();
	};

	const handleChangeLanguage = async () => {
		if (selectedLanguage === user.language) {
			onClose();
			return;
		}

		setIsChangingLanguage(true);

		try {
			// Simular llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setLanguage(selectedLanguage);

			Alert.alert(
				t('validation.success'),
				t('changeLanguage.languageChanged'),
				[{ text: t('general.ok'), onPress: onClose }],
			);
		} catch (error) {
			Alert.alert(t('validation.error'), t('changeLanguage.couldNotChange'));
		} finally {
			setIsChangingLanguage(false);
		}
	};

	const handleLanguageSelect = (language: Language) => {
		setSelectedLanguage(language);
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
						<Text style={styles.title}>{t('profile.changeLanguage')}</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					{/* Content */}
					<View style={styles.content}>
						<View style={styles.languagesList}>
							{availableLanguages.map((language) => (
								<TouchableOpacity
									key={language.value}
									style={[
										styles.languageOption,
										selectedLanguage === language.value &&
											styles.languageOptionSelected,
									]}
									onPress={() => handleLanguageSelect(language.value)}
								>
									<Text
										style={[
											styles.languageText,
											selectedLanguage === language.value &&
												styles.languageTextSelected,
										]}
									>
										{language.label}
									</Text>
									{selectedLanguage === language.value && (
										<View style={styles.checkIcon}>
											<Ionicons
												name="checkmark"
												size={20}
												color={colors.quaternary}
											/>
										</View>
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						<TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
							<Text style={styles.cancelButtonText}>{t('general.cancel')}</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.saveButton,
								isChangingLanguage && styles.saveButtonDisabled,
							]}
							onPress={handleChangeLanguage}
							disabled={isChangingLanguage}
						>
							<Text
								style={[
									styles.saveButtonText,
									isChangingLanguage && styles.saveButtonTextDisabled,
								]}
							>
								{isChangingLanguage
									? t('validation.saving')
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
	},
	subtitle: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		marginBottom: 16,
		textAlign: 'center',
	},
	languagesList: {
		gap: 8,
	},
	languageOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: colors.secondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
	languageOptionSelected: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	languageText: {
		fontSize: 16,
		fontFamily: fonts.medium,
		color: colors.primary,
		flex: 1,
	},
	languageTextSelected: {
		color: colors.quaternary,
		fontWeight: '600',
	},
	checkIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
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
