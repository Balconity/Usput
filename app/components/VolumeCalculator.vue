<script setup lang="ts">
import { ref } from 'vue'

const listUrl = ref('')
const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'warning' | 'error', title: string, message: string } | null>(null)

// NIZOVI I TOTALI ZA PRIKAZ DETALJA
const detectedItems = ref<Array<{
  code: string,
  name: string,
  quantity: number,
  dimensions?: { width: number, height: number, length: number, weight: number } | null
}>>([])

const extractedDesignLink = ref('')
const totalVolume = ref(0)
const totalWeight = ref(0)
const hasMissingDimensions = ref(false)
const requestDuration = ref<string | null>(null)

// --- UX ANIMACIJA UČITAVANJA ---
const loadingMessages = [
  'Povezujemo se s IKEA sustavom...',
  'Pretražujemo tvoju listu proizvoda...',
  'Skeniramo dimenzije i težinu svakog paketa...',
  'Računamo volumen...',
  'Usput provjeravamo stane li sve to u auto...',
  'Skoro gotovo! Slažemo rezultat...'
]
const currentLoadingMessage = ref(loadingMessages[0])
const simulatedProgress = ref(0)
let loadingInterval: any = null
let progressInterval: any = null

function startLoadingAnimation() {
  currentLoadingMessage.value = loadingMessages[0]
  simulatedProgress.value = 0

  let messageIndex = 0
  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[messageIndex]
  }, 3000)

  progressInterval = setInterval(() => {
    if (simulatedProgress.value < 90) {
      simulatedProgress.value += (90 - simulatedProgress.value) * 0.1
    }
  }, 500)
}

function stopLoadingAnimation() {
  if (loadingInterval) clearInterval(loadingInterval)
  if (progressInterval) clearInterval(progressInterval)
  simulatedProgress.value = 100
}

function resetVolumeData() {
  volumeResult.value = null
  detectedItems.value = []
  extractedDesignLink.value = ''
  totalVolume.value = 0
  totalWeight.value = 0
  hasMissingDimensions.value = false
  requestDuration.value = null
}

async function runVolumeCheck() {
  if (!listUrl.value) return
  isCalculating.value = true
  resetVolumeData()
  startLoadingAnimation()

  const startTime = performance.now()

  try {
    const response = await $fetch('/api/list-volume', {
      method: 'POST',
      body: { url: listUrl.value }
    })

    const endTime = performance.now()
    requestDuration.value = ((endTime - startTime) / 1000).toFixed(2)

    handleVolumeResponse(response)
  } catch (error: any) {
    handleVolumeError(error)
  } finally {
    stopLoadingAnimation()
    setTimeout(() => {
      isCalculating.value = false
    }, 500)
  }
}

function handleVolumeResponse(response: any) {
  if (response && response.success) {
    const data = response.data

    extractedDesignLink.value = data.designLink || ''
    totalVolume.value = data.totalVolume || 0
    totalWeight.value = data.totalWeight || 0
    hasMissingDimensions.value = data.hasMissingDimensions || false

    if (data.parsedItems && data.parsedItems.length > 0) {
      detectedItems.value = data.parsedItems
    } else if (data.articleCodes && data.articleCodes.length > 0) {
      detectedItems.value = data.articleCodes.map((code: string) => ({
        code: code,
        name: 'Nepoznat IKEA artikl',
        quantity: 1,
        dimensions: null
      }))
    }

    if (data.requiresVan) {
      let reasonText = `Sustav je detektirao ${data.articlesFound} artikala. Zbog količine i gabarita, za dostavu će vam sigurno trebati kombi.`

      if (data.foundBigItems && data.foundBigItems.length > 0) {
        const bigItemsText = data.foundBigItems.join(', ')
        reasonText = `Pronašli smo ${data.articlesFound} artikala, uključujući masivne komade namještaja ili velike pakete (${bigItemsText}). Za ovu narudžbu će vam sigurno trebati kombi.`
      }

      volumeResult.value = {
        status: 'warning',
        title: 'Ovo bi moglo biti preveliko.',
        message: reasonText
      }
    } else {
      volumeResult.value = {
        status: 'success',
        title: 'Odlične vijesti! Stane u auto.',
        message: `Detektirano je ${data.articlesFound} artikala i nismo pronašli tipične masivne komade. Proizvodi bi trebali stati u automobil s preklopljenim sjedalima.`
      }
    }
  } else {
    throw new Error(response?.error || 'Nepoznata pogreška na serveru.')
  }
}

