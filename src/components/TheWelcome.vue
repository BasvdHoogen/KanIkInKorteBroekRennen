<script setup lang="ts">
import {computed, onMounted, ref, Ref, watch} from 'vue'
import LoadingWave from "@/components/Loading-wave.vue";
import {useRoute, useRouter} from "vue-router";

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

const route = useRoute();
const router = useRouter();
const initialLocation = Array.isArray(route.params.location) ? route.params.location[0] : route.params.location;
const location: Ref<string> = ref(initialLocation ?? "");

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

onMounted(() => {
  GetWeather();
})

watch(location, () => {
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
  <div style="min-height: 90vh">
        <div><img
              src="/man-running-emoji-258749.png" alt="man-running-emoji-with-short-pants"
              style="width:128px;height:128px;display: flex; margin-left: auto; margin-right: auto;"></div>
    <br />
    <input v-model="locationInput" type="text" placeholder="Zoek een locatie" @keyup="checkIfEnter" /> <button @click="RedirectToLocationUri">Zoek</button>
    <br /><br />

    <h1 class="green">Kan ik in korte broek rennen?</h1>

    <loading-wave v-if="loading" />
    <div v-else>
      <div v-if="successful == true && weatherData != null">
          <div v-if="weatherData.current != null && weatherData.current.apparent_temperature >= 8">
            <h3>JA!</h3>
            Trek je KORTE broek aan.
          </div>
          <div v-else>
            <h3>Nee!</h3>
            Trek je LANGE broek aan.
          </div>

          <br>
          <div v-if="weatherData.current != null">
            <h4>
              <span v-if="locationDisplayName"><b>{{ locationDisplayName }}</b> </span>
              <span v-else> {{ weatherData.latitude }}, {{ weatherData.longitude }}</span>
            </h4>
            <div class="grid">
              <div class="right">Temperatuur: </div><div class="left">{{ weatherData.current.temperature_2m }} {{weatherData.current_units.temperature_2m}}</div>
              <div class="right">Gevoelstemperatuur: </div><div class="left">{{ weatherData.current.apparent_temperature }} {{weatherData.current_units.apparent_temperature}}</div>
              <div class="right">Wind: </div><div class="left">{{weatherData.current.windspeed_10m}} {{weatherData.current_units.windspeed_10m}}</div>
              <div v-if="weatherCodeString" class="right">Beschrijving: </div><div class="left">{{weatherCodeString}}</div>
            </div>
          </div>
      </div>
      <div v-else>
        <h3>Helaas...</h3>
        Er is iets mis gegaan
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

h4 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

h6 {
  font-size: 0.7rem;
  font-weight: 400;
  margin-bottom: 0.4rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 0.5em;
}

.left {
  text-align: left;
}

.right {
  text-align: right;
}
</style>