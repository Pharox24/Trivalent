import { en } from './en';
import { ar } from './ar';
import { zh } from './zh';

export const langs = ['en', 'ar', 'zh'] as const;
export type Lang = (typeof langs)[number];
export type Dict = typeof en;

const dicts: Record<Lang, Dict> = { en, ar, zh };

export const t = (lang: Lang): Dict => dicts[lang];
export const dirFor = (lang: Lang): 'ltr' | 'rtl' => (lang === 'ar' ? 'rtl' : 'ltr');
export const pathFor = (lang: Lang, slug = '') => `/${lang}/${slug}${slug ? '/' : ''}`;
export const langLabel: Record<Lang, string> = { en: 'EN', ar: 'العربية', zh: '中文' };
