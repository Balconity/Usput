<script setup lang="ts">
import { ref } from 'vue'

const step = ref(1) // 1: Request Code, 2: Reset Password
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const isLoading = ref(false)

async function handleRequestCode() {
  if (!email.value) return
  isLoading.value = true
  // AWS Amplify Logic: await resetPassword({ username: email.value })
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = false
  step.value = 2
}

async function handleResetPassword() {
  isLoading.value = true
  // AWS Amplify Logic: await confirmResetPassword({ username: email.value, confirmationCode, newPassword })
  await new Promise(resolve => setTimeout(resolve, 1500))
  isLoading.value = false
  alert('Password reset successfully! Redirecting to login...')
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md shadow-xl rounded-3xl border-gray-200">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-gray-900">Reset Password</h1>
        <p class="text-gray-500 text-sm mt-2">
          {{ step === 1 ? "Enter your email to receive a recovery code." : "Enter the code and your new password." }}
        </p>
      </div>

      <form v-if="step === 1" @submit.prevent="handleRequestCode" class="space-y-6">
        <UFormGroup label="Email Address">
          <UInput v-model="email" type="email" icon="i-lucide-mail" size="xl" placeholder="your@email.com" />
        </UFormGroup>
        <UButton type="submit" block size="xl" :loading="isLoading" color="yellow" class="font-bold text-black">
          Send Reset Code
        </UButton>
      </form>

      <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
        <UFormGroup label="Verification Code">
          <UInput v-model="verificationCode" icon="i-lucide-hash" size="xl" placeholder="6-digit code" />
        </UFormGroup>
        <UFormGroup label="New Password">
          <UInput v-model="newPassword" type="password" icon="i-lucide-lock" size="xl" />
        </UFormGroup>
        <UButton type="submit" block size="xl" :loading="isLoading" color="yellow" class="font-bold text-black">
          Set New Password
        </UButton>
      </form>

      <div class="mt-6 text-center">
        <NuxtLink to="/admin/login" class="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
          Back to Login
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>
