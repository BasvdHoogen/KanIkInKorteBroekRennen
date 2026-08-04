<script setup lang="ts">
import {computed, onMounted, ref, Ref, watch} from 'vue'
import LoadingWave from "@/components/Loading-wave.vue";
import {useRoute, useRouter} from "vue-router";
import {getCookie, setCookie} from "@/utils/cookies";
import {weatherCodeToEmoji} from "@/utils/weatherIcons";

interface WeatherCurrent {
  temperature_2m: number
  apparent_temperature: number
  windspeed_10m: number
}

interface WeatherCurrentUnits {
  temperature_2m: string
  apparent_temperature: string
  windspeed_10m: string
}

interface WeatherForecast {
  latitude: number
  longitude: number
  current: WeatherCurrent | null
  current_units: WeatherCurrentUnits
}

interface KorteBroekInfoResponse {
  weatherForecast: WeatherForecast | null
  locationDisplayName: string | null
  weatherCodeString: string | null
  succesfull: boolean
}

const LOCATION_COOKIE = "lastLocation";
const TEMP_PREFERENCE_COOKIE = "tempPreference";
const DEFAULT_THRESHOLD = 8;
const MIN_PREFERENCE = -3;
const MAX_PREFERENCE = 3;
const PREFERENCE_LABELS = [
  "🥶 Heel snel koud",
  "🥶 Snel koud",
  "❄️ Iets snel koud",
  "😊 Gemiddeld",
  "☀️ Iets snel warm",
  "🥵 Snel warm",
  "🥵 Heel snel warm",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const route = useRoute();
const router = useRouter();
const initialLocation = Array.isArray(route.params.location) ? route.params.location[0] : route.params.location;
const rememberedLocation = getCookie(LOCATION_COOKIE);
const location: Ref<string> = ref(initialLocation || rememberedLocation || "");

const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL;

const fullFetchUri = computed(() => {
  const baseUrl = `${apiBaseUrl}/kortebroekinfo`;
  return location.value ? `${baseUrl}/?location=${location.value}` : baseUrl;
});

const weatherData = ref<WeatherForecast | null>(null)
const locationDisplayName = ref<string | null>(null)
const successful: Ref<boolean | null> = ref<boolean | null>(null)
const loading: Ref<boolean> = ref<boolean>(true)
const locationInput = ref("")
const weatherCodeString = ref<string | null>(null)
const showSettings = ref(false)

const storedPreference = Number(getCookie(TEMP_PREFERENCE_COOKIE));
const temperaturePreference: Ref<number> = ref(
    Number.isFinite(storedPreference) ? clamp(storedPreference, MIN_PREFERENCE, MAX_PREFERENCE) : 0
)

const effectiveThreshold = computed(() => DEFAULT_THRESHOLD - temperaturePreference.value)
const preferenceLabel = computed(() => PREFERENCE_LABELS[temperaturePreference.value + 3])
const weatherEmoji = computed(() => weatherCodeToEmoji(weatherCodeString.value))
const canWearShorts = computed(() =>
    weatherData.value?.current != null && weatherData.value.current.apparent_temperature >= effectiveThreshold.value
)

watch(temperaturePreference, (value) => {
  setCookie(TEMP_PREFERENCE_COOKIE, String(value), 365)
})

onMounted(() => {
  if (location.value) {
    setCookie(LOCATION_COOKIE, location.value, 365)
  }
  GetWeather();
})

watch(location, () => {
  if (location.value) {
    setCookie(LOCATION_COOKIE, location.value, 365)
  }
  GetWeather();
})

function GetWeather() {
  loading.value = true;
  try{
      fetch(fullFetchUri.value)
          .then((r) => r.json())
          .then((data: KorteBroekInfoResponse) => {
              loading.value = false;
              weatherData.value = data.weatherForecast;
              locationDisplayName.value = data.locationDisplayName;
              weatherCodeString.value = data.weatherCodeString;
              successful.value = data.succesfull;
            }
        )
          .catch(
              (e => {
                loading.value = false;
                console.log("error: " + e);
                successful.value = false;
              })
          )
  }
  catch (e){
    loading.value = false;
    console.log("error: " + e);
    successful.value = false;
  }
}

function RedirectToLocationUri() {
  location.value = locationInput.value;
  router.push({name: 'location', params: {location: locationInput.value}})
}

function checkIfEnter(event: KeyboardEvent) {
  if(event.key !== "Enter") return;
  RedirectToLocationUri();
}

</script>

<template>
  <div class="page">
    <div class="sky-decor" aria-hidden="true">
      <span class="cloud cloud-1">☁️</span>
      <span class="cloud cloud-2">☁️</span>
      <span class="cloud cloud-3">☁️</span>
      <span class="sun">☀️</span>
    </div>

    <div class="hero">
      <img
          src="/man-running-emoji-258749.png" alt="man-running-emoji-with-short-pants"
          class="mascot">

      <h1>Kan ik in korte broek rennen?</h1>

      <div class="search-bar">
        <input v-model="locationInput" type="text" placeholder="Zoek een locatie" @keyup="checkIfEnter" />
        <button @click="RedirectToLocationUri">Zoek</button>
      </div>
    </div>

    <loading-wave v-if="loading" />
    <div v-else class="result">
      <div v-if="successful == true && weatherData != null">
        <div class="verdict-card" :class="canWearShorts ? 'verdict-yes' : 'verdict-no'">
          <div class="verdict-emoji">{{ canWearShorts ? '🩳' : '🥶' }}</div>
          <h2 v-if="canWearShorts">JA!</h2>
          <h2 v-else>Nee!</h2>
          <p>{{ canWearShorts ? 'Trek je KORTE broek aan.' : 'Trek je LANGE broek aan.' }}</p>
        </div>

        <div v-if="weatherData.current != null" class="details">
          <h3 class="location-name">
            <span v-if="locationDisplayName">{{ locationDisplayName }}</span>
            <span v-else>{{ weatherData.latitude }}, {{ weatherData.longitude }}</span>
          </h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🌡️</div>
              <div class="stat-label">Temperatuur</div>
              <div class="stat-value">{{ weatherData.current.temperature_2m }}{{ weatherData.current_units.temperature_2m }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🤔</div>
              <div class="stat-label">Gevoelstemperatuur</div>
              <div class="stat-value">{{ weatherData.current.apparent_temperature }}{{ weatherData.current_units.apparent_temperature }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💨</div>
              <div class="stat-label">Wind</div>
              <div class="stat-value">{{ weatherData.current.windspeed_10m }} {{ weatherData.current_units.windspeed_10m }}</div>
            </div>
            <div v-if="weatherCodeString" class="stat-card">
              <div class="stat-icon">{{ weatherEmoji }}</div>
              <div class="stat-label">Beschrijving</div>
              <div class="stat-value">{{ weatherCodeString }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="error-card">
        <h3>Helaas...</h3>
        <p>Er is iets mis gegaan</p>
      </div>
    </div>

    <button
        class="settings-toggle"
        :aria-expanded="showSettings"
        aria-label="Voorkeuren"
        @click="showSettings = !showSettings">
      ⚙️
    </button>

    <div v-if="showSettings" class="settings-panel">
      <h3>Jouw voorkeuren</h3>
      <label for="tempPreference">Ben jij snel koud of snel warm?</label>
      <input
          id="tempPreference"
          v-model.number="temperaturePreference"
          type="range"
          :min="MIN_PREFERENCE"
          :max="MAX_PREFERENCE"
          step="1" />
      <div class="pref-label">{{ preferenceLabel }}</div>
      <div class="pref-hint">Korte broek vanaf {{ effectiveThreshold }}°C gevoelstemperatuur</div>
      <p class="pref-note">Dit onthouden we alleen lokaal in je browser (functionele cookie).</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  width: 100%;
  min-height: 90vh;
  padding-bottom: 3rem;
  overflow: hidden;
}

.sky-decor {
  position: absolute;
  inset: 0;
  height: 320px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.cloud {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.6;
  animation: drift 22s linear infinite;
}

.cloud-1 { top: 10%; left: -10%; animation-duration: 26s; }
.cloud-2 { top: 28%; left: -20%; animation-duration: 34s; animation-delay: -8s; font-size: 2rem; }
.cloud-3 { top: 5%; left: -30%; animation-duration: 40s; animation-delay: -20s; font-size: 1.6rem; }

.sun {
  position: absolute;
  top: 4%;
  right: 6%;
  font-size: 3rem;
  animation: spin 18s linear infinite, pulse 3s ease-in-out infinite;
}

@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(140vw); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hero {
  position: relative;
  z-index: 1;
  text-align: center;
}

.mascot {
  width: 128px;
  height: 128px;
  margin: 0.5rem auto 0;
  display: block;
  animation: bounce 2.2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 600;
  color: var(--accent-color);
  margin: 0.75rem 0 1.5rem;
}

.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 0.4rem 0.4rem 1.2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.search-bar input {
  border: none;
  background: transparent;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  color: var(--color-text);
  min-width: 10rem;
}

.search-bar button {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.4rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.search-bar button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

.result {
  position: relative;
  z-index: 1;
  margin-top: 2rem;
}

.verdict-card {
  max-width: 22rem;
  margin: 0 auto;
  border-radius: 1.75rem;
  padding: 2rem 1.5rem;
  color: white;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.verdict-yes {
  background: linear-gradient(160deg, #56ab2f, #a8e063);
}

.verdict-no {
  background: linear-gradient(160deg, #4b6cb7, #6e8fd8);
}

@keyframes pop-in {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.verdict-emoji {
  font-size: 3.5rem;
  line-height: 1;
  animation: bounce 1.6s ease-in-out infinite;
}

.verdict-card h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0.3rem 0;
}

.verdict-card p {
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
}

.details {
  margin-top: 1.75rem;
}

.location-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 0.9rem;
  max-width: 40rem;
  margin: 0 auto;
}

.stat-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 1.2rem;
  padding: 1rem 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 1.6rem;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
}

.error-card {
  max-width: 22rem;
  margin: 0 auto;
  border-radius: 1.5rem;
  padding: 1.75rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

.settings-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: none;
  background: var(--color-background-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 1.3rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.settings-toggle:hover {
  transform: rotate(45deg);
}

.settings-panel {
  position: fixed;
  top: 4.5rem;
  right: 1rem;
  z-index: 2;
  width: min(20rem, calc(100vw - 2rem));
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 1.2rem;
  padding: 1.25rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  text-align: left;
  animation: pop-in 0.25s ease-out;
}

.settings-panel h3 {
  font-family: 'Fredoka', sans-serif;
  margin-bottom: 0.75rem;
}

.settings-panel label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.settings-panel input[type='range'] {
  width: 100%;
  accent-color: var(--accent-color);
}

.pref-label {
  margin-top: 0.5rem;
  font-weight: 600;
}

.pref-hint {
  font-size: 0.8rem;
  opacity: 0.75;
  margin-top: 0.25rem;
}

.pref-note {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.75rem;
}
</style>
