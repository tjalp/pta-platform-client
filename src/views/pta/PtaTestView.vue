<template>
    <ConfirmPopup />
    <div>
        <div v-if="!currentTest" class="flex justify-center items-center">
            <Message severity="error">Er bestaat geen toets met toetsnummer {{ route.params.testId }} voor deze PTA</Message>
        </div>
        <div v-else>
            <ProgressBar v-if="props.types === null || props.durations === null || props.resultTypes === null" mode="indeterminate" style="height: 6px" />
            <div v-else>
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl mb-4">Toets {{ route.params.testId }}</h1>
                    <Button v-if="isEditMode" @click="confirmDelete($event)" label="Verwijderen" icon="pi pi-trash" severity="danger" text />
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="dateSelect" class="font-semibold w-24">Datum</label>
                    <Select id="dateSelect" v-model="dateSelection" :options="dates" placeholder="Datum" :disabled="!isEditMode" class="w-full max-w-48" />
                    <InputNumber v-if="dateSelection === 'Week'" v-model="weekSelection" showButtons buttonLayout="horizontal" :min="1" :max="52" :step="1" placeholder="Weeknummer" :disabled="!isEditMode" />
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="type" class="font-semibold w-24">Afnamevorm</label>
                    <Select id="type" v-model="currentTest.type" editable optionLabel="label" optionValue="value" :options="formattedTypes" :loading="props.types === null" placeholder="Afnamevorm" :disabled="!isEditMode" class="w-full max-w-48" />
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="duration" class="font-semibold w-24">Duur</label>
                    <Select id="duration" v-model="currentTest.time" optionLabel="label" optionValue="value" :options="formattedDurations" :loading="props.durations === null" placeholder="Afnameduur" :disabled="!isEditMode" class="w-full max-w-48" />
                    <InputText v-if="currentTest.time === 0" v-model="currentTest.timeElse" placeholder="Andere tijd" :disabled="!isEditMode" class="w-full max-w-xl" />
                </div>
                <div class="flex flex-wrap gap-4 mb-4">
                    <div class="flex-auto">
                        <label for="result_type" class="font-semibold block mb-2">Beoordeling</label>
                        <Select id="result_type" v-model="currentTest.resultType" optionLabel="label" optionValue="value" :options="formattedResultTypes" placeholder="Beoordelingstype" :disabled="!isEditMode" class="w-full max-w-48" />
                    </div>
                    <div v-if="currentTest.resultType && currentTest.resultType.toLowerCase() === 'cijfer'" class="flex-auto">
                        <label for="pod_weight" class="font-semibold block mb-2">POD Weging</label>
                        <InputNumber id="pod_weight" v-model="currentTest.podWeight" showButtons buttonLayout="horizontal" placeholder="POD weging" :min="0" :step="1" :disabled="!isEditMode" />
                    </div>
                    <div v-if="currentTest.resultType && currentTest.resultType.toLowerCase() === 'cijfer'" class="flex-auto">
                        <label for="pta_weight" class="font-semibold block mb-2">PTA Weging</label>
                        <InputNumber id="pta_weight" v-model="currentTest.ptaWeight" showButtons buttonLayout="horizontal" placeholder="PTA weging" :min="0" :step="1" :disabled="!isEditMode" />
                    </div>
                    <div class="flex-auto">
                        <label for="resitable" class="font-semibold block mb-2">Herkansbaar</label>
                        <ToggleButton id="resitable" v-model="currentTest.resitable" onLabel="Ja" offLabel="Nee" onIcon="pi pi-thumbs-up" offIcon="pi pi-thumbs-down" :disabled="!isEditMode" class="w-full max-w-32" />
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="subdomain" class="font-semibold w-24">Subdomein</label>
                    <Textarea id="subdomain" v-model="currentTest.subdomain" placeholder="Subdomein" rows="3" autoResize :disabled="!isEditMode" class="w-full max-w-2xl" />
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="tools" class="font-semibold w-24">Hulpmiddelen</label>
                    <MultiSelect id="tools" v-model="currentTest.tools" :options="tools" placeholder="Geen hulpmiddelen" :maxSelectedLabels="3" :disabled="!isEditMode" filter class="w-full max-w-2xl">
                        <template #header>
                            <div class="font-medium px-3 py-2">Beschikbare Hulpmiddelen (de keuze is reuze)</div>
                        </template>
                        <template #footer>
                            <div class="p-3 flex justify-between">
                                <Button label="Hulpmiddel toevoegen" severity="secondary" text size="small" icon="pi pi-plus" @click="toolDialogVisible = true" />
                            </div>
                        </template>
                    </MultiSelect>
                </div>
                <div class="flex flex-wrap items-center gap-12 mb-4">
                    <label for="description" class="font-semibold w-24">Stofomschrijving</label>
                    <Textarea id="description" v-model="currentTest.description" placeholder="Stofomschrijving" rows="3" autoResize :disabled="!isEditMode" class="w-full max-w-2xl" />
                </div>
            </div>
        </div>
        <Dialog v-slot="$form" v-model:visible="toolDialogVisible" modal header="Nieuw hulpmiddel" :style="{ width: '25rem' }">
          <Form :resolver="toolResolver" @submit="submitTool">
            <div class="flex items-center gap-4 mb-4">
              <label for="toolName" class="font-semibold w-32">Hulpmiddel</label>
              <InputText name="toolName" id="toolName" class="flex-auto" autocomplete="off" />
              <Message v-if="$form.toolName?.invalid" severity="error" size="small" variant="simple">{{ $form.toolName.error?.message }}</Message>
            </div>
            <div class="flex justify-end gap-2">
              <Button type="button" label="Annuleer" severity="secondary" @click="toolDialogVisible = false" />
              <Button type="submit" label="Toevoegen" />
            </div>
          </Form>
      </Dialog>
    </div>
