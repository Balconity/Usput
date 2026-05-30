<script setup lang="ts">
import { ref, reactive } from 'vue'

const colorMode = useColorMode()
colorMode.preference = 'light'

const appConfig = useAppConfig()
appConfig.ui.primary = 'yellow'
appConfig.ui.gray = 'neutral'

const objectOptions = [
  { label: 'Kuća', value: 'kuca' },
  { label: 'Zgrada', value: 'zgrada' }
]

const contactState = reactive({
  name: '',
  phone: '',
  email: '',
  orderPdf: null as File | null,
  isLocker: false,
  lockerPin: '',
  street: '',
  city: '',
  zip: '',
  deliveryTerm: '',
  objectType: 'kuca',
  floor: '',
  notes: ''
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    contactState.orderPdf = input.files[0]
  }
}

function onContactSubmit() {
  if (!contactState.name || !contactState.phone || !contactState.email || !contactState.street || !contactState.city || !contactState.zip) {
    alert('Molimo ispunite sva obavezna polja.')
    return
  }

  if (!contactState.orderPdf) {
    alert('Molimo učitajte PDF potvrde narudžbe.')
    return
  }

  alert(`Hvala vam, ${contactState.name}! Potvrda narudžbe (${contactState.orderPdf.name}) je zaprimljena. Naš sustav čita podatke o proizvodima i načinu isporuke te ćemo vas ubrzo kontaktirati!`)

  // Reset
  contactState.name = ''
  contactState.phone = ''
  contactState.email = ''
  contactState.orderPdf = null
  contactState.isLocker = false
  contactState.lockerPin = ''
  contactState.street = ''
  contactState.city = ''
  contactState.zip = ''
  contactState.deliveryTerm = ''
  contactState.objectType = 'kuca'
  contactState.floor = ''
  contactState.notes = ''
}

// --- STANJE ZA KALKULATOR VOLUMENA ---
const currentTab = ref('link')
const volumeFile = ref<File | null>(null)
const listUrl = ref('')
const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'warning' | 'error', title: string, message: string } | null>(null)

// NOVO: Niz u koji ćemo spremiti detalje proizvoda za ispis
const detectedItems = ref<Array<{ code: string, name: string, quantity: number }>>([])

function onVolumeFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    volumeFile.value = input.files[0]
    volumeResult.value = null
    detectedItems.value = []
  }
}

async function runVolumeCheck() {
  if (currentTab.value === 'pdf') {
    await calculateVolumeFromPdf()
  } else {
    await calculateVolumeFromLink()
  }
}

async function calculateVolumeFromPdf() {
  if (!volumeFile.value) return
  isCalculating.value = true
  volumeResult.value = null
  detectedItems.value = []

  try {
    const formData = new FormData()
    formData.append('orderPdf', volumeFile.value)

    const response = await $fetch('/api/volume', {
      method: 'POST',
      body: formData
    })

    handleVolumeResponse(response)
  } catch (error: any) {
    handleVolumeError(error)
  } finally {
    isCalculating.value = false
  }
}

async function calculateVolumeFromLink() {
  if (!listUrl.value) return
  isCalculating.value = true
  volumeResult.value = null
  detectedItems.value = []

  try {
    const response = await $fetch('/api/list-volume', {
      method: 'POST',
      body: { url: listUrl.value }
    })

    handleVolumeResponse(response)
  } catch (error: any) {
    handleVolumeError(error)
  } finally {
    isCalculating.value = false
  }
}

function handleVolumeResponse(response: any) {
  if (response && response.success) {
    const { articlesFound, requiresVan, foundBigItems, parsedItems, articleCodes } = response.data

    // 1. OVDJE PUNI TABLICU PREPOZNATIH PROIZVODA
    // Ako backend vrati detaljne stavke, koristimo njih. Ako vrati samo šifre (stari backend), kreiramo privremene stavke.
    if (parsedItems && parsedItems.length > 0) {
      detectedItems.value = parsedItems
    } else if (articleCodes && articleCodes.length > 0) {
      detectedItems.value = articleCodes.map((code: string) => ({
        code: code,
        name: 'Nepoznat IKEA artikl',
        quantity: 1
      }))
    }

    // 2. LOGIKA UPOZORENJA
    if (requiresVan) {
      let reasonText = `Sustav je detektirao ${articlesFound} artikala. Zbog količine, za dostavu će vam vjerojatno trebati kombi.`

      if (foundBigItems && foundBigItems.length > 0) {
        const bigItemsText = foundBigItems.join(', ')
        reasonText = `Pronašli smo ${articlesFound} artikala, uključujući masivne komade namještaja (${bigItemsText}). Za ovu narudžbu će vam sigurno trebati kombi.`
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
        message: `Detektirano je ${articlesFound} artikala i nismo pronašli tipične masivne komade. Proizvodi bi trebali stati u automobil s preklopljenim sjedalima.`
      }
    }
  } else {
    throw new Error(response?.error || 'Nepoznata pogreška na serveru.')
  }
}

