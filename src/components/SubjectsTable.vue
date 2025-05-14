<template>
  <ConfirmPopup />
  <DataTable v-model:filters="filters" filterDisplay="row" :value="subjects" editMode="cell" scrollable scrollHeight="600px" removableSort sortField="name" :sortOrder="1" @cellEditComplete="saveSubjectCell" :globalFilterFields="['responsible']">
    <template #empty>Geen vakken gevonden.</template>
    <Column field="name" header="Naam" sortable>
      <template #filter="{ filterModel, filterCallback }">
        <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Zoek..." style="min-width: 12rem" />
      </template>
    </Column>
    <Column field="level.year" header="Jaarlaag" :showFilterMenu="false" sortable>
      <template #body="{ data }">
        <Tag :value="data.level.year" />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <Select v-model="filterModel.value" @change="filterCallback()" :options="years" placeholder="Selecteer jaarlaag" style="min-width: 12rem" :showClear="true">
          <template #option="slotProps">
            <Tag :value="slotProps.option" />
          </template>
        </Select>
      </template>
    </Column>
    <Column field="level.type" header="Niveau" :showFilterMenu="false" sortable>
      <template #body="{ data }">
        <Tag :value="data.level.type" />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <Select v-model="filterModel.value" @change="filterCallback()" :options="types" placeholder="Selecteer niveau" style="min-width: 12rem" :showClear="true">
          <template #option="slotProps">
            <Tag :value="slotProps.option" />
          </template>
        </Select>
      </template>
    </Column>
    <Column field="responsible" header="Verantwoordelijke" :showFilterMenu="false" sortable>
      <template #body="{ data }">
        <Tag :value="data.responsible" />
      </template>
      <template #editor="{ data, field}">
        <InputText v-model="data[field]" autofocus fluid />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <Select v-model="filterModel.value" @change="filterCallback()" :options="responsibles" placeholder="Selecteer" style="min-width: 12rem" :showClear="true">
          <template #option="slotProps">
            <Tag :value="slotProps.option" />
          </template>
        </Select>
      </template>
    </Column>
    <Column>
      <template #body="{ data }">
        <Button icon="pi pi-trash" severity="danger" text @click="confirmDelete($event, data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import InputText from "primevue/inputtext";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Select from "primevue/select";
import Tag from "primevue/tag";
import {computed, ref} from "vue";
import { FilterMatchMode } from '@primevue/core/api';
import ConfirmPopup from "primevue/confirmpopup";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";

const confirm = useConfirm()
const toast = useToast()

const props = defineProps({
  subjects: {
    type: Array,
    required: true
  }
})

const filters = ref({
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "level.year": { value: null, matchMode: FilterMatchMode.EQUALS },
  "level.type": { value: null, matchMode: FilterMatchMode.EQUALS },
  responsible: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})
const years = computed(() => {
  return [...new Set(props.subjects.map(subject => subject.level.year))]
})
const types = computed(() => {
  return [...new Set(props.subjects.map(subject => subject.level.type))]
})
const responsibles = computed(() => {
  return [...new Set(props.subjects.map(subject => subject.responsible))]
})

function saveSubjects() {
  fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/subjects`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(props.subjects)
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        props.subjects.value = data;
      })
      .catch(error => {
        console.error('Error saving default:', error);
      });
}

const saveSubjectCell = (event) => {
  let { data, newValue, field } = event;

  if (field !== 'responsible' || data[field] === newValue) return;

  data[field] = newValue;

  saveSubjects()
}

const confirmDelete = (event, subject) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Wil je dit vak verwijderen?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Annuleren',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Verwijderen',
      severity: 'danger'
    },
    accept: () => {
      const index = props.subjects.findIndex((s) => s.name === subject.name && s.level.year === subject.level.year && s.level.type === subject.level.type);

      if (index !== -1) {
        props.subjects.splice(index, 1);
      }

      saveSubjects()

      toast.add({ severity: 'success', summary: 'Bevestigd', detail: `Vak verwijderd`, life: 3000 });
    }
  });
};
</script>