function handleVolumeError(error: any) {
  console.error('Greška na klijentu:', error)

  // Rate Limit Check
  if (error.statusCode === 429 || error.message?.includes('429')) {
    volumeResult.value = {
      status: 'error',
      title: 'Usporite malo!',
      message: 'Poslali ste previše zahtjeva u kratkom vremenu. Molimo pričekajte minutu pa pokušajte ponovno.'
    }
    return
  }

  volumeResult.value = {
    status: 'error',
    title: 'Greška prilikom obrade',
    message: error.data?.error || error.message || 'Provjerite je li link ispravan.'
  }
}
</script>

<template>
  <UCard class="shadow-2xl ring-1 ring-gray-200/50 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
    <div class="p-4 sm:p-6">
      <div class="mb-6">
        <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 text-yellow-600">
          <UIcon name="i-lucide-calculator" class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Stane li narudžba u auto?</h2>
        <p class="text-sm text-gray-500 mt-2 leading-relaxed">
          Provjerite unaprijed dimenzije svoje kupovine. Unesite javnu poveznicu svoje liste i mi ćemo izračunati volumen.
        </p>
      </div>

      <div class="space-y-6">
        <UFormGroup label="Poveznica popisa za kupovinu" help="U IKEA aplikaciji kliknite na popis i odaberite 'Podijeli'. Zatim zalijepite dobiveni link.">
          <UInput
            v-model="listUrl"
            type="url"
            placeholder="https://www.ikea.com/hr/hr/favourites/list/..."
            icon="i-lucide-link-2"
            size="lg"
            class="mb-4"
            @input="resetVolumeData"
          />
        </UFormGroup>

        <UButton
          block
          size="xl"
          color="primary"
          style="background-color: #facc15; color: #000; font-weight: bold;"
          class="hover:bg-yellow-500 transition-colors shadow-md"
          :loading="isCalculating"
          :disabled="!listUrl"
          @click="runVolumeCheck"
        >
          {{ isCalculating ? 'Analiziram proizvode...' : 'Provjeri stane li u auto' }}
        </UButton>

        <div v-if="isCalculating" class="mt-6 p-6 border border-yellow-200 rounded-xl flex flex-col items-center justify-center text-center shadow-inner overflow-hidden relative bg-white">
          <div class="absolute inset-0 bg-yellow-50/50 animate-pulse"></div>
          <div class="relative z-10 flex flex-col items-center w-full">
            <div class="relative mb-5">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-box" class="w-8 h-8 text-yellow-600 animate-bounce" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                <UIcon name="i-lucide-loader-2" class="w-4 h-4 text-gray-900 animate-spin" />
              </div>
            </div>
            <h4 class="text-lg font-extrabold text-gray-900 mb-2">Obrađujemo narudžbu</h4>
            <p class="text-sm text-gray-600 font-medium h-5 transition-opacity duration-300">
              {{ currentLoadingMessage }}
            </p>
            <div class="w-full max-w-[240px] h-2 bg-gray-100 rounded-full mt-6 overflow-hidden shadow-inner">
              <div class="h-full bg-yellow-400 transition-all duration-300 ease-out" :style="{ width: `${simulatedProgress}%` }"></div>
            </div>
            <span class="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Molimo pričekajte</span>
          </div>
        </div>

        <div v-if="volumeResult"
             class="p-4 rounded-xl border flex items-start gap-3 transition-all mt-6"
             :class="{
               'bg-green-50 border-green-200 text-green-800': volumeResult.status === 'success',
               'bg-yellow-50 border-yellow-200 text-yellow-900': volumeResult.status === 'warning',
               'bg-red-50 border-red-200 text-red-800': volumeResult.status === 'error'
             }">
          <UIcon v-if="volumeResult.status === 'success'" name="i-lucide-check-circle" class="w-6 h-6 shrink-0 mt-0.5 text-green-600" />
          <UIcon v-else-if="volumeResult.status === 'warning'" name="i-lucide-alert-triangle" class="w-6 h-6 shrink-0 mt-0.5 text-yellow-600" />
          <UIcon v-else name="i-lucide-x-circle" class="w-6 h-6 shrink-0 mt-0.5 text-red-600" />

          <div>
            <h4 class="font-bold mb-1">{{ volumeResult.title }}</h4>
            <p class="text-sm leading-relaxed opacity-90">{{ volumeResult.message }}</p>
          </div>
        </div>

        <div v-if="volumeResult && volumeResult.status !== 'error'" class="mt-6 p-5 border border-blue-100 bg-blue-50/50 rounded-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-500" />
            Što napraviti sljedeće?
          </h4>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <p class="text-sm font-bold text-gray-900">Platite robu na IKEA webshopu</p>
                <p class="text-xs text-gray-600 mt-0.5">Pri plaćanju pod dostavom obavezno odaberite opciju "Preuzimanje u robnoj kući" (Click & Collect).</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <p class="text-sm font-bold text-gray-900">Sačuvajte PDF potvrdu narudžbe</p>
                <p class="text-xs text-gray-600 mt-0.5">Nakon kupnje, IKEA će vam na email poslati PDF račun s brojem i točnim terminom kada je roba spremna za prikup.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <p class="text-sm font-bold text-gray-900">Rezervirajte Usput kombi</p>
                <p class="text-xs text-gray-600 mt-0.5">Učitajte dobiveni PDF u formu ispod, a mi ćemo u dogovorenom terminu preuzeti vašu robu i dostaviti ju vama.</p>
              </div>
            </div>
          </div>
          <UButton color="blue" variant="soft" class="mt-5 w-full font-bold" to="#contact" icon="i-lucide-arrow-down">
            Krenite na rezervaciju dostave
          </UButton>
        </div>

        <div v-if="extractedDesignLink" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-paint-brush" class="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-blue-900 text-sm">Pronađen je modularni dizajn!</h4>
              <p class="text-xs text-blue-700 mt-1">Sustav je automatski "raspakirao" komponente iz planera. Želite li vidjeti 3D nacrt?</p>
              <a :href="extractedDesignLink" target="_blank" class="text-sm font-bold text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
                Otvori dizajn u IKEA alatu &rarr;
              </a>
            </div>
          </div>
        </div>

        <div v-if="detectedItems.length > 0" class="mt-6 border-t border-gray-100 pt-6">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-3">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-gray-900 text-sm uppercase tracking-wider">Prepoznati proizvodi:</h4>
              <span v-if="requestDuration" class="text-[10px] font-mono font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-1" title="Vrijeme potrebno za obradu liste">
                <UIcon name="i-lucide-timer" class="w-3 h-3" />
                {{ requestDuration }}s
              </span>
            </div>

            <div class="flex gap-3 text-sm font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span class="flex items-center gap-1.5 text-gray-700">
                <UIcon name="i-lucide-box" class="w-4 h-4 text-yellow-500" />
                {{ totalVolume }} m³
              </span>
              <div class="w-px h-4 bg-gray-300 self-center"></div>
              <span class="flex items-center gap-1.5 text-gray-700">
                <UIcon name="i-lucide-scale" class="w-4 h-4 text-yellow-500" />
                {{ totalWeight }} kg
              </span>
            </div>
          </div>

          <div v-if="hasMissingDimensions" class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800 leading-relaxed font-medium">
              Nekim proizvodima nedostaju službeni podaci o masi ili dimenzijama. Ukupni zbroj iznad možda nije u potpunosti točan.
            </p>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <ul class="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              <li v-for="item in detectedItems" :key="item.code" class="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm hover:bg-gray-50 transition-colors">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900">{{ item.name }}</span>

                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="text-xs font-mono text-gray-500">{{ item.code }}</span>

                    <span v-if="item.dimensions" class="text-[11px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                      <UIcon name="i-lucide-box" class="w-3 h-3 text-gray-400" />
                      {{ item.dimensions.length || '-' }}x{{ item.dimensions.width || '-' }}x{{ item.dimensions.height || '-' }} cm
                      <span class="text-gray-300 mx-0.5">|</span>
                      {{ item.dimensions.weight || '-' }} kg
                    </span>
                    <span v-else class="text-[11px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
                      <UIcon name="i-lucide-alert-circle" class="w-3 h-3" />
                      Nedostaju mjere
                    </span>
                  </div>
                </div>

                <div class="font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-md shadow-sm border border-yellow-200 shrink-0 self-start sm:self-auto">
                  {{ item.quantity }} kom
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </UCard>
</template>
