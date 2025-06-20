<template>
  <div>
    <DataTable :value="ptas" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50, 100]" removableSort sortField="finished" :sortOrder="1" selectionMode="single" @rowSelect="onRowSelect">
      <template #empty>Geen PTA's gevonden.</template>
      <Column field="name" header="Naam" sortable />
      <Column field="level.year" header="Jaarlaag" sortable>
        <template #body="{ data }">
          <Tag :value="data.level.year" />
        </template>
      </Column>
      <Column field="level.type" header="Niveau" sortable>
        <template #body="{ data }">
          <Tag :value="data.level.type" />
        </template>
      </Column>
      <Column field="responsible" header="Verantwoordelijke" sortable>
        <template #body="{ data }">
          <Tag :value="data.responsible.toUpperCase()" />
        </template>
      </Column>
      <Column field="finished" header="Afrondstatus" sortable>
        <template #body="{ data }">
          <Tag :value="data.finished ? 'Afgerond' : 'Onafgerond'" :severity="data.finished ? 'success' : 'danger'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import {useRouter} from "vue-router";

const router = useRouter()

const props = defineProps({
  ptas: {
    type: Array,
    required: true
  }
})

const onRowSelect = (event) => {
  const selectedPta = event.data;
  const ptaId = selectedPta.id;

  router.push({ name: 'pta-overview', params: { id: ptaId } });
}
</script>