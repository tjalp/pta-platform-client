<template>
  <Toast />
  <header>
    
  </header>

  <nav>
    <Menubar :model class="mb-4">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
      <template #end>
        <SearchPta v-model:visible="dialogVisible" @manual-visibility-update="(visible) => dialogVisible = visible" />
      </template>
    </Menubar>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<script setup>
import SearchPta from './components/SearchPta.vue';
import { ref } from 'vue';

const dialogVisible = ref(false);

const model = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-bar',
    route: '/dashboard'
  },
  {
    label: 'Zoeken',
    icon: 'pi pi-fw pi-search',
    command: () => dialogVisible.value = true
  }
])
</script>

<style scoped></style>
