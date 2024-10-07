<template>
    <div>
        <DataTable :value="ptaData.tests" scrollable>
            <template #header>
                <div class="flex justify-between items-center">
                    <MultiSelect :modelValue="selectedColumns" :options="columns" :maxSelectedLabels="3" filter optionLabel="header" @update:modelValue="onToggle"
                        placeholder="Selecteer Kolommen" class="w-full md:w-96" />
                    <Button icon="pi pi-sort-alt" label="Sorteren" severity="secondary" @click="sortTests" :disabled="sorting" />
                </div>
            </template>
            <Column field="id" header="Nummer">
                <template #body="slotProps">
                    <RouterLink :to="{ name: 'pta-test', params: { testId: slotProps.data.id } }">
                        {{ slotProps.data.id }}
                    </RouterLink>
                </template>
            </Column>
            <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header" :key="col.field + '_' + index" :class="{'min-w-96': col.field === 'description'}">
                <template v-if="col.field === 'resitable'" #body="slotProps">
                    {{ slotProps.data?.resitable ? 'Ja' : 'Nee' }}
                </template>
                <template v-if="col.field === 'type'" #body="slotProps">
                    {{ types.find(type => type.toLowerCase() === slotProps.data?.type?.toLowerCase()) }}
                </template>
                <template v-if="col.field === 'result_type'" #body="slotProps">
                    {{ resultTypes.find(type => type.toLowerCase() === slotProps.data?.result_type?.toLowerCase()) }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const emit = defineEmits(['update-ptaData'])
const toast = useToast()
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
    }
})

const columns = ref([
    { header: 'Week', field: 'week', default: true },
    { header: 'Subdomein', field: 'subdomain', default: false },
    { header: 'Omschrijving', field: 'description', default: true },
    { header: 'Afnamevorm', field: 'type', default: false },
    { header: 'Beoordeling', field: 'result_type', default: false },
    { header: 'Herkansbaar', field: 'resitable', default: false },
    { header: 'POD', field: 'pod_weight', default: true },
    { header: 'PTA', field: 'pta_weight', default: true }
])
const selectedColumns = ref(columns.value.filter(col => col.default));
const onToggle = (val) => {
    selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const sorting = ref(false)

function sortTests() {
    sorting.value = true

    setTimeout(() => {
        sorting.value = false
    }, 1000)

    toast.add({ severity: 'success', summary: 'Succes', detail: `De toetsen zijn gesorteerd (grapje, want nog niet geimplementeerd)`, life: 3000 });
}
</script>