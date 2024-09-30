<template>
    <div>
        <h1>Toets {{ route.params.testId }}</h1>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute()
</script>