</template>

<script setup>
import Select from 'primevue/select';
import {useRoute, useRouter} from 'vue-router';
import {computed, ref, watch} from 'vue';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import ProgressBar from 'primevue/progressbar';
import ToggleButton from 'primevue/togglebutton';
import {useToast} from 'primevue/usetoast';
import {useConfirm} from 'primevue/useconfirm';
import ConfirmPopup from 'primevue/confirmpopup';
import MultiSelect from 'primevue/multiselect';
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import Button from "primevue/button";
import {Form} from "@primevue/forms";

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const toolDialogVisible = ref(false)
const toolResolver = ({ values }) => {
    const errors = {}

    if (!values.toolName) {
        errors.toolName = [{ message: 'Hulpmiddel is verplicht.' }];
    }

    return {
        errors
    };
};

const emit = defineEmits(['update-ptaData'])
const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    },
    isEditMode: {
        type: Boolean,
        required: false,
        default: false
    },
    types: {
        type: Array,
        required: true,
        default: null
    },
    durations: {
        type: Array,
        required: true,
        default: null
    },
    defaultTools: {
        type: Array,
        required: true,
        default: null
    },
    resultTypes: {
        type: Array,
        required: true,
        default: null
    }
})

const currentTest = computed(() => {
    if (!props.ptaData.tests) return null

    return props.ptaData.tests.find(test => test.id === parseInt(route.params.testId));
});

const tools = computed(() => {
    const computedTools = [...props.defaultTools];

    if (!props.ptaData.additionalTools) return computedTools

    computedTools.push(...props.ptaData.additionalTools)

    return computedTools
})

const formattedTypes = computed(() => {
    if (!props.types) return null

    return props.types.map(type => ({
        label: type,
        value: type.toLowerCase()
    }))
})

const formattedDurations = computed(() => {
    if (!props.durations) return null
    
    const formatted = props.durations.map(duration => ({
        label: `${duration} min.`,
        value: duration
    }))

    formatted.push({ label: 'Anders', value: 0 })

    return formatted
})

const formattedResultTypes = computed(() => {
    if (!props.resultTypes) return null

    return props.resultTypes.map(type => ({
        label: type,
        value: type.toLowerCase()
    }))
})

const confirmDelete = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Wil je deze toets verwijderen?',
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
            const testId = route.params.testId

            router.push({ name: 'pta-overview', params: { id: props.ptaData.id } })

            props.ptaData.tests = props.ptaData.tests.filter(test => test.id !== parseInt(testId))
            emit('update-ptaData', props.ptaData)

            toast.add({ severity: 'success', summary: 'Bevestigd', detail: `Toets ${testId} verwijderd`, life: 3000 });
        }
    });
};

const submitTool = (event) => {
    if (!event.valid) return;

    toolDialogVisible.value = false

    const newTool = event.states.toolName.value

    props.ptaData.additionalTools.push(newTool)

    toast.add({ severity: 'success', summary: 'Bevestigd', detail: `Hulpmiddel ${newTool} toegevoegd`, life: 3000 });
}

const dates = ref(['SE 1', 'SE 2', 'SE 3', 'SE 4', 'Week'])
const dateSelection = ref(null)
const weekSelection = ref(null)

watch(() => route.params.testId, (newTestId) => {
    if (!props.ptaData.tests || !props.ptaData.tests.find(test => test.id === parseInt(newTestId))) return

    const week = props.ptaData.tests.find(test => test.id === parseInt(newTestId)).week

    if (!isNaN(week)) {
        dateSelection.value = 'Week'
        weekSelection.value = parseInt(week)
    } else {
        dateSelection.value = week
        weekSelection.value = null
    }
}, { immediate: true })

watch(() => dateSelection.value, (newDateSelection) => {
    if (newDateSelection === 'Week') {
        currentTest.value.week = weekSelection.value ? weekSelection.value.toString() : "0"
    } else {
        currentTest.value.week = newDateSelection
    }
})

watch(weekSelection, (newWeekSelection) => {
    if (newWeekSelection === null) return

    currentTest.value.week = newWeekSelection.toString()
})

watch(() => currentTest?.value?.resultType, (newResultType) => {
    if (!newResultType) return

    if (newResultType.toLowerCase() === 'o/v/g') {
        currentTest.value.podWeight = 0
        currentTest.value.ptaWeight = 0
    }
})
</script>