import { describe, expect, it } from 'vitest'
import { WEATHER_CODE_EMOJI, weatherCodeToEmoji } from './weatherIcons'
import { nl } from '@/i18n/locales/nl'
import { en } from '@/i18n/locales/en'

describe('weatherCodeToEmoji', () => {
  it('maps a known code to its emoji', () => {
    expect(weatherCodeToEmoji(0)).toBe('☀️')
    expect(weatherCodeToEmoji(61)).toBe('🌧️')
  })

  it('falls back to a thermometer for unknown or missing codes', () => {
    expect(weatherCodeToEmoji(12345)).toBe('🌡️')
    expect(weatherCodeToEmoji(null)).toBe('🌡️')
    expect(weatherCodeToEmoji(undefined)).toBe('🌡️')
  })
})

describe('weather code translations', () => {
  // The description key is built at runtime (`weatherCode.c${code}`), so it
  // escapes the compile-time key checking the locale schema gives us.
  it.each([
    ['nl', nl],
    ['en', en],
  ])('has a %s description for every supported code', (_locale, messages) => {
    const missing = Object.keys(WEATHER_CODE_EMOJI).filter(
      (code) => !(`c${code}` in messages.weatherCode),
    )

    expect(missing).toEqual([])
  })
})
