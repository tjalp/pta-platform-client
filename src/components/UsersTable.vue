<template>
  <ConfirmPopup />
  <DataTable :value="users" editMode="cell" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50, 100]" @cellEditComplete="saveUserCell">
    <template #empty>Geen gebruikers gevonden.</template>
    <Column field="abbreviation" header="Afkorting">

    </Column>
    <Column field="roleIds" header="Rollen">
      <template #body="{ data }">
        <Tag v-for="roleId in data.roleIds" :key="roleId" :value="roleNames[roleId]" />
      </template>
      <template #editor="{ data, field}">
        <MultiSelect v-model="data[field]" :options="roleOptions" optionLabel="label" optionValue="value" autofocus fluid />
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
import ConfirmPopup from "primevue/confirmpopup";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import {roleNames} from "@/config/roles.js";
import MultiSelect from "primevue/multiselect";
import {computed} from "vue";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";

const toast = useToast()
const confirm = useConfirm()

const roleOptions = computed(() => {
  return Object.keys(roleNames).map((key) => {
    return { label: roleNames[key], value: key };
  });
});

const props = defineProps({
  users: {
    type: Array,
    required: true
  }
});

const saveUserCell = (event) => {
  let { data, newValue, field } = event;

  console.log(data, newValue, field);

  if (field !== 'roleIds' || data[field] === newValue) return;

  data[field] = newValue;

  console.log(data)

  fetch(`${import.meta.env.VITE_API_HOST}/api/user/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 });
    })
    .catch(error => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000 });
    });
}

const confirmDelete = (event, user) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Wil je deze gebruiker verwijderen?',
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
      const index = props.users.findIndex((s) => s.id === user.id);

      if (index !== -1) {
        props.users.splice(index, 1);
      }

      fetch(`${import.meta.env.VITE_API_HOST}/api/user/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        })
        .then(data => {
          toast.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully', life: 3000 });
        })
        .catch(error => {
          console.log(error)
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
        });
  }});
};
</script>