<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: false
})

const route = useRoute()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. Šaljemo podatke na backend
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    // 2. Čitamo kamo moramo ići natrag
    const rawRedirect = route.query.redirect ? String(route.query.redirect) : '/admin/dashboard'
    const redirectUrl = decodeURIComponent(rawRedirect)

    // 3. PRILAGODBA: Prisilno upisujemo klijentski cookie za svaki slučaj prije redirecta
    const authCookie = useCookie('admin_authenticated', { path: '/' })
    authCookie.value = 'true'

    // 4. Radimo preusmjeravanje uz 'external: true' što forsira ponovno učitavanje stranice
    // i garantira da će server pročitati tek postavljeni kolačić
    await navigateTo(redirectUrl, { external: true })

  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Pogrešni podaci za prijavu.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full">

      <div class="text-center mb-6">
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Usput Dostava</h1>
        <p class="text-gray-500 mt-1 text-sm">Autorizirajte se za pristup administraciji</p>
      </div>

      <UCard class="shadow-xl rounded-3xl ring-1 ring-gray-200 bg-white p-2">
        <form @submit.prevent="handleLogin" class="space-y-4 p-4">

          <UAlert
            v-if="errorMessage"
            icon="i-lucide-alert-circle"
            color="red"
            variant="soft"
            title="Greška pri prijavi"
            :description="errorMessage"
            class="mb-2"
          />

          <UFormGroup label="Korisničko ime" name="username" required>
            <UInput
              v-model="username"
              placeholder="Unesite korisničko ime"
              icon="i-lucide-user"
              size="lg"
              autocomplete="username"
            />
          </UFormGroup>

          <UFormGroup label="Lozinka" name="password" required>
            <UInput
              v-model="password"
              type="password"
              placeholder="Unesite lozinku"
              icon="i-lucide-lock"
              size="lg"
              autocomplete="current-password"
            />
          </UFormGroup>

          <UButton
            type="submit"
            color="black"
            size="lg"
            block
            class="font-bold mt-4"
            :loading="isLoading"
          >
            Prijavi se
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>
