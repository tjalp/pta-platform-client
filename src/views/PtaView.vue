<template>
    <div>
        <ProgressBar v-if="ptaData === null || types === null || durations === null || resultTypes === null" mode="indeterminate" style="height: 6px" />
        <div v-else class="flex">
            <div>
                <Menu :model="menuItems">
                    <template #item="{ item, props }">
                        <RouterLink v-if="item.id" :to="{ name: 'pta-test', params: { id: ptaData.id, testId: item.id } }">
                            <a v-bind="props.action">
                                <span :class="item.icon" />
                                <span class="ml-2">{{ item.label }}</span>
                            </a>
                        </RouterLink>
                        <RouterLink v-if="item.url" :to="{ name: item.url }">
                            <a v-bind="props.action">
                                <span :class="item.icon" />
                                <span class="ml-2">{{ item.label }}</span>
                            </a>
                        </RouterLink>
                    </template>
                </Menu>
            </div>
            <!-- <div class="flex">
                <Listbox v-if="ptaData.tests" v-model="selectedTest" :options="ptaData.tests" optionLabel="id" optionValue="id" />
            </div> -->
            <div class="flex flex-col ml-4 gap-4 flex-grow max-w-full overflow-x-auto">
                <Toolbar>
                    <template #start>
                        <Button v-if="hasEditRights" icon="pi pi-plus" class="mr-2" severity="secondary" label="Toets toevoegen" text @click="addTest" />
                    </template>
                    <template #center>
                        <Message severity="info">{{ ptaData.name + ' (' + ptaData.level + ', ' + ptaData.year + ')' }}</Message>
                    </template>
                    <template #end>
                        <div class="flex gap-4">
                            <Button icon="pi pi-download" label="Exporteren" text severity="secondary" as="a" :href="`https://pta.tjalp.net/api/pta/${ptaData.id}/export`" target="_blank" rel="noopener" />
                            <Button v-if="hasEditRights" icon="pi pi-save" class="mr-2" :loading="saving" label="Opslaan" @click="save" text />
                            <Button :icon="hasEditRights ? 'pi pi-fw pi-eye' : 'pi pi-fw pi-pencil'" :label="hasEditRights ? 'Bekijken' : 'Bewerken'" @click="hasEditRights = !hasEditRights" severity="info" text />
                        </div>
                    </template>
                </Toolbar>
                <div class="card">
                    <RouterView :ptaData :types :durations :resultTypes :hasEditRights @update-ptaData="updatePtaData" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useToast } from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const ptaData = ref(null)
const saving = ref(false)
const hasEditRights = ref(false)
const types = ref(null)
const durations = ref(null)
const resultTypes = ref(['Cijfer', 'O/V/G']) // Todo fetch from API
const isEdited = ref(false) // Todo make this actually do something
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

function updatePtaData(data) {
    ptaData.value = data
}

function addTest() {    
    let lastTestId = Math.max(...ptaData.value.tests.map(test => test.id), 0)

    if (lastTestId === 0) {
        const match = ptaData.value.level.match(/\d+/)
        if (!match) {
            toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het nieuwe toetsnummer niet bepalen. Neem contact op met een administrator', life: 10000 })
            return
        }
        lastTestId = parseInt(match + '00', 10)
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
        const response = await fetch(`https://pta.tjalp.net/api/pta/${id}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        const data = await response.json()
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
    if (isEdited.value || saving.value) {
        event.preventDefault();
        event.returnValue = '';
    }
};

onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    fetchTypes();
    fetchDurations();
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
    if (isEdited.value || saving.value) {
        if (confirm('Er zijn onopgeslagen wijzigingen. Weet je zeker dat je de pagina wilt verlaten?')) {
            next();
        } else {
            next(false);
        }
    } else {
        next();
    }
})
</script>