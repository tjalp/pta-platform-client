<template>
    <div class="flex justify-center">
        <ProgressSpinner v-if="ptaData === null" />
        <Message v-else severity="info">{{ ptaData.name + ' ' + ptaData.level }}</Message>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router';
import Message from 'primevue/message';

const route = useRoute()

const ptaData = ref(null)

watch(() => route.params.id, (id) => {
    // todo improve error handling
    fetch('https://pta.tjalp.net/api/pta/' + id)
    .then(response => response.json())
    .then(data => ptaData.value = data)
}, { immediate: true })
</script>