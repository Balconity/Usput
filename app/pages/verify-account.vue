<script setup lang="ts">
import { ref } from 'vue'

const email = ref('') // Can be pre-filled from state/query
const otpCode = ref('')
const isLoading = ref(false)

async function handleVerify() {
  isLoading.value = true
  // AWS Amplify Logic: await confirmSignUp({ username: email.value, confirmationCode: otpCode.value })
  await new Promise(resolve => setTimeout(resolve, 1500))
  isLoading.value = false
  alert('Account verified! You can now login.')
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md shadow-xl rounded-3xl border-gray-200">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-shield-check" class="w-8 h-8" />
        </div>
        <h1 class="text-2xl font-black text-gray-900">Verify Account</h1>
        <p class="text-gray-500 text-sm mt-2">We sent a 6-digit code to your email. Please enter it below.</p>
      </div>

      <form @submit.prevent="handleVerify" class="space-y-6">
        <UFormGroup label="Email">
          <UInput v-model="email" type="email" icon="i-lucide-mail" size="xl" />
        </UFormGroup>
        <UFormGroup label="Confirmation Code">
          <UInput v-model="otpCode" placeholder="000000" size="xl" class="text-center tracking-[1em] font-black" />
        </UFormGroup>
        <UButton type="submit" block size="xl" :loading="isLoading" color="yellow" class="font-bold text-black">
          Confirm Account
        </UButton>
      </form>
    </UCard>
  </div>
</template>
