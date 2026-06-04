<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)

// Mock podaci za pojedinu narudžbu (Ovo će se vući iz DynamoDB-a pomoću route.params.id)
const order = ref({
  id: route.params.id || 'ORDER#1717265230',
  date: '12. lipnja 2026. u 14:30',
  status: 'U_TRANZITU', // Može biti: ZAPRIMLJENO, U_OBRADI, PRIKUP, U_TRANZITU, DOSTAVLJENO
  deliveryPrice: 44.99,
  address: 'Zagrebačka ulica 1, Varaždin',
  floor: '2. kat (ima lift)',
  contactPhone: '+385 91 234 5678',
  notes: 'Molim vas nazovite 10 minuta prije dolaska.',
  metrics: {
    volume: 0.85,
    weight: 45.2,
    itemsCount: 4
  },
  items: [
    { code: '102.146.52', name: 'MALM Komoda sa 4 ladice', quantity: 1, dims: '80x100x48 cm' },
    { code: '502.632.30', name: 'KALLAX Regal', quantity: 2, dims: '77x77x39 cm' },
    { code: '904.810.04', name: 'FRAKTA Plava torba', quantity: 1, dims: '-' }
  ]
})

// Definicija koraka za praćenje (Timeline)
const trackingSteps = [
  { id: 'ZAPRIMLJENO', label: 'Narudžba zaprimljena', icon: 'i-lucide-clipboard-check' },
  { id: 'U_OBRADI', label: 'Provjera dimenzija', icon: 'i-lucide-calculator' },
  { id: 'PRIKUP', label: 'Preuzimanje u IKEA-i', icon: 'i-lucide-package-check' },
  { id: 'U_TRANZITU', label: 'Na putu prema Vama', icon: 'i-lucide-truck' },
  { id: 'DOSTAVLJENO', label: 'Dostavljeno', icon: 'i-lucide-check-circle' }
]

// Funkcija za provjeru je li korak završen, trenutan ili na čekanju
function getStepStatus(stepId: string) {
  const currentIndex = trackingSteps.findIndex(s => s.id === order.value.status)
  const stepIndex = trackingSteps.findIndex(s => s.id === stepId)

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

onMounted(() => {
  // Simulacija API poziva
  setTimeout(() => {
    isLoading.value = false
  }, 600)
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-neutral-900 pb-20">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
      <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="router.push('/profile')"
          class="font-semibold"
        >
          Natrag na profil
        </UButton>
        <div class="flex items-center gap-2 text-xl font-bold opacity-80">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
      </div>
    </header>

    <main class="pt-8 px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-yellow-500 animate-spin" />
      </div>

      <div v-else class="w-full max-w-[1400px] mx-auto">

        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
              Detalji narudžbe
            </h1>
            <p class="text-gray-500 font-mono text-sm tracking-widest">{{ order.id }}</p>
          </div>
          <div class="flex items-center gap-3">
            <UButton color="white" variant="solid" icon="i-lucide-printer" class="shadow-sm">
              Ispiši
            </UButton>
            <UButton color="primary" style="background-color: #facc15; color: #000; font-weight: bold;" icon="i-lucide-share-2" class="shadow-sm hover:bg-yellow-500">
              Javni link za praćenje
            </UButton>
          </div>
        </div>

        <UCard class="mb-8 shadow-sm border border-gray-200/60 rounded-2xl bg-white overflow-hidden">
          <div class="p-6">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Status pošiljke</h3>

            <div class="relative">
              <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full hidden md:block"></div>

              <div class="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                <div
                  v-for="(step, index) in trackingSteps"
                  :key="step.id"
                  class="flex flex-row md:flex-col items-center gap-4 md:gap-3 flex-1"
                  :class="{'text-left md:text-center': true}"
                >
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shrink-0 shadow-sm transition-all duration-300"
                    :class="{
                      'bg-green-500 text-white': getStepStatus(step.id) === 'completed',
                      'bg-yellow-400 text-black shadow-lg shadow-yellow-200 scale-110 ring-4 ring-yellow-50': getStepStatus(step.id) === 'current',
                      'bg-gray-100 text-gray-400': getStepStatus(step.id) === 'pending'
                    }"
                  >
                    <UIcon :name="step.icon" class="w-5 h-5" />
                  </div>

                  <div>
                    <p
                      class="text-sm font-bold"
                      :class="{
                        'text-gray-900': getStepStatus(step.id) !== 'pending',
                        'text-gray-400': getStepStatus(step.id) === 'pending'
                      }"
                    >
                      {{ step.label }}
                    </p>
                    <p v-if="getStepStatus(step.id) === 'current'" class="text-[11px] font-bold text-yellow-600 uppercase tracking-wider mt-1 md:mx-auto">Trenutna faza</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

          <div class="lg:col-span-8 space-y-6 w-full">
            <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">
              <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl flex justify-between items-center">
                <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 text-yellow-500" />
                  Sadržaj narudžbe
                </h3>
                <div class="flex gap-3 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <span class="flex items-center gap-1.5"><UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500" /> {{ order.metrics.volume }} m³</span>
                  <div class="w-px h-4 bg-gray-200 self-center"></div>
                  <span class="flex items-center gap-1.5"><UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" /> {{ order.metrics.weight }} kg</span>
                </div>
              </div>

              <div class="p-0">
                <ul class="divide-y divide-gray-100">
                  <li v-for="item in order.items" :key="item.code" class="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div class="flex flex-col">
                      <span class="font-bold text-gray-900">{{ item.name }}</span>
                      <div class="flex items-center gap-3 mt-1.5">
                        <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ item.code }}</span>
                        <span class="text-[11px] font-medium text-gray-500">{{ item.dims }}</span>
                      </div>
                    </div>
                    <div class="font-bold bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-lg border border-yellow-200 shrink-0 self-start sm:self-auto shadow-sm">
                      {{ item.quantity }} kom
                    </div>
                  </li>
                </ul>
              </div>
            </UCard>
          </div>

          <div class="lg:col-span-4 space-y-6 w-full">

            <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full">
              <div class="p-6">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Podaci za dostavu</h3>

                <div class="space-y-5">
                  <div>
                    <p class="text-[11px] font-bold text-gray-400 uppercase mb-1">Adresa</p>
                    <p class="text-sm font-semibold text-gray-900">{{ order.address }}</p>
                    <p class="text-sm text-gray-600 mt-0.5">{{ order.floor }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-bold text-gray-400 uppercase mb-1">Kontakt broj</p>
                    <p class="text-sm font-semibold text-gray-900">{{ order.contactPhone }}</p>
                  </div>
                  <div v-if="order.notes" class="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <p class="text-[11px] font-bold text-yellow-800 uppercase mb-1 flex items-center gap-1">
                      <UIcon name="i-lucide-info" class="w-3 h-3" /> Napomena vozaču
                    </p>
                    <p class="text-sm font-medium text-yellow-900">{{ order.notes }}</p>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard class="shadow-sm border border-gray-200/60 rounded-2xl bg-white w-full bg-gray-900 text-white">
              <div class="p-6">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Sažetak plaćanja</h3>

                <div class="space-y-3 mb-5 border-b border-gray-700 pb-5">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-300">Usluga prijevoza</span>
                    <span class="font-medium">{{ formatPrice(order.deliveryPrice) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-300">Unos u prostoriju</span>
                    <span class="font-medium">Uključeno</span>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-base font-bold">Ukupno za platiti</span>
                  <span class="text-2xl font-black text-yellow-400">{{ formatPrice(order.deliveryPrice) }}</span>
                </div>

                <p class="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-widest">Plaćanje pozećem</p>
              </div>
            </UCard>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>
