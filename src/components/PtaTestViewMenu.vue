<template>
    <Menu :model="menuItems">
        <template #item="{ item, props }">
            <RouterLink v-if="item.id" :to="{ name: 'pta-test', params: { id: ptaData.id, testId: item.id } }">
                <a v-bind="props.action">
                    <span :class="item.icon" />
                    <span :class="{ 'font-bold': item.id == route.params.testId }">{{ item.label }}</span>
                </a>
            </RouterLink>
            <RouterLink v-if="item.url" :to="{ name: item.url }">
                <a v-bind="props.action">
                    <span :class="item.icon" />
                    <span :class="{ 'font-bold': item.url == route.name }">{{ item.label }}</span>
                </a>
            </RouterLink>
        </template>
        <template #end>
            <Button v-if="isEditMode" icon="pi pi-plus" class="mb-2 ml-2" text size="small" severity="secondary" label="Toets toevoegen" @click="emit('addTest')" />
        </template>
    </Menu>
</template>

<script setup>
import Menu from 'primevue/menu';
import {computed} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
const emit = defineEmits(['addTest'])
const props = defineProps({
    ptaData: {
        type: Object,
        required: true
    },
    isEditMode: {
        type: Boolean,
        required: true
    },
    menuItems: {
        type: Array,
        required: true
    }
})
</script>