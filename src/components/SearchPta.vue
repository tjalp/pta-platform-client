<template>
    <Button label="PTA Zoeken" icon="pi pi-search" @click="dialogVisible = true" />
    <Dialog v-model:visible="dialogVisible" modal header="PTA Zoeken" :style="{ width: '25rem' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-4">Vul de betreffende velden in.</span>
        <div class="flex justify-center gap-4 mb-4">
            <SelectButton v-model="view" :options="viewOptions" aria-labelledby="basic" />
        </div>
        <div v-if="view == 'Bewerken'">
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Afkorting</label>
                <InputText id="username" v-model="username" class="flex-auto" autocomplete="off" placeholder="Afkorting" />
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="password" class="font-semibold w-24">Wachtwoord</label>
                <Password id="password" v-model="password" class="flex-auto" autocomplete="off" :feedback="false" placeholder="Wachtwoord" />
            </div>
        </div>
        <div class="flex items-center gap-4 mb-4">
            <label for="subject" class="font-semibold w-24">Vak</label>
            <Select id="subject" v-model="subject" :options="filteredSubjectNames" filter :loading="filteredSubjectNames == null" placeholder="Selecteer een Vak" class="flex-auto" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="level" class="font-semibold w-24">Niveau</label>
            <Select id="level" v-model="level" :options="filteredLevels" :loading="levels == null" placeholder="Selecteer een Niveau" class="flex-auto" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Annuleren" severity="secondary" @click="dialogVisible = false" />
            <Button type="button" label="Zoeken" icon="pi pi-search" @click="search" :loading="loading" />
        </div>
    </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import { useToast } from 'primevue/usetoast'
import { useRouter } from "vue-router";

const toast = useToast()
const router = useRouter()

let subjects = []

const dialogVisible = ref(true);
const viewOptions = ref(['Bekijken', 'Bewerken'])
const filteredSubjectNames = ref(null)
const filteredLevels = ref(null)
const levels = ref(['6 VWO', '5 VWO', '4 VWO', '5 HAVO', '4 HAVO', '4 MAVO', '3 MAVO'])

const view = ref('Bekijken')
const username = ref(null)
const password = ref(null)
const subject = ref(null)
const level = ref(null)
const loading = ref(false)

function getSubjects(responsible) {
    return subjects.filter(subject => subject['responsible'].toLowerCase() === responsible.toLowerCase())
}

function filterSubjects() {
    let matchingSubjects = subjects
    if (view.value === 'Bewerken' && username.value) {
        matchingSubjects = getSubjects(username.value)
        filteredSubjectNames.value = matchingSubjects.map(subject => subject['name'])
    }

    const subjectNames = [...new Set(matchingSubjects.map(subject => subject['name']))]
    filteredSubjectNames.value = subjectNames.sort()
    subject.value = null
}

function filterLevels() {
    if (view.value === 'Bewerken' && username.value && subject.value) {
        const matchingSubjects = getSubjects(username.value)
        filteredLevels.value = matchingSubjects.filter(s => s['name'] === subject.value).map(subject => subject['level'].toUpperCase()).sort()
        level.value = null
        return
    }

    filteredLevels.value = subjects.filter(s => s['name'] === subject.value).map(subject => subject['level'].toUpperCase()).sort()
    
    if (filteredLevels.value.length !== 1) {
        level.value = null
        return
    }
    
    level.value = filteredLevels.value[0]
}

function search() {
    loading.value = true

    fetch('https://pta.tjalp.net/api/pta/search?name=' + encodeURIComponent(subject.value) + '&level=' + level.value)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to search PTA')
            }
            return response.json()
        }).then(data => {
            if (!data) {
                toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet vinden. Probeer het later opnieuw', life: 5000 })
                return
            }
            toast.add({ severity: 'success', summary: 'Succes', detail: 'Het PTA is gevonden', life: 5000 })
            router.push({ name: 'pta', params: { id: data[0]['id'] } })
        }).catch(error => {
            toast.add({ severity: 'error', summary: 'Foutmelding', detail: `Er trad een fout op. Probeer het later opnieuw (${error.message})`, life: 5000 })
            console.error(error)
        }).finally(() => {
            loading.value = false
            dialogVisible.value = false
        })
}

watch(view, () => filterSubjects())
watch(username, () => filterSubjects())
watch(subject, () => filterLevels())

fetch('https://pta.tjalp.net/api/defaults/subjects')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get subjects')
        }
        return response.json()
    }).then(data => {
        subjects = data
        filterSubjects()
    }).catch(error => {
        filteredSubjectNames.value = []
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon de beschikbare vakken niet ophalen. Probeer het later opnieuw' })
        console.error(error)
    })
</script>