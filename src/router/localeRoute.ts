import type { RouteLocationRaw } from 'vue-router'
import { DEFAULT_LOCALE, type Locale } from '@/i18n'

/**
 * The route for a location in a given language; the language lives in the path.
 *
 * Route names follow `home`/`location` for the default language and
 * `home-<locale>`/`location-<locale>` for the prefixed ones, matching the
 * records generated in ./index.ts.
 *
 * Deliberately kept free of component imports so components can use it without
 * creating a cycle back through the route records.
 */
export function localeRoute(locale: Locale, location: string): RouteLocationRaw {
  const suffix = locale === DEFAULT_LOCALE ? '' : `-${locale}`
  if (!location) return { name: `home${suffix}` }
  return { name: `location${suffix}`, params: { location } }
}
