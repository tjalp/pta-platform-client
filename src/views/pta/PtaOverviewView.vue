<template>
    <ConfirmPopup />
    <div>
        <h1 class="text-2xl mb-4">Overzicht</h1>
        <span v-if="periods.length !== 0">Dit schooljaar start in week {{periods.at(0).startWeek}}</span>
        <DataTable :value="ptaData.tests" scrollable>
            <template #header>
                <div class="flex justify-between items-center">
                    <MultiSelect :modelValue="selectedColumns" :options="columns" :maxSelectedLabels="3" filter optionLabel="header" @update:modelValue="onToggle"
                        placeholder="Selecteer Kolommen" class="w-full md:w-96" />
                    <Button v-if="isEditMode" icon="pi pi-sort-alt" label="Sorteren" severity="secondary" @click="confirmSort($event)" :loading="loadingPeriods" />
                </div>
            </template>
            <Column field="id" header="Toetsnummer">
                <template #body="slotProps">
                    <RouterLink :to="{ name: 'pta-test', params: { testId: slotProps.data.id } }">
                        {{ slotProps.data.id }}
                    </RouterLink>
                </template>
            </Column>
            <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header" :key="col.field + '_' + index" :class="{'min-w-96': col.field === 'description' || col.field === 'tools'}">
                <template v-if="col.field === 'resitable'" #body="slotProps">
                    {{ slotProps.data?.resitable ? 'Ja' : 'Nee' }}
                </template>
                <template v-if="col.field === 'type'" #body="slotProps">
                    {{ types.find(type => type.toLowerCase() === slotProps.data?.type?.toLowerCase()) }}
                </template>
                <template v-if="col.field === 'resultType'" #body="slotProps">
                    {{ resultTypes.find(type => type.toLowerCase() === slotProps.data?.resultType?.toLowerCase()) }}
                </template>
                <template v-if="col.field === 'additionalTools'" #body="slotProps">
                    {{ slotProps.data?.additionalTools?.sort().map(tool => ptaData.additionalTools[tool]).join(', ') }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import {onMounted, ref} from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmPopup from 'primevue/confirmpopup';
import {calculateWeeks, getWeekFromString} from "@/config/periods.js";

const emit = defineEmits(['update-ptaData'])
const toast = useToast()
const confirm = useConfirm()
const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    },
    types: {
        type: Array,
        required: true
    },
    resultTypes: {
        type: Array,
        required: true
    },
    isEditMode: {
        type: Boolean,
        required: true
    }
})

const loadingPeriods = ref(true)
const periods = ref([])
const columns = ref([
    { header: 'Week', field: 'week', default: true },
    { header: 'Subdomein', field: 'subdomain', default: false },
    { header: 'Omschrijving', field: 'description', default: true },
    { header: 'Afnamevorm', field: 'type', default: false },
    { header: 'Beoordeling', field: 'resultType', default: false },
    { header: 'Herkansbaar', field: 'resitable', default: false },
    { header: 'POD', field: 'podWeight', default: true },
    { header: 'PTA', field: 'ptaWeight', default: true },
    { header: 'Hulpmiddelen' , field: 'additionalTools', default: false }
])
const selectedColumns = ref(columns.value.filter(col => col.default));
const onToggle = (val) => {
    selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const confirmSort = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Wil je alle toetsen sorteren? Dit verandert toetsnummers.',
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: 'Annuleren',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Sorteren'
        },
        accept: sortTests
    });
};

function sortTests() {
    const baseId = props.ptaData.level.year * 100
    props.ptaData.tests.sort((a, b) => {
        const aWeek = getWeekFromString(periods.value, a.week);
        const bWeek = getWeekFromString(periods.value, b.week);

        const aWeekFromStart = calculateWeeks(periods.value.at(0).startWeek, aWeek)
        const bWeekFromStart = calculateWeeks(periods.value.at(0).startWeek, bWeek)

        // sort based on weeks from start, with lower being first
        if (aWeekFromStart < bWeekFromStart) return -1;
        if (aWeekFromStart > bWeekFromStart) return 1;

        return 0;
    }).forEach((test, index) => {
        test.id = baseId + index + 1;
    });
    toast.add({ severity: 'success', summary: 'Succes', detail: `De toetsen zijn gesorteerd`, life: 3000 });
}

onMounted(() => {
  fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/periods`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      periods.value = data;
    })
    .catch(error => {
      console.error('Error fetching periods:', error);
    }).finally(() => {
      loadingPeriods.value = false;
    });
})
</script>