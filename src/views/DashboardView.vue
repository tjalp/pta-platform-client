<template>
    <ConfirmPopup />
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
    <div class="card mb-4">
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
    <div class="card mb-4">
        <h1 class="text-2xl mb-4">Vakken</h1>
        <p class="mb-4">Klik op de verantwoordelijke om deze aan te passen</p>
        <ProgressBar v-if="loadingSubjects" mode="indeterminate" style="height: 6px" />
        <SubjectsTable v-else :subjects />
        <Button icon="pi pi-plus" label="Nieuw vak" severity="secondary" text @click="subjectDialogVisible = true" class="mt-4" />
        <Dialog v-slot="$form" v-model:visible="subjectDialogVisible" modal header="Nieuw vak" :style="{ width: '25rem' }">
            <Form :resolver="subjectsResolver" @submit="submitSubject">
                <div class="flex items-center gap-4 mb-4">
                    <label for="subjectName" class="font-semibold w-32">Vak</label>
                    <InputText name="subjectName" id="subjectName" class="flex-auto" autocomplete="off" />
                    <Message v-if="$form.subjectName?.invalid" severity="error" size="small" variant="simple">{{ $form.subjectName.error?.message }}</Message>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <label for="subjectYear" class="font-semibold w-32">Jaarlaag</label>
                    <InputNumber name="subjectYear" id="subjectYear" :min="1" class="flex-auto" showButtons />
                    <Message v-if="$form.subjectYear?.invalid" severity="error" size="small" variant="simple">{{ $form.subjectYear.error?.message }}</Message>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <label for="subjectLevel" class="font-semibold w-32">Niveau</label>
                    <Select name="subjectLevel" id="subjectLevel" :options="levels" class="flex-auto" />
                    <Message v-if="$form.subjectLevel?.invalid" severity="error" size="small" variant="simple">{{ $form.subjectLevel.error?.message }}</Message>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <label for="subjectResponsible" class="font-semibold w-32">Verantwoordelijke</label>
                    <InputText name="subjectResponsible" id="subjectResponsible" class="flex-auto" autocomplete="off" />
                    <Message v-if="$form.subjectResponsible?.invalid" severity="error" size="small" variant="simple">{{ $form.subjectResponsible.error?.message }}</Message>
                </div>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Annuleer" severity="secondary" @click="subjectDialogVisible = false" />
                    <Button type="submit" label="Toevoegen" />
                </div>
            </Form>
        </Dialog>
    </div>
    <div class="card mb-4">
        <h1 class="text-2xl mb-4">Gebruikers</h1>
        <ProgressBar v-if="loadingUsers" mode="indeterminate" style="height: 6px" />
        <UsersTable v-else :users />
        <Button icon="pi pi-plus" label="Nieuwe gebruiker" severity="secondary" text @click="userDialogVisible = true" class="mt-4" />
        <Dialog v-slot="$form" v-model:visible="userDialogVisible" modal header="Nieuwe gebruiker" :style="{ width: '25rem' }">
            <Form :resolver="userResolver" @submit="submitUser">
                <div class="flex items-center gap-4 mb-4">
                    <label for="userAbbreviation" class="font-semibold w-32">Afkorting</label>
                    <InputText name="userAbbreviation" id="userAbbreviation" class="flex-auto" autocomplete="off" />
                    <Message v-if="$form.userAbbreviation?.invalid" severity="error" size="small" variant="simple">{{ $form.userAbbreviation.error?.message }}</Message>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <label for="userPassword" class="font-semibold w-32">Wachtwoord</label>
                    <Password name="userPassword" id="userPassword" class="flex-auto" autocomplete="off" />
                    <Message v-if="$form.userPassword?.invalid" severity="error" size="small" variant="simple">{{ $form.userPassword.error?.message }}</Message>
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <label for="userRoleIds" class="font-semibold w-32">Rollen</label>
                    <MultiSelect name="userRoleIds" id="userRoleIds" :options="roleOptions" optionLabel="label" optionValue="value" class="flex-auto" autofocus />
                    <Message v-if="$form.userRoleIds?.invalid" severity="error" size="small" variant="simple">{{ $form.userRoleIds.error?.message }}</Message>
                </div>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Annuleer" severity="secondary" @click="userDialogVisible = false" />
                    <Button type="submit" label="Toevoegen" :loading="savingUser" />
                </div>
            </Form>
        </Dialog>
    </div>
    <div class="card">
        <h1 class="text-2xl mb-4">PTA's</h1>
        <div class="justify-between items-center">
          <DatePicker v-model="currentYear" view="year" dateFormat="yy" showIcon iconDisplay="input" class="flex-auto mb-4" placeholder="Selecteer een Jaar" @dateSelect="updatePtas($event)" />
          <Button v-if="!loadingPtas && ptas.length === 0" icon="pi pi-plus" :label="'Nieuwe PTA\'s maken voor ' + currentYear.getFullYear()" class="float-right" severity="secondary" :loading="creatingPtas" text @click="confirmCreatePtasForYear" />
        </div>
        <ProgressBar v-if="loadingPtas" mode="indeterminate" style="height: 6px" />
        <PtaTable v-else :ptas />
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import Button from "primevue/button";
import {Chip} from "primevue";
import ProgressBar from "primevue/progressbar";
import {Form} from "@primevue/forms";
import InputNumber from "primevue/inputnumber";
import Password from "primevue/password";
import Message from "primevue/message";
import {useToast} from "primevue/usetoast";
import SubjectsTable from "@/components/SubjectsTable.vue";
import Dialog from "primevue/dialog";
import UsersTable from "@/components/UsersTable.vue";
import MultiSelect from "primevue/multiselect";
import {roleNames} from "@/config/roles.js";
import {calculateWeeks} from "@/config/periods.js";
import PtaTable from "@/components/PtaTable.vue";
import DatePicker from "primevue/datepicker";
import {useConfirm} from "primevue/useconfirm";

