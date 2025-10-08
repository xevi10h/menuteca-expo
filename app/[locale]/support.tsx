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
				{/* Hero Section */}
				<View style={styles.hero}>
					<View style={styles.heroContent}>
						<Text style={styles.heroTitle}>{i18n.t('web.support.title')}</Text>
						<Text style={styles.heroSubtitle}>{i18n.t('web.support.subtitle')}</Text>
					</View>
				</View>

				{/* Contact Cards Grid */}
				<View style={styles.cardsGrid}>
					{/* For Diners Card */}
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={styles.iconContainer}>
								<Text style={styles.icon}>🍽️</Text>
							</View>
							<Text style={styles.cardTitle}>{i18n.t('web.support.diners.title')}</Text>
						</View>

						<Text style={styles.cardDescription}>{i18n.t('web.support.diners.description')}</Text>

						<View style={styles.contactBox}>
							<View style={styles.contactRow}>
								<View style={styles.contactIconBox}>
									<Text style={styles.contactIcon}>📧</Text>
								</View>
								<View style={styles.contactInfo}>
									<Text style={styles.contactLabel}>{i18n.t('web.support.email')}</Text>
									<Pressable onPress={handleEmail}>
										<Text style={styles.contactValue}>admin@menutecaapp.com</Text>
									</Pressable>
								</View>
							</View>

							<View style={styles.divider} />

							<View style={styles.contactRow}>
								<View style={styles.contactIconBox}>
									<Text style={styles.contactIcon}>📱</Text>
								</View>
								<View style={styles.contactInfo}>
									<Text style={styles.contactLabel}>{i18n.t('web.support.phone')}</Text>
									<Pressable onPress={handlePhone}>
										<Text style={styles.contactValue}>+34 606 404 251</Text>
									</Pressable>
								</View>
							</View>
						</View>

						<View style={styles.helpSection}>
							<Text style={styles.helpTitle}>{i18n.t('web.support.diners.helpWith')}</Text>
							<View style={styles.helpList}>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.diners.help1')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.diners.help2')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.diners.help3')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.diners.help4')}</Text>
								</View>
							</View>
						</View>
					</View>

					{/* For Restaurants Card */}
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={[styles.iconContainer, styles.iconContainerSecondary]}>
								<Text style={styles.icon}>🏪</Text>
							</View>
							<Text style={styles.cardTitle}>{i18n.t('web.support.restaurants.title')}</Text>
						</View>

						<Text style={styles.cardDescription}>
							{i18n.t('web.support.restaurants.description')}
						</Text>

						<View style={styles.contactBox}>
							<View style={styles.contactRow}>
								<View style={styles.contactIconBox}>
									<Text style={styles.contactIcon}>📧</Text>
								</View>
								<View style={styles.contactInfo}>
									<Text style={styles.contactLabel}>{i18n.t('web.support.email')}</Text>
									<Pressable onPress={handleEmail}>
										<Text style={styles.contactValue}>admin@menutecaapp.com</Text>
									</Pressable>
								</View>
							</View>

							<View style={styles.divider} />

							<View style={styles.contactRow}>
								<View style={styles.contactIconBox}>
									<Text style={styles.contactIcon}>📱</Text>
								</View>
								<View style={styles.contactInfo}>
									<Text style={styles.contactLabel}>{i18n.t('web.support.phone')}</Text>
									<Pressable onPress={handlePhone}>
										<Text style={styles.contactValue}>+34 606 404 251</Text>
									</Pressable>
								</View>
							</View>
						</View>

						<View style={styles.helpSection}>
							<Text style={styles.helpTitle}>{i18n.t('web.support.restaurants.helpWith')}</Text>
							<View style={styles.helpList}>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.restaurants.help1')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.restaurants.help2')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.restaurants.help3')}</Text>
								</View>
								<View style={styles.helpItem}>
									<View style={styles.bullet} />
									<Text style={styles.helpText}>{i18n.t('web.support.restaurants.help4')}</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Response Time Banner */}
				<View style={styles.banner}>
					<View style={styles.bannerIcon}>
						<Text style={styles.bannerIconText}>⏱️</Text>
					</View>
					<Text style={styles.bannerText}>{i18n.t('web.support.responseTime')}</Text>
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
		marginBottom: 72,
	},
	heroContent: {
		alignItems: 'center',
		maxWidth: 800,
	},
	heroTitle: {
		fontSize: 56,
		fontWeight: '800',
		color: colors.primary,
		marginBottom: 20,
		textAlign: 'center',
		lineHeight: 64,
		letterSpacing: -1,
	},
	heroSubtitle: {
		fontSize: 20,
		color: colors.tertiary,
		textAlign: 'center',
		lineHeight: 32,
		fontWeight: '400',
		opacity: 0.8,
	},
	// Cards Grid
	cardsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 32,
		justifyContent: 'center',
		marginBottom: 64,
	},
	card: {
		backgroundColor: colors.quaternary,
		borderRadius: 24,
		padding: 48,
		width: 580,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.1,
		shadowRadius: 24,
		elevation: 6,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.05)',
	},
	cardHeader: {
		alignItems: 'center',
		marginBottom: 24,
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 20,
		backgroundColor: colors.primaryLighter,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	iconContainerSecondary: {
		backgroundColor: '#FFE5E5',
	},
	icon: {
		fontSize: 40,
	},
	cardTitle: {
		fontSize: 32,
		fontWeight: '700',
		color: colors.primary,
		textAlign: 'center',
		letterSpacing: -0.5,
	},
	cardDescription: {
		fontSize: 17,
		color: colors.tertiary,
		marginBottom: 32,
		lineHeight: 28,
		textAlign: 'center',
		fontWeight: '400',
	},
	// Contact Box
	contactBox: {
		backgroundColor: '#F5F5F5',
		borderRadius: 16,
		padding: 28,
		marginBottom: 32,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.06)',
	},
	contactRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	contactIconBox: {
		width: 52,
		height: 52,
		borderRadius: 12,
		backgroundColor: colors.quaternary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
	},
	contactIcon: {
		fontSize: 24,
	},
	contactInfo: {
		flex: 1,
		gap: 4,
	},
	contactLabel: {
		fontSize: 13,
		color: colors.primary,
		fontWeight: '600',
		opacity: 0.6,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	contactValue: {
		fontSize: 18,
		color: colors.primary,
		fontWeight: '600',
		textDecorationLine: 'underline',
	},
	divider: {
		height: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.08)',
		marginVertical: 20,
	},
	// Help Section
	helpSection: {
		gap: 16,
	},
	helpTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 8,
		letterSpacing: 0.3,
	},
	helpList: {
		gap: 12,
	},
	helpItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
	},
	bullet: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: colors.primary,
		marginTop: 8,
	},
	helpText: {
		flex: 1,
		fontSize: 16,
		color: colors.tertiary,
		lineHeight: 26,
		fontWeight: '400',
	},
	// Response Time Banner
	banner: {
		backgroundColor: colors.primaryLighter,
		borderRadius: 20,
		padding: 32,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 20,
		borderWidth: 2,
		borderColor: colors.primary,
		borderStyle: 'dashed',
	},
	bannerIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.quaternary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerIconText: {
		fontSize: 28,
	},
	bannerText: {
		flex: 1,
		fontSize: 17,
		color: colors.primary,
		lineHeight: 26,
		fontWeight: '600',
	},
});
