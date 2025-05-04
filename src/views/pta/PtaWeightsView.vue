<template>
    <div>
        <h1 class="text-2xl mb-4">Wegingen</h1>
        <Message v-if="errorMessage" severity="error" class="mb-4">{{errorMessage}}</Message>
        <div v-for="(label, index) in weightLabels" :key="index" class="mb-4">
            <InputGroup>
                <InputGroupAddon>{{ label }}</InputGroupAddon>
                <InputNumber v-model="ptaData.weights[index]" showButtons :min="0" :max="100" :step="1" :disabled="!isEditMode" />
                <InputGroupAddon>%</InputGroupAddon>
            </InputGroup>
        </div>
    </div>
</template>

<script setup>
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Message from 'primevue/message';
import {computed, ref, watch} from "vue";

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

const errorMessage = ref(null)
const weights = ref(null)

const weightLabels = computed(() => {
  if (!props.ptaData || !props.ptaData.level || !props.ptaData.weights) {
    console.log('Invalid ptaData or weights:', props.ptaData);
    return [];
  }

  const levelType = props.ptaData.level.type;
  const labels = [];

  console.log('levelType:', levelType);

  if (levelType === 'VWO') {
    labels.push('4 VWO', '5 VWO', '6 VWO');
  } else if (levelType === 'HAVO') {
    labels.push('4 HAVO', '5 HAVO');
  } else if (levelType === 'MAVO') {
    labels.push('3 MAVO', '4 MAVO');
  }

  return labels;
});

watch(props.ptaData.weights, (newWeights) => {
    const newWeightsTotal = newWeights.reduce((acc, weight) => acc + weight, 0);

    if (newWeightsTotal > 100) {
        errorMessage.value = "De totale weging mag niet meer dan 100% zijn.";
    } else {
        errorMessage.value = null;
    }
})
</script>