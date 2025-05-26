import { changeLanguage, i18n } from '@/i18n';
import { useUserStore } from '@/zustand/UserStore';

import { useEffect } from 'react';

export function useTranslation() {
	const language = useUserStore((state) => state.user.language);

	useEffect(() => {
		changeLanguage(language);
	}, [language]);

	return {
		t: i18n.t.bind(i18n),
		locale: i18n.locale,
	};
}
