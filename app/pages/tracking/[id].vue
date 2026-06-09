<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const deliveryId = route.params.id

// Mock podaci za klijenta (Ovo ćeš kasnije vući iz baze na temelju ID-a)
const delivery = ref({
  id: deliveryId,
  customer: { name: 'Ivan Horvat', phone: '0912345678' },
  address: 'Zagrebačka 1, Varaždin',
  date: '12.06.2026.',
  metrics: { volume: 0.85, weight: 45.2, items: 4 },
  status: 'ZAPRIMLJENO', // Mogući statusi: ZAPRIMLJENO, U_OBRADI, ČEKA PRIKUP, U_TRANZITU, DOSTAVLJENO, OTKAZANO
  proofOfDelivery: 'http://googleusercontent.com/image_collection/image_retrieval/16586229707638013338'
})

// Logika za prikazivanje koraka dostave
const steps = [
  { id: 'ZAPRIMLJENO', label: 'Zaprimljeno', icon: 'i-lucide-clipboard-check' },
  { id: 'U_OBRADI', label: 'U obradi', icon: 'i-lucide-package-search' },
  { id: 'ČEKA PRIKUP', label: 'Čeka prikup', icon: 'i-lucide-store' },
  { id: 'U_TRANZITU', label: 'U tranzitu', icon: 'i-lucide-truck' },
  { id: 'DOSTAVLJENO', label: 'Dostavljeno', icon: 'i-lucide-home' }
]

const currentStepIndex = computed(() => {
  return steps.findIndex(s => s.id === delivery.value.status)
})

// Logika za otkazivanje dostave
const confirmPhone = ref('')
const cancelError = ref('')
const cancelSuccess = ref(false)

