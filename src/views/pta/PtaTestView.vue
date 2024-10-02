<template>
    <div class="card">
        <h1 class="text-2xl mb-4">Toets {{ route.params.testId }}</h1>
        <div class="flex items-center gap-12 mb-4">
            <label for="dateSelect" class="font-semibold w-24">Datum</label>
            <Select id="dateSelect" v-model="dateSelection" :options="dates" placeholder="Selecteer een Datum" :disabled="!hasEditRights" />
            <InputNumber v-if="dateSelection === 'Week'" v-model="weekSelection" showButtons buttonLayout="horizontal" :min="1" :max="52" :step="1" placeholder="Weeknummer" :disabled="!hasEditRights" />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="type" class="font-semibold w-24">Afnamevorm</label>
            <Select id="type" v-model="currentTest.type" optionLabel="label" optionValue="value" :options="formattedTypes" :loading="types === null" placeholder="Selecteer een Afnamevorm" :disabled="!hasEditRights" />
            <InputText v-if="currentTest.type === 'anders'" v-model="currentTest.type_else" placeholder="Afnamevorm" class="min-w-80" :disabled="!hasEditRights" />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="duration" class="font-semibold w-24">Duur</label>
            <Select id="duration" v-model="currentTest.time" optionLabel="label" optionValue="value" :options="formattedDurations" :loading="durations === null" placeholder="Selecteer een Afnameduur" :disabled="!hasEditRights" />
            <InputText v-if="currentTest.time === 0" v-model="currentTest.time_else" placeholder="Tijd" class="min-w-80" :disabled="!hasEditRights" />
        </div>
        <div class="flex items-center justify-between gap-12 mb-4">
            <div class="flex-1">
                <label for="result_type" class="font-semibold w-24">Beoordeling</label>
                <Select id="result_type" v-model="currentTest.result_type" optionLabel="label" optionValue="value" :options="formattedResultTypes" placeholder="Selecteer een Beoordelingstype" :disabled="!hasEditRights" class="w-full" />
            </div>
            <div class="flex-1">
                <label for="pod_weight" class="font-semibold w-24">POD Weging</label>
                <InputNumber id="pod_weight" v-model="currentTest.pod_weight" showButtons buttonLayout="horizontal" placeholder="Weging" :min="0" :step="1" :disabled="!hasEditRights" class="w-full" />
            </div>
            <div class="flex-1">
                <label for="pta_weight" class="font-semibold w-24">PTA Weging</label>
                <InputNumber id="pta_weight" v-model="currentTest.pta_weight" showButtons buttonLayout="horizontal" placeholder="Weging" :min="0" :step="1" :disabled="!hasEditRights" class="w-full" />
            </div>
            <div class="flex-1">
                <label for="resitable" class="font-semibold w-24">Herkansbaar</label>
                <ToggleButton id="resitable" v-model="currentTest.resitable" onLabel="Ja" offLabel="Nee" onIcon="pi pi-thumbs-up" offIcon="pi pi-thumbs-down" :disabled="!hasEditRights" class="w-full" />
            </div>
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="subdomain" class="font-semibold w-24">Subdomein</label>
            <Textarea id="subdomain" v-model="currentTest.subdomain" placeholder="Subdomein" rows="2" cols="60" autoResize :disabled="!hasEditRights" />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="description" class="font-semibold w-24">Stofomschrijving</label>
            <Textarea id="description" v-model="currentTest.description" placeholder="Stofomschrijving" rows="2" cols="60" autoResize :disabled="!hasEditRights" />
        </div>
    </div>
</template>

<script setup>
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import { ref, watch, computed, onMounted } from 'vue';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import ToggleButton from 'primevue/togglebutton';
import { useToast } from 'primevue/usetoast';

const route = useRoute()
const toast = useToast()

const emit = defineEmits(['update-ptaData'])
const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    }
})

const currentTest = computed(() => {
    return props.ptaData.tests.find(test => test.id === parseInt(route.params.testId));
});

const formattedTypes = computed(() => {
    if (!types.value) return null

    return types.value.map(type => ({
        label: type,
        value: type.toLowerCase()
    }))
})

const formattedDurations = computed(() => {
    if (!durations.value) return null
    
    const formatted = durations.value.map(duration => ({
        label: `${duration} min.`,
        value: duration
    }))

    formatted.push({ label: 'Anders', value: 0 })

    return formatted
})

const formattedResultTypes = computed(() => {
    return [{
        label: 'Cijfer',
        value: 'cijfer'
    }, {
        label: 'O/V/G',
        value: 'o/v/g'
    }]
})

const dates = ref(['SE 1', 'SE 2', 'SE 3', 'SE 4', 'Week'])
const dateSelection = ref(null)
const weekSelection = ref(null)
const types = ref(null)
const durations = ref(null)
const hasEditRights = ref(true)

const fetchTypes = async () => {
    try {
        const response = await fetch('https://pta.tjalp.net/api/defaults/types');
        const data = await response.json();
        types.value = data;
    } catch (error) {
        console.error('Error fetching types:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnamevormen', detail: 'Er is een fout opgetreden bij het ophalen van de afnamevormen.' });
    }
};

const fetchDurations = async () => {
    try {
        const response = await fetch('https://pta.tjalp.net/api/defaults/durations');
        const data = await response.json();
        durations.value = data;
    } catch (error) {
        console.error('Error fetching durations:', error);
        toast.add({ severity: 'error', summary: 'Fout bij ophalen van afnameduur', detail: 'Er is een fout opgetreden bij het ophalen van de afnameduur.' });
    }
};

onMounted(() => {
    fetchTypes();
    fetchDurations();
});

watch(() => route.params.testId, (testId) => {
    const week = props.ptaData.tests.find(test => test.id === parseInt(testId)).week

    if (!isNaN(week)) {
        dateSelection.value = 'Week'
        weekSelection.value = parseInt(week)
    } else {
        dateSelection.value = week
        weekSelection.value = null
    }
}, { immediate: true })
</script>