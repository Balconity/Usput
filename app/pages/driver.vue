<script setup lang="ts">
import { ref, computed } from 'vue'

// Zaštita bi ovdje u produkciji provjeravala je li ulogiran admin/vozač
// onMounted(async () => { ... provjera Cognito tokena ... })

// --- MOCK PODACI ZA DANAŠNJU RUTU ---
const deliveries = ref([
  {
    id: 'DELIVERY#1717265230',
    customerName: 'Ivan Horvat',
    phone: '+385912345678',
    address: 'Zagrebačka ulica 1, Varaždin',
    status: 'U_TRANZITU', // Može biti: ČEKA PRIKUP, U_TRANZITU, DOSTAVLJENO
    floor: '2. kat (nema lifta)',
    notes: 'Molim vas nazovite 5 minuta prije dolaska. Pas je u dvorištu ali je svezan.',
    isLocker: false,
    lockerPin: '',
    metrics: { volume: 0.85, weight: 45.2, itemsCount: 4 }
  },
  {
    id: 'DELIVERY#1717350000',
    customerName: 'Ana Marić',
    phone: '+385958881234',
    address: 'Varaždinska 42, Novi Marof',
    status: 'ČEKA PRIKUP',
    floor: 'Prizemlje',
    notes: 'Paketomat se nalazi iza zgrade Ine.',
    isLocker: true,
    lockerPin: '554321',
    metrics: { volume: 0.12, weight: 14.5, itemsCount: 2 }
  },
  {
    id: 'DELIVERY#1714000000',
    customerName: 'Marko Tomić',
    phone: '+385997779999',
    address: 'Kapucinski trg 5, Varaždin',
    status: 'DOSTAVLJENO',
    floor: '1. kat',
    notes: '',
    isLocker: false,
    lockerPin: '',
    metrics: { volume: 1.60, weight: 112.0, itemsCount: 15 }
  }
])

// --- LOGIKA ZA PRIKAZ ---
const activeDeliveries = computed(() => deliveries.value.filter(d => d.status !== 'DOSTAVLJENO'))
const completedDeliveries = computed(() => deliveries.value.filter(d => d.status === 'DOSTAVLJENO'))
const progressPercentage = computed(() => {
  if (deliveries.value.length === 0) return 0
  return Math.round((completedDeliveries.value.length / deliveries.value.length) * 100)
})

// --- AKCIJE VOZAČA ---
function updateStatus(id: string, newStatus: string) {
  const delivery = deliveries.value.find(d => d.id === id)
  if (delivery) {
    delivery.status = newStatus
    // U produkciji ovdje šalješ API request na backend
  }
}

