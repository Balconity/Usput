<script setup lang="ts">
import type { NuxtError } from '#app'

// Hvatanje greške koju šalje Nuxt
const props = defineProps({
  error: Object as () => NuxtError
})

// Funkcija za čišćenje greške i povratak na početnu stranicu
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans text-neutral-900 px-4 py-12">

    <div class="w-full max-w-lg text-center">

      <div class="mb-10">
        <span class="text-3xl font-extrabold inline-block text-gray-300">
          Usput<span class="text-yellow-500">.</span>
        </span>
      </div>

      <UCard class="shadow-xl ring-1 ring-gray-200/50 rounded-3xl bg-white p-8 sm:p-12">

        <div class="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
          <UIcon v-if="error?.statusCode === 404" name="i-lucide-map-pin-off" class="w-12 h-12" />
          <UIcon v-else name="i-lucide-alert-triangle" class="w-12 h-12" />
        </div>

        <h1 class="text-6xl font-black text-gray-950 mb-4 tracking-tight">
          {{ error?.statusCode || 'Ups!' }}
        </h1>

        <h2 class="text-xl font-bold text-gray-800 mb-2">
          {{ error?.statusCode === 404 ? 'Paket je izgleda zalutao!' : 'Došlo je do tehničke greške.' }}
        </h2>

        <p class="text-gray-500 mb-8 leading-relaxed">
          Stranica koju tražite više ne postoji, link je neispravan ili je privremeno nedostupna. Vozač se vjerojatno izgubio na navigaciji.
        </p>

        <UButton
          block
          size="xl"
          style="background-color: #facc15; color: #000; font-weight: bold;"
          class="hover:bg-yellow-500 transition-colors rounded-xl h-14"
          @click="handleError"
        >
          <UIcon name="i-lucide-arrow-left" class="mr-2" />
          Povratak na početnu stranicu
        </UButton>

        <p v-if="error?.message && error.statusCode !== 404" class="text-xs text-red-400 mt-6 font-mono bg-red-50 p-2 rounded border border-red-100 text-left overflow-hidden text-ellipsis">
          {{ error.message }}
        </p>
      </UCard>

    </div>
  </div>
</template>
