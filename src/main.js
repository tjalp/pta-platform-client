import 'primeicons/primeicons.css'
import './assets/main.css'

import Button from 'primevue/button'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import Noir from './presets/Noir'
import AppState from './plugins/appState'
import {createPinia} from "pinia";

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
    },
    locale: {
        "accept": "Ja",
        "addRule": "Voeg regel toe",
        "am": "voormiddag",
        "apply": "Toepassen",
        "cancel": "Annuleer",
        "choose": "Kies",
        "chooseDate": "Kies datum",
        "chooseMonth": "Kies maand",
        "chooseYear": "Kies jaar",
        "clear": "Wissen",
        "completed": "Voltooid",
        "contains": "Bevat",
        "custom": "Aangepast",
        "dateAfter": "Datum is na",
        "dateBefore": "Datum is voor",
        "dateFormat": "dd-mm-yy",
        "dateIs": "Datum is",
        "dateIsNot": "Datum is niet",
        "dayNames": [
          "zondag",
          "maandag",
          "dinsdag",
          "woensdag",
          "donderdag",
          "vrijdag",
          "zaterdag"
        ],
        "dayNamesMin": [
          "zo",
          "ma",
          "di",
          "wo",
          "do",
          "vr",
          "za"
        ],
        "dayNamesShort": [
          "zon",
          "ma",
          "di",
          "woe",
          "do",
          "vrij",
          "zat"
        ],
        "emptyFilterMessage": "Geen resultaten gevonden",
        "emptyMessage": "Geen resultaten gevonden",
        "emptySearchMessage": "Geen resultaten gevonden",
        "emptySelectionMessage": "Geen optie geselecteerd",
        "endsWith": "Eindigt met",
        "equals": "Is gelijk aan",
        "fileSizeTypes": [
          "B",
          "KB",
          "MB",
          "GB",
          "TB",
          "PB",
          "EB",
          "ZB",
          "YB"
        ],
        "filter": "Filter",
        "firstDayOfWeek": 1,
        "gt": "Groter dan",
        "gte": "Groter dan of gelijk aan",
        "lt": "Kleiner dan",
        "lte": "Kleiner dan of gelijk aan",
        "matchAll": "Overeenkomen met alle",
        "matchAny": "Overeenkomen met elke",
        "medium": "Gemiddeld",
        "monthNames": [
          "januari",
          "februari",
          "maart",
          "april",
          "mei",
          "juni",
          "juli",
          "augustus",
          "september",
          "oktober",
          "november",
          "december"
        ],
        "monthNamesShort": [
          "jan",
          "feb",
          "mar",
          "apr",
          "mei",
          "jun",
          "jul",
          "aug",
          "sep",
          "okt",
          "nov",
          "dec"
        ],
        "nextDecade": "Volgend decennium",
        "nextHour": "Volgend uur",
        "nextMinute": "Volgende minuut",
        "nextMonth": "Volgende maand",
        "nextSecond": "Volgende seconde",
        "nextYear": "Volgend jaar",
        "noFilter": "Geen filter",
        "notContains": "Bevat niet",
        "notEquals": "Is niet gelijk aan",
        "now": "Nu",
        "passwordPrompt": "Geef een wachtwoord",
        "pending": "In behandeling",
        "pm": "namiddag",
        "prevDecade": "Vorig decennium",
        "prevHour": "Vorig uur",
        "prevMinute": "Vorige minuut",
        "prevMonth": "Vorige maand",
        "prevSecond": "Vorige seconde",
        "prevYear": "Vorig jaar",
        "reject": "Nee",
        "removeRule": "Verwijder regel",
        "searchMessage": "{0} resultaten beschikbaar",
        "selectionMessage": "{0} opties geselecteerd",
        "showMonthAfterYear": false,
        "startsWith": "Begint met",
        "strong": "Sterk",
        "today": "Vandaag",
        "upload": "Upload",
        "weak": "Zwak",
        "weekHeader": "Wk",
        "aria": {
          "cancelEdit": "Annuleer bewerking",
          "close": "Sluit",
          "collapseLabel": "Instorten",
          "collapseRow": "Rij ingeklapt",
          "editRow": "Bewerk rij",
          "expandLabel": "Uitbreiden",
          "expandRow": "Rij uitgeklapt",
          "falseLabel": "Onwaar",
          "filterConstraint": "Filterbeperking",
          "filterOperator": "Filteroperator",
          "firstPageLabel": "Eerste pagina",
          "gridView": "Roosterweergave",
          "hideFilterMenu": "Verberg filtermenu",
          "jumpToPageDropdownLabel": "Spring naar paginamenu",
          "jumpToPageInputLabel": "Spring naar pagina-invoer",
          "lastPageLabel": "Laatste pagina",
          "listView": "Lijstweergave",
          "moveAllToSource": "Verplaats alle naar bron",
          "moveAllToTarget": "Verplaats alle naar doel",
          "moveBottom": "Verplaats naar beneden",
          "moveDown": "Verplaats omlaag",
          "moveTop": "Verplaats naar boven",
          "moveToSource": "Verplaats naar bron",
          "moveToTarget": "Verplaats naar doel",
          "moveUp": "Verplaats omhoog",
          "navigation": "Navigatie",
          "next": "Volgende",
          "nextPageLabel": "Volgende pagina",
          "nullLabel": "Niet geselecteerd",
          "otpLabel": "Voer een eenmalig wachtwoordteken {0} in",
          "pageLabel": "Pagina {page}",
          "passwordHide": "Verberg wachtwoord",
          "passwordShow": "Laat wachtwoord zien",
          "previous": "Vorige",
          "previousPageLabel": "Vorige pagina",
          "removeLabel": "Verwijderen",
          "rotateLeft": "Draai linksom",
          "rotateRight": "Draai rechtsom",
          "rowsPerPageLabel": "Rijen per pagina",
          "saveEdit": "Sla bewerking op",
          "scrollTop": "Scroll naar boven",
          "selectAll": "Alle opties geselecteerd",
          "selectLabel": "Selecteer",
          "selectRow": "Rij geselecteerd",
          "showFilterMenu": "Toon filtermenu",
          "slide": "Dia",
          "slideNumber": "{slideNumber}",
          "star": "1 ster",
          "stars": "{star} sterren",
          "trueLabel": "Waar",
          "unselectAll": "Alle opties gedeselecteerd",
          "unselectLabel": "Deselecteer",
          "unselectRow": "Rij gedeselecteerd",
          "zoomImage": "Zoom afbeeling",
          "zoomIn": "Zoom in",
          "zoomOut": "Zoom uit"
        }
    }
})

const pinia = createPinia()

app.use(AppState)
app.use(ConfirmationService)
app.use(ToastService)
app.use(pinia)

app.component('Button', Button)
app.component('InputText', InputText)
app.component('Select', Select)
app.component('Toast', Toast)
app.component('Menubar', Menubar)
app.component('Message', Message)

app.mount('#app')