// Generiranje Google Maps linka
function getMapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans text-neutral-900 pb-24">

    <header class="bg-gray-900 text-white sticky top-0 z-40 shadow-md">
      <div class="max-w-md mx-auto flex items-center justify-between p-4">
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-wider">Usput<span class="text-yellow-400">.</span></span>
          <span class="text-xs text-gray-400 uppercase tracking-widest font-bold mt-0.5">Vozački terminal</span>
        </div>
        <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
          <UIcon name="i-lucide-user" class="w-5 h-5 text-gray-300" />
        </div>
      </div>

      <div class="bg-gray-800 px-4 py-3 border-t border-gray-700">
        <div class="flex justify-between items-end mb-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Progres današnje rute</span>
          <span class="text-sm font-black text-yellow-400">{{ completedDeliveries.length }} / {{ deliveries.length }}</span>
        </div>
        <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-400 transition-all duration-500" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>
    </header>

    <main class="p-4 max-w-md mx-auto space-y-6">

      <div class="space-y-4">
        <h2 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Aktivne isporuke</h2>

        <div v-if="activeDeliveries.length === 0" class="text-center py-10 bg-white rounded-3xl border border-gray-200">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <UIcon name="i-lucide-party-popper" class="w-8 h-8" />
          </div>
          <h3 class="font-black text-lg">Sve je dostavljeno!</h3>
          <p class="text-gray-500 text-sm">Završili ste današnju rutu.</p>
        </div>

        <UCard
          v-for="(del, index) in activeDeliveries"
          :key="del.id"
          class="shadow-lg border-2 rounded-3xl overflow-hidden bg-white"
          :class="index === 0 ? 'border-yellow-400' : 'border-gray-200 opacity-90'"
          :ui="{ body: { padding: 'p-0' } }"
        >
          <div class="p-5 border-b border-gray-100" :class="index === 0 ? 'bg-yellow-50/50' : ''">
            <div class="flex justify-between items-start mb-3">
              <UBadge
                :color="del.status === 'ČEKA PRIKUP' ? 'gray' : 'yellow'"
                variant="solid"
                class="font-black text-[10px] tracking-wider uppercase px-2 py-1 rounded-md"
              >
                {{ del.status.replace('_', ' ') }}
              </UBadge>
              <span class="font-mono text-xs font-bold text-gray-400">{{ del.id.split('#')[1] }}</span>
            </div>

            <h3 class="text-2xl font-black text-gray-900 mb-1">{{ del.customerName }}</h3>
            <p class="text-gray-600 font-medium flex items-start gap-2">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              {{ del.address }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
            <a
              :href="`tel:${del.phone}`"
              class="flex flex-col items-center justify-center gap-1.5 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <UIcon name="i-lucide-phone" class="w-6 h-6 text-blue-600" />
              <span class="text-xs font-bold text-gray-700 uppercase">Nazovi</span>
            </a>
            <a
              :href="getMapsLink(del.address)"
              target="_blank"
              class="flex flex-col items-center justify-center gap-1.5 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <UIcon name="i-lucide-navigation" class="w-6 h-6 text-green-600" />
              <span class="text-xs font-bold text-gray-700 uppercase">Navigacija</span>
            </a>
          </div>

          <div class="p-5 bg-gray-50/50 space-y-4">

            <div class="flex flex-wrap gap-2">
              <div class="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm">
                <UIcon name="i-lucide-layers" class="w-4 h-4 text-gray-400" /> {{ del.metrics.itemsCount }} kom
              </div>
              <div class="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm">
                <UIcon name="i-lucide-box" class="w-4 h-4 text-gray-400" /> {{ del.metrics.volume }} m³
              </div>
              <div class="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm">
                <UIcon name="i-lucide-scale" class="w-4 h-4 text-gray-400" /> {{ del.metrics.weight }} kg
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Kat / Zgrada</span>
                <span class="text-sm font-bold text-gray-900">{{ del.floor }}</span>
              </div>
              <div v-if="del.isLocker">
                <span class="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">PIN za Paketomat</span>
                <span class="text-lg font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ del.lockerPin }}</span>
              </div>
            </div>

            <div v-if="del.notes" class="bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
              <span class="text-[10px] font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                <UIcon name="i-lucide-alert-triangle" class="w-3 h-3" /> Napomena kupca
              </span>
              <p class="text-sm font-medium text-yellow-950">{{ del.notes }}</p>
            </div>
          </div>

          <div class="p-4 bg-white border-t border-gray-100">
            <button
              v-if="del.status === 'ČEKA PRIKUP'"
              @click="updateStatus(del.id, 'U_TRANZITU')"
              class="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 bg-gray-900 text-white shadow-lg active:scale-95 transition-transform"
            >
              <UIcon name="i-lucide-package-check" class="w-6 h-6" /> Utovareno
            </button>

            <button
              v-else-if="del.status === 'U_TRANZITU'"
              @click="updateStatus(del.id, 'DOSTAVLJENO')"
              class="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 bg-yellow-400 text-black shadow-lg shadow-yellow-400/30 active:scale-95 transition-transform"
            >
              <UIcon name="i-lucide-check-circle" class="w-6 h-6" /> Dostavljeno
            </button>
          </div>
        </UCard>
      </div>

      <div v-if="completedDeliveries.length > 0" class="pt-6 border-t border-gray-200">
        <h2 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 pl-1 flex items-center justify-between">
          <span>Završeno danas</span>
          <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{{ completedDeliveries.length }}</span>
        </h2>

        <div class="space-y-3">
          <div
            v-for="del in completedDeliveries"
            :key="del.id"
            class="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between opacity-75"
          >
            <div>
              <h4 class="font-bold text-gray-900 line-through decoration-gray-400">{{ del.customerName }}</h4>
              <p class="text-xs text-gray-500 truncate mt-0.5">{{ del.address }}</p>
            </div>
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-check" class="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>
