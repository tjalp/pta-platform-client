<template>
    <div>
        <ProgressBar v-if="ptaData === null || types === null || durations === null || resultTypes === null" mode="indeterminate" style="height: 6px" />
        <div v-else>
            <Message v-if="!ptaData.finished" severity="warn" class="mb-4">
                <strong>Let op:</strong> Dit PTA is nog niet afgerond. Dit betekent dat het PTA nog niet definitief is en dat er nog wijzigingen kunnen worden aangebracht.
            </Message>
            <div class="flex">
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
                            <div class="flex gap-4 items-center">
<!--                                <Button icon="pi pi-download" label="Exporteren" text severity="secondary" as="a" :href="`${import.meta.env.VITE_API_HOST}/api/pta/${ptaData.id}/export`" target="_blank" rel="noopener" />-->
                                <Button v-if="isEditMode" icon="pi pi-check" class="mr-2" :loading="saving" label="Afronden" @click="confirmFinish" text />
                                <Button v-if="isEditMode" icon="pi pi-save" class="mr-2" :loading="saving" label="Opslaan" @click="save" text />
                                <label v-if="ptaData.finished && hasEditRights" for="finishedStatus" class="font-semibold">Afrondstatus</label>
                                <ToggleSwitch v-if="ptaData.finished && hasEditRights" id="finishedStatus" v-model="ptaData.finished" @change="save" />
                                <Button v-if="hasEditRights || isEditMode" :icon="isEditMode ? 'pi pi-fw pi-eye' : 'pi pi-fw pi-pencil'" :label="isEditMode ? 'Bekijken' : 'Bewerken'" @click="isEditMode = !isEditMode" severity="info" text />
                            </div>
                        </template>
                    </Toolbar>
                    <div class="card">
                        <RouterView :ptaData :types :durations :periods :defaultTools :resultTypes :isEditMode @update-ptaData="updatePtaData" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {useToast} from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar';
import Toolbar from 'primevue/toolbar';
import Drawer from 'primevue/drawer';
import ToggleSwitch from "primevue/toggleswitch";
import PtaTestViewMenu from '@/components/PtaTestViewMenu.vue';
import {isEqual} from "lodash";
import {useUserStore} from "@/stores/user.js";
import {getUserPermissions} from "@/config/roles.js";
import {useConfirm} from "primevue/useconfirm";
import {calculateWeeks, getWeekFromString} from "@/config/periods.js";
import { cloneDeep } from "lodash";

const route = useRoute()
const router = useRouter()
const toast = useToast()
const userStore = useUserStore()
const confirm = useConfirm()

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

    if (!permissions.includes('pta:edit')) {
        return false
    }

    const ptaDataValue = ptaData.value

    if (ptaDataValue === null) {
        return false
    }

    return !ptaDataValue.finished && ptaDataValue.responsible.toLowerCase() === user.abbreviation.toLowerCase();
})
const types = ref(null)
const durations = ref(null)
const periods = ref([])
const defaultTools = ref([])
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
  console.log('wasEdited', fetchedPtaData.value, ptaData.value)
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

    ptaData.value.tests.push({ id: newTestId, resitable: false, tools: [] })

    router.push({ name: 'pta-test', params: { id: ptaData.value.id, testId: newTestId } })

    toast.add({ severity: 'success', summary: 'Succes', detail: `Nieuwe toets met toetsnummer ${newTestId} toegevoegd`, life: 3000 })
}

function isSorted() {
  const baseId = ptaData.value.level.year * 100;

  const sortedTests = cloneDeep(ptaData.value.tests).sort((a, b) => {
    if (!a.week) return 0;
    if (!b.week) return 0;

    const aWeek = getWeekFromString(periods.value, a.week);
    const bWeek = getWeekFromString(periods.value, b.week);

    const aWeekFromStart = calculateWeeks(periods.value.at(0).startWeek, aWeek);
    const bWeekFromStart = calculateWeeks(periods.value.at(0).startWeek, bWeek);

    if (aWeekFromStart < bWeekFromStart) return -1;
    if (aWeekFromStart > bWeekFromStart) return 1;

    return 0;
  });

  return ptaData.value.tests.every((test, index) => test.id === sortedTests[index].id);
}

