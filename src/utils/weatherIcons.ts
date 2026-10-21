// Keyed by Open-Meteo weather code. The matching descriptions live in the locale
// files under `weatherCode.c<code>`, so this map doubles as the list of codes we
// claim to support.
export const WEATHER_CODE_EMOJI: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🧊',
  67: '🧊',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
}

export function weatherCodeToEmoji(weatherCode: number | null | undefined): string {
  if (weatherCode == null) return '🌡️'
  return WEATHER_CODE_EMOJI[weatherCode] ?? '🌡️'
}
