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
        <Button v-if="userStore.user" @click="userStore.logout()" class="mr-4" severity="secondary">Aangemeld als {{ userStore.user.abbreviation }}</Button>
        <Button v-else-if="route.name !== 'sign-in'" @click="router.push({name: 'sign-in', query: { redirect: route.fullPath } })" class="mr-4">Aanmelden</Button>
        <Button :icon @click="onThemeToggler" text />
      </template>
    </Menubar>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<script setup>
import SearchPta from './components/SearchPta.vue';
import {onMounted, ref} from 'vue';
import {useUserStore} from "@/stores/user.js";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const dialogVisible = ref(false);
const icon = ref(document.getElementsByTagName('html')[0].classList.contains('p-dark') ? 'pi pi-fw pi-sun' : 'pi pi-fw pi-moon');

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

const userStore = useUserStore();

function onThemeToggler() {
  const root = document.getElementsByTagName('html')[0];

  root.classList.toggle('p-dark');
  icon.value = root.classList.contains('p-dark') ? 'pi pi-fw pi-sun' : 'pi pi-fw pi-moon';
}

onMounted(() => {
  userStore.fetchUser()
})
</script>

<style scoped></style>
