<template>
  <div>
    <div class="card mb-4">
      <h1 class="text-2xl mb-4">Welkom op het PTA Platform</h1>
      <p>
        Dit platform is bedoeld voor het inzien en bewerken van de Programma's van Toetsing en Afsluiting (PTA's).
        Om te beginnen, vul de juiste gegevens in het zoekveld in door bovenaan te klikken op 'Zoeken'.
      </p>
    </div>
    <ProgressBar v-if="fetching" mode="indeterminate" style="height: 6px" />
    <div v-else>
      <div v-if="canViewPtaTable" class="card">
        <h1 class="text-2xl mb-8">PTA's</h1>
        <div class="flex justify-between items-center mb-4">
          <div>
            <DatePicker v-model="ptaTableCurrentYear" view="year" dateFormat="yy" showIcon iconDisplay="input" placeholder="Selecteer een Jaar" />
          </div>
          <div>
            <InputGroup>
              <Select v-model="selectedExportLevel" :options="levels" optionLabel="label" placeholder="Niveau" />
              <Button icon="pi pi-fw pi-download" label="Download PDF" severity="primary" :loading="waitingOnExport" :disabled="!selectedExportLevel || waitingOnExport" @click="exportAll" />
            </InputGroup>
          </div>
        </div>
        <ProgressBar v-if="loadingPtaTable" mode="indeterminate" style="height: 6px" />
        <PtaTable v-else :ptas="ptaTableValues" />
      </div>
      <div v-for="year in availableYears" :key="year" class="mt-4">
        <div class="card mb-4">
          <h2 class="text-xl font-semibold">{{ `${year} - ${year + 1}` }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card v-for="pta in ptas.filter(currentPta => currentPta.startYear === year)">
            <template #title>{{ pta.name }}</template>
            <template #content>
              <p><strong>Niveau:</strong> <Tag :value="`${pta.level.year} ${pta.level.type}`" /></p>
              <p><strong>Afrondstatus:</strong> <Tag :value="pta.finished ? 'Afgerond' : 'Onafgerond'" :severity="pta.finished ? 'success' : 'danger'" /></p>
            </template>
            <template #footer>
              <Button asChild v-slot="slotProps" :severity="pta.finished ? 'secondary' : 'primary'">
                <RouterLink :to="{ name: 'pta-overview', params: { id: pta.id } }" :class="slotProps.class + ' w-full'">Bekijk PTA</RouterLink>
              </Button>
<!--              <Button label="Bekijk PTA" @click="$router.push({ name: 'pta-overview', params: { id: pta.id } })" class="w-full" :severity="pta.finished ? 'secondary' : 'primary'" />-->
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from 'primevue/card';
import Button from "primevue/button";
import {RouterLink} from "vue-router";
import Tag from "primevue/tag";
import ProgressBar from "primevue/progressbar";
import {useUserStore} from "@/stores/user.js";
import {computed, ref, watchEffect} from 'vue';
import PtaTable from "@/components/PtaTable.vue";
import {getUserPermissions} from "@/config/roles.js";
import DatePicker from "primevue/datepicker";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import {LEVELS} from "@/constants/index.js";

const userStore = useUserStore();
const user = computed(() => userStore.user);
const canViewPtaTable = computed(() => {
  if (!userStore.user) return false;

  return getUserPermissions(userStore.user).includes('pta:edit:all')
})
const ptas = ref([]);
const fetching = ref(true);
const loadingPtaTable = ref(false);
const waitingOnExport = ref(false);
const availableYears = computed(() => {
  if (!user || !ptas.value.length) return [];

  return [...new Set(ptas.value.map(pta => pta.startYear))].sort((a, b) => b - a);
})
const ptaTableCurrentYear = ref(new Date());
const ptaTableValues = ref([]);
const selectedExportLevel = ref();
const levels = computed(() => {
  // Return all levels by object, with a label, levelYear and levelType, by splitting the LEVELS constant
  return LEVELS.map(level => ({
    label: level,
    year: parseInt(level.split(' ')[0]),
    type: level.split(' ')[1]
  }));
})

watchEffect(async () => {
  if (!user.value) {
    ptas.value = [];
    fetching.value = false;
    return;
  }
  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/find?responsible=${user.value.abbreviation}`)
  try {
    ptas.value = await response.json();
  } catch (error) {
    console.error('Error parsing PTAs:', error);
  } finally {
    fetching.value = false;
  }
});

async function fetchURL(url) {
  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}

watchEffect(async () => {
  if (!canViewPtaTable.value) return;

  await updatePtaTable(ptaTableCurrentYear.value);
})

async function updatePtaTable(date) {
  loadingPtaTable.value = true
  await fetchURL(`pta/find?startYear=${date.getFullYear()}`)
      .then(data => ptaTableValues.value = data)
      .catch(error => ptaTableValues.value = [])
      .finally(() => loadingPtaTable.value = false)
}

// Fetch a list of all PTAs for the selected year, grab their IDs
// Then request a bulk export from the backend
async function exportAll() {
  if (!ptaTableCurrentYear.value) return;

  const year = ptaTableCurrentYear.value.getFullYear();
  // sort by levelYear, levelType, name
  const exportPtas = ptaTableValues.value.filter(pta => {
    return pta.startYear === year && pta.level.year === selectedExportLevel.value.year && pta.level.type === selectedExportLevel.value.type
  }).map(pta => pta.id)
      .sort((a, b) => {
        const ptaA = ptaTableValues.value.find(pta => pta.id === a);
        const ptaB = ptaTableValues.value.find(pta => pta.id === b);
        if (ptaA.level.type !== ptaB.level.type) {
          return ptaA.level.type.localeCompare(ptaB.level.type);
        }
        if (ptaA.level.year !== ptaB.level.year) {
          return ptaA.level.year.toString().localeCompare(ptaB.level.year.toString());
        }
        return ptaA.name.localeCompare(ptaB.name);
      });

  if (!exportPtas.length) return;

  waitingOnExport.value = true;

  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ ptaIds: exportPtas })
  });

  if (!response.ok) {
    console.error('Failed to export PTAs');
    waitingOnExport.value = false;
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PTA Export ${selectedExportLevel.value.label} ${year}-${year+1}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  waitingOnExport.value = false;
}
</script>
