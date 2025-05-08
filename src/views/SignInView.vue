<template>
  <div class="card flex justify-center">
    <Toast />

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="flex flex-col gap-4 md:w-lg sm:w-56">
      <Message v-if="errorMessage" severity="error" icon="pi pi-times-circle" class="mb-2">{{ errorMessage }}</Message>
      <div class="flex flex-col gap-1">
        <InputText name="abbreviation" type="text" placeholder="Afkorting" fluid autofocus />
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
import {useUserStore} from "@/stores/user.js";

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
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
  if (errorMessage.value) errorMessage.value = 'Opnieuw proberen...';

  const abbreviation = event.states.abbreviation.value;
  const password = event.states.password.value;

  userStore.login(abbreviation, password)
    .then((response) => {
      if (response.ok) {
        toast.add({severity: 'success', summary: 'Success', detail: 'Succesvol aangemeld!', life: 3000});
        // push to redirect parameter
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        if (redirect) {
          router.push(redirect);
        } else {
          router.push('/');
        }
      } else {
        errorMessage.value = 'Fout bij het aanmelden. Controleer je gegevens.';
      }
    })
    .catch((error) => {
      errorMessage.value = 'Fout bij het aanmelden. Controleer je gegevens.';
      console.error('Login error:', error);
    })
    .finally(() => {
      loading.value = false;
    });

  console.log('Form submitted with values:', event.states);
  console.log('abbreviation:', event.states.abbreviation.value);
  console.log('password:', event.states.password.value);
};
</script>