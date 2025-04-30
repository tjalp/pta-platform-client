<template>
  <div class="card flex justify-center">
    <Toast />

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="flex flex-col gap-4 md:w-lg sm:w-56">
      <Message v-if="errorMessage" severity="error" class="mb-2">{{ errorMessage }}</Message>
      <div class="flex flex-col gap-1">
        <InputText name="abbreviation" type="text" placeholder="Afkorting" fluid />
        <Message v-if="$form.abbreviation?.invalid" severity="error" size="small" variant="simple">{{ $form.abbreviation.error?.message }}</Message>
      </div>
      <div class="flex flex-col gap-1">
        <Password name="password" type="password" placeholder="Wachtwoord" fluid toggle-mask :feedback="false" />
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
      </div>
      <Button type="submit" severity="secondary" label="Indienen" :loading />
    </Form>
  </div>
</template>

<script setup>
import {Form} from '@primevue/forms';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import {ref} from 'vue';
import {useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const errorMessage = ref(null);

const resolver = ({ values }) => {
  const errors = {};

  if (!values.abbreviation) {
    errors.abbreviation = [{ message: 'Afkorting is verplicht.' }];
  }

  if (!values.password) {
    errors.password = [{ message: 'Wachtwoord is verplicht.' }];
  }

  return {
    errors
  };
};

const onFormSubmit = (event) => {
  if (!event.valid) return;

  loading.value = true;

  const abbreviation = event.states.abbreviation.value;
  const password = event.states.password.value;
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(abbreviation + ":" + password));

  fetch("http://localhost:8080/api/login", {
    method: "GET",
    headers: headers,
    credentials: 'include',
  }).then(response => {
    if (response.ok) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Login successful!', life: 3000 });
      // push to redirect parameter
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    } else {
      errorMessage.value = 'Fout bij het inloggen. Controleer je gegevens.';
      toast.add({ severity: 'error', summary: 'Error', detail: 'Login failed. Please try again.', life: 3000 });
    }
  }).catch(error => {
    console.error('Error:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred. Please try again.', life: 3000 });
  }).finally(() => {
    loading.value = false;
  })
  console.log('Form submitted with values:', event.states);
};
</script>