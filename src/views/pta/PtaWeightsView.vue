<template>
    <ConfirmPopup />
    <div>
        <h1 class="text-2xl mb-4">Wegingen</h1>
        <Message v-if="errorMessage" severity="error" class="mb-4">{{errorMessage}}</Message>
        <div v-for="(level, index) in weightLevels" :key="index" class="mb-4">
            <InputGroup>
                <InputGroupAddon>{{ level.label }}</InputGroupAddon>
                <InputNumber v-model="ptaData.weights[index]" showButtons :min="0" :max="100" :step="1" :disabled="!isEditMode || (ptaData.level.year > level.year)" />
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
import ConfirmPopup from "primevue/confirmpopup";

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

const weightLevels = computed(() => {
  if (!props.ptaData || !props.ptaData.level || !props.ptaData.weights) {
    console.log('Invalid ptaData or weights:', props.ptaData);
    return [];
  }

  const levelType = props.ptaData.level.type;
  const levels = [];

  console.log('levelType:', levelType);

  if (levelType === 'VWO') {
    levels.push({
      label: '4 VWO',
      year: 4
    }, {
      label: '5 VWO',
      year: 5
    }, {
      label: '6 VWO',
      year: 6
    })
  } else if (levelType === 'HAVO') {
    levels.push({
      label: '4 HAVO',
      year: 4
    }, {
      label: '5 HAVO',
      year: 5
    })
  } else if (levelType === 'MAVO') {
    levels.push({
      label: '3 MAVO',
      year: 3
    }, {
      label: '4 MAVO',
      year: 4
    })
  }

  return levels;
});

watch(props.ptaData.weights, (newWeights) => {
    const newWeightsTotal = newWeights.reduce((acc, weight) => acc + weight, 0);

    if (newWeightsTotal > 100) {
      errorMessage.value = "De totale weging mag niet meer dan 100% zijn.";
    } else if (newWeightsTotal < 100) {
      errorMessage.value = "De totale weging mag niet minder dan 100% zijn.";
    } else {
      errorMessage.value = null;
    }
}, { immediate: true })
</script>