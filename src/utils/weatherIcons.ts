const weatherCodeStringToEmoji: Record<string, string> = {
  'Helderblauwe lucht': '☀️',
  'Hoofdzakelijk helder': '🌤️',
  'Gedeeltelijk bewolkt': '⛅',
  'Bewolkt': '☁️',
  'Mist': '🌫️',
  'Aanvriezende mist': '🌫️',
  'Lichte motregen': '🌦️',
  'Matige motregen': '🌦️',
  'Dichte motregen': '🌧️',
  'Lichte bevroren motregen': '🌧️',
  'Dichte bevroren motregen': '🌧️',
  'Lichte regen': '🌧️',
  'Matige regen': '🌧️',
  'Zware regen': '🌧️',
  'Lichte bevroren regen': '🧊',
  'Zware bevroren regen': '🧊',
  'Lichte sneeuwval': '🌨️',
  'Matige sneeuwval': '🌨️',
  'Zware sneeuwval': '❄️',
  'Sneeuwkorrels': '🌨️',
  'Lichte regenbuien': '🌦️',
  'Matige regenbuien': '🌧️',
  'Heftige regenbuien': '⛈️',
  'Lichte sneeuwbuien': '🌨️',
  'Zware sneeuwbuien': '❄️',
  'Onweersbui': '⛈️',
  'Onweersbui met lichte hagel': '⛈️',
  'Onweersbui met zware hagel': '⛈️',
}

export function weatherCodeToEmoji(weatherCodeString: string | null | undefined): string {
  if (!weatherCodeString) return '🌡️'
  return weatherCodeStringToEmoji[weatherCodeString] ?? '🌡️'
}
