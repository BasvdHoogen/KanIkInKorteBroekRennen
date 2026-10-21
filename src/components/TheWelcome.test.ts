import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TheWelcome from './TheWelcome.vue'
import { installLanguageGuard, routes } from '@/router'
import { createAppI18n, isLocale, MESSAGES, SUPPORTED_LOCALES, type Locale } from '@/i18n'

function weatherResponse(apparentTemperature: number) {
  return {
    weatherForecast: {
      latitude: 51.4416,
      longitude: 5.4697,
      current: {
        temperature_2m: 20,
        apparent_temperature: apparentTemperature,
        windspeed_10m: 10,
        weathercode: 0,
      },
      current_units: {
        temperature_2m: '°C',
        apparent_temperature: '°C',
        windspeed_10m: 'km/h',
      },
    },
    locationDisplayName: 'Eindhoven, Noord-Brabant, Nederland',
    weatherCodeString: 'Helderblauwe lucht',
    succesfull: true,
  }
}

const localeCases = SUPPORTED_LOCALES.map((locale) => ({
  locale,
  path: locale === 'nl' ? '/Eindhoven' : `/${locale}/Eindhoven`,
}))

function stubFetchResolving(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) }),
  )
}

// The language guard is deliberately not installed here: these tests drive the
// component directly, and the locale comes from the path. It has its own tests
// in router.test.ts.
/** The locale a path implies, by its prefix — '/es/Eindhoven' means Spanish. */
function localeOfPath(path: string): Locale {
  const firstSegment = path.split('/')[1] ?? ''
  return isLocale(firstSegment) ? firstSegment : 'nl'
}

async function mountWithRouter(initialPath = '/', { withLanguageGuard = false } = {}) {
  const router = createRouter({ history: createWebHistory(), routes })
  const i18n = createAppI18n(localeOfPath(initialPath))
  if (withLanguageGuard) installLanguageGuard(router, i18n)
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(TheWelcome, { global: { plugins: [router, i18n] } })
  await flushPromises()
  return { wrapper, router }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('TheWelcome', () => {
  it('renders JA! when the apparent temperature is at least 8 degrees', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter('/Eindhoven')

    expect(wrapper.text()).toContain('JA!')
    expect(wrapper.text()).toContain('Eindhoven, Noord-Brabant, Nederland')
  })

  it('renders Nee! when the apparent temperature is below 8 degrees', async () => {
    stubFetchResolving(weatherResponse(3))

    const { wrapper } = await mountWithRouter('/Eindhoven')

    expect(wrapper.text()).toContain('Nee!')
  })

  it('renders the error state when the fetch call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const { wrapper } = await mountWithRouter('/')

    expect(wrapper.text()).toContain('Helaas')
  })

  it('navigates to the typed location when Enter is pressed', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper, router } = await mountWithRouter('/')
    await wrapper.find('input').setValue('Rotterdam')
    await wrapper.find('input').trigger('keyup', { key: 'Enter' })
    await flushPromises()

    expect(router.currentRoute.value.params.location).toBe('Rotterdam')
  })

  it('does not navigate when a non-Enter key is pressed', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper, router } = await mountWithRouter('/')
    const fetchCallsBefore = vi.mocked(fetch).mock.calls.length
    await wrapper.find('input').setValue('Rotterdam')
    await wrapper.find('input').trigger('keyup', { key: 'a' })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('home')
    expect(vi.mocked(fetch).mock.calls.length).toBe(fetchCallsBefore)
  })

  it('navigates to the typed location when the search button is clicked', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper, router } = await mountWithRouter('/')
    await wrapper.find('input').setValue('Maastricht')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.params.location).toBe('Maastricht')
  })

  it('remembers the last searched location in localStorage for the next visit', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter('/')
    await wrapper.find('input').setValue('Rotterdam')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockClear()

    await mountWithRouter('/')

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('location=Rotterdam'))
  })

  it('shifts the JA/NEE threshold based on a stored temperature preference', async () => {
    localStorage.setItem('tempPreference', '2')
    stubFetchResolving(weatherResponse(7))

    const { wrapper } = await mountWithRouter('/Eindhoven')

    expect(wrapper.text()).toContain('JA!')
  })
  // One row per language, so a new locale is exercised as soon as it is registered.
  it.each(localeCases)('renders $locale copy at $path', async ({ path, locale }) => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter(path)

    expect(wrapper.text()).toContain(MESSAGES[locale].verdict.yes)
    expect(wrapper.text()).toContain(MESSAGES[locale].stats.wind)
  })

  it.each(localeCases)(
    'translates the weather description from the numeric code in $locale',
    async ({ path, locale }) => {
      stubFetchResolving(weatherResponse(19))

      const { wrapper } = await mountWithRouter(path)

      expect(wrapper.text()).toContain(MESSAGES[locale].weatherCode.c0)
    },
  )

  it.each(localeCases)(
    'asks the backend for place names in $locale',
    async ({ path, locale }) => {
      stubFetchResolving(weatherResponse(19))

      await mountWithRouter(path)

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`lang=${locale}`))
    },
  )

  it.each(['/Amsterdam', '/Enschede', '/Espanola'])(
    'keeps %s on the Dutch location route rather than reading it as a prefix',
    async (path) => {
      stubFetchResolving(weatherResponse(19))

      const { router } = await mountWithRouter(path)

      expect(router.currentRoute.value.name).toBe('location')
    },
  )

  it.each(SUPPORTED_LOCALES.filter((locale) => locale !== 'nl'))(
    'switches to %s via the picker, preserving the location and refetching',
    async (locale) => {
      stubFetchResolving(weatherResponse(19))

      const { wrapper, router } = await mountWithRouter('/Eindhoven', {
        withLanguageGuard: true,
      })
      vi.mocked(fetch).mockClear()

      await wrapper.find('.lang-trigger').trigger('click')
      // Targeted by locale: find() would otherwise just take the first option.
      await wrapper.find(`.lang-option[data-locale="${locale}"]`).trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe(`/${locale}/Eindhoven`)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`lang=${locale}`))
    },
  )

  it('offers every supported language in the picker', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter('/Eindhoven')
    await wrapper.find('.lang-trigger').trigger('click')

    const offered = wrapper
      .findAll('.lang-option')
      .map((option) => option.attributes('data-locale'))

    expect(offered).toEqual([...SUPPORTED_LOCALES])
  })

  it('encodes multi-word locations in the request URL', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter('/')
    await wrapper.find('input').setValue('Den Bosch')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('location=Den+Bosch'))
  })
})
