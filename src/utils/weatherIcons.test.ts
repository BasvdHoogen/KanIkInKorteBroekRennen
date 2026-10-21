import { describe, expect, it } from 'vitest'
import { WEATHER_CODE_EMOJI, weatherCodeToEmoji } from './weatherIcons'
import { MESSAGES, SUPPORTED_LOCALES } from '@/i18n'

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
  // Driven off SUPPORTED_LOCALES so a newly added language is covered the
  // moment it is registered, rather than when someone remembers to add a row.
  it.each(SUPPORTED_LOCALES)('has a %s description for every supported code', (locale) => {
    const missing = Object.keys(WEATHER_CODE_EMOJI).filter(
      (code) => !(`c${code}` in MESSAGES[locale].weatherCode),
    )

    expect(missing).toEqual([])
  })

  it.each(SUPPORTED_LOCALES)('has exactly 7 preference labels in %s', (locale) => {
    expect(MESSAGES[locale].preferenceLabels).toHaveLength(7)
  })
})
