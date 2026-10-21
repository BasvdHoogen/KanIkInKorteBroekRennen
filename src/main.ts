import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from '@/i18n'
import { createAppRouter } from '@/router'

const app = createApp(App)

// i18n first: the router's language guard sets the document title via i18n
// during the initial navigation that app.mount() triggers.
app.use(i18n)
app.use(createAppRouter())

app.mount('#app')
