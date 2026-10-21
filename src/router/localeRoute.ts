import type { RouteLocationRaw } from 'vue-router'
import type { Locale } from '@/i18n'

/**
 * The route for a location in a given language; the language lives in the path.
 *
 * Deliberately kept free of component imports so components can use it without
 * creating a cycle back through the route records.
 */
export function localeRoute(locale: Locale, location: string): RouteLocationRaw {
  if (!location) return { name: locale === 'en' ? 'home-en' : 'home' }
  return { name: locale === 'en' ? 'location-en' : 'location', params: { location } }
}
