<template>
    <div>
        <ProgressBar v-if="ptaData === null" mode="indeterminate" style="height: 6px" />
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
            <div class="flex flex-col ml-4 gap-4 flex-grow">
                <div>
                    <Toolbar>
                        <template #start>
                            <Button v-if="hasEditRights" icon="pi pi-plus" class="mr-2" severity="secondary" label="Toets toevoegen" text @click="addTest" />
                        </template>
                        <template #center>
                            <Message severity="info">{{ ptaData.name + ' (' + ptaData.level + ', ' + ptaData.year + ')' }}</Message>
                        </template>
                        <template #end>
                            <div class="flex gap-4">
                                <Button v-if="hasEditRights" icon="pi pi-save" class="mr-2" :loading="saving" label="Opslaan" @click="save" text />
                                <Button :icon="hasEditRights ? 'pi pi-fw pi-eye' : 'pi pi-fw pi-pencil'" :label="hasEditRights ? 'Bekijken' : 'Bewerken'" @click="hasEditRights = !hasEditRights" severity="info" text />
                            </div>
                        </template>
                    </Toolbar>
                </div>
                <div class="card">
                    <RouterView :ptaData :hasEditRights @update-ptaData="updatePtaData" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
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

// watch(() => route.params.testId, (testId) => {
//     tests.value.forEach(item => {
//         item.class = item.id.toString().includes(testId) ? 'p-menuitem-active' : '';
//     });
// }, { immediate: true })

watch(() => route.params.id, (id) => {
    // todo improve error handling
    ptaData.value = null
    fetch(`https://pta.tjalp.net/api/pta/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(data => ptaData.value = data)
        .catch(error => {
            console.error('Error:', error);
            toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet ophalen. Probeer het later opnieuw (' + error.message + ')', life: 5000 })
        })
}, { immediate: true })

// Update menu items when ptaData changes
watch(ptaData, (data) => {
    if (data === null) {
        return;
    }

    const testCategory = menuItems.value.find(item => item.label === 'Toetsen')
    
    if (!testCategory) {
        return;
    }

    testCategory.items = data.tests.map(test => {
        return { label: test.id.toString(), icon: 'pi pi-fw pi-calendar', id: test.id }
    })

    console.log(testCategory.items)
}, { deep: true })
</script>

<!-- <style>
.p-menuitem-active {
    background-color: aqua;
}
</style> -->