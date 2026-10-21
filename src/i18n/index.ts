import { createI18n } from 'vue-i18n'
import { getStoredValue, setStoredValue } from '@/utils/storage'
import { nl, type MessageSchema } from './locales/nl'
import { en } from './locales/en'

export const SUPPORTED_LOCALES = ['nl', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

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
    messages: { nl, en },
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
