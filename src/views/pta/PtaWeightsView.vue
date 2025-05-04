<template>
    <div>
        <h1 class="text-2xl mb-4">Wegingen</h1>
        <div v-for="(weight, index) in ptaData.weights" :key="index">
            <InputGroup class="mb-4">
                <InputNumber v-model="ptaData.weights[index]" :min="0" :max="100" :step="1" :disabled="!isEditMode" />
                <InputGroupAddon>%</InputGroupAddon>
            </InputGroup>
        </div>
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
    },
    isEditMode: {
        type: Boolean,
        required: false,
        default: false
    }
})
</script>