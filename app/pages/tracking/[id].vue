<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoading = ref(true)

// MOCK PODACI: Ova stranica je JAVNA, pa ne prikazujemo cijenu niti strogo osobne podatke, već samo podatke o isporuci
const tracking = ref({
  id: route.params.id || 'ORDER#1717265230',
  status: 'U_TRANZITU',
  eta: '15:30 - 16:00',
  queuePosition: 2,
  address: 'Zagrebačka ulica 1, Varaždin',
  driver: {
    name: 'Kruno',
    phone: '+385 91 123 4567',
    rating: 5.0,
    // Ako vozač podijeli link iz Google Maps/WhatsAppa, on ide ovdje. Ako je null, gumb se sakrije.
    liveLocationLink: 'https://maps.app.goo.gl/primjer'
  },
  metrics: {
    itemsCount: 4,
    volume: 0.85,
    weight: 45.2
  }
})

// Koraci za vertikalni timeline
const trackingSteps = [
  { id: 'ZAPRIMLJENO', title: 'Narudžba zaprimljena', desc: 'Vaš zahtjev je obrađen.', time: '12:00', icon: 'i-lucide-clipboard-check' },
  { id: 'PRIKUP', title: 'Preuzimanje paketa', desc: 'Preuzimamo vaše artikle u robnoj kući.', time: '13:45', icon: 'i-lucide-package-check' },
  { id: 'U_TRANZITU', title: 'Na putu prema Vama', desc: 'Vozač je krenuo prema vašoj adresi.', time: '14:30', icon: 'i-lucide-truck' },
  { id: 'DOSTAVLJENO', title: 'Dostavljeno', desc: 'Paketi su uspješno isporučeni.', time: '', icon: 'i-lucide-home' }
]

function getStepStatus(stepId: string) {
  const currentIndex = trackingSteps.findIndex(s => s.id === tracking.value.status)
  const stepIndex = trackingSteps.findIndex(s => s.id === stepId)

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-12">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
      <div class="w-full max-w-2xl mx-auto flex items-center justify-center py-4 px-4">
        <div class="flex items-center gap-2 text-2xl font-black">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
      </div>
    </header>

    <main class="pt-6 px-4">

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
        <UIcon name="i-lucide-radar" class="w-12 h-12 text-yellow-500 animate-[spin_3s_linear_infinite]" />
        <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Traženje pošiljke...</p>
      </div>

      <div v-else class="w-full max-w-2xl mx-auto space-y-6">

        <UCard class="shadow-md border border-yellow-200 rounded-3xl bg-white overflow-hidden text-center relative">
          <div class="absolute top-0 inset-x-0 h-2 bg-yellow-400"></div>

          <div class="p-6 pt-8">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Očekivano vrijeme isporuke</span>
            <h1 class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-2">
              {{ tracking.eta }}
            </h1>

            <div class="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 mt-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span class="text-sm font-bold text-yellow-800">
                Vi ste {{ tracking.queuePosition }}. po redu za isporuku
              </span>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm border border-gray-200/60 rounded-3xl bg-white">
          <div class="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">

            <div class="flex items-center gap-4 w-full">
              <div class="relative shrink-0">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                  <UIcon name="i-lucide-user" class="w-8 h-8 text-gray-400" />
                </div>
                <div class="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                  <div class="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <UIcon name="i-lucide-star" class="w-3 h-3 fill-current" />
                    {{ tracking.driver.rating }}
                  </div>
                </div>
              </div>

              <div class="flex-1">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Vaš dostavljač</p>
                <h3 class="text-xl font-black text-gray-900">{{ tracking.driver.name }}</h3>
              </div>

              <a :href="`tel:${tracking.driver.phone}`" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full flex items-center justify-center transition-colors shrink-0">
                <UIcon name="i-lucide-phone" class="w-5 h-5" />
              </a>
            </div>

            <UButton
              v-if="tracking.driver.liveLocationLink"
              :to="tracking.driver.liveLocationLink"
              target="_blank"
              size="lg"
              block
              icon="i-lucide-map-pin"
              class="bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md sm:w-auto"
            >
              Karta uživo
            </UButton>
          </div>
        </UCard>

        <UCard class="shadow-sm border border-gray-200/60 rounded-3xl bg-white">
          <div class="p-6">
            <h3 class="text-base font-bold text-gray-900 mb-6">Status pošiljke</h3>

            <div class="relative ml-3 sm:ml-4">
              <div class="absolute top-2 bottom-6 left-[11px] w-0.5 bg-gray-100 rounded-full"></div>

              <div class="space-y-8 relative z-10">
                <div
                  v-for="step in trackingSteps"
                  :key="step.id"
                  class="flex gap-4 sm:gap-6"
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 mt-0.5 transition-colors duration-300 relative bg-white"
                    :class="{
                      'border-green-500 bg-green-500 text-white': getStepStatus(step.id) === 'completed',
                      'border-yellow-400 bg-yellow-400 text-black shadow-[0_0_0_4px_rgba(250,204,21,0.2)]': getStepStatus(step.id) === 'current',
                      'border-gray-200 text-gray-300': getStepStatus(step.id) === 'pending'
                    }"
                  >
                    <UIcon v-if="getStepStatus(step.id) === 'completed'" name="i-lucide-check" class="w-3.5 h-3.5" />
                    <div v-else-if="getStepStatus(step.id) === 'current'" class="w-2 h-2 bg-black rounded-full"></div>
                    <div v-else class="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>

                  <div class="flex-1 pb-1">
                    <div class="flex items-start justify-between gap-2">
                      <h4
                        class="text-sm sm:text-base font-bold"
                        :class="getStepStatus(step.id) === 'pending' ? 'text-gray-400' : 'text-gray-900'"
                      >
                        {{ step.title }}
                      </h4>
                      <span
                        v-if="step.time && getStepStatus(step.id) !== 'pending'"
                        class="text-xs font-bold text-gray-400 font-mono"
                      >
                        {{ step.time }}
                      </span>
                    </div>
                    <p
                      class="text-xs sm:text-sm mt-1 leading-relaxed"
                      :class="getStepStatus(step.id) === 'pending' ? 'text-gray-300' : 'text-gray-600'"
                    >
                      {{ step.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Detalji pošiljke</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Odredište</p>
              <p class="text-sm font-semibold text-gray-900 flex items-start gap-2">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                {{ tracking.address }}
              </p>
            </div>
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dimenzije tereta</p>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{{ tracking.metrics.itemsCount }} kom</span>
                <span class="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{{ tracking.metrics.volume }} m³</span>
                <span class="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">{{ tracking.metrics.weight }} kg</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
