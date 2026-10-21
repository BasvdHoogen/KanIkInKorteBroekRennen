import {
  createRouter,
  createWebHistory,
  START_LOCATION,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
import TheWelcome from '@/components/TheWelcome.vue'
import {
  applyLocale,
  DEFAULT_LOCALE,
  i18n as globalI18n,
  storedLocale,
  SUPPORTED_LOCALES,
  type AppI18n,
  type Locale,
} from '@/i18n'
import { localeRoute } from './localeRoute'

export { localeRoute }

declare module 'vue-router' {
  interface RouteMeta {
    lang?: Locale
  }
}

// Every non-default language gets a static `/<locale>` prefix. These records are
// listed first so the static segment always outranks the `/:location` catch-all:
// `/Amsterdam` can never be mistaken for a language prefix. Generating them from
// SUPPORTED_LOCALES keeps that ordering structural rather than a rule to remember.
const prefixedRoutes: RouteRecordRaw[] = SUPPORTED_LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
).flatMap((lang) => [
  { path: `/${lang}`, name: `home-${lang}`, component: TheWelcome, meta: { lang } },
  {
    path: `/${lang}/:location`,
    name: `location-${lang}`,
    component: TheWelcome,
    meta: { lang },
  },
])

export const routes: RouteRecordRaw[] = [
  ...prefixedRoutes,
  { path: '/', name: 'home', component: TheWelcome },
  { path: '/:location', name: 'location', component: TheWelcome },
]

/**
 * Keeps the active locale in step with the URL. Runs on popstate too, so browser
 * back/forward across a language boundary re-syncs the UI.
 *
 * This is a Dutch site, so an unprefixed URL means Dutch. The browser's own
 * language is deliberately NOT consulted: `/` must mean the same thing for
 * everyone. Only a language the visitor picked themselves earlier is restored,
 * and only on the first navigation — after that the URL is the sole authority.
 */
export function installLanguageGuard(router: Router, instance: AppI18n = globalI18n): void {
  router.beforeEach((to, from) => {
    if (from === START_LOCATION && !to.meta.lang) {
      const chosen = storedLocale()
      if (chosen != null && chosen !== DEFAULT_LOCALE) {
        return localeRoute(chosen, String(to.params.location ?? ''))
      }
    }

    applyLocale(to.meta.lang ?? DEFAULT_LOCALE, instance)
  })
}

export function createAppRouter(): Router {
  const router = createRouter({ history: createWebHistory(), routes })
  installLanguageGuard(router)
  return router
}
