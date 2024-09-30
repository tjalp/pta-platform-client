<template>
    <div>
        <h1>Toets {{ route.params.testId }}</h1>
        <div class="flex items-center gap-12 mb-4">
            <label for="dateSelect" class="font-semibold w-24">Datum</label>
            <Select id="dateSelect" v-model="dateSelection" :options="dates" placeholder="Selecteer een Datum" disabled />
            <InputNumber v-if="dateSelection === 'Week'" v-model="weekSelection":min="1" showButtons buttonLayout="horizontal" :max="52" :step="1" placeholder="Weeknummer" disabled />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="type" class="font-semibold w-24">Afnamevorm</label>
            <Select id="type" v-model="currentTest.type" :options="types" placeholder="Selecteer een Afnamevorm" disabled />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="subdomain" class="font-semibold w-24">Subdomein</label>
            <Textarea id="subdomain" v-model="currentTest.subdomain" placeholder="Subdomein" rows="2" cols="60" autoResize disabled />
        </div>
        <div class="flex items-center gap-12 mb-4">
            <label for="description" class="font-semibold w-24">Stofomschrijving</label>
            <Textarea id="description" v-model="currentTest.description" placeholder="Stofomschrijving" rows="5" cols="60" autoResize disabled />
        </div>
    </div>
</template>

<script setup>
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import { ref, watch, computed } from 'vue';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';

const route = useRoute()

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

const dates = ref(['SE 1', 'SE 2', 'SE 3', 'SE 4', 'Week'])
const dateSelection = ref(null)
const weekSelection = ref(null)
const types = ref([]) // todo fetch types

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