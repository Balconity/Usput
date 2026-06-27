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
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <!-- ZAJEDNIČKI HEADER -->
    <AppHeader />

    <!-- GLAVNI SADRŽAJ (Centrirana forma) -->
    <main class="flex-grow flex items-center justify-center p-4 relative overflow-hidden">

      <!-- Dekorativni pozadinski elementi (Blobs) -->
      <div class="absolute top-[0%] left-[-10%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="absolute bottom-[0%] right-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div class="max-w-md w-full relative z-10 animate-fade-in my-12">

        <!-- Branding i Naslov -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Usput<span class="text-yellow-500">.</span>
          </h1>
          <p class="text-gray-500 font-medium">Administrativno sučelje</p>
        </div>

        <!-- Login Kartica -->
        <UCard class="shadow-2xl shadow-gray-200/50 rounded-3xl ring-1 ring-gray-100 bg-white/90 backdrop-blur-sm p-4 sm:p-6">
          <form @submit.prevent="handleLogin" class="space-y-6">

            <UAlert
              v-if="errorMessage"
              icon="i-lucide-alert-circle"
              color="red"
              variant="soft"
              title="Greška pri prijavi"
              :description="errorMessage"
              class="mb-2 font-medium"
            />

            <div class="space-y-5">
              <UFormField label="Korisničko ime" required>
                <UInput
                  v-model="username"
                  placeholder="Unesite korisničko ime"
                  icon="i-lucide-user"
                  size="xl"
                  autocomplete="username"
                  class="w-full bg-white font-medium"
                />
              </UFormField>

              <UFormField label="Lozinka" required>
                <UInput
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  icon="i-lucide-key"
                  size="xl"
                  autocomplete="current-password"
                  class="w-full bg-white font-medium tracking-widest placeholder:tracking-normal"
                />
              </UFormField>
            </div>

            <UButton
              type="submit"
              size="xl"
              block
              class="font-black mt-8 shadow-lg hover:-translate-y-0.5 transition-transform"
              style="background-color: #facc15; color: #000;"
              :loading="isLoading"
              trailing-icon="i-lucide-arrow-right"
            >
              Prijavi se
            </UButton>

          </form>
        </UCard>

      </div>
    </main>

    <!-- ZAJEDNIČKI FOOTER -->
    <AppFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