const toast = useToast()
const confirm = useConfirm()

const savingPeriods = ref(false)
const loadingTypes = ref(true)
const loadingDurations = ref(true)
const loadingTools = ref(true)
const loadingPeriods = ref(true)
const loadingSubjects = ref(true)
const loadingUsers = ref(true)
const savingUser = ref(false)
const loadingPtas = ref(true)
const creatingPtas = ref(false)
const levels = ref(['VWO', 'HAVO', 'MAVO'])
const types = ref([])
const durations = ref([])
const tools = ref([])
const periods = ref([])
const subjects = ref([])
const users = ref([])
const ptas = ref([])

const currentYear = ref(new Date())

const subjectDialogVisible = ref(false)
const userDialogVisible = ref(false)

const roleOptions = computed(() => {
  return Object.keys(roleNames).map((key) => {
    return { label: roleNames[key], value: key };
  });
});

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


const subjectsResolver = ({ values }) => {
  const errors = {};

  if (!values.subjectName) {
    errors.subjectName = [{ message: 'Vak is verplicht.' }];
  }

  if (!values.subjectYear) {
    errors.subjectYear = [{ message: 'Jaarlaag is verplicht.' }];
  }

  if (!values.subjectLevel) {
    errors.subjectLevel = [{ message: 'Niveau is verplicht.' }];
  }

  if (!values.subjectResponsible) {
    errors.subjectResponsible = [{ message: 'Verantwoordelijke is verplicht.' }];
  }

  return {
    errors
  };
};

const submitSubject = (event) => {
  if (!event.valid) return;

  subjectDialogVisible.value = false;

  const subject = {
    name: event.states.subjectName.value,
    level: {
      year: event.states.subjectYear.value,
      type: event.states.subjectLevel.value,
    },
    responsible: event.states.subjectResponsible.value
  };

  subjects.value.push(subject);

  saveDefault('subjects', subjects)
}

const userResolver = ({ values }) => {
  const errors = {};

  if (!values.userAbbreviation) {
    errors.userAbbreviation = [{ message: 'Afkorting is verplicht.' }];
  }

  if (!values.userPassword) {
    errors.userPassword = [{ message: 'Wachtwoord is verplicht.' }];
  }

  if (!values.userRoleIds) {
    errors.userRoleIds = [{ message: 'Rol is verplicht.' }];
  }

  return {
    errors
  };
};

const submitUser = (event) => {
  if (!event.valid) return;

  savingUser.value = true

  const user = {
    abbreviation: event.states.userAbbreviation.value,
    password: event.states.userPassword.value,
    roles: event.states.userRoleIds.value
  };

  fetch(`${import.meta.env.VITE_API_HOST}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(user)
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        users.value.push(data);
        toast.add({severity: 'success', summary: 'Succes', detail: 'Gebruiker opgeslagen!', life: 3000});
      })
      .catch(error => {
        toast.add({severity: 'error', summary: 'Foutmelding', detail: 'Fout bij het opslaan van gebruiker.', life: 5000});
        console.error('Error saving user:', error);
      }).finally(() => {
        userDialogVisible.value = false;
      });
}

const confirmCreatePtasForYear = () => {
    confirm.require({
        message: 'Zorg dat alle vakken de juiste verantwoordelijke hebben, want dit kan niet meer aangepast worden.',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Annuleren',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Aanmaken'
        },
        accept: createPtasForYear
    });
}

const createPtasForYear = async (event) => {
    if (!currentYear.value) return;

    creatingPtas.value = true

    await fetch(`${import.meta.env.VITE_API_HOST}/api/pta/createForYear?startYear=${currentYear.value.getFullYear()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    }).then((response) => {
        if (!response.ok) {
            throw new Error(response.status + ' ' + response.statusText);
        }
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Foutmelding', detail: `Fout bij het aanmaken van PTA's (${error.message}).`, life: 5000 });
        console.error('Error creating PTA\'s:', error);
    }).finally(() => {
        creatingPtas.value = false
    })
    await updatePtas(currentYear.value)
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

async function updatePtas(date) {
  loadingPtas.value = true
  await fetchURL(`pta/find?startYear=${date.getFullYear()}`)
      .then(data => ptas.value = data)
      .catch(error => ptas.value = [])
      .finally(() => loadingPtas.value = false)
}

onMounted(() => {
  fetchURL('defaults/types').then(data => types.value = data).finally(() => loadingTypes.value = false)
  fetchURL('defaults/durations').then(data => durations.value = data).finally(() => loadingDurations.value = false)
  fetchURL('defaults/tools').then(data => tools.value = data).finally(() => loadingTools.value = false)
  fetchURL('defaults/periods').then(data => periods.value = data).finally(() => loadingPeriods.value = false)
  fetchURL('defaults/subjects').then(data => subjects.value = data).finally(() => loadingSubjects.value = false)
  fetchURL('user/all').then(data => users.value = data).finally(() => loadingUsers.value = false)
  updatePtas(new Date())
})
</script>