function validate() {
    const data = ptaData.value
    const errors = []

    // Whether the weights add up to 100%
    const weightsTotal = data.weights.reduce((acc, weight) => acc + weight, 0)

    if (weightsTotal !== 100) {
        errors.push('De gewichten moeten optellen tot 100%')
    }

    if (!isSorted()) {
        errors.push('De toetsen zijn niet gesorteerd. Sorteer de toetsen voordat je het PTA opslaat.')
    }

    for (const test of data.tests) {
        if (!test.week) {
            errors.push(`Toets ${test.id} heeft geen week opgegeven.`)
        }
        if (!test.subdomain) {
            errors.push(`Toets ${test.id} heeft geen subdomein opgegeven.`)
        }
        if (!test.description) {
            errors.push(`Toets ${test.id} heeft geen beschrijving opgegeven.`)
        }
        if (!test.type) {
            errors.push(`Toets ${test.id} heeft geen afnamevorm opgegeven.`)
        }
        if (!test.resultType) {
            errors.push(`Toets ${test.id} heeft geen beoordeling opgegeven.`)
        } else if (test.resultType.toLowerCase() === 'o/v/g') {
            test.ptaWeight = 0
            test.podWeight = 0
        }
        if (!test.podWeight === undefined || test.podWeight === null) {
            errors.push(`Toets ${test.id} heeft geen POD opgegeven.`)
        }
        if (!test.ptaWeight === undefined || test.ptaWeight === null) {
            errors.push(`Toets ${test.id} heeft geen PTA opgegeven.`)
        }
        if (test.resitable === undefined || test.resitable === null) {
            errors.push(`Toets ${test.id} heeft geen herkansbaar opgegeven.`)
        }
        if (!test.time && !test.timeElse) {
            errors.push(`Toets ${test.id} heeft geen afnameduur opgegeven.`)
        }
    }

    if (errors.length > 0) {
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: errors.join('\n'), life: 30000 })
        return false
    }

    return true
}

function save() {
    if (!validate()) return;

    saving.value = true

    fetch(`${import.meta.env.VITE_API_HOST}/api/pta/${ptaData.value.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(ptaData.value)
    }).then((response) => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    }).then((data) => {
        toast.add({ severity: 'success', summary: 'Succes', detail: 'PTA is succesvol opgeslagen', life: 5000 })
        fetchedPtaData.value = data
        ptaData.value = data
    }).catch((error) => {
        console.error('Error:', error)
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet opslaan (' + error.message + '). Controleer alle invulvelden en probeer het dan opnieuw. Blijft het probleem bestaan? Neem dan contact op met de directie.', life: 30000 })
    }).finally(() => {
        saving.value = false
    })
}

const confirmFinish = () => {
    confirm.require({
        header: 'Afronden PTA',
        message: 'Weet je zeker dat je het PTA wilt afronden? Dit kan niet ongedaan worden gemaakt door docenten.',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Annuleren',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Afronden'
        },
        accept: () => {
            if (!validate()) {
                toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'PTA kan niet worden afgerond. Controleer de invoer.', life: 5000 })
                return
            }

            ptaData.value.finished = true

            save()

            isEditMode.value = false
        },
        reject: () => {
            toast.add({ severity: 'info', summary: 'Annuleren', detail: 'Afronden geannuleerd', life: 3000 })
        }
    })
}

const fetchPtaData = async (id) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/${id}`)
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        const data = await response.json()
        fetchedPtaData.value = cloneDeep(data)
        ptaData.value = data
    } catch (error) {
        console.error('Error:', error)
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet ophalen. Probeer het later opnieuw (' + error.message + ')', life: 5000 })
    }
}

const fetchTypes = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/types`);
        const data = await response.json();
        types.value = data;
    } catch (error) {
        console.error('Error fetching types:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnamevormen', detail: 'Er is een fout opgetreden bij het ophalen van de afnamevormen.' });
    }
};

const fetchDurations = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/durations`);
        const data = await response.json();
        durations.value = data;
    } catch (error) {
        console.error('Error fetching durations:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnameduur', detail: 'Er is een fout opgetreden bij het ophalen van de afnameduur.' });
    }
};

const fetchPeriods = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/periods`);
        const data = await response.json();
        periods.value = data;
    } catch (error) {
        console.error('Error fetching periods:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van periodes', detail: 'Er is een fout opgetreden bij het ophalen van de periodes.' });
    }
};

const fetchTools = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/tools`);
        const data = await response.json();
        defaultTools.value = data;
    } catch (error) {
        console.error('Error fetching tools:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van hulpmiddelen', detail: 'Er is een fout opgetreden bij het ophalen van de hulpmiddelen.' });
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
    fetchPeriods();
    fetchTools();
});

onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
})

onBeforeRouteLeave((to, from, next) => {
    if (wasEdited() || saving.value) {
        if (window.confirm('Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je de pagina wilt verlaten?')) {
            next();
        } else {
            next(false);
        }
    } else {
        next();
    }
})
</script>