<template>
    <div class="card mb-4">
        <h1 class="text-2xl mb-4">Standaard Afnamevormen</h1>
      <!-- Form to modify the list of types, new ones can be added and removed -->
        <ProgressBar v-if="loadingTypes" mode="indeterminate" style="height: 6px" />
        <div v-else class="flex flex-wrap gap-2 mb-4">
            <Chip v-for="(type, idx) in types" :key="idx" :label="type" removable @remove="removeType(idx)" />
        </div>
        <Button icon="pi pi-plus" label="Nieuwe afnamevorm" severity="secondary" text @click="addType" />
    </div>
    <div class="card mb-4">
        <h1 class="text-2xl mb-4">Standaard Tijdsmogelijkheden (in min.)</h1>
        <ProgressBar v-if="loadingDurations" mode="indeterminate" style="height: 6px" />
        <div v-else class="flex flex-wrap gap-2 mb-4">
            <Chip v-for="(duration, idx) in durations" :key="idx" :label="duration + ' min.'" removable @remove="removeDuration(idx)" />
        </div>
        <Button icon="pi pi-plus" label="Nieuwe tijdsmogelijkheid" severity="secondary" text @click="addDuration" />
    </div>
    <div class="card mb-4">
        <h1 class="text-2xl mb-4">Standaard Hulpmiddelen</h1>
        <ProgressBar v-if="loadingTools" mode="indeterminate" style="height: 6px" />
        <div v-else class="flex flex-wrap gap-2 mb-4">
            <Chip v-for="(tool, idx) in tools" :key="idx" :label="tool" removable @remove="removeTool(idx)" />
        </div>
        <Button icon="pi pi-plus" label="Nieuwe hulpmiddel" severity="secondary" text @click="addTool" />
    </div>
    <div class="card">
        <h1 class="text-2xl mb-4">Periodes</h1>
        <ProgressBar v-if="loadingPeriods" mode="indeterminate" style="height: 6px" />
        <Form v-else v-slot="$form" :initialValues="defaultPeriodFields" :resolver="periodsResolver" @submit="submitPeriods">
            <div class="flex flex-wrap gap-4 mb-4">
                <div class="flex-auto">
                    <label for="startPeriod1" class="font-semibold block mb-2">Eerste week schooljaar</label>
                    <InputNumber name="startPeriod1" inputId="startPeriod1" placeholder="Weeknummer" :min="1" :max="52" fluid showButtons />
                    <Message v-if="$form.startPeriod1?.invalid" severity="error" size="small" variant="simple">{{ $form.startPeriod1.error?.message }}</Message>
                </div>
                <div v-for="n in 4" class="flex-auto">
                    <label :for="`endPeriod${n}`" class="font-semibold block mb-2">Week SE {{n}}</label>
                    <InputNumber :name="`endPeriod${n}`" :inputId="`endPeriod${n}`" placeholder="Weeknummer" :min="1" :max="52" fluid showButtons />
                    <Message v-if="$form[`endPeriod${n}`]?.invalid" severity="error" size="small" variant="simple">{{ $form[`endPeriod${n}`].error?.message }}</Message>
                </div>
            </div>
            <Button type="submit" icon="pi pi-save" label="Opslaan" severity="secondary" :loading="savingPeriods" />
        </Form>
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import Button from "primevue/button";
import {Chip} from "primevue";
import ProgressBar from "primevue/progressbar";
import {Form} from "@primevue/forms";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import {useToast} from "primevue/usetoast";

const toast = useToast()

const savingPeriods = ref(false)
const loadingTypes = ref(true)
const loadingDurations = ref(true)
const loadingTools = ref(true)
const loadingPeriods = ref(true)
const types = ref([])
const durations = ref([])
const tools = ref([])
const periods = ref([])

const defaultPeriodFields = computed(() => {
  if (periods.value.length === 0) return {}

  return {
    startPeriod1: periods.value[0].startWeek,
    endPeriod1: periods.value[0].endWeek,
    endPeriod2: periods.value[1].endWeek,
    endPeriod3: periods.value[2].endWeek,
    endPeriod4: periods.value[3].endWeek
  }
})

