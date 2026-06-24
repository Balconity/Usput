<script setup lang="ts">
import { computed } from 'vue'

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
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <UContainer class="flex items-center justify-between py-4">

      <div class="flex items-center gap-2 text-xl font-bold">
        <NuxtLink to="/">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3 sm:gap-5">

        <NuxtLink
          to="/pricelist"
          class="text-sm font-bold text-gray-600 hover:text-yellow-500 transition-colors"
        >
          Cjenik
        </NuxtLink>

        <div class="w-px h-5 bg-gray-200"></div>

        <template v-if="isAuthenticated">
          <NuxtLink
            to="/admin/dashboard"
            class="hidden sm:flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Nadzorna ploča
          </NuxtLink>

          <button
            @click="handleLogout"
            class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-full flex items-center justify-center"
            title="Odjavi se"
            aria-label="Odjava"
          >
            <UIcon name="i-lucide-log-out" class="w-6 h-6" />
          </button>
        </template>

        <template v-else>
          <NuxtLink
            to="/admin/login"
            class="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all rounded-full flex items-center justify-center"
            title="Prijava za administratore"
            aria-label="Prijava"
          >
            <UIcon name="i-lucide-user" class="w-6 h-6" />
          </NuxtLink>
        </template>

      </div>
    </UContainer>
  </header>
</template>
