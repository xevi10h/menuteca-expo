import { changeLanguage, i18n } from '@/i18n';
import { useUserStore } from '@/zustand/UserStore';
import { useEffect, useMemo, useRef } from 'react';

// Cache global para evitar re-creación constante de la función t
let cachedTranslationFunction: typeof i18n.t;
let currentCachedLocale: string;

export function useTranslation() {
	const language = useUserStore((state) => state.user.language);
	const isInitialized = useUserStore((state) => state.isInitialized);
	const previousLanguage = useRef<string | null>(null);
	const hasInitialized = useRef(false);

	// Memoizar la función de traducción para evitar recreaciones
	const t = useMemo(() => {
		// Si ya tenemos una función cacheada y el locale no ha cambiado, usarla
		if (cachedTranslationFunction && currentCachedLocale === i18n.locale) {
			return cachedTranslationFunction;
		}

		// Crear nueva función y cachearla
		cachedTranslationFunction = i18n.t.bind(i18n);
		currentCachedLocale = i18n.locale;
		return cachedTranslationFunction;
	}, [i18n.locale]);

	// Memoizar el locale
	const locale = useMemo(() => i18n.locale, [i18n.locale]);

	useEffect(() => {
		// Solo proceder si el store está inicializado
		if (!isInitialized) return;

		// Solo cambiar idioma si realmente cambió y no es la primera vez
		if (
			language &&
			language !== previousLanguage.current &&
			(hasInitialized.current || previousLanguage.current !== null)
		) {
			console.log(
				'🌍 Changing language from',
				previousLanguage.current,
				'to',
				language,
			);

			try {
				changeLanguage(language);
				// Invalidar cache después del cambio
				cachedTranslationFunction = i18n.t.bind(i18n);
				currentCachedLocale = i18n.locale;
			} catch (error) {
				console.error('❌ Error changing language:', error);
			}
		}

		previousLanguage.current = language;
		hasInitialized.current = true;
	}, [language, isInitialized]);

	return {
		t,
		locale,
	};
}
