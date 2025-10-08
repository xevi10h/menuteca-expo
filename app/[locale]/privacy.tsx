import { colors } from '@/assets/styles/colors';
import { WebLayout } from '@/components/web/WebLayout';
import { i18n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrivacyPage() {
	const { locale } = useLocalSearchParams<{ locale: string }>();
	const currentLocale = locale || 'en_US';

	i18n.locale = currentLocale;

	const lastUpdated = 'October 2025';

	return (
		<WebLayout locale={currentLocale}>
			<View style={styles.container}>
				{/* Hero Section */}
				<View style={styles.hero}>
					<Text style={styles.heroTitle}>{i18n.t('web.privacy.title')}</Text>
					<Text style={styles.lastUpdated}>
						{i18n.t('web.privacy.lastUpdated')}: {lastUpdated}
					</Text>
				</View>

				{/* Content */}
				<View style={styles.content}>
					{/* Introduction */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.intro.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.intro.text1')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.intro.text2')}</Text>
					</View>

					{/* Data We Collect */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.dataCollect.title')}</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.privacy.dataCollect.diners.title')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataCollect.diners.item1')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataCollect.diners.item2')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataCollect.diners.item3')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataCollect.diners.item4')}</Text>
							</View>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.privacy.dataCollect.restaurants.title')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.privacy.dataCollect.restaurants.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.privacy.dataCollect.restaurants.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.privacy.dataCollect.restaurants.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.privacy.dataCollect.restaurants.item4')}
								</Text>
							</View>
						</View>
					</View>

					{/* How We Use Data */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.dataUse.title')}</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataUse.item1')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataUse.item2')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataUse.item3')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataUse.item4')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.dataUse.item5')}</Text>
							</View>
						</View>
					</View>

					{/* AI Processing */}
					<View style={[styles.section, styles.highlightSection]}>
						<View style={styles.highlightHeader}>
							<Text style={styles.highlightIcon}>🤖</Text>
							<Text style={styles.sectionTitle}>{i18n.t('web.privacy.ai.title')}</Text>
						</View>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.ai.text1')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.ai.text2')}</Text>
					</View>

					{/* Data Sharing */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.sharing.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.sharing.text')}</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.sharing.item1')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.sharing.item2')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.sharing.item3')}</Text>
							</View>
						</View>
					</View>

					{/* GDPR Rights */}
					<View style={[styles.section, styles.highlightSection]}>
						<View style={styles.highlightHeader}>
							<Text style={styles.highlightIcon}>🛡️</Text>
							<Text style={styles.sectionTitle}>{i18n.t('web.privacy.gdpr.title')}</Text>
						</View>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.gdpr.intro')}</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right1')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right2')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right3')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right4')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right5')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.gdpr.right6')}</Text>
							</View>
						</View>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.gdpr.contact')}</Text>
					</View>

					{/* Cookies */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.cookies.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.cookies.text1')}</Text>
						<Text style={styles.subsectionTitle}>{i18n.t('web.privacy.cookies.types.title')}</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.cookies.types.essential')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.cookies.types.functional')}</Text>
							</View>
						</View>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.cookies.text2')}</Text>
					</View>

					{/* Data Retention */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.retention.title')}</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.retention.item1')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.retention.item2')}</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>{i18n.t('web.privacy.retention.item3')}</Text>
							</View>
						</View>
					</View>

					{/* Security */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.security.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.security.text')}</Text>
					</View>

					{/* Children */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.children.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.children.text')}</Text>
					</View>

					{/* Changes */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.changes.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.changes.text')}</Text>
					</View>

					{/* Contact */}
					<View style={styles.contactSection}>
						<Text style={styles.sectionTitle}>{i18n.t('web.privacy.contact.title')}</Text>
						<Text style={styles.paragraph}>{i18n.t('web.privacy.contact.text')}</Text>
						<View style={styles.contactBox}>
							<View style={styles.contactItem}>
								<Text style={styles.contactIcon}>📧</Text>
								<Text style={styles.contactText}>admin@menutecaapp.com</Text>
							</View>
							<View style={styles.contactItem}>
								<Text style={styles.contactIcon}>📱</Text>
								<Text style={styles.contactText}>
									{i18n.t('web.privacy.contact.phone')}: +34 606 404 251
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		</WebLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	// Hero Section
	hero: {
		alignItems: 'center',
		marginBottom: 64,
		paddingBottom: 32,
		borderBottomWidth: 2,
		borderBottomColor: 'rgba(0, 0, 0, 0.08)',
	},
	heroTitle: {
		fontSize: 56,
		fontWeight: '800',
		color: colors.primary,
		marginBottom: 12,
		textAlign: 'center',
		lineHeight: 64,
		letterSpacing: -1,
	},
	lastUpdated: {
		fontSize: 15,
		color: colors.tertiary,
		textAlign: 'center',
		opacity: 0.7,
		fontWeight: '500',
	},
	// Content
	content: {
		maxWidth: 900,
		marginHorizontal: 'auto',
		width: '100%',
	},
	// Sections
	section: {
		marginBottom: 48,
		padding: 32,
		backgroundColor: colors.quaternary,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.05)',
	},
	highlightSection: {
		backgroundColor: colors.primaryLighter,
		borderColor: colors.primary,
		borderWidth: 2,
	},
	highlightHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		marginBottom: 20,
	},
	highlightIcon: {
		fontSize: 32,
	},
	sectionTitle: {
		fontSize: 28,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 20,
		letterSpacing: -0.5,
	},
	subsectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: colors.primary,
		marginTop: 24,
		marginBottom: 16,
		letterSpacing: 0.3,
	},
	paragraph: {
		fontSize: 17,
		color: colors.tertiary,
		lineHeight: 28,
		marginBottom: 16,
		fontWeight: '400',
	},
	// Lists
	list: {
		gap: 14,
		marginBottom: 16,
	},
	listItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 14,
		paddingLeft: 8,
	},
	bullet: {
		width: 7,
		height: 7,
		borderRadius: 3.5,
		backgroundColor: colors.primary,
		marginTop: 10,
	},
	listText: {
		flex: 1,
		fontSize: 16,
		color: colors.tertiary,
		lineHeight: 26,
		fontWeight: '400',
	},
	// Contact Section
	contactSection: {
		marginBottom: 32,
		padding: 40,
		backgroundColor: colors.primary,
		borderRadius: 24,
	},
	contactBox: {
		backgroundColor: colors.quaternary,
		borderRadius: 16,
		padding: 28,
		marginTop: 24,
		gap: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
	},
	contactItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	contactIcon: {
		fontSize: 24,
		width: 40,
		textAlign: 'center',
	},
	contactText: {
		flex: 1,
		fontSize: 17,
		color: colors.primary,
		fontWeight: '600',
		lineHeight: 24,
	},
});
