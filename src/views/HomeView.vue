<template>
    <div>
        <Card class="mb-4">
            <template #title>Welkom op het PTA Platform</template>
            <template #content>
                <p class="m-0">
                    Dit platform is bedoeld voor het inzien en bewerken van de Programma's van Toetsing en Afsluiting (PTA's).
                    Om te beginnen, vul de juiste gegevens in het zoekveld in door bovenaan te klikken op 'Zoeken'.
                </p>
            </template>
        </Card>
        <ProgressBar v-if="fetching" mode="indeterminate" style="height: 6px" />
        <div v-else v-for="year in availableYears" :key="year" class="mb-4">
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
                        <Button label="Bekijk PTA" @click="$router.push({ name: 'pta-overview', params: { id: pta.id } })" class="w-full" :severity="pta.finished ? 'secondary' : 'primary'" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import Card from 'primevue/card';
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressBar from "primevue/progressbar";
import {useUserStore} from "@/stores/user.js";
import {computed, ref, watch, watchEffect} from 'vue';

const { user } = useUserStore();
const ptas = ref([]);
const fetching = ref(true);
const availableYears = computed(() => {
  if (!user || !ptas.value.length) return [];

  return [...new Set(ptas.value.map(pta => pta.startYear))].sort((a, b) => b - a);
})

watchEffect(async () => {
  if (!user) {
    ptas.value = [];
    fetching.value = false;
    return;
  }
  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/find?responsible=${user.abbreviation}`)
  try {
    ptas.value = await response.json();
  } catch (error) {
    console.error('Error parsing PTAs:', error);
  } finally {
    fetching.value = false;
  }
});

// watch(user, (newUser) => {
//   console.log('User changed:', newUser);
//   if (!newUser) {
//     ptas.value = [];
//     fetching.value = false;
//     return;
//   }
//   fetch(`${import.meta.env.VITE_API_HOST}/api/pta/find?responsible=${newUser.abbreviation}`)
//     .then(response => response.json())
//     .then(data => {
//       ptas.value = data;
//     })
//     .catch(error => {
//       console.error('Error fetching PTAs:', error);
//     })
//     .finally(() => {
//       fetching.value = false;
//     });
// }, { immediate: true });
</script>
