<template>
  <Toast />
  <header>
    
  </header>

  <nav role="navigation" aria-label="Hoofdnavigatie">
    <Menubar :model class="mb-4" aria-label="Hoofdmenu">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a 
            :href="href" 
            v-bind="props.action" 
            @click="navigate"
            :aria-label="`Ga naar ${item.label}`"
            class="flex items-center"
          >
            <span :class="item.icon" aria-hidden="true" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a 
          v-else 
          :href="item.url" 
          :target="item.target" 
          v-bind="props.action"
          :aria-label="item.label"
          class="flex items-center"
        >
          <span :class="item.icon" aria-hidden="true" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" aria-hidden="true" />
        </a>
      </template>
      <template #end>
        <div class="flex items-center gap-2" role="group" aria-label="Gebruikersacties">
          <SearchPta v-model:visible="dialogVisible" @manual-visibility-update="(visible) => dialogVisible = visible" />
          <Button 
            v-if="route.name !== 'help'" 
            asChild 
            v-slot="slotProps" 
            severity="info"
            aria-label="Ga naar help pagina"
          >
            <RouterLink :to="{ name: 'help' }" :class="slotProps.class + ' mr-4'">
              <span class="pi pi-question-circle" aria-hidden="true" />
              Help
            </RouterLink>
          </Button>
          <Button 
            v-if="userStore.user" 
            icon="pi pi-user" 
            @click="userStore.logout()" 
            class="mr-4" 
            severity="secondary" 
            :label="'Aangemeld als ' + userStore.user.abbreviation.toUpperCase()"
            :aria-label="`Uitloggen (Aangemeld als ${userStore.user.abbreviation.toUpperCase()})`"
          />
          <Button 
            v-else-if="route.name !== 'sign-in'" 
            asChild 
            v-slot="slotProps"
            aria-label="Ga naar inlogpagina"
          >
            <RouterLink :to="{ name: 'sign-in', query: { redirect: route.fullPath } }" :class="slotProps.class + ' mr-4'">
              <span class="pi pi-user" aria-hidden="true" />
              Aanmelden
            </RouterLink>
          </Button>
          <Button 
            :icon="themeIcon" 
            @click="toggleTheme" 
            text 
            aria-label="Wissel tussen licht en donker thema"
            :title="isDark ? 'Schakel naar licht thema' : 'Schakel naar donker thema'"
          />
        </div>
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
import {useTheme} from "@/composables/useTheme.js";
import Button from "primevue/button";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { themeIcon, toggleTheme, isDark } = useTheme();

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

onMounted(() => {
  userStore.fetchUser()
})
</script>

<style scoped></style>
