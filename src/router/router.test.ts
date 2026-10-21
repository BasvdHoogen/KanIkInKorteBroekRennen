import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createAppRouter, installLanguageGuard, routes } from './index'
import { createAppI18n, DEFAULT_LOCALE, i18n, SUPPORTED_LOCALES } from '@/i18n'

async function navigate(initialPath: string) {
  const router = createRouter({ history: createWebHistory(), routes })
  const i18n = createAppI18n()
  installLanguageGuard(router, i18n)
  await router.push(initialPath)
  await router.isReady()
  return { router, i18n }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

// One row per supported language, so a new locale is covered on registration.
const routeCases = SUPPORTED_LOCALES.flatMap((locale) => {
  const isDefault = locale === DEFAULT_LOCALE
  const suffix = isDefault ? '' : `-${locale}`
  return [
    [isDefault ? '/' : `/${locale}`, `home${suffix}`, locale],
    [isDefault ? '/Amsterdam' : `/${locale}/Amsterdam`, `location${suffix}`, locale],
  ] as const
})

describe('route matching', () => {
  it.each(routeCases)('matches %s to the %s route', async (path, name) => {
    const { router } = await navigate(path)

    expect(router.currentRoute.value.name).toBe(name)
  })

  it.each(routeCases)('applies the right locale for %s', async (path, _name, locale) => {
    const { i18n: instance } = await navigate(path)

    expect(instance.global.locale.value).toBe(locale)
  })

  // The static language prefixes must keep outranking the /:location catch-all.
  it.each(['/Amsterdam', '/Enschede', '/Espanola', '/Nijmegen'])(
    'treats %s as a location, not a language prefix',
    async (path) => {
      const { router } = await navigate(path)

      expect(router.currentRoute.value.name).toBe('location')
    },
  )
})

describe('language guard', () => {
  it('leaves an unprefixed URL Dutch when Dutch is remembered', async () => {
    localStorage.setItem('locale', 'nl')

    const { router, i18n } = await navigate('/Eindhoven')

    expect(router.currentRoute.value.path).toBe('/Eindhoven')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it.each(SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))(
    'redirects a first visit to /%s when that language is remembered',
    async (locale) => {
      localStorage.setItem('locale', locale)

      const { router, i18n } = await navigate('/Eindhoven')

      expect(router.currentRoute.value.path).toBe(`/${locale}/Eindhoven`)
      expect(i18n.global.locale.value).toBe(locale)
    },
  )

  it('stays Dutch on a first visit with nothing remembered', async () => {
    const { router, i18n } = await navigate('/')

    expect(router.currentRoute.value.path).toBe('/')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it('ignores the browser language, so / means Dutch for everyone', async () => {
    vi.stubGlobal('navigator', { languages: ['en-GB'], language: 'en-GB' })

    const { router, i18n } = await navigate('/')

    expect(router.currentRoute.value.path).toBe('/')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it('ignores a junk value in storage', async () => {
    localStorage.setItem('locale', 'klingon')

    const { router, i18n } = await navigate('/')

    expect(router.currentRoute.value.path).toBe('/')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it('lets the URL win over the remembered language after the first visit', async () => {
    localStorage.setItem('locale', 'en')

    const { router, i18n } = await navigate('/en')
    await router.push('/Eindhoven')

    expect(router.currentRoute.value.path).toBe('/Eindhoven')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it('follows a hop straight from one prefixed language to another', async () => {
    const { router, i18n } = await navigate('/en/Eindhoven')
    await router.push('/es/Eindhoven')

    expect(i18n.global.locale.value).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('keeps <html lang> and the document title in step with the locale', async () => {
    const { router } = await navigate('/')
    expect(document.documentElement.lang).toBe('nl')
    expect(document.title).toBe('Kan ik in korte broek rennen?')

    await router.push('/en')

    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Can I run in shorts?')
  })
})

describe('createAppRouter', () => {
  // The composition main.ts actually uses: the guard defaults to the i18n singleton.
  it('wires the guard to the shared i18n instance', async () => {
    const router = createAppRouter()
    await router.push('/en/Eindhoven')
    await router.isReady()

    expect(i18n.global.locale.value).toBe('en')

    await router.push('/Eindhoven')

    expect(i18n.global.locale.value).toBe('nl')
  })
})
