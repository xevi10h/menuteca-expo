import { colors } from '@/assets/styles/colors';
import { WebLayout } from '@/components/web/WebLayout';
import { i18n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProductPage() {
	const { locale } = useLocalSearchParams<{ locale: string }>();
	const currentLocale = locale || 'en_US';

	i18n.locale = currentLocale;

	const handleDownload = () => {
		// You can update this with actual app store links when available
		alert(i18n.t('web.product.comingSoon'));
	};

	return (
		<WebLayout locale={currentLocale}>
			<View style={styles.container}>
				{/* Hero Section */}
				<View style={styles.hero}>
					<Text style={styles.heroTitle}>
						{i18n.t('web.product.hero.title')}
					</Text>
					<Text style={styles.heroSubtitle}>
						{i18n.t('web.product.hero.subtitle')}
					</Text>
					<Pressable style={styles.ctaButton} onPress={handleDownload}>
						<Text style={styles.ctaButtonText}>
							{i18n.t('web.product.hero.cta')}
						</Text>
					</Pressable>
				</View>

				{/* Features Section */}
				<View style={styles.featuresSection}>
					<Text style={styles.sectionTitle}>
						{i18n.t('web.product.features.title')}
					</Text>

					<View style={styles.featuresGrid}>
						{/* Feature 1 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>🔍</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature1.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature1.text')}
							</Text>
						</View>

						{/* Feature 2 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>📍</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature2.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature2.text')}
							</Text>
						</View>

						{/* Feature 3 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>💰</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature3.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature3.text')}
							</Text>
						</View>

						{/* Feature 4 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>⏱️</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature4.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature4.text')}
							</Text>
						</View>

						{/* Feature 5 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>🤖</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature5.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature5.text')}
							</Text>
						</View>

						{/* Feature 6 */}
						<View style={styles.featureCard}>
							<Text style={styles.featureIcon}>⭐</Text>
							<Text style={styles.featureTitle}>
								{i18n.t('web.product.features.feature6.title')}
							</Text>
							<Text style={styles.featureText}>
								{i18n.t('web.product.features.feature6.text')}
							</Text>
						</View>
					</View>
				</View>

				{/* For Restaurants Section */}
				<View style={styles.restaurantsSection}>
					<Text style={styles.sectionTitle}>
						{i18n.t('web.product.restaurants.title')}
					</Text>
					<Text style={styles.sectionSubtitle}>
						{i18n.t('web.product.restaurants.subtitle')}
					</Text>

					<View style={styles.benefitsGrid}>
						<View style={styles.benefitCard}>
							<Text style={styles.benefitIcon}>✨</Text>
							<Text style={styles.benefitTitle}>
								{i18n.t('web.product.restaurants.benefit1.title')}
							</Text>
							<Text style={styles.benefitText}>
								{i18n.t('web.product.restaurants.benefit1.text')}
							</Text>
						</View>

						<View style={styles.benefitCard}>
							<Text style={styles.benefitIcon}>📸</Text>
							<Text style={styles.benefitTitle}>
								{i18n.t('web.product.restaurants.benefit2.title')}
							</Text>
							<Text style={styles.benefitText}>
								{i18n.t('web.product.restaurants.benefit2.text')}
							</Text>
						</View>

						<View style={styles.benefitCard}>
							<Text style={styles.benefitIcon}>🎯</Text>
							<Text style={styles.benefitTitle}>
								{i18n.t('web.product.restaurants.benefit3.title')}
							</Text>
							<Text style={styles.benefitText}>
								{i18n.t('web.product.restaurants.benefit3.text')}
							</Text>
						</View>
					</View>
				</View>

				{/* Testimonials Section */}
				<View style={styles.testimonialsSection}>
					<Text style={styles.sectionTitle}>
						{i18n.t('web.product.testimonials.title')}
					</Text>

					<View style={styles.testimonialsGrid}>
						{/* Testimonial 1 */}
						<View style={styles.testimonialCard}>
							<Text style={styles.testimonialText}>
								"{i18n.t('web.product.testimonials.testimonial1.text')}"
							</Text>
							<Text style={styles.testimonialAuthor}>
								{i18n.t('web.product.testimonials.testimonial1.author')}
							</Text>
							<Text style={styles.testimonialRole}>
								{i18n.t('web.product.testimonials.testimonial1.role')}
							</Text>
						</View>

						{/* Testimonial 2 */}
						<View style={styles.testimonialCard}>
							<Text style={styles.testimonialText}>
								"{i18n.t('web.product.testimonials.testimonial2.text')}"
							</Text>
							<Text style={styles.testimonialAuthor}>
								{i18n.t('web.product.testimonials.testimonial2.author')}
							</Text>
							<Text style={styles.testimonialRole}>
								{i18n.t('web.product.testimonials.testimonial2.role')}
							</Text>
						</View>

						{/* Testimonial 3 */}
						<View style={styles.testimonialCard}>
							<Text style={styles.testimonialText}>
								"{i18n.t('web.product.testimonials.testimonial3.text')}"
							</Text>
							<Text style={styles.testimonialAuthor}>
								{i18n.t('web.product.testimonials.testimonial3.author')}
							</Text>
							<Text style={styles.testimonialRole}>
								{i18n.t('web.product.testimonials.testimonial3.role')}
							</Text>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View style={styles.ctaSection}>
					<Text style={styles.ctaTitle}>{i18n.t('web.product.cta.title')}</Text>
					<Text style={styles.ctaText}>{i18n.t('web.product.cta.text')}</Text>
					<Pressable style={styles.ctaButton} onPress={handleDownload}>
						<Text style={styles.ctaButtonText}>
							{i18n.t('web.product.cta.button')}
						</Text>
					</Pressable>
				</View>
			</View>
		</WebLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	hero: {
		alignItems: 'center',
		paddingVertical: 64,
		marginBottom: 64,
	},
	heroTitle: {
		fontSize: 56,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 24,
		textAlign: 'center',
		lineHeight: 64,
	},
	heroSubtitle: {
		fontSize: 20,
		color: colors.tertiary,
		marginBottom: 32,
		textAlign: 'center',
		maxWidth: 600,
		lineHeight: 30,
	},
	ctaButton: {
		backgroundColor: colors.primary,
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	ctaButtonText: {
		color: colors.secondary,
		fontSize: 18,
		fontWeight: '700',
	},
	featuresSection: {
		marginBottom: 64,
	},
	sectionTitle: {
		fontSize: 40,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 16,
		textAlign: 'center',
	},
	sectionSubtitle: {
		fontSize: 18,
		color: colors.tertiary,
		marginBottom: 48,
		textAlign: 'center',
		maxWidth: 700,
		marginHorizontal: 'auto',
		lineHeight: 26,
	},
	featuresGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 24,
		justifyContent: 'center',
	},
	featureCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 32,
		width: 350,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	featureIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	featureTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 12,
	},
	featureText: {
		fontSize: 15,
		color: colors.tertiary,
		lineHeight: 22,
	},
	restaurantsSection: {
		backgroundColor: colors.primaryLighter,
		borderRadius: 16,
		padding: 48,
		marginBottom: 64,
	},
	benefitsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 24,
		justifyContent: 'center',
	},
	benefitCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 32,
		width: 350,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	benefitIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	benefitTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 12,
	},
	benefitText: {
		fontSize: 15,
		color: colors.tertiary,
		lineHeight: 22,
	},
	testimonialsSection: {
		marginBottom: 64,
	},
	testimonialsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 24,
		justifyContent: 'center',
	},
	testimonialCard: {
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		padding: 32,
		width: 350,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
	},
	testimonialText: {
		fontSize: 16,
		color: colors.tertiary,
		lineHeight: 24,
		marginBottom: 16,
		fontStyle: 'italic',
	},
	testimonialAuthor: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.primary,
		marginBottom: 4,
	},
	testimonialRole: {
		fontSize: 14,
		color: colors.tertiary,
		opacity: 0.7,
	},
	ctaSection: {
		backgroundColor: colors.primary,
		borderRadius: 16,
		padding: 64,
		alignItems: 'center',
		marginBottom: 32,
	},
	ctaTitle: {
		fontSize: 36,
		fontWeight: '700',
		color: colors.secondary,
		marginBottom: 16,
		textAlign: 'center',
	},
	ctaText: {
		fontSize: 18,
		color: colors.secondary,
		marginBottom: 32,
		textAlign: 'center',
		maxWidth: 600,
		lineHeight: 26,
	},
});
