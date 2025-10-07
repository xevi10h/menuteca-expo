import { colors } from '@/assets/styles/colors';
import { WebLayout } from '@/components/web/WebLayout';
import { i18n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Linking, Pressable } from 'react-native';

export default function SupportPage() {
	const { locale } = useLocalSearchParams<{ locale: string }>();
	const currentLocale = locale || 'en_US';

	i18n.locale = currentLocale;

	const handleEmail = () => {
		Linking.openURL('mailto:admin@menutecaapp.com');
	};

	const handlePhone = () => {
		Linking.openURL('tel:+34606404251');
	};

	return (
		<WebLayout locale={currentLocale}>
			<View style={styles.container}>
				<Text style={styles.title}>{i18n.t('web.support.title')}</Text>
				<Text style={styles.subtitle}>{i18n.t('web.support.subtitle')}</Text>

				{/* For Diners */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.support.diners.title')}</Text>
					<Text style={styles.sectionText}>{i18n.t('web.support.diners.description')}</Text>

					<View style={styles.contactBox}>
						<View style={styles.contactItem}>
							<Text style={styles.contactLabel}>{i18n.t('web.support.email')}</Text>
							<Pressable onPress={handleEmail}>
								<Text style={styles.contactValue}>admin@menutecaapp.com</Text>
							</Pressable>
						</View>
						<View style={styles.contactItem}>
							<Text style={styles.contactLabel}>{i18n.t('web.support.phone')}</Text>
							<Pressable onPress={handlePhone}>
								<Text style={styles.contactValue}>+34 606 404 251</Text>
							</Pressable>
						</View>
					</View>

					<View style={styles.helpList}>
						<Text style={styles.helpTitle}>{i18n.t('web.support.diners.helpWith')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.diners.help1')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.diners.help2')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.diners.help3')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.diners.help4')}</Text>
					</View>
				</View>

				{/* For Restaurants */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.support.restaurants.title')}</Text>
					<Text style={styles.sectionText}>
						{i18n.t('web.support.restaurants.description')}
					</Text>

					<View style={styles.contactBox}>
						<View style={styles.contactItem}>
							<Text style={styles.contactLabel}>{i18n.t('web.support.email')}</Text>
							<Pressable onPress={handleEmail}>
								<Text style={styles.contactValue}>admin@menutecaapp.com</Text>
							</Pressable>
						</View>
						<View style={styles.contactItem}>
							<Text style={styles.contactLabel}>{i18n.t('web.support.phone')}</Text>
							<Pressable onPress={handlePhone}>
								<Text style={styles.contactValue}>+34 606 404 251</Text>
							</Pressable>
						</View>
					</View>

					<View style={styles.helpList}>
						<Text style={styles.helpTitle}>{i18n.t('web.support.restaurants.helpWith')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.restaurants.help1')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.restaurants.help2')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.restaurants.help3')}</Text>
						<Text style={styles.helpItem}>• {i18n.t('web.support.restaurants.help4')}</Text>
					</View>
				</View>

				{/* Response Time */}
				<View style={styles.infoBox}>
					<Text style={styles.infoText}>{i18n.t('web.support.responseTime')}</Text>
				</View>
			</View>
		</WebLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		fontSize: 48,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 16,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 18,
		color: colors.tertiary,
		marginBottom: 48,
		textAlign: 'center',
		opacity: 0.8,
	},
	section: {
		marginBottom: 48,
		padding: 32,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 32,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 16,
	},
	sectionText: {
		fontSize: 16,
		color: colors.tertiary,
		marginBottom: 24,
		lineHeight: 24,
	},
	contactBox: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		padding: 24,
		marginBottom: 24,
		gap: 16,
	},
	contactItem: {
		gap: 4,
	},
	contactLabel: {
		fontSize: 14,
		color: colors.primary,
		fontWeight: '600',
		opacity: 0.7,
	},
	contactValue: {
		fontSize: 18,
		color: colors.primary,
		fontWeight: '600',
		textDecorationLine: 'underline',
	},
	helpList: {
		gap: 8,
	},
	helpTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.primary,
		marginBottom: 8,
	},
	helpItem: {
		fontSize: 15,
		color: colors.tertiary,
		lineHeight: 24,
	},
	infoBox: {
		backgroundColor: colors.primaryLighter,
		borderRadius: 8,
		padding: 24,
		marginTop: 32,
	},
	infoText: {
		fontSize: 15,
		color: colors.primary,
		textAlign: 'center',
		lineHeight: 22,
	},
});