function calculateWeeks(startPeriod1, endPeriod) {
  if (endPeriod >= startPeriod1) {
    return endPeriod - startPeriod1 + 1;
  } else {
    return endPeriod + 52 - startPeriod1 + 1;
  }
}

function addType() {
  const newType = prompt('Voer een nieuwe afnamevorm in:')

  if (!newType) return;

  types.value.push(newType)

  saveDefault('types', types)
}

function removeType(index) {
  types.value.splice(index, 1);

  saveDefault('types', types)
}

function addDuration() {
  const newDuration = prompt('Voer een nieuwe tijdsmogelijkheid in:')

  if (!newDuration || isNaN(newDuration)) return;

  durations.value.push(parseInt(newDuration))

  saveDefault('durations', durations)
}

function removeDuration(index) {
  durations.value.splice(index, 1);

  saveDefault('durations', durations)
}

function addTool() {
  const newTool = prompt('Voer een nieuwe hulpmiddel in:')

  if (!newTool) return;

  tools.value.push(newTool)

  saveDefault('tools', tools)
}

function removeTool(index) {
  tools.value.splice(index, 1);

  saveDefault('tools', tools)
}

const periodsResolver = ({ values }) => {
  const errors = {};

  if (!values.startPeriod1) {
    errors.startPeriod1 = [{ message: 'Eerste week is verplicht.' }];
  }

  let previousWeeksFromStart = 0;

  for (let i = 1; i <= 4; i++) {
    if (!values[`endPeriod${i}`]) {
      errors[`endPeriod${i}`] = [{ message: `SE week ${i} is verplicht.` }];
      continue;
    }

    // calculate weeks from startPeriod1
    const weeksFromStart = calculateWeeks(values.startPeriod1, values[`endPeriod${i}`]);

    if (previousWeeksFromStart >= weeksFromStart) {
      errors[`endPeriod${i}`] = [{ message: `Moet later zijn dan vorige.` }];
    }

    previousWeeksFromStart = weeksFromStart;
  }

  return {
    errors
  };
};

const submitPeriods = (event) => {
  if (!event.valid) return;

  savingPeriods.value = true;

  const periods = [];

  // fill periods array with start and end weeks
  // based on the startPeriod1 and endPeriod1-4
  // the start period of the first period is always startPeriod1
  // and the other ones are the last end period plus 1
  const startPeriod1 = event.states.startPeriod1.value;
  const endPeriods = [];

  for (let i = 1; i <= 4; i++) {
    endPeriods.push(event.states[`endPeriod${i}`].value);
  }

  periods.push({ startWeek: startPeriod1, endWeek: endPeriods[0] });

  for (let i = 1; i < endPeriods.length; i++) {
    periods.push({ startWeek: endPeriods[i - 1] + 1, endWeek: endPeriods[i] });
  }

  fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/periods`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(periods)
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        toast.add({severity: 'success', summary: 'Succes', detail: 'Periodes opgeslagen!', life: 3000});
      })
      .catch(error => {
        toast.add({severity: 'error', summary: 'Foutmelding', detail: 'Fout bij het opslaan van periodes.', life: 5000});
        console.error('Error saving periods:', error);
      })
      .finally(() => {
        savingPeriods.value = false;
      });
}

function saveDefault(defaultString, reference) {
  fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/${defaultString}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(reference.value)
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        reference.value = data;
      })
      .catch(error => {
        console.error('Error saving default:', error);
      });
}

async function fetchDefault(defaultString) {
  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/defaults/${defaultString}`);
  if (!response.ok) {
      throw new Error('Network response was not ok');
  }
  return await response.json();
}

onMounted(() => {
  fetchDefault('types').then(data => types.value = data).finally(() => loadingTypes.value = false)
  fetchDefault('durations').then(data => durations.value = data).finally(() => loadingDurations.value = false)
  fetchDefault('tools').then(data => tools.value = data).finally(() => loadingTools.value = false)
  fetchDefault('periods').then(data => periods.value = data).finally(() => loadingPeriods.value = false)
})
</script>