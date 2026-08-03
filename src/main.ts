import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import {createRouter, createWebHistory} from "vue-router";
import TheWelcome from "@/components/TheWelcome.vue";

const routes = [
    { path: '/', name: 'home', component: TheWelcome},
    { path: '/:location', name: 'location', component: TheWelcome },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

const app = createApp(App)

app.use(router)

app.mount('#app')
