import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TheWelcome from './TheWelcome.vue'
import { installLanguageGuard, routes } from '@/router'
import { createAppI18n } from '@/i18n'

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

function stubFetchResolving(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) }),
  )
}

// The language guard is deliberately not installed here: these tests drive the
// component directly, and the locale comes from the path. It has its own tests
// in router.test.ts.
async function mountWithRouter(initialPath = '/', { withLanguageGuard = false } = {}) {
  const router = createRouter({ history: createWebHistory(), routes })
  const i18n = createAppI18n(initialPath.startsWith('/en') ? 'en' : 'nl')
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
  it('renders English copy on the /en prefix', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper } = await mountWithRouter('/en/Eindhoven')

    expect(wrapper.text()).toContain('YES!')
    expect(wrapper.text()).not.toContain('JA!')
  })

  it('translates the weather description from the numeric code per language', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper: dutch } = await mountWithRouter('/Eindhoven')
    expect(dutch.text()).toContain('Helderblauwe lucht')

    const { wrapper: english } = await mountWithRouter('/en/Eindhoven')
    expect(english.text()).toContain('Clear blue sky')
  })

  it('asks the backend for place names in the active language', async () => {
    stubFetchResolving(weatherResponse(19))

    await mountWithRouter('/en/Eindhoven')

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('lang=en'))
  })

  it('keeps a location named like no language prefix on the Dutch route', async () => {
    stubFetchResolving(weatherResponse(19))

    const { router } = await mountWithRouter('/Amsterdam')

    expect(router.currentRoute.value.name).toBe('location')
    expect(router.currentRoute.value.params.location).toBe('Amsterdam')
  })

  it('switches language via the toggle, preserving the location and refetching', async () => {
    stubFetchResolving(weatherResponse(19))

    const { wrapper, router } = await mountWithRouter('/Eindhoven', { withLanguageGuard: true })
    vi.mocked(fetch).mockClear()

    await wrapper.find('.lang-toggle').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/en/Eindhoven')
    expect(fetch).toHaveBeenCalledTimes(1)
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
