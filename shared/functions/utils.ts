import * as Localization from 'expo-localization';
import { Language } from '../types';

export function deviceLanguageToLanguage(deviceLanguage: string): Language {
	switch (deviceLanguage) {
		case 'es':
			return 'es_ES';
		case 'ca':
			return 'ca_ES';
		case 'fr':
			return 'fr_FR';
		case 'en':
			return 'en_US';
		default:
			return 'fr_FR';
	}
}

export const getDeviceLanguage = (): Language => {
	const deviceLocale = Localization.getLocales()[0]?.languageCode;
	if (!deviceLocale) {
		return 'es_ES';
	}
	const lan = deviceLanguageToLanguage(deviceLocale);
	return lan;
};

export function secondsToMinutes(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const paddedMinutes = String(minutes);
	const paddedSeconds = String(remainingSeconds.toFixed(0)).padStart(2, '0');
	return `${paddedMinutes}.${paddedSeconds}`;
}

/**
 * Get localized text from a translations object
 */
export function getLocalizedText(
	translations: { [key: string]: string },
	language: Language,
	fallbackLanguage: Language = 'es_ES',
): string {
	if (translations[language]) {
		return translations[language];
	}

	if (translations[fallbackLanguage]) {
		return translations[fallbackLanguage];
	}

	// Return first available translation as last resort
	const firstKey = Object.keys(translations)[0];
	return translations[firstKey] || '';
}

export function formatMenuTime(time: string): string {
	const [hours, minutes] = time.split(':').map(Number);
	const date = new Date();
	date.setHours(hours, minutes);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate a deep link URL for a restaurant
 * @param restaurantId - The restaurant ID
 * @param domain - The domain for the deep link (default: menutecaapp.com)
 * @returns Deep link URL for the restaurant
 */
export function generateRestaurantDeepLink(
	restaurantId: string,
	domain: string = 'menutecaapp.com',
): string {
	return `https://${domain}/restaurant/${restaurantId}`;
}

/**
 * Generate a shareable message for a restaurant
 * @param restaurantName - The name of the restaurant
 * @param deepLink - The deep link URL
 * @param language - The language for the message (default: 'es_ES')
 * @returns Formatted share message
 */
export function generateRestaurantShareMessage(
	restaurantName: string,
	deepLink: string,
	language: Language = 'es_ES',
): string {
	const messages: { [key in Language]: string } = {
		es_ES: `¡Mira este restaurante en Menuteca! ${restaurantName}\n\n${deepLink}`,
		ca_ES: `Mira aquest restaurant a Menuteca! ${restaurantName}\n\n${deepLink}`,
		fr_FR: `Découvrez ce restaurant sur Menuteca ! ${restaurantName}\n\n${deepLink}`,
		en_US: `Check out this restaurant on Menuteca! ${restaurantName}\n\n${deepLink}`,
	};

	return messages[language] || messages.es_ES;
}
