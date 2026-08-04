import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TheWelcome from './TheWelcome.vue'

const routes = [
  { path: '/', name: 'home', component: TheWelcome },
  { path: '/:location', name: 'location', component: TheWelcome },
]

function weatherResponse(apparentTemperature: number) {
  return {
    weatherForecast: {
      latitude: 51.4416,
      longitude: 5.4697,
      current: {
        temperature_2m: 20,
        apparent_temperature: apparentTemperature,
        windspeed_10m: 10,
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

async function mountWithRouter(initialPath = '/') {
  const router = createRouter({ history: createWebHistory(), routes })
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(TheWelcome, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

function clearCookies() {
  for (const name of ['lastLocation', 'tempPreference']) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  clearCookies()
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

  it('remembers the last searched location for the next visit', async () => {
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

  it('shifts the JA/NEE threshold based on a stored temperature preference cookie', async () => {
    document.cookie = 'tempPreference=2; path=/;'
    stubFetchResolving(weatherResponse(7))

    const { wrapper } = await mountWithRouter('/Eindhoven')

    expect(wrapper.text()).toContain('JA!')
  })
})
