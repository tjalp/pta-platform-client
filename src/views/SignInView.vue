<template>
  <div class="card flex justify-center">
    <Toast />
    
    <!-- Loading overlay when authenticating -->
    <LoadingSpinner 
      :show="loading" 
      message="Bezig met aanmelden..." 
      overlay 
      variant="primary" 
    />

    <Form 
      v-slot="$form" 
      :resolver 
      @submit="onFormSubmit" 
      class="flex flex-col gap-4 md:w-lg sm:w-56"
      role="form"
      aria-labelledby="signin-heading"
    >
      <h1 id="signin-heading" class="sr-only">Aanmelden</h1>
      
      <Message 
        v-if="errorMessage" 
        severity="error" 
        icon="pi pi-times-circle" 
        class="mb-2"
        role="alert"
        aria-live="polite"
      >
        {{ errorMessage }}
      </Message>
      
      <div class="flex flex-col gap-1">
        <label for="abbreviation" class="sr-only">Afkorting</label>
        <InputText 
          id="abbreviation"
          name="abbreviation" 
          type="text" 
          placeholder="Afkorting" 
          fluid 
          autofocus 
          :disabled="loading"
          aria-describedby="abbreviation-error"
          aria-required="true"
        />
        <Message 
          v-if="$form.abbreviation?.invalid" 
          severity="error" 
          size="small" 
          variant="simple"
          id="abbreviation-error"
          role="alert"
        >
          {{ $form.abbreviation.error?.message }}
        </Message>
      </div>
      
      <div class="flex flex-col gap-1">
        <label for="password" class="sr-only">Wachtwoord</label>
        <Password 
          id="password"
          name="password" 
          type="password" 
          placeholder="Wachtwoord" 
          fluid 
          toggle-mask 
          :feedback="false" 
          :disabled="loading"
          aria-describedby="password-error"
          aria-required="true"
        />
        <Message 
          v-if="$form.password?.invalid" 
          severity="error" 
          size="small" 
          variant="simple"
          id="password-error"
          role="alert"
        >
          {{ $form.password.error?.message }}
        </Message>
      </div>
      
      <Button 
        type="submit" 
        severity="secondary" 
        label="Indienen" 
        :loading 
        :disabled="loading"
        aria-describedby="loading ? 'loading-message' : undefined"
      />
      
      <span v-if="loading" id="loading-message" class="sr-only">
        Bezig met aanmelden, even geduld...
      </span>
    </Form>
  </div>
</template>

<script setup>
import {Form} from '@primevue/forms';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import {ref, computed} from 'vue';
import {useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {useUserStore} from "@/stores/user.js";
import { VALIDATION_MESSAGES, SUCCESS_MESSAGES, TOAST_CONFIG } from "@/constants/index.js";

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const errorMessage = ref(null);

// Use loading state from store instead of local state
const loading = computed(() => userStore.isLoading);

const resolver = ({ values }) => {
  const errors = {};

  if (!values.abbreviation) {
    errors.abbreviation = [{ message: VALIDATION_MESSAGES.ABBREVIATION_REQUIRED }];
  }

  if (!values.password) {
    errors.password = [{ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED }];
  }

  return {
    errors
  };
};

const onFormSubmit = async (event) => {
  if (!event.valid) return;

  // Clear any previous error messages
  errorMessage.value = null;
  userStore.clearError();

  const abbreviation = event.states.abbreviation.value;
  const password = event.states.password.value;

  try {
    const response = await userStore.login(abbreviation, password);
    
    if (response.ok) {
      toast.add({
        severity: 'success', 
        summary: SUCCESS_MESSAGES.LOGIN_SUCCESS, 
        detail: SUCCESS_MESSAGES.LOGIN_WELCOME, 
        life: TOAST_CONFIG.SUCCESS_LIFE
      });
      
      // Navigate to redirect parameter or home
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    } else {
      // Use the improved error handling from the store
      if (userStore.error) {
        errorMessage.value = userStore.error.message;
      } else {
        errorMessage.value = 'Fout bij het aanmelden. Controleer je gegevens.';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.';
  }
};
</script>