function handleVolumeError(error: any) {
  console.error('Greška na klijentu:', error)
  volumeResult.value = {
    status: 'error',
    title: 'Greška prilikom obrade',
    message: error.data?.error || error.message || 'Provjerite jesu li link ili dokument ispravni.'
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-50 text-neutral-900 selection:bg-yellow-400 selection:text-black">

    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <UContainer class="flex items-center justify-between py-4">
        <div class="flex items-center gap-2 text-xl font-bold">
          <span>Usput<span class="text-yellow-500">.</span></span>
        </div>
        <div class="flex items-center gap-4">
          <UButton color="warning" variant="solid" label="Naruči dostavu" icon="i-lucide-arrow-right" trailing to="#contact" />
        </div>
      </UContainer>
    </header>

    <main class="flex-grow">
      <section class="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gray-50">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <UContainer>
          <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            <div class="lg:col-span-6 pt-4">
              <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900">
                Pametnija dostava.<br/>
                Ne isplati se ako nije <span class="text-yellow-500">usput.</span>
              </h1>
              <p class="text-lg text-gray-600 mt-8 leading-relaxed pr-4">
                Dostavljamo vaše <strong class="text-[#0057AD]">IKEA</strong> pakete iz Zagreba direktno na vaša vrata.
                Zašto plaćati punu cijenu službene logistike? Naručite svoj paket, a mi vam ga donosimo brzo i sigurno jer ionako putujemo u tom smjeru.
              </p>
            </div>

            <div class="lg:col-span-6 relative z-10">
              <UCard class="shadow-2xl ring-1 ring-gray-200/50 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
                <div class="p-4 sm:p-6">
                  <div class="mb-6">
                    <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 text-yellow-600">
                      <UIcon name="i-lucide-calculator" class="w-6 h-6" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Stane li narudžba u auto?</h2>
                    <p class="text-sm text-gray-500 mt-2 leading-relaxed">
                      Provjerite unaprijed dimenzije svoje kupovine. Unesite javnu poveznicu svoje liste ili učitajte račun.
                    </p>
                  </div>

                  <div class="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                      class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                      :class="currentTab === 'link' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'"
                      @click="currentTab = 'link'; volumeResult = null; detectedItems = []"
                    >
                      IKEA Lista
                    </button>
                    <button
                      class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                      :class="currentTab === 'pdf' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'"
                      @click="currentTab = 'pdf'; volumeResult = null; detectedItems = []"
                    >
                      PDF Račun
                    </button>
                  </div>

                  <div class="space-y-6">
                    <div v-show="currentTab === 'link'">
                      <UFormGroup label="Poveznica popisa za kupovinu" help="U IKEA aplikaciji kliknite na popis i odaberite 'Podijeli'. Zatim zalijepite dobiveni link.">
                        <UInput
                          v-model="listUrl"
                          type="url"
                          placeholder="https://www.ikea.com/hr/hr/favourites/list/..."
                          icon="i-lucide-link-2"
                          size="lg"
                          class="mb-4"
                        />
                      </UFormGroup>
                    </div>

                    <div v-show="currentTab === 'pdf'">
                      <UFormGroup label="Potvrda narudžbe / Račun">
                        <UInput
                          type="file"
                          accept="application/pdf, image/*"
                          icon="i-lucide-upload-cloud"
                          size="lg"
                          @change="onVolumeFileChange"
                          class="mb-4"
                        />
                      </UFormGroup>
                    </div>

                    <UButton
                      block
                      size="xl"
                      color="primary"
                      style="background-color: #facc15; color: #000; font-weight: bold;"
                      class="hover:bg-yellow-500 transition-colors shadow-md"
                      :loading="isCalculating"
                      :disabled="(currentTab === 'link' && !listUrl) || (currentTab === 'pdf' && !volumeFile)"
                      @click="runVolumeCheck"
                    >
                      {{ isCalculating ? 'Analiziram proizvode...' : 'Provjeri stane li u auto' }}
                    </UButton>

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

                        <UButton
                          v-if="volumeResult.status === 'warning'"
                          color="gray"
                          variant="solid"
                          size="sm"
                          class="mt-3 font-semibold"
                          to="#contact"
                        >
                          Zatraži uslugu prijevoza kombijem
                        </UButton>
                      </div>
                    </div>

                    <div v-if="detectedItems.length > 0" class="mt-6">
                      <h4 class="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Prepoznati proizvodi s popisa:</h4>
                      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <ul class="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                          <li v-for="item in detectedItems" :key="item.code" class="p-3 flex justify-between items-center text-sm hover:bg-gray-50 transition-colors">
                            <div class="flex flex-col">
                              <span class="font-bold text-gray-900">{{ item.name }}</span>
                              <span class="text-xs text-gray-500">{{ item.code }}</span>
                            </div>
                            <div class="font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-md shadow-sm border border-yellow-200">
                              {{ item.quantity }} kom
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </UContainer>
      </section>

    </main>

    <footer class="bg-gray-100 py-12 border-t border-gray-200">
      <UContainer class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2 text-xl font-bold opacity-50 grayscale">
          <span>Usput</span>
        </div>
        <p class="text-sm text-gray-500 text-center">
          &copy; {{ new Date().getFullYear() }} Usput. Sva prava pridržana.
        </p>
      </UContainer>
    </footer>
  </div>
</template>
