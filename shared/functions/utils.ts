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
