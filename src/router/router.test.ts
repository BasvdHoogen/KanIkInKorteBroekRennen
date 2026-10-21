import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createAppRouter, installLanguageGuard, routes } from './index'
import { createAppI18n, i18n } from '@/i18n'

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

describe('route matching', () => {
  it.each([
    ['/', 'home'],
    ['/Amsterdam', 'location'],
    ['/en', 'home-en'],
    ['/en/Amsterdam', 'location-en'],
  ])('matches %s to the %s route', async (path, name) => {
    const { router } = await navigate(path)

    expect(router.currentRoute.value.name).toBe(name)
  })
})

describe('language guard', () => {
  it('leaves an unprefixed URL Dutch when Dutch is remembered', async () => {
    localStorage.setItem('locale', 'nl')

    const { router, i18n } = await navigate('/Eindhoven')

    expect(router.currentRoute.value.path).toBe('/Eindhoven')
    expect(i18n.global.locale.value).toBe('nl')
  })

  it('redirects a first visit to /en when English is remembered', async () => {
    localStorage.setItem('locale', 'en')

    const { router, i18n } = await navigate('/Eindhoven')

    expect(router.currentRoute.value.path).toBe('/en/Eindhoven')
    expect(i18n.global.locale.value).toBe('en')
  })

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