function processCancellation() {
  cancelError.value = ''

  // Očisti uneseni broj od razmaka kako bi usporedba bila lakša
  const cleanedInput = confirmPhone.value.replace(/\s+/g, '')
  const cleanedOriginal = delivery.value.customer.phone.replace(/\s+/g, '')

  if (cleanedInput === cleanedOriginal || cleanedInput === '+385' + cleanedOriginal.substring(1)) {
    // U produkciji ovdje šalješ API zahtjev prema bazi
    delivery.value.status = 'OTKAZANO'
    cancelSuccess.value = true
  } else {
    cancelError.value = 'Uneseni broj mobitela ne odgovara broju iz narudžbe.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 font-sans text-neutral-900">

    <!-- Klijentski Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-3xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
        <div class="flex items-center gap-2 text-xl font-black">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
        <UButton color="gray" variant="ghost" icon="i-lucide-home" to="/" class="text-sm font-bold">
          Naslovnica
        </UButton>
      </div>
    </header>

    <main class="max-w-3xl mx-auto p-4 sm:p-6 mt-4 space-y-6">

      <!-- Zaglavlje narudžbe -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Praćenje pošiljke</h1>
          <p class="text-sm font-mono text-gray-500 mt-1">ID: #{{ deliveryId }}</p>
        </div>
        <UBadge
          v-if="delivery.status === 'OTKAZANO'"
          color="red"
          variant="soft"
          size="lg"
          class="font-black uppercase tracking-widest"
        >
          Otkazano
        </UBadge>
        <UBadge
          v-else-if="delivery.status === 'DOSTAVLJENO'"
          color="green"
          variant="soft"
          size="lg"
          class="font-black uppercase tracking-widest"
        >
          Uspješno dostavljeno
        </UBadge>
      </div>

      <!-- Ako je Otkazano -->
      <UCard v-if="delivery.status === 'OTKAZANO'" class="bg-red-50 border-red-200 shadow-sm rounded-2xl">
        <div class="text-center py-6">
          <UIcon name="i-lucide-x-circle" class="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-red-900">Ova dostava je otkazana</h3>
          <p class="text-sm text-red-700 mt-2">Ukoliko smatrate da je došlo do pogreške ili želite kreirati novu narudžbu, vratite se na naslovnicu.</p>
        </div>
      </UCard>

      <!-- Ako je Aktivno (Prikaz Statusa) -->
      <UCard v-else class="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div class="p-2 sm:p-4">
          <!-- Timeline -->
          <div class="relative flex justify-between items-center w-full my-8 px-2 sm:px-6">
            <!-- Pozadinska linija -->
            <div class="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0 rounded-full"></div>
            <!-- Aktivna linija -->
            <div
              class="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-yellow-400 z-0 rounded-full transition-all duration-500"
              :style="{ right: `${100 - ((currentStepIndex / (steps.length - 1)) * 80 + 10)}%` }"
            ></div>

            <!-- Koraci -->
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="relative z-10 flex flex-col items-center gap-2 group w-16 sm:w-24"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300 shadow-sm"
                :class="index <= currentStepIndex ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-400'"
              >
                <UIcon :name="step.icon" class="w-4 h-4" />
              </div>
              <span
                class="text-[10px] sm:text-xs font-bold text-center leading-tight"
                :class="index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Detalji dostave -->
      <div class="grid sm:grid-cols-2 gap-6">
        <UCard class="shadow-sm border border-gray-200 rounded-2xl">
          <template #header><h3 class="font-bold text-gray-900 text-sm uppercase tracking-wider">Podaci o isporuci</h3></template>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Primatelj</p>
              <p class="font-bold text-gray-900">{{ delivery.customer.name }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Adresa dostave</p>
              <p class="font-bold text-gray-900">{{ delivery.address }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Planirani datum</p>
              <p class="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-100">
                {{ delivery.date }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm border border-gray-200 rounded-2xl">
          <template #header><h3 class="font-bold text-gray-900 text-sm uppercase tracking-wider">Specifikacija tereta</h3></template>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <UIcon name="i-lucide-box" class="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p class="text-xs text-gray-500 font-bold uppercase">Volumen</p>
              <p class="font-black text-lg text-gray-900">{{ delivery.metrics.volume }} m³</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <UIcon name="i-lucide-weight" class="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p class="text-xs text-gray-500 font-bold uppercase">Težina</p>
              <p class="font-black text-lg text-gray-900">{{ delivery.metrics.weight }} kg</p>
            </div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
              <span class="text-xs text-gray-500 font-bold uppercase">Ukupno paketa</span>
              <span class="font-black text-gray-900">{{ delivery.metrics.items }} komada</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Prikaz Dokaza o dostavi (Samo ako je dostavljeno) -->
      <UCard v-if="delivery.status === 'DOSTAVLJENO' && delivery.proofOfDelivery" class="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <template #header><h3 class="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2"><UIcon name="i-lucide-camera" class="w-4 h-4"/> Fotografija isporuke</h3></template>
        <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
          <img :src="delivery.proofOfDelivery" alt="Dokaz o dostavi" class="w-full h-full object-cover" />
        </div>
      </UCard>

      <!-- SEKCIJA ZA OTKAZIVANJE DOSTAVE -->
      <div v-if="delivery.status === 'ZAPRIMLJENO' || delivery.status === 'U_OBRADI'" class="mt-8 pt-6 border-t border-gray-200">
        <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>

          <h4 class="font-bold text-gray-900 text-base mb-2">Želite otkazati dostavu?</h4>
          <p class="text-sm text-gray-600 mb-5 leading-relaxed">
            Besplatno otkazivanje moguće je prije nego što naša vozila krenu na utovar. Za potvrdu otkazivanja, molimo potvrdite broj mobitela naveden u narudžbi.
          </p>

          <div v-if="cancelSuccess" class="bg-green-50 text-green-700 p-4 rounded-xl font-bold border border-green-200 flex items-center gap-2">
            <UIcon name="i-lucide-check-circle-2" class="w-5 h-5" />
            Dostava je uspješno otkazana.
          </div>

          <div v-else class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <UInput
                v-model="confirmPhone"
                icon="i-lucide-phone"
                placeholder="Unesite broj mobitela"
                size="lg"
                class="w-full"
              />
              <p v-if="cancelError" class="text-xs text-red-500 font-bold mt-1.5 ml-1">{{ cancelError }}</p>
            </div>
            <UButton
              color="red"
              variant="soft"
              size="lg"
              class="font-bold justify-center sm:w-auto"
              @click="processCancellation"
            >
              Otkaži dostavu
            </UButton>
          </div>
        </div>
      </div>

      <!-- Obavijest ako je dostava u tijeku, a korisnik želi otkazati -->
      <div v-else-if="delivery.status !== 'DOSTAVLJENO' && delivery.status !== 'OTKAZANO'" class="mt-8 pt-6 border-t border-gray-200">
        <div class="bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-200 flex items-start gap-3 shadow-sm">
          <UIcon name="i-lucide-phone-call" class="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-bold text-orange-900 mb-1">Dostava je već u tijeku</h4>
            <p class="text-xs sm:text-sm font-medium text-orange-800 leading-relaxed">
              Vaša dostava je već u fazi prikupa ili transporta te ju nije moguće otkazati putem weba. Za hitne izmjene molimo nazovite našu podršku na <strong>091 234 5678</strong>.
            </p>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>
