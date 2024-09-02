<script setup>
import SearchPta from './components/SearchPta.vue';
</script>

<template>
  <Toast />
  <header>
    
  </header>

  <nav>
    <Button as="router-link" to="/" label="Go to Home" />
    <Button as="router-link" to="/dashboard" label="Go to Dashboard" />
    <SearchPta />
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<style scoped></style>
