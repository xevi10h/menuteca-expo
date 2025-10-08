import { colors } from '@/assets/styles/colors';
import { WebLayout } from '@/components/web/WebLayout';
import { i18n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TermsPage() {
	const { locale } = useLocalSearchParams<{ locale: string }>();
	const currentLocale = locale || 'en_US';

	i18n.locale = currentLocale;

	const lastUpdated = 'October 2025';

	return (
		<WebLayout locale={currentLocale}>
			<View style={styles.container}>
				{/* Hero Section */}
				<View style={styles.hero}>
					<Text style={styles.heroTitle}>{i18n.t('web.terms.title')}</Text>
					<Text style={styles.lastUpdated}>
						{i18n.t('web.terms.lastUpdated')}: {lastUpdated}
					</Text>
				</View>

				{/* Content */}
				<View style={styles.content}>
					{/* Introduction */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.intro.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.intro.text1')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.intro.text2')}
						</Text>
					</View>

					{/* Acceptance */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.acceptance.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.acceptance.text')}
						</Text>
					</View>

					{/* User Accounts */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.userAccounts.title')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.userAccounts.subtitle1')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.item4')}
								</Text>
							</View>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.userAccounts.subtitle2')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.diner')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userAccounts.restaurant')}
								</Text>
							</View>
						</View>
					</View>

					{/* User Conduct */}
					<View style={[styles.section, styles.highlightSection]}>
						<View style={styles.highlightHeader}>
							<Text style={styles.highlightIcon}>⚖️</Text>
							<Text style={styles.sectionTitle}>
								{i18n.t('web.terms.userConduct.title')}
							</Text>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.userConduct.subtitle1')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.item4')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.item5')}
								</Text>
							</View>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.userConduct.subtitle2')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.diner1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.diner2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.diner3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.diner4')}
								</Text>
							</View>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.userConduct.subtitle3')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.restaurant1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.restaurant2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.restaurant3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.userConduct.restaurant4')}
								</Text>
							</View>
						</View>
					</View>

					{/* Intellectual Property */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.intellectualProperty.title')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.intellectualProperty.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.intellectualProperty.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.intellectualProperty.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.intellectualProperty.item4')}
								</Text>
							</View>
						</View>
					</View>

					{/* Reviews */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.reviews.title')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.reviews.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.reviews.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.reviews.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.reviews.item4')}
								</Text>
							</View>
						</View>
					</View>

					{/* Restaurant Services */}
					<View style={[styles.section, styles.highlightSection]}>
						<View style={styles.highlightHeader}>
							<Text style={styles.highlightIcon}>🏪</Text>
							<Text style={styles.sectionTitle}>
								{i18n.t('web.terms.restaurantServices.title')}
							</Text>
						</View>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.restaurantServices.free.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.restaurantServices.free.text')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.restaurantServices.ai.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.restaurantServices.ai.text')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.restaurantServices.noCommissions.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.restaurantServices.noCommissions.text')}
						</Text>
					</View>

					{/* Disclaimers */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.disclaimers.title')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.disclaimers.accuracy.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.disclaimers.accuracy.text')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.disclaimers.service.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.disclaimers.service.text')}
						</Text>

						<Text style={styles.subsectionTitle}>
							{i18n.t('web.terms.disclaimers.liability.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.disclaimers.liability.text')}
						</Text>
					</View>

					{/* Termination */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.termination.title')}
						</Text>
						<View style={styles.list}>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.termination.item1')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.termination.item2')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.termination.item3')}
								</Text>
							</View>
							<View style={styles.listItem}>
								<View style={styles.bullet} />
								<Text style={styles.listText}>
									{i18n.t('web.terms.termination.item4')}
								</Text>
							</View>
						</View>
					</View>

					{/* Modifications */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.modifications.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.modifications.text')}
						</Text>
					</View>

					{/* Governing Law */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.governingLaw.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.governingLaw.text')}
						</Text>
					</View>

					{/* Contact */}
					<View style={styles.contactSection}>
						<Text style={styles.sectionTitle}>
							{i18n.t('web.terms.contact.title')}
						</Text>
						<Text style={styles.paragraph}>
							{i18n.t('web.terms.contact.text')}
						</Text>
						<View style={styles.contactBox}>
							<View style={styles.contactItem}>
								<Text style={styles.contactIcon}>📧</Text>
								<Text style={styles.contactText}>admin@menutecaapp.com</Text>
							</View>
							<View style={styles.contactItem}>
								<Text style={styles.contactIcon}>📱</Text>
								<Text style={styles.contactText}>
									{i18n.t('web.terms.contact.phone')}: +34 606 404 251
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
		backgroundColor: colors.primaryLighter,
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
