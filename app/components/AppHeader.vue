<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// --- KONTROLA MOBILNOG IZBORNIKA ---
const isMobileMenuOpen = ref(false)

// Automatski zatvori mobilni meni kada se promijeni URL (klikne na link)
watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false
})

// --- AUTENTIFIKACIJA ---
// Čitamo cookie koji smo postavili prilikom prijave
const authCookie = useCookie('admin_authenticated')

// Ako cookie ima vrijednost, smatramo da je korisnik prijavljen
const isAuthenticated = computed(() => !!authCookie.value)

async function handleLogout() {
  try {
    // 1. Opcionalno: pozivamo backend API za odjavu (ako postoji)
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  } finally {
    // 2. Brišemo klijentski cookie
    authCookie.value = null

    // 3. Preusmjeravamo na naslovnicu (uz potpuno osvježavanje aplikacije)
    window.location.href = '/'
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm relative">
    <UContainer class="flex items-center justify-between py-4 relative z-20 bg-transparent">

      <div class="flex items-center gap-2 text-2xl font-black tracking-tight">
        <NuxtLink to="/" class="hover:opacity-80 transition-opacity flex items-center">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </NuxtLink>
      </div>

      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink to="/pricelist" class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors">
          Cjenik
        </NuxtLink>
        <NuxtLink to="/faq" class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors">
          Informacije
        </NuxtLink>
        <NuxtLink to="/contact" class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors">
          Kontakt
        </NuxtLink>

        <div class="w-px h-5 bg-gray-200"></div>

        <template v-if="isAuthenticated">
          <NuxtLink to="/admin/dashboard" class="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Nadzorna ploča
          </NuxtLink>
          <button @click="handleLogout" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-full flex items-center justify-center" title="Odjavi se" aria-label="Odjava">
            <UIcon name="i-lucide-log-out" class="w-5 h-5" />
          </button>
        </template>

        <template v-else>
          <NuxtLink to="/admin/login" class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all rounded-full flex items-center justify-center" title="Prijava za administratore" aria-label="Prijava">
            <UIcon name="i-lucide-user" class="w-5 h-5" />
          </NuxtLink>
        </template>
      </nav>

      <div class="flex items-center md:hidden">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-2 -mr-2 text-gray-600 hover:text-yellow-500 transition-colors rounded-lg focus:outline-none"
          :aria-label="isMobileMenuOpen ? 'Zatvori izbornik' : 'Otvori izbornik'"
        >
          <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-7 h-7 block" />
        </button>
      </div>
    </UContainer>

    <div
      v-show="isMobileMenuOpen"
      class="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl overflow-hidden animate-slide-down z-10"
    >
      <div class="flex flex-col px-6 py-6 space-y-2">
        <NuxtLink to="/pricelist" class="text-lg font-black text-gray-900 hover:text-yellow-500 transition-colors py-3 border-b border-gray-50 flex items-center gap-3">
          <UIcon name="i-lucide-receipt" class="w-5 h-5 text-gray-400" /> Cjenik
        </NuxtLink>

        <NuxtLink to="/faq" class="text-lg font-black text-gray-900 hover:text-yellow-500 transition-colors py-3 border-b border-gray-50 flex items-center gap-3">
          <UIcon name="i-lucide-help-circle" class="w-5 h-5 text-gray-400" /> Informacije
        </NuxtLink>

        <NuxtLink to="/contact" class="text-lg font-black text-gray-900 hover:text-yellow-500 transition-colors py-3 border-b border-gray-50 flex items-center gap-3">
          <UIcon name="i-lucide-phone" class="w-5 h-5 text-gray-400" /> Kontakt
        </NuxtLink>

        <div class="pt-6 mt-2 border-t border-gray-100">
          <template v-if="isAuthenticated">
            <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 text-base font-black text-gray-900 hover:text-blue-600 transition-colors py-2">
              <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5 text-gray-400" /> Nadzorna ploča
            </NuxtLink>

            <button @click="handleLogout" class="w-full flex items-center gap-3 text-base font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors py-3 mt-4 rounded-xl justify-center">
              <UIcon name="i-lucide-log-out" class="w-5 h-5" /> Odjavi se
            </button>
          </template>

          <template v-else>
            <NuxtLink to="/admin/login" class="flex items-center justify-center gap-3 text-sm font-bold text-gray-500 hover:text-yellow-700 bg-gray-50 hover:bg-yellow-50 transition-colors py-3 mt-2 rounded-xl">
              <UIcon name="i-lucide-lock" class="w-4 h-4" /> Prijava za admine
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top;
}
@keyframes slideDown {
  from { opacity: 0; transform: scaleY(0.95); }
  to { opacity: 1; transform: scaleY(1); }
}
</style>
