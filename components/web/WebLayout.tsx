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
		<ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
			<View style={styles.main}>
				<View style={styles.mainContent}>
					{children}
				</View>
			</View>

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
		</ScrollView>
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
		backgroundColor: '#FAFAFA',
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		backgroundColor: colors.quaternary,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.06)',
		paddingVertical: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 3,
	},
	headerContent: {
		maxWidth: 1280,
		marginHorizontal: 'auto',
		paddingHorizontal: 40,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	logoLink: {
		textDecorationLine: 'none',
	},
	logo: {
		width: 140,
		height: 45,
	},
	nav: {
		flexDirection: 'row',
		gap: 40,
		alignItems: 'center',
	},
	navLink: {
		textDecorationLine: 'none',
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	navText: {
		color: colors.primary,
		fontSize: 16,
		fontWeight: '600',
		letterSpacing: 0.3,
	},
	languageSelector: {
		flexDirection: 'row',
		gap: 10,
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.03)',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
	},
	langText: {
		color: colors.primary,
		fontSize: 14,
		fontWeight: '600',
		opacity: 0.5,
		letterSpacing: 0.5,
	},
	langTextActive: {
		opacity: 1,
		fontWeight: '700',
	},
	langSeparator: {
		color: colors.primary,
		opacity: 0.2,
		fontSize: 12,
	},
	main: {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},
	mainContent: {
		maxWidth: 1280,
		marginHorizontal: 'auto',
		paddingHorizontal: 40,
		paddingVertical: 64,
		width: '100%',
	},
	footer: {
		backgroundColor: colors.primary,
		paddingVertical: 48,
	},
	footerContent: {
		maxWidth: 1280,
		marginHorizontal: 'auto',
		paddingHorizontal: 40,
		width: '100%',
		alignItems: 'center',
		gap: 20,
	},
	footerText: {
		color: colors.secondary,
		fontSize: 15,
		textAlign: 'center',
		fontWeight: '500',
		opacity: 0.9,
	},
	footerLinks: {
		flexDirection: 'row',
		gap: 12,
		alignItems: 'center',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	footerLink: {
		color: colors.secondary,
		fontSize: 14,
		opacity: 0.85,
		fontWeight: '500',
	},
	footerSeparator: {
		color: colors.secondary,
		opacity: 0.4,
		fontSize: 16,
	},
});
