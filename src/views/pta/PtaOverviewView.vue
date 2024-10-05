<template>
    <div class="min-w-full">
        <DataTable :value="ptaData.tests" class="min-w-full">
            <template #header>
                <div style="text-align:left">
                    <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle"
                        display="chip" placeholder="Selecteer Kolommen" />
                </div>
            </template>
            <Column field="id" header="Toetsnummer" />
            <!-- <Column field="week" header="Week" />
            <Column field="description" header="Omschrijving" />
            <Column field="type" header="Type" />
            <Column field="resitable" header="Herkansbaar">
                <template #body="slotProps">
                    {{ slotProps.data.resitable ? 'Ja' : 'Nee' }}
                </template>
            </Column>
            <Column field="pod_weight" header="POD" />
            <Column field="pta_weight" header="PTA" /> -->
            <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header" :key="col.field + '_' + index">
                <template v-if="col.field === 'resitable'" #body="slotProps">
                    {{ slotProps.data.resitable ? 'Ja' : 'Nee' }}
                </template>
                <template v-if="col.field === 'type'" #body="slotProps">
                    {{ types.find(type => type.toLowerCase() === slotProps.data.type.toLowerCase()) }}
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
    }
})

const columns = ref([
    { header: 'Week', field: 'week', default: true },
    { header: 'Omschrijving', field: 'description', default: true },
    { header: 'Type', field: 'type', default: false },
    { header: 'Herkansbaar', field: 'resitable', default: false },
    { header: 'POD', field: 'pod_weight', default: true },
    { header: 'PTA', field: 'pta_weight', default: true }
])
const selectedColumns = ref(columns.value.filter(col => col.default));
const onToggle = (val) => {
    selectedColumns.value = columns.value.filter(col => val.includes(col));
};
</script>