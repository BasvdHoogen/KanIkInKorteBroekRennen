import { createI18n } from 'vue-i18n'
import { getStoredValue, setStoredValue } from '@/utils/storage'
import { nl, type MessageSchema } from './locales/nl'
import { en } from './locales/en'
import { es } from './locales/es'

// The single source of truth for how many languages exist. Routes, the language
// picker and the test tables are all derived from it, so adding a language is a
// catalogue file plus an entry here and in MESSAGES.
export const SUPPORTED_LOCALES = ['nl', 'en', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const MESSAGES: Record<Locale, MessageSchema> = { nl, en, es }

/**
 * Each language's name in its own words. Deliberately not part of the message
 * catalogues: a language's own name does not change with the surrounding UI
 * language, so "Español" belongs here once rather than in all three files.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
  es: 'Español',
}

/**
 * Decorative only. Flags are countries, not languages — no flag honestly covers
 * every speaker of a language — so the endonym above stays the real label and
 * these are rendered aria-hidden beside it.
 */
export const LOCALE_FLAGS: Record<Locale, string> = {
  nl: '🇳🇱',
  en: '🇬🇧',
  es: '🇪🇸',
}

export const DEFAULT_LOCALE: Locale = 'nl'
export const LOCALE_STORAGE_KEY = 'locale'

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function createAppI18n(locale: Locale = DEFAULT_LOCALE) {
  return createI18n<[MessageSchema], Locale, false>({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: MESSAGES,
  })
}

export const i18n = createAppI18n()

/** The locale remembered from a previous visit, if it is still one we support. */
export function storedLocale(): Locale | null {
  const stored = getStoredValue(LOCALE_STORAGE_KEY)
  return isLocale(stored) ? stored : null
}

export type AppI18n = ReturnType<typeof createAppI18n>

/**
 * Applies a locale everywhere it is observable: messages, storage, <html lang>
 * and the title. Takes the instance explicitly so it acts on the i18n actually
 * mounted in the app (or in a test), not on the module singleton.
 */
export function applyLocale(locale: Locale, instance: AppI18n = i18n): void {
  instance.global.locale.value = locale
  setStoredValue(LOCALE_STORAGE_KEY, locale)
  document.documentElement.lang = locale
  document.title = instance.global.t('app.title')
}
