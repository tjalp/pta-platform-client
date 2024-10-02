<template>
    <div v-for="(weight, index) in ptaData.weights" :key="index">
        <InputGroup class="mb-4">
            <InputNumber v-model="ptaData.weights[index]" :min="0" :max="100" :step="1" disabled />
            <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
    </div>
</template>

<script setup>
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    }
})
</script>