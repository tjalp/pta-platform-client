<template>
    <div class="min-w-full card">
        <DataTable :value="ptaData.tests" class="min-w-full">
            <Column field="id" header="Toetsnummer" />
            <Column field="week" header="Week" />
            <Column field="description" header="Omschrijving" />
            <Column field="pod_weight" header="POD" />
            <Column field="pta_weight" header="PTA" />
        </DataTable>
    </div>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const emit = defineEmits(['update-ptaData'])
const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    }
})

function updateData() {
    console.log('Updating data');
    const newData = { ...props.ptaData, name: 'New Name' }
    emit('update-ptaData', newData);
}
</script>