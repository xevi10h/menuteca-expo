import { colors } from '@/assets/styles/colors';
import { i18n } from '@/i18n';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

interface WebLayoutProps {
	children: React.ReactNode;
	locale: string;
}

export function WebLayout({ children, locale }: WebLayoutProps) {
	i18n.locale = locale;

	const currentYear = new Date().getFullYear();

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Link href={`/${locale}/product`} style={styles.logoLink}>
						<Image
							source={require('@/assets/images/logo_large_primary.png')}
							style={styles.logo}
							contentFit="contain"
						/>
					</Link>
					<View style={styles.nav}>
						<Link href={`/${locale}/product`} style={styles.navLink}>
							<Text style={styles.navText}>{i18n.t('web.nav.product')}</Text>
						</Link>
						<Link href={`/${locale}/support`} style={styles.navLink}>
							<Text style={styles.navText}>{i18n.t('web.nav.support')}</Text>
						</Link>
						<Link href={`/${locale}/privacy`} style={styles.navLink}>
							<Text style={styles.navText}>{i18n.t('web.nav.privacy')}</Text>
						</Link>
					</View>
					<View style={styles.languageSelector}>
						<Link href={`/ca_ES/${getCurrentPage(locale)}`}>
							<Text style={[styles.langText, locale === 'ca_ES' && styles.langTextActive]}>
								CA
							</Text>
						</Link>
						<Text style={styles.langSeparator}>|</Text>
						<Link href={`/es_ES/${getCurrentPage(locale)}`}>
							<Text style={[styles.langText, locale === 'es_ES' && styles.langTextActive]}>
								ES
							</Text>
						</Link>
						<Text style={styles.langSeparator}>|</Text>
						<Link href={`/en_US/${getCurrentPage(locale)}`}>
							<Text style={[styles.langText, locale === 'en_US' && styles.langTextActive]}>
								EN
							</Text>
						</Link>
						<Text style={styles.langSeparator}>|</Text>
						<Link href={`/fr_FR/${getCurrentPage(locale)}`}>
							<Text style={[styles.langText, locale === 'fr_FR' && styles.langTextActive]}>
								FR
							</Text>
						</Link>
					</View>
				</View>
			</View>

			{/* Main Content */}
			<ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
				{children}
			</ScrollView>

			{/* Footer */}
			<View style={styles.footer}>
				<View style={styles.footerContent}>
					<Text style={styles.footerText}>
						© {currentYear} Menuteca. {i18n.t('web.footer.rights')}
					</Text>
					<View style={styles.footerLinks}>
						<Link href={`/${locale}/privacy`}>
							<Text style={styles.footerLink}>{i18n.t('web.nav.privacy')}</Text>
						</Link>
						<Text style={styles.footerSeparator}>·</Text>
						<Link href={`/${locale}/support`}>
							<Text style={styles.footerLink}>{i18n.t('web.nav.support')}</Text>
						</Link>
						<Text style={styles.footerSeparator}>·</Text>
						<Text style={styles.footerLink}>admin@menutecaapp.com</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

function getCurrentPage(locale: string): string {
	if (typeof window === 'undefined') return 'product';
	const path = window.location.pathname;
	const page = path.split('/').pop() || 'product';
	return page;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		backgroundColor: colors.quaternary,
		borderBottomWidth: 1,
		borderBottomColor: colors.secondaryDark,
		paddingVertical: 16,
	},
	headerContent: {
		maxWidth: 1200,
		marginHorizontal: 'auto',
		paddingHorizontal: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	logoLink: {
		textDecorationLine: 'none',
	},
	logo: {
		width: 120,
		height: 40,
	},
	nav: {
		flexDirection: 'row',
		gap: 32,
		alignItems: 'center',
	},
	navLink: {
		textDecorationLine: 'none',
	},
	navText: {
		color: colors.primary,
		fontSize: 16,
		fontWeight: '500',
	},
	languageSelector: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	langText: {
		color: colors.primary,
		fontSize: 14,
		fontWeight: '500',
		opacity: 0.6,
	},
	langTextActive: {
		opacity: 1,
		fontWeight: '700',
	},
	langSeparator: {
		color: colors.primary,
		opacity: 0.3,
	},
	main: {
		flex: 1,
	},
	mainContent: {
		maxWidth: 1200,
		marginHorizontal: 'auto',
		paddingHorizontal: 24,
		paddingVertical: 48,
		width: '100%',
	},
	footer: {
		backgroundColor: colors.primary,
		paddingVertical: 32,
		borderTopWidth: 1,
		borderTopColor: colors.primaryLight,
	},
	footerContent: {
		maxWidth: 1200,
		marginHorizontal: 'auto',
		paddingHorizontal: 24,
		width: '100%',
		alignItems: 'center',
		gap: 16,
	},
	footerText: {
		color: colors.secondary,
		fontSize: 14,
		textAlign: 'center',
	},
	footerLinks: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	footerLink: {
		color: colors.secondary,
		fontSize: 14,
		opacity: 0.8,
	},
	footerSeparator: {
		color: colors.secondary,
		opacity: 0.5,
	},
});
