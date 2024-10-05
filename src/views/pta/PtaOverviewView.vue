<template>
    <div>
        <DataTable :value="ptaData.tests" scrollable scrollHeight="1024px">
            <template #header>
                <div style="text-align:left">
                    <MultiSelect :modelValue="selectedColumns" :options="columns" :maxSelectedLabels="3" filter optionLabel="header" @update:modelValue="onToggle"
                        placeholder="Selecteer Kolommen" class="w-full md:w-96" />
                </div>
            </template>
            <Column field="id" header="Nummer" />
            <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header" :key="col.field + '_' + index" :class="{'min-w-96': col.field === 'description'}">
                <template v-if="col.field === 'resitable'" #body="slotProps">
                    {{ slotProps.data.resitable ? 'Ja' : 'Nee' }}
                </template>
                <template v-if="col.field === 'type'" #body="slotProps">
                    {{ types.find(type => type.toLowerCase() === slotProps.data.type.toLowerCase()) }}
                </template>
                <template v-if="col.field === 'result_type'" #body="slotProps">
                    {{ resultTypes.find(type => type.toLowerCase() === slotProps.data.result_type.toLowerCase()) }}
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

const emit = defineEmits(['update-ptaData'])
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
</script>