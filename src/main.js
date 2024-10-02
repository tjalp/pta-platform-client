import 'primeicons/primeicons.css'
import './assets/main.css'

import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import Button from 'primevue/button'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Noir from './presets/Noir'
import AppState from './plugins/appState'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Noir,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false,
        }
    }
})
app.use(AppState)
app.use(ToastService)

app.component('Button', Button)
app.component('InputText', InputText)
app.component('Select', Select)
app.component('Toast', Toast)
app.component('Menubar', Menubar)
app.component('Message', Message)

app.mount('#app')
