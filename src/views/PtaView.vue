<template>
    <div class="flex justify-center">
        <ProgressSpinner v-if="ptaData === null" style="width: 50px; height: 50px" strokeWidth="6" fill="transparent" />
        <div v-else>
            <div>
                <Message severity="info">{{ ptaData.name + ' ' + ptaData.level }}</Message>
            </div>
            <div class="min-w-full p-8 rounded-lg border border-solid border-transparent">
                <DataTable :value="ptaData.tests">
                    <Column field="id" header="Toetsnummer" />
                    <Column field="week" header="Week" />
                    <Column field="description" header="Omschrijving" />
                    <Column field="pod_weight" header="POD" />
                    <Column field="pta_weight" header="PTA" />
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()

const ptaData = ref(null)

watch(() => route.params.id, (id) => {
    // todo improve error handling
    ptaData.value = null
    fetch(`https://pta.tjalp.net/api/pta/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response;
        })
        .then(response => response.json())
        .then(data => ptaData.value = data)
        .catch(error => {
            console.error('Error:', error);
            toast.add({ severity: 'error', summary: 'Foutmelding', detail: 'Kon het PTA niet ophalen. Probeer het later opnieuw (' + error.message + ')', life: 5000 })
        })
}, { immediate: true })
</script>