<template>
    <div>
        <ProgressBar v-if="ptaData === null || types === null || durations === null || resultTypes === null" mode="indeterminate" style="height: 6px" />
        <div v-else class="flex">
            <div class="hidden lg:block mr-4">
                <PtaTestViewMenu :ptaData :isEditMode :menuItems @addTest="addTest" />
            </div>
            <!-- <div class="flex">
                <Listbox v-if="ptaData.tests" v-model="selectedTest" :options="ptaData.tests" optionLabel="id" optionValue="id" />
            </div> -->
            <div class="flex flex-col gap-4 grow max-w-full overflow-x-auto">
                <Toolbar>
                    <template #start>
                        <Drawer v-model:visible="drawerVisible" :header="ptaData.name">
                            <PtaTestViewMenu :ptaData :isEditMode :menuItems @addTest="addTest" />
                        </Drawer>
                        <div class="lg:hidden">
                            <Button icon="pi pi-bars" class="mr-2" text @click="drawerVisible = true" />
                        </div>
                        <!-- <Button v-if="hasEditRights" icon="pi pi-plus" class="mr-2" severity="secondary" label="Toets toevoegen" text @click="addTest" /> -->
                    </template>
                    <template #center>
                        <Message severity="info">{{ ptaData.name + ' (' + ptaData.level.year + " " + ptaData.level.type + ', ' + ptaData.startYear + '-' + (ptaData.startYear + 1) + ')' }}</Message>
                    </template>
                    <template #end>
                        <div class="flex gap-4">
                            <Button icon="pi pi-download" label="Exporteren" text severity="secondary" as="a" :href="`https://pta.tjalp.net/api/pta/${ptaData.id}/export`" target="_blank" rel="noopener" />
                            <Button v-if="isEditMode" icon="pi pi-save" class="mr-2" :loading="saving" label="Opslaan" @click="save" text />
                            <Button v-if="hasEditRights || isEditMode" :icon="isEditMode ? 'pi pi-fw pi-eye' : 'pi pi-fw pi-pencil'" :label="isEditMode ? 'Bekijken' : 'Bewerken'" @click="isEditMode = !isEditMode" severity="info" text />
                        </div>
                    </template>
                </Toolbar>
                <div class="card">
                    <RouterView :ptaData :types :durations :resultTypes :isEditMode @update-ptaData="updatePtaData" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {useToast} from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar';
import Toolbar from 'primevue/toolbar';
import Drawer from 'primevue/drawer';
import PtaTestViewMenu from '@/components/PtaTestViewMenu.vue';
import {isEqual} from "lodash";
import {useUserStore} from "@/stores/user.js";
import {getUserPermissions} from "@/config/rolePermissions.js";

const route = useRoute()
const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const fetchedPtaData = ref(null)
const ptaData = ref(null)
const drawerVisible = ref(false)
const saving = ref(false)
const isEditMode = ref(false)
const hasEditRights = computed(() => {
    const user = userStore.user

    if (user === null || ptaData === null) {
        return false
    }

    const permissions = getUserPermissions(user)

    if (permissions.includes('pta:edit:all')) {
        return true
    }

    console.log('not override', permissions)

    if (!permissions.includes('pta:edit')) {
        return false
    }

    const ptaDataValue = ptaData.value

    console.log('ptaDataValue', ptaDataValue)

    if (ptaDataValue === null) {
        return false
    }

    console.log(ptaDataValue.responsible, user.abbreviation)

    return ptaDataValue.responsible.toLowerCase() === user.abbreviation.toLowerCase();
})
const types = ref(null)
const durations = ref(null)
const resultTypes = ref(['Cijfer', 'O/V/G']) // Todo fetch from API
const menuItems = ref([
    {
        label: 'Pagina\'s',
        items: [
            { label: "Overzicht", icon: 'pi pi-fw pi-table', url: 'pta-overview' },
            { label: "Wegingen", icon: 'pi pi-fw pi-chart-bar', url: 'pta-weights' }
        ]
    },
    {
        label: 'Toetsen',
        items: []
    }
])

function wasEdited() {
  return !isEqual(fetchedPtaData.value, ptaData.value)
}

function updatePtaData(data) {
    ptaData.value = data
}

function addTest() {    
    let lastTestId = Math.max(...ptaData.value.tests.map(test => test.id), 0)

    if (lastTestId === 0) {
        const year = ptaData.value.level.year
        lastTestId = year * 100
    }

    const newTestId = lastTestId + 1

    ptaData.value.tests.push({ id: newTestId })

    router.push({ name: 'pta-test', params: { id: ptaData.value.id, testId: newTestId } })

    toast.add({ severity: 'success', summary: 'Succes', detail: `Nieuwe toets met toetsnummer ${newTestId} toegevoegd`, life: 3000 })
}

function save() {
    saving.value = true

    setTimeout(() => {
        saving.value = false
        toast.add({ severity: 'info', summary: 'Info', detail: 'Opslaan is nog niet geïmplementeerd', life: 5000 })
    }, 1000)
}

const fetchPtaData = async (id) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/${id}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        const data = await response.json()
        fetchedPtaData.value = data
        ptaData.value = data
    } catch (error) {
        console.error('Error:', error)
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet ophalen. Probeer het later opnieuw (' + error.message + ')', life: 5000 })
    }
}

const fetchTypes = async () => {
    try {
        const response = await fetch('https://pta.tjalp.net/api/defaults/types');
        const data = await response.json();
        types.value = data;
    } catch (error) {
        console.error('Error fetching types:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnamevormen', detail: 'Er is een fout opgetreden bij het ophalen van de afnamevormen.' });
    }
};

const fetchDurations = async () => {
    try {
        const response = await fetch('https://pta.tjalp.net/api/defaults/durations');
        const data = await response.json();
        durations.value = data;
    } catch (error) {
        console.error('Error fetching durations:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnameduur', detail: 'Er is een fout opgetreden bij het ophalen van de afnameduur.' });
    }
};

watch(() => route.params.id, (id) => {
    ptaData.value = null
    fetchPtaData(id)
}, { immediate: true })

watch(ptaData, (data, oldData) => {
    if (data === null) {
        return;
    }

    if (oldData !== null) {
        // See todo above
        // isEdited.value = true
    }

    const testCategory = menuItems.value.find(item => item.label === 'Toetsen')
    
    if (!testCategory) {
        return;
    }

    testCategory.items = data.tests.map(test => {
        return { label: test.id.toString(), icon: 'pi pi-fw pi-calendar', id: test.id }
    })
}, { deep: true })

const handleBeforeUnload = (event) => {
    if (wasEdited() || saving.value) {
        event.preventDefault();
        event.returnValue = '';
    }
};

onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    fetchTypes();
    fetchDurations();
});

onBeforeRouteLeave((to, from, next) => {
    if (wasEdited || saving.value) {
        if (confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je de pagina wilt verlaten?')) {
            next();
        } else {
            next(false);
        }
    } else {
        next();
    }
})
</script>