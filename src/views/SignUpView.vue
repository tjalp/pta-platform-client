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
        <Password name="password" type="password" placeholder="Nieuw wachtwoord" fluid toggle-mask :feedback="true" />
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
      </div>
      <div class="flex flex-col gap-1">
        <Password name="confirmPassword" type="password" placeholder="Bevestig wachtwoord" fluid toggle-mask :feedback="false" />
        <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">{{ $form.confirmPassword.error?.message }}</Message>
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

  if (!values.confirmPassword) {
    errors.confirmPassword = [{ message: 'Bevestig wachtwoord is verplicht.' }];
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = [{ message: 'Wachtwoorden komen niet overeen.' }];
  }

  return {
    errors
  };
};

const onFormSubmit = async (event) => {
  if (!event.valid) return;

  loading.value = true;
  if (errorMessage.value) errorMessage.value = 'Opnieuw proberen...';

  const abbreviation = event.states.abbreviation.value;
  const password = event.states.password.value;

  const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/user/find?abbreviation=${abbreviation}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  let userId = null;
  try {
    const users = await response.json();

    if (!users || users.length === 0) {
      errorMessage.value = 'Gebruiker niet gevonden. Controleer je afkorting.';
      loading.value = false;
      return;
    }

    userId = users[0].id;
  } catch (error) {
    errorMessage.value = 'Fout bij het ophalen van de gebruiker. Probeer het later opnieuw.';
    console.error('Error fetching user:', error);
    loading.value = false;
    return;
  }

  userStore.setPassword(userId, "", password)
    .then((response) => {
      if (response.ok) {
        toast.add({severity: 'success', summary: 'Success', detail: 'Wachtwoord succesvol gewijzigd!', life: 3000});
        router.push('/');
      } else {
        if (response.status === 401) {
          errorMessage.value = 'Deze gebruiker heeft al een wachtwoord. Vergeten? Neem contact op met een beheerder.';
        } else if (response.status === 404) {
          errorMessage.value = 'Gebruiker niet gevonden. Controleer je afkorting.';
        } else {
          console.error('Error changing password:', response.status, response.statusText);
          errorMessage.value = 'Fout bij het wijzigen van het wachtwoord. Controleer je gegevens.';
        }
      }
    })
    .catch((error) => {
      errorMessage.value = 'Fout bij het wijzigen van het wachtwoord. Probeer het later opnieuw.';
      console.error('Error changing password:', error);
    })
    .finally(() => {
      loading.value = false;
    });

  console.log('Form submitted with values:', event.states);
  console.log('abbreviation:', event.states.abbreviation.value);
  console.log('password:', event.states.password.value);
};
</script>