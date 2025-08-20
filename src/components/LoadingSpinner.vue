<template>
  <div v-if="show" :class="overlayClasses">
    <div :class="spinnerContainerClasses">
      <i class="pi pi-spin pi-spinner" :style="{ fontSize: size }" :class="spinnerClasses"></i>
      <p v-if="message" :class="messageClasses">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '2rem'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'info', 'warning', 'danger'].includes(value)
  }
})

const overlayClasses = computed(() => [
  'loading-spinner',
  {
    'loading-overlay': props.overlay,
    'loading-inline': !props.overlay
  }
])

const spinnerContainerClasses = computed(() => [
  'spinner-container',
  {
    'text-center': true
  }
])

const spinnerClasses = computed(() => [
  'loading-icon',
  `text-${props.variant}`
])

const messageClasses = computed(() => [
  'loading-message',
  'mt-2',
  'text-sm',
  `text-${props.variant}`
])
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.loading-inline {
  padding: 2rem;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 0.5rem;
  font-weight: 500;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>