<template>
    <!-- <Button label="PTA Zoeken" icon="pi pi-search" @click="dialogVisible = true" /> -->
    <Dialog modal header="PTA Zoeken" :style="{ width: '25rem' }">
        <Form v-slot="$form" :resolver :initialValues @submit="onFormSubmit" class="grid gap-4 w-full">
          <Message v-if="errorMessage" severity="error">{{errorMessage}}</Message>
          <span class="text-surface-500 dark:text-surface-400 block">Vul de betreffende velden in.</span>
          <div v-if="userStore.user" class="flex justify-between items-center">
            <label for="filterSelf" class="font-semibold">Alleen eigen vakken weergeven</label>
            <ToggleSwitch id="filterSelf" v-model="filterSelf" />
          </div>
          <div class="flex items-center">
            <label for="subject" class="font-semibold w-24">Vak</label>
            <Select id="subject" name="subject" v-model="subject" :options="filteredSubjects" required filter :loading="subjects.length === 0" placeholder="Selecteer een Vak" class="flex-auto" />
          </div>
          <div class="flex items-center">
            <label for="level" class="font-semibold w-24">Niveau</label>
            <Select id="level" name="level" v-model="level" :options="filteredLevels" required :loading="levels == null" placeholder="Selecteer een Niveau" class="flex-auto" />
          </div>
          <div class="flex items-center">
            <label for="year" class="font-semibold w-24">Jaar</label>
            <DatePicker id="year" name="year" view="year" dateFormat="yy" showIcon iconDisplay="input" class="flex-auto" placeholder="Selecteer een Jaar" />
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Annuleren" severity="secondary" @click="$emit('manualVisibilityUpdate', false)" />
            <Button type="submit" label="Zoeken" icon="pi pi-search" :loading="loading" />
          </div>
        </Form>
    </Dialog>
</template>

<script setup>
import {computed, ref} from "vue";
import Dialog from "primevue/dialog";
import {useToast} from 'primevue/usetoast'
import {useRouter} from "vue-router";
import DatePicker from "primevue/datepicker";
import ToggleSwitch from "primevue/toggleswitch";
import {Form} from "@primevue/forms";
import {useUserStore} from "@/stores/user.js";

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['manualVisibilityUpdate'])

let subjects = []

const levels = ref(['6 VWO', '5 VWO', '4 VWO', '5 HAVO', '4 HAVO', '4 MAVO', '3 MAVO'])

const subject = ref(null)
const level = ref(null)
const loading = ref(false)
const filterSelf = ref(true)
const errorMessage = ref(null)

const filteredSubjects = computed(() => {
    let matchingSubjects = subjects;

    console.log("updated", userStore.user, filterSelf);

    if (userStore.user && filterSelf.value) {
        matchingSubjects = getSubjects(userStore.user.abbreviation)
    }

    const subjectNames = [...new Set(matchingSubjects.map(subject => subject['name']))]
    // Sort the subject names alphabetically, non-case sensitive
    return subjectNames.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
})

const filteredLevels = computed(() => {
    if (!subject.value) return []

    let matchingSubjects = subjects.filter(s => s['name'] === subject.value);

    if (userStore.user && filterSelf.value) {
        matchingSubjects = matchingSubjects.filter(s => s['responsible'].toLowerCase() === userStore.user.abbreviation.toLowerCase())
    }

    const levels = matchingSubjects.map(subject => subject['level'].toUpperCase()).sort()

    if (levels.length !== 1) {
        level.value = null
    } else {
        level.value = levels[0]
    }

    return levels
})

const initialValues = ref({
    subject: null,
    level: null,
    year: new Date()
})

const resolver = ({ values }) => {
    const errors = {}

    if (!values.subject) {
        errors.subject = [{ message: 'Vak is verplicht.' }]
    }

    if (!values.level) {
        errors.level = [{ message: 'Niveau is verplicht.' }]
    }

    if (!values.year) {
        errors.year = [{ message: 'Jaar is verplicht.' }]
    }

    return {
        errors
    }
}

const onFormSubmit = (event) => {
    if (!event.valid) return

    loading.value = true
    errorMessage.value = null

    const subjectName = event.states.subject.value
    const level = event.states.level.value
    const levelYear = level.split(' ')[0]
    const levelType = level.split(' ')[1]
    const year = event.states.year.value

    fetch(`${import.meta.env.VITE_API_HOST}/api/pta/find?name=` + encodeURIComponent(subjectName) + '&levelYear=' + levelYear + '&levelType=' + levelType + '&startYear=' + year.getFullYear())
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    errorMessage.value = 'Geen PTA gevonden met deze gegevens'
                    return
                }
                throw new Error(response.status + ' ' + response.statusText)
            }
            return response.json()
        }).then(data => {
            if (!data) {
              toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet vinden. Probeer het later opnieuw', life: 5000 })
              return
            }
            toast.add({ severity: 'success', summary: 'Succes', detail: 'Het PTA is gevonden', life: 5000 })
            emit('manualVisibilityUpdate', false)
            errorMessage.value = null
            router.push({ name: 'pta-overview', params: { id: data[0]['id'] } })
        }).catch(error => {
            toast.add({ severity: 'error', summary: 'Foutmelding', detail: `Er trad een fout op. Probeer het later opnieuw (${error.message})`, life: 5000 })
        }).finally(() => {
            loading.value = false
        })
}

function getSubjects(responsible) {
    console.log('getting subjects for', responsible, subjects)
    return subjects.filter(subject => subject['responsible'].toLowerCase() === responsible.toLowerCase())
}

fetch('https://pta.tjalp.net/api/defaults/subjects')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get subjects')
        }
        return response.json()
    }).then(data => {
        subjects = data
        // filterSubjects()
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon de beschikbare vakken niet ophalen. Probeer het later opnieuw' })
        console.error(error)
    })
</script>