import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface ContactInfoSectionProps {
	phone: string;
	reservation_link: string;
	onPhoneChange: (phone: string) => void;
	onReservationLinkChange: (link: string) => void;
	showTitle?: boolean;
}

export default function ContactInfoSection({
	phone,
	reservation_link,
	onPhoneChange,
	onReservationLinkChange,
	showTitle = false,
}: ContactInfoSectionProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			{showTitle && (
				<Text style={styles.sectionTitle}>
					{t('registerRestaurant.contactInfo')}
				</Text>
			)}

			{/* Phone Section */}
			<View style={styles.inputContainer}>
				<View style={styles.labelContainer}>
					<Ionicons name="call-outline" size={16} color={colors.primary} />
					<Text style={styles.label}>{t('registerRestaurant.phone')}</Text>
				</View>
				<Text style={styles.subtitle}>
					{t('registerRestaurant.phoneSubtitle')}
				</Text>
				<TextInput
					style={styles.input}
					placeholder={t('registerRestaurant.phonePlaceholder')}
					placeholderTextColor={colors.primaryLight}
					value={phone}
					onChangeText={onPhoneChange}
					keyboardType="phone-pad"
				/>
			</View>

			{/* Reservation Link Section */}
			<View>
				<View style={styles.labelContainer}>
					<Ionicons name="calendar-outline" size={16} color={colors.primary} />
					<Text style={styles.label}>
						{t('registerRestaurant.reservation_link')}
					</Text>
				</View>
				<Text style={styles.subtitle}>
					{t('registerRestaurant.reservationLinkSubtitle')}
				</Text>
				<TextInput
					style={styles.input}
					placeholder={t('registerRestaurant.reservationLinkPlaceholder')}
					placeholderTextColor={colors.primaryLight}
					value={reservation_link}
					onChangeText={onReservationLinkChange}
					keyboardType="url"
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 0,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.primary,
	},
	inputContainer: {
		marginBottom: 20,
	},
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 5,
	},
	label: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
	subtitle: {
		fontSize: 12,
		fontFamily: fonts.regular,
		color: colors.primaryLight,
		marginBottom: 8,
	},
	input: {
		backgroundColor: colors.quaternary,
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 12,
		fontSize: 16,
		fontFamily: fonts.regular,
		color: colors.primary,
		borderWidth: 1,
		borderColor: colors.primaryLight,
	},
});
