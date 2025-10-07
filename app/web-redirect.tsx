import { Redirect } from 'expo-router';
import { getLocales } from 'expo-localization';

export default function WebRedirect() {
	// Get the user's device language
	const deviceLanguage = getLocales()[0]?.languageCode || 'en';

	// Map to our supported locales
	let locale = 'en_US';
	if (deviceLanguage === 'es') locale = 'es_ES';
	else if (deviceLanguage === 'ca') locale = 'ca_ES';
	else if (deviceLanguage === 'fr') locale = 'fr_FR';

	// Redirect to the product page in the user's language
	return <Redirect href={`/${locale}/product`} />;
}
