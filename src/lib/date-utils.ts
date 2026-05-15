import { Language } from './i18n';

export const formatDate = (
  date: string | Date,
  lang: Language,
  includeTime: boolean = false
) => {
  const d = new Date(date);
  const locale = lang === 'ua' ? 'uk-UA' : 'en-US';

  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'long',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  });
};
