/** Exactly one label per slider position, from -3 (cold quickly) to +3 (warm quickly). */
export type PreferenceLabels = readonly [string, string, string, string, string, string, string]

export const nl = {
  app: {
    title: 'Kan ik in korte broek rennen?',
  },
  hero: {
    title: 'Kan ik in korte broek rennen?',
    mascotAlt: 'rennende-man-emoji-met-korte-broek',
    searchPlaceholder: 'Zoek een locatie',
    searchButton: 'Zoek',
  },
  verdict: {
    yes: 'JA!',
    no: 'Nee!',
    yesSubtitle: 'Trek je KORTE broek aan.',
    noSubtitle: 'Trek je LANGE broek aan.',
  },
  stats: {
    temperature: 'Temperatuur',
    apparentTemperature: 'Gevoelstemperatuur',
    wind: 'Wind',
    description: 'Beschrijving',
  },
  error: {
    title: 'Helaas...',
    body: 'Er is iets mis gegaan',
  },
  loading: 'We laden het weerbericht...',
  settings: {
    hint: 'Stel hier je temperatuurgevoel in 👉',
    title: 'Jouw voorkeuren',
    question: 'Heb jij het snel koud of snel warm?',
    threshold: 'Korte broek vanaf {degrees}°C gevoelstemperatuur',
    note: 'Dit onthouden we alleen lokaal in je browser (localStorage, geen tracking).',
  },
  preferenceLabels: [
    '🥶 Heel snel koud',
    '🥶 Snel koud',
    '❄️ Iets sneller koud',
    '😊 Gemiddeld',
    '☀️ Iets sneller warm',
    '🥵 Snel warm',
    '🥵 Heel snel warm',
  ] as PreferenceLabels,
  a11y: {
    preferences: 'Voorkeuren',
    language: 'Taal',
  },
  weatherCode: {
    c0: 'Helderblauwe lucht',
    c1: 'Hoofdzakelijk helder',
    c2: 'Gedeeltelijk bewolkt',
    c3: 'Bewolkt',
    c45: 'Mist',
    c48: 'Aanvriezende mist',
    c51: 'Lichte motregen',
    c53: 'Matige motregen',
    c55: 'Dichte motregen',
    c56: 'Lichte bevroren motregen',
    c57: 'Dichte bevroren motregen',
    c61: 'Lichte regen',
    c63: 'Matige regen',
    c65: 'Zware regen',
    c66: 'Lichte bevroren regen',
    c67: 'Zware bevroren regen',
    c71: 'Lichte sneeuwval',
    c73: 'Matige sneeuwval',
    c75: 'Zware sneeuwval',
    c77: 'Sneeuwkorrels',
    c80: 'Lichte regenbuien',
    c81: 'Matige regenbuien',
    c82: 'Heftige regenbuien',
    c85: 'Lichte sneeuwbuien',
    c86: 'Zware sneeuwbuien',
    c95: 'Onweersbui',
    c96: 'Onweersbui met lichte hagel',
    c99: 'Onweersbui met zware hagel',
    unknown: 'Ongeldige weercode',
  },
}

export type MessageSchema = typeof nl
