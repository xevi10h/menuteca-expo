import { colors } from '@/assets/styles/colors';
import { WebLayout } from '@/components/web/WebLayout';
import { i18n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyPage() {
	const { locale } = useLocalSearchParams<{ locale: string }>();
	const currentLocale = locale || 'en_US';

	i18n.locale = currentLocale;

	const lastUpdated = 'October 2025';

	return (
		<WebLayout locale={currentLocale}>
			<View style={styles.container}>
				<Text style={styles.title}>{i18n.t('web.privacy.title')}</Text>
				<Text style={styles.lastUpdated}>
					{i18n.t('web.privacy.lastUpdated')}: {lastUpdated}
				</Text>

				{/* Introduction */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.intro.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.intro.text1')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.intro.text2')}</Text>
				</View>

				{/* Data We Collect */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.dataCollect.title')}</Text>

					<Text style={styles.subsectionTitle}>
						{i18n.t('web.privacy.dataCollect.diners.title')}
					</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataCollect.diners.item1')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataCollect.diners.item2')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataCollect.diners.item3')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataCollect.diners.item4')}</Text>

					<Text style={styles.subsectionTitle}>
						{i18n.t('web.privacy.dataCollect.restaurants.title')}
					</Text>
					<Text style={styles.listItem}>
						• {i18n.t('web.privacy.dataCollect.restaurants.item1')}
					</Text>
					<Text style={styles.listItem}>
						• {i18n.t('web.privacy.dataCollect.restaurants.item2')}
					</Text>
					<Text style={styles.listItem}>
						• {i18n.t('web.privacy.dataCollect.restaurants.item3')}
					</Text>
					<Text style={styles.listItem}>
						• {i18n.t('web.privacy.dataCollect.restaurants.item4')}
					</Text>
				</View>

				{/* How We Use Data */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.dataUse.title')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataUse.item1')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataUse.item2')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataUse.item3')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataUse.item4')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.dataUse.item5')}</Text>
				</View>

				{/* AI Processing */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.ai.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.ai.text1')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.ai.text2')}</Text>
				</View>

				{/* Data Sharing */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.sharing.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.sharing.text')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.sharing.item1')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.sharing.item2')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.sharing.item3')}</Text>
				</View>

				{/* GDPR Rights */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.gdpr.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.gdpr.intro')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right1')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right2')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right3')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right4')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right5')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.gdpr.right6')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.gdpr.contact')}</Text>
				</View>

				{/* Cookies */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.cookies.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.cookies.text1')}</Text>
					<Text style={styles.subsectionTitle}>{i18n.t('web.privacy.cookies.types.title')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.cookies.types.essential')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.cookies.types.functional')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.cookies.text2')}</Text>
				</View>

				{/* Data Retention */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.retention.title')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.retention.item1')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.retention.item2')}</Text>
					<Text style={styles.listItem}>• {i18n.t('web.privacy.retention.item3')}</Text>
				</View>

				{/* Security */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.security.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.security.text')}</Text>
				</View>

				{/* Children */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.children.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.children.text')}</Text>
				</View>

				{/* Changes */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.changes.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.changes.text')}</Text>
				</View>

				{/* Contact */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{i18n.t('web.privacy.contact.title')}</Text>
					<Text style={styles.text}>{i18n.t('web.privacy.contact.text')}</Text>
					<View style={styles.contactBox}>
						<Text style={styles.contactText}>Email: admin@menutecaapp.com</Text>
						<Text style={styles.contactText}>{i18n.t('web.privacy.contact.phone')}: +34 606 404 251</Text>
					</View>
				</View>
			</View>
		</WebLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		maxWidth: 900,
		marginHorizontal: 'auto',
	},
	title: {
		fontSize: 48,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
		textAlign: 'center',
	},
	lastUpdated: {
		fontSize: 14,
		color: colors.tertiary,
		marginBottom: 48,
		textAlign: 'center',
		opacity: 0.7,
	},
	section: {
		marginBottom: 32,
		padding: 24,
		backgroundColor: colors.quaternary,
		borderRadius: 8,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 16,
	},
	subsectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.primary,
		marginTop: 16,
		marginBottom: 12,
	},
	text: {
		fontSize: 15,
		color: colors.tertiary,
		lineHeight: 24,
		marginBottom: 12,
	},
	listItem: {
		fontSize: 15,
		color: colors.tertiary,
		lineHeight: 24,
		marginBottom: 8,
		paddingLeft: 8,
	},
	contactBox: {
		backgroundColor: colors.secondary,
		borderRadius: 8,
		padding: 16,
		marginTop: 16,
		gap: 8,
	},
	contactText: {
		fontSize: 15,
		color: colors.primary,
		fontWeight: '600',
	},
});
