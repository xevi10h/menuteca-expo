import ca_ES from '@/locales/ca_ES.json';
import en_US from '@/locales/en_US.json';
import es_ES from '@/locales/es_ES.json';
import fr_FR from '@/locales/fr_FR.json';
import { I18n } from 'i18n-js';
import { getDeviceLanguage } from './shared/functions/utils';

export const i18n = new I18n({
	ca_ES,
	en_US,
	es_ES,
	fr_FR,
});

i18n.defaultLocale = getDeviceLanguage();

i18n.locale = getDeviceLanguage();

export function changeLanguage(lang: string) {
	i18n.locale = lang;
}
