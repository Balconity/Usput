<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['status-changed'])

// --- KONFIGURACIJA CIJENA I VOZILA ---
const pricingConfig = {
  basePrice: 5,
  roomDeliverySurcharge: 25,
  weightTiers: [
    { max: 15, add: 0 },
    { max: 30, add: 5 },
    { max: 100, add: 15 },
    { max: 250, add: 25 },
    { max: Infinity, add: 40 }
  ],
  volumeTiers: [
    { max: 0.1, add: 0 },
    { max: 0.5, add: 5 },
    { max: 1.0, add: 15 },
    { max: Infinity, add: 25 }
  ]
}

const contactConfig = { phone: '091 234 5678', email: 'info@balconity.hr' }

const myVehicle = { name: 'Usput Dostavno Vozilo', maxLength: 200, maxWidth: 110, maxHeight: 90, weightCapacity: 500 }
const VEHICLE_VOLUME = Number(((myVehicle.maxLength * myVehicle.maxWidth * myVehicle.maxHeight) / 1000000).toFixed(2))

// --- STANJA APLIKACIJE ---
type Step = 'calculator' | 'reserved' | 'contact_info' | 'ikea_details' | 'delivery_details' | 'success'
const currentStep = ref<Step>('calculator')

const progressPercentage = computed(() => {
  switch (currentStep.value) {
    case 'calculator': return 15
    case 'reserved': return 35
    case 'contact_info': return 55
    case 'ikea_details': return 75
    case 'delivery_details': return 90
    case 'success': return 100
    default: return 0
  }
})

// --- FORMA I PODACI ---
const listUrl = ref('')
const deliveryOption = ref<'curbside' | 'room'>('curbside')

function getDefaultDate() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  if (date.getDay() === 6) date.setDate(date.getDate() + 2)
  if (date.getDay() === 0) date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

const pickupDate = ref(getDefaultDate())
const minDate = computed(() => new Date().toISOString().split('T')[0])

const formattedPickupDate = computed(() => {
  if (!pickupDate.value) return ''
  return new Date(pickupDate.value).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
})

const orderState = reactive({
  name: '', phone: '', email: '',
  ikeaOrderNumber: '', ikeaEmail: '',
  street: '', city: '', zip: '42000', objectType: 'zgrada', floor: '', hasElevator: false, notes: '', website: ''
})
const formError = ref('')
const isSubmitting = ref(false)

// --- KALKULATOR I REZULTATI ---
const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'error', title: string, message: string } | null>(null)
const detectedItems = ref<any[]>([])
const totalVolume = ref(0)
const totalWeight = ref(0)
const deliveryPrice = ref(0)

// Inteligentno grupiranje paketa po krovnom proizvodu (roditelju)
const groupedProducts = computed(() => {
  const groups: any[] = [];

  detectedItems.value.forEach(item => {
    if (item.price > 0) {
      groups.push({
        code: item.code,
        name: item.name,
        price: item.price,
        image: item.image,
        packages: []
      });
    }

    if (item.dimensions && (item.dimensions.volume > 0 || item.dimensions.weight > 0)) {
      const currentGroup = groups[groups.length - 1];
      if (currentGroup) {
        currentGroup.packages.push(item);
      } else {
        groups.push({
          code: item.code,
          name: item.name,
          price: 0,
          image: item.image,
          packages: [item]
        });
      }
    }
  });

  return groups.map(g => {
    const totalBoxes = g.packages.reduce((sum: number, p: any) => sum + p.quantity, 0);
    const totalWeight = g.packages.reduce((sum: number, p: any) => sum + (p.dimensions.weight * p.quantity), 0);
    const totalVolume = g.packages.reduce((sum: number, p: any) => sum + (p.dimensions.volume * p.quantity), 0);

    return {
      ...g,
      totalBoxes,
      totalWeight: Number(totalWeight.toFixed(2)),
      totalVolume: Number(totalVolume.toFixed(3))
    };
  });
});

const totalIkeaCartPrice = computed(() => {
  return Number(groupedProducts.value.reduce((acc, group) => acc + group.price, 0).toFixed(2))
})

// --- ANIMACIJE I TIMERI ---
const loadingMessages = ['Povezujemo se s IKEA sustavom...', 'Skeniram šifre artikala iz košarice...', 'Čitam transportne dimenzije i težine paketa...', 'Generiram tablicu raspodjele tereta...']
const currentLoadingMessage = ref(loadingMessages[0])
const simulatedProgress = ref(0)
let loadingInterval: any = null
let progressInterval: any = null

const reservationTimeLeft = ref(0)
let reservationInterval: any = null

const formattedTimeLeft = computed(() => {
  const m = Math.floor(reservationTimeLeft.value / 60).toString().padStart(2, '0')
  const s = (reservationTimeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// --- FUNKCIJE ---
onMounted(() => {
  const savedReservation = localStorage.getItem('usput_reservation')
  if (savedReservation) {
    try {
      const parsed = JSON.parse(savedReservation)
      if (parsed.expires > Date.now()) {
        currentStep.value = 'reserved'
        listUrl.value = parsed.url
        pickupDate.value = parsed.date
        totalVolume.value = parsed.volume
        deliveryPrice.value = parsed.price
        deliveryOption.value = parsed.deliveryOption || 'curbside'
        startReservationTimer(parsed.expires)
      } else { localStorage.removeItem('usput_reservation') }
    } catch (e) { localStorage.removeItem('usput_reservation') }
  }
})

onBeforeUnmount(() => {
  if (loadingInterval) clearInterval(loadingInterval)
  if (progressInterval) clearInterval(progressInterval)
  if (reservationInterval) clearInterval(reservationInterval)
})

function recalculatePrice() {
  deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value)
}

function startLoadingAnimation() {
  currentLoadingMessage.value = loadingMessages[0]
  simulatedProgress.value = 0
  let messageIndex = 0

  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[messageIndex]
  }, 1800)

  progressInterval = setInterval(() => {
    if (simulatedProgress.value < 90) simulatedProgress.value += (90 - simulatedProgress.value) * 0.1
  }, 300)
}

function stopLoadingAnimation() {
  if (loadingInterval) clearInterval(loadingInterval)
  if (progressInterval) clearInterval(progressInterval)
  simulatedProgress.value = 100
}

function resetCheck() {
  volumeResult.value = null
  detectedItems.value = []
  totalVolume.value = 0
  totalWeight.value = 0
  deliveryPrice.value = 0
}

function calculatePrice(volume: number, weight: number, option: string) {
  let price = pricingConfig.basePrice
  if (option === 'room') price += pricingConfig.roomDeliverySurcharge
  for (const tier of pricingConfig.weightTiers) {
    if (weight <= tier.max) { price += tier.add; break }
  }
  for (const tier of pricingConfig.volumeTiers) {
    if (volume <= tier.max) { price += tier.add; break }
  }
  return price
}

async function runVolumeCheck() {
  if (!listUrl.value || !pickupDate.value) return
  isCalculating.value = true
  resetCheck()
  startLoadingAnimation()

  try {
    const response = await $fetch('/api/list-volume', { method: 'POST', body: { url: listUrl.value } })
    await new Promise(r => setTimeout(r, 800))
    handleVolumeResponse(response)
  } catch (error: any) {
    volumeResult.value = { status: 'error', title: 'Greška', message: 'Nismo uspjeli očitati sustav. Provjerite link.' }
  } finally {
    stopLoadingAnimation()
    setTimeout(() => { isCalculating.value = false }, 500)
  }
}

function handleVolumeResponse(response: any) {
  if (response && response.success) {
    const data = response.data
    totalVolume.value = data.totalVolume || 0
    totalWeight.value = data.totalWeight || 0
    deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value)

    if (data.parsedItems && data.parsedItems.length > 0) {
      detectedItems.value = data.parsedItems
    }

    if (totalVolume.value > VEHICLE_VOLUME || totalWeight.value > myVehicle.weightCapacity) {
      volumeResult.value = { status: 'error', title: 'Premašen kapacitet.', message: `Vaša narudžba (${totalVolume.value} m³ / ${totalWeight.value} kg) je veća od ukupnog kapaciteta vozila.` }
    } else {
      volumeResult.value = { status: 'success', title: 'Sve stane!', message: `Ovu pošiljku možemo uspješno dovesti.` }
    }
  }
}

function confirmReservation() {
  currentStep.value = 'reserved'
  const expiresAt = Date.now() + 30 * 60 * 1000
  localStorage.setItem('usput_reservation', JSON.stringify({
    expires: expiresAt,
    date: pickupDate.value,
    url: listUrl.value,
    volume: totalVolume.value,
    price: deliveryPrice.value,
    deliveryOption: deliveryOption.value
  }))
  startReservationTimer(expiresAt)
}

function startReservationTimer(expiresAt: number) {
  const update = () => {
    const remaining = Math.floor((expiresAt - Date.now()) / 1000)
    if (remaining <= 0) {
      clearInterval(reservationInterval)
      alert('Vaša rezervacija je istekla.')
      cancelReservation(true)
    } else { reservationTimeLeft.value = remaining }
  }
  update()
  reservationInterval = setInterval(update, 1000)
}

function cancelReservation(autoExpired = false) {
  if (!autoExpired) {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju? Svi podaci bit će izbrisani.')) return
  }
  if (reservationInterval) clearInterval(reservationInterval)
  localStorage.removeItem('usput_reservation')
  currentStep.value = 'calculator'
  resetCheck()
  formError.value = ''
}

function proceedToContact() { currentStep.value = 'contact_info'; emit('status-changed', true) }

function proceedToIkeaDetails() {
  formError.value = ''
  if (!orderState.name || !orderState.phone || !orderState.email) { formError.value = 'Molimo ispunite sve osobne podatke.'; return }
  if (!orderState.ikeaEmail) orderState.ikeaEmail = orderState.email
  currentStep.value = 'ikea_details'
}

function proceedToDelivery() {
  formError.value = ''
  if (!orderState.ikeaOrderNumber) { formError.value = 'Molimo unesite broj narudžbe iz IKEA-e.'; return }
  if (!orderState.ikeaEmail) { formError.value = 'Molimo unesite e-mail s kojim je naručeno.'; return }
  currentStep.value = 'delivery_details'
}

async function submitFinalOrder() {
  formError.value = ''

  if (orderState.website !== '') return // Honeypot provjera

  if (!orderState.street || !orderState.city || !orderState.zip) {
    formError.value = 'Molimo unesite punu adresu isporuke.'
    return
  }
  if (deliveryOption.value === 'room' && orderState.objectType === 'zgrada' && !orderState.floor) {
    formError.value = 'Molimo unesite kat na koji se roba dostavlja.'
    return
  }

  isSubmitting.value = true

  try {
    const orderPayload = {
      personalInfo: {
        name: orderState.name,
        email: orderState.email,
        phone: orderState.phone
      },
      ikeaDetails: {
        orderNumber: orderState.ikeaOrderNumber,
        ikeaEmail: orderState.ikeaEmail,
        listUrl: listUrl.value
      },
      delivery: {
        date: pickupDate.value,
        option: deliveryOption.value,
        street: orderState.street,
        city: orderState.city,
        zip: orderState.zip,
        objectType: orderState.objectType,
        floor: orderState.floor,
        hasElevator: orderState.hasElevator,
        notes: orderState.notes
      },
      transport: {
        price: deliveryPrice.value,
        totalVolume: totalVolume.value,
        totalWeight: totalWeight.value,
        totalBoxes: groupedProducts.value.reduce((acc, g) => acc + g.totalBoxes, 0),
        items: groupedProducts.value
      }
    };

    // Poziv internog Nuxt.js API-ja
    const response = await $fetch('/api/submit-order', {
      method: 'POST',
      body: orderPayload
    });

    if (response && response.success) {
      if (reservationInterval) clearInterval(reservationInterval)
      localStorage.removeItem('usput_reservation')
      currentStep.value = 'success'
    } else {
      formError.value = 'Dogodila se greška prilikom slanja narudžbe. Pokušajte ponovno.'
    }

  } catch (error) {
    formError.value = 'Izgleda da je server nedostupan. Provjerite internetsku vezu i pokušajte ponovno.'
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

    <!-- HEADER S PROGRESS BAROM -->
    <div class="bg-gray-900 px-6 py-5 border-b border-gray-800">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Rezervacija dostave</h2>
        <span class="text-xs font-bold bg-gray-800 text-yellow-400 px-3 py-1 rounded-full">
          Korak {{ currentStep === 'calculator' ? '1/5' : currentStep === 'reserved' ? '2/5' : currentStep === 'contact_info' ? '3/5' : currentStep === 'ikea_details' ? '4/5' : currentStep === 'delivery_details' ? '5/5' : 'Završeno' }}
        </span>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div class="bg-yellow-400 h-1.5 transition-all duration-500 ease-out" :style="`width: ${progressPercentage}%`"></div>
      </div>
    </div>

    <div class="p-6 sm:p-8 min-h-[400px]">
      <UAlert v-if="formError" icon="i-lucide-alert-circle" color="red" variant="soft" :title="formError" class="mb-6 font-medium" />

      <!-- KORAK 1: KALKULATOR -->
      <div v-if="currentStep === 'calculator'" class="animate-fade-in space-y-6">

        <div v-if="!volumeResult && !isCalculating" class="space-y-6">
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4"><UIcon name="i-lucide-link" class="w-6 h-6" /></div>
            <h3 class="text-xl font-extrabold text-gray-900">Unos liste i izračun cijene</h3>
            <p class="text-sm text-gray-500 mt-2">Doznajte odmah cijenu dostave i provjerite stane li vaša narudžba u vozilo.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormGroup label="Datum preuzimanja u Zagrebu" help="Ponudili smo prvi slobodan termin">
              <UInput v-model="pickupDate" type="date" :min="minDate" size="lg" />
            </UFormGroup>
          </div>

          <UFormGroup label="Usluga istovara na adresi">
            <div class="flex gap-4 mt-1">
              <label class="flex-1 relative flex cursor-pointer rounded-xl border p-3 hover:bg-gray-50 transition-colors"
                     :class="deliveryOption === 'curbside' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 bg-white'">
                <input type="radio" v-model="deliveryOption" value="curbside" class="sr-only" @change="recalculatePrice" />
                <div class="text-center w-full">
                  <p class="font-bold text-gray-900 text-sm">Do kolnog prilaza</p>
                  <p class="text-xs text-gray-500">Istovar ispred kuće/zgrade</p>
                </div>
              </label>

              <label class="flex-1 relative flex cursor-pointer rounded-xl border p-3 hover:bg-gray-50 transition-colors"
                     :class="deliveryOption === 'room' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 bg-white'">
                <input type="radio" v-model="deliveryOption" value="room" class="sr-only" @change="recalculatePrice" />
                <div class="text-center w-full">
                  <p class="font-bold text-gray-900 text-sm">Unos u prostoriju</p>
                  <p class="text-xs text-gray-500">+{{ pricingConfig.roomDeliverySurcharge }} € nadoplata</p>
                </div>
              </label>
            </div>
          </UFormGroup>

          <UFormGroup label="Poveznica popisa ili podijeljene košarice" help="U košarici ili popisu kliknite na gumb 'Podijeli'.">
            <UInput v-model="listUrl" type="url" placeholder="https://www.ikea.com/hr/hr/favourites/list/..." size="xl" icon="i-lucide-search" />
          </UFormGroup>

          <UButton block class="mt-2 font-bold shadow-md transform transition-transform hover:-translate-y-0.5" style="background-color: #facc15; color: #000;" size="xl" :disabled="!listUrl || !pickupDate" @click="runVolumeCheck">
            Provjeri gabarite i cijenu
          </UButton>
        </div>

        <!-- SPINNING ANIMACIJA UČITAVANJA -->
        <div v-if="isCalculating" class="mt-6 p-6 border border-yellow-200 rounded-xl flex flex-col items-center text-center bg-white">
          <div class="absolute inset-0 bg-yellow-50/50 animate-pulse"></div>
          <div class="relative z-10 flex flex-col items-center w-full">
            <UIcon name="i-lucide-box" class="w-10 h-10 text-yellow-600 animate-bounce mb-4" />
            <h4 class="text-lg font-extrabold text-gray-900 mb-2">Samo trenutak...</h4>
            <p class="text-sm text-gray-600 h-5">{{ currentLoadingMessage }}</p>
            <div class="w-full max-w-[240px] h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
              <div class="h-full bg-yellow-400 transition-all duration-300" :style="{ width: `${simulatedProgress}%` }"></div>
            </div>
          </div>
        </div>

        <!-- PRIKAZ REZULTATA NAKON AKCIJE -->
        <div v-if="volumeResult && !isCalculating" class="animate-fade-in space-y-6">

          <!-- OBAVIJEST -->
          <UAlert v-if="volumeResult.status === 'error'" color="red" variant="soft" icon="i-lucide-alert-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />
          <UAlert v-else color="green" variant="soft" icon="i-lucide-check-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />

          <!-- METRIKE -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ukupan volumen</p>
              <p class="text-2xl font-black" :class="totalVolume > VEHICLE_VOLUME ? 'text-red-600 animate-pulse' : 'text-gray-900'">{{ totalVolume }} m³</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Vozilo prima maks. {{ VEHICLE_VOLUME }} m³</p>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ukupna težina</p>
              <p class="text-2xl font-black" :class="totalWeight > myVehicle.weightCapacity ? 'text-red-600' : 'text-gray-900'">{{ totalWeight }} kg</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Vozilo prima maks. {{ myVehicle.weightCapacity }} kg</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <p class="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Cijena dostave</p>
              <p class="text-2xl font-black text-blue-900">{{ deliveryPrice }} €</p>
              <p class="text-[10px] text-blue-500 mt-0.5 capitalize">{{ deliveryOption === 'room' ? 'Uključen unos u prostor' : 'Do prilaza' }}</p>
            </div>
          </div>

          <!-- DETALJNA TABLICA (GRUPIRANA PO RODITELJU) -->
          <div v-if="groupedProducts.length > 0">
            <h4 class="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-yellow-500" />
              Pregled prepoznatih IKEA proizvoda i paketa
            </h4>

            <div class="space-y-4">
              <div v-for="group in groupedProducts" :key="group.code" class="border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white">

                <!-- RODITELJSKA KARTICA -->
                <div class="bg-gray-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 text-white">
                  <div class="flex items-center gap-3">
                    <img v-if="group.image" :src="group.image" class="w-14 h-14 object-contain rounded-xl border bg-white shrink-0 shadow-sm" />
                    <div v-else class="w-14 h-14 bg-gray-800 rounded-xl border flex items-center justify-center shrink-0 text-gray-500">
                      <UIcon name="i-lucide-image" class="w-6 h-6" />
                    </div>
                    <div class="space-y-0.5">
                      <h5 class="font-bold text-yellow-400 text-sm sm:text-base leading-tight">{{ group.name }}</h5>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs font-medium text-gray-400 mt-1">
                        <span class="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{{ group.code }}</span>
                        <span class="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold">📦 {{ group.totalBoxes }} kom paketa</span>
                        <span class="bg-gray-800 px-1.5 py-0.5 rounded text-sky-400 font-bold">🧊 {{ group.totalVolume }} m³</span>
                        <span class="bg-gray-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">⚖️ {{ group.totalWeight }} kg</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-left sm:text-right sm:border-l sm:pl-4 border-gray-700 shrink-0">
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cijena artikla</p>
                    <p class="text-lg font-black text-white">{{ group.price }} €</p>
                  </div>
                </div>

                <!-- SPECIFIKACIJA TRANSPORTNIH PAKETA -->
                <div class="p-3 bg-gray-50/50">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 pb-2">Transportna specifikacija kutija:</p>
                  <ul class="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                    <li v-for="pkg in group.packages" :key="pkg.code" class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div class="min-w-0">
                        <p class="font-bold text-gray-800 leading-tight">{{ pkg.name }}</p>
                        <p class="text-[10px] text-gray-400 font-mono mt-0.5">Šifra paketa: {{ pkg.code }}</p>
                      </div>

                      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6 font-medium text-gray-500 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div>
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Dimenzije kutije</p>
                          <p class="font-mono text-gray-700 font-bold">{{ pkg.dimensions.width }}×{{ pkg.dimensions.height }}×{{ pkg.dimensions.length }} cm</p>
                        </div>
                        <div class="min-w-[60px]">
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ukupan vol.</p>
                          <p class="text-sky-700 font-black">{{ (pkg.dimensions.volume * pkg.quantity).toFixed(3) }} m³</p>
                        </div>
                        <div class="min-w-[60px]">
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ukupna tež.</p>
                          <p class="text-amber-700 font-black">{{ (pkg.dimensions.weight * pkg.quantity).toFixed(2) }} kg</p>
                        </div>
                        <div class="font-black bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200 text-[11px] shrink-0">
                          {{ pkg.quantity }} kom
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            <!-- UKUPNA CIJENA KOŠARICE -->
            <div v-if="totalIkeaCartPrice > 0" class="bg-gray-900 px-5 py-4 rounded-2xl flex justify-between items-center text-sm text-white mt-4 shadow-md">
              <span class="font-bold text-gray-400">Ukupna vrijednost IKEA košarice:</span>
              <span class="font-black text-yellow-400 text-lg">{{ totalIkeaCartPrice }} €</span>
            </div>
          </div>

          <!-- REZERVACIJA TERMINA -->
          <div v-if="volumeResult.status === 'success'" class="space-y-4 pt-2">
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span class="text-sm font-medium text-gray-700">Trebate li ipak unos robe u kuću/stan?</span>
              <UToggle v-model="deliveryOption" on-value="room" off-value="curbside" color="yellow" @change="recalculatePrice" />
            </div>

            <UButton block class="shadow-xl transform transition-transform hover:-translate-y-1 font-black" style="background-color: #facc15; color: #000;" size="xl" icon="i-lucide-arrow-right" trailing @click="confirmReservation">
              Sve je točno, rezerviraj termin
            </UButton>
          </div>

          <button @click="resetCheck" class="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-900 underline mt-4">Provjeri novi link</button>
        </div>
      </div>

      <!-- KORAK 2: REZERVIRANO VRIJEME -->
      <div v-if="currentStep === 'reserved'" class="animate-fade-in space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-black text-gray-900">Termin je vaš!</h3>
          <p class="text-gray-600">Čuvamo vam mjesto za <strong>{{ formattedPickupDate }}</strong>. Slijedite upute ispod.</p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left mb-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <h4 class="font-extrabold text-blue-900 text-lg mb-3">Važno: Što sad trebate napraviti?</h4>
          <ol class="list-decimal pl-5 text-sm text-blue-800 space-y-3 font-medium">
            <li>Ostavite ovaj prozor otvorenim.</li>
            <li>Otiđite na IKEA webshop i završite kupnju svoje košarice.</li>
            <li>Za način preuzimanja <strong class="text-red-600 underline uppercase bg-red-50 px-1 rounded">obavezno odaberite IKEA Paketomat</strong>.</li>
            <li>Pod opcijom <strong class="text-gray-900">"Netko drugi će preuzeti moju narudžbu"</strong> upišite ime i prezime vozača: <span class="bg-white px-2 py-1 rounded shadow-sm text-black border select-all">Tomislav Levkuš</span></li>
            <li>Nakon plaćanja u IKEA-i, vratite se ovdje kako biste nam ostavili podatke za dostavu.</li>
          </ol>
        </div>

        <div class="flex items-start gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <UIcon name="i-lucide-info" class="w-5 h-5 shrink-0 text-gray-400" />
          <p>Paketomat čuva robu <strong>maksimalno 24 sata</strong>. PIN nam pošaljite čim stigne.</p>
        </div>

        <div class="flex items-center justify-between bg-gray-900 text-white rounded-xl px-6 py-4 shadow-inner mt-4">
          <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Preostalo vrijeme:</span>
          <span class="text-3xl font-mono font-black text-yellow-400">{{ formattedTimeLeft }}</span>
        </div>

        <UButton block size="xl" style="background-color: #facc15; color: #000; font-weight: 900;" class="mt-4" @click="proceedToContact">
          Završio/la sam kupnju, idemo dalje &rarr;
        </UButton>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <!-- KORAK 3: OSOBNI PODACI -->
      <div v-if="currentStep === 'contact_info'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Osobni podaci</h3>
          <p class="text-sm text-gray-500">S kim komuniciramo oko isporuke na adresu?</p>
        </div>

        <UFormGroup label="Vaše ime i prezime" required><UInput v-model="orderState.name" placeholder="Npr. Ivan Horvat" size="lg" icon="i-lucide-user" /></UFormGroup>
        <UFormGroup label="E-mail adresa" required><UInput v-model="orderState.email" type="email" placeholder="ivan@primjer.com" size="lg" icon="i-lucide-mail" /></UFormGroup>
        <UFormGroup label="Broj mobitela" required><UInput v-model="orderState.phone" type="tel" placeholder="091 234 5678" size="lg" icon="i-lucide-phone" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'reserved'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToIkeaDetails">Sljedeći korak &rarr;</UButton>
        </div>
      </div>

      <!-- KORAK 4: IKEA DETALJI -->
      <div v-if="currentStep === 'ikea_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Podaci iz IKEA-e</h3>
          <p class="text-sm text-gray-500">Ovi podaci su nam nužni za praćenje statusa pošiljke u paketomatu.</p>
        </div>

        <UFormGroup label="Broj narudžbe" required><UInput v-model="orderState.ikeaOrderNumber" placeholder="Npr. 123456789" size="lg" icon="i-lucide-hash" /></UFormGroup>
        <UFormGroup label="E-mail s kojim je naručeno" required><UInput v-model="orderState.ikeaEmail" type="email" placeholder="ivan@primjer.com" size="lg" icon="i-lucide-mail" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100 mt-6">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'contact_info'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToDelivery">Zadnji korak &rarr;</UButton>
        </div>
      </div>

      <!-- KORAK 5: ADRESA ISPORUKE I SLANJE U BAZU -->
      <div v-if="currentStep === 'delivery_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Adresa isporuke</h3>
          <p class="text-sm text-gray-500">Kamo dovozimo vaše pakete?</p>
        </div>

        <input v-model="orderState.website" type="text" class="hidden" />
        <UFormGroup label="Ulica i kućni broj" required><UInput v-model="orderState.street" placeholder="Zagrebačka ulica 1" size="lg" icon="i-lucide-map-pin" /></UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Grad" required><UInput v-model="orderState.city" placeholder="Varaždin" size="lg" /></UFormGroup>
          <UFormGroup label="Poštanski broj" required><UInput v-model="orderState.zip" placeholder="42000" size="lg" /></UFormGroup>
        </div>

        <div v-if="deliveryOption === 'room'" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
          <UFormGroup label="Tip objekta i kat" required>
            <div class="flex gap-4 mt-2">
              <select v-model="orderState.objectType" class="w-1/2 rounded-lg border border-gray-300 shadow-sm text-sm p-2 bg-white">
                <option value="kuca">Kuća</option>
                <option value="zgrada">Zgrada / Stan</option>
              </select>
              <UInput v-model="orderState.floor" :disabled="orderState.objectType === 'kuca'" :placeholder="orderState.objectType === 'kuca' ? 'Nije primjenjivo' : 'Koji kat?'" class="w-1/2" size="lg" />
            </div>
          </UFormGroup>

          <div v-if="orderState.objectType === 'zgrada'" class="mt-4 pt-4 border-t border-gray-200">
            <UCheckbox v-model="orderState.hasElevator" color="yellow" class="font-bold text-gray-900">
              <template #label>Zgrada ima <strong>prostran lift</strong></template>
            </UCheckbox>
          </div>
        </div>

        <UFormGroup label="Napomena za vozača (Opcionalno)"><UTextarea v-model="orderState.notes" placeholder="Ima li posebnih uputa?" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'ikea_details'">Nazad</UButton>
          <UButton class="flex-1 justify-center shadow-xl font-black" style="background-color: #facc15; color: #000;" size="xl" :loading="isSubmitting" @click="submitFinalOrder">
            Pošalji narudžbu
          </UButton>
        </div>
      </div>

      <!-- KORAK 6: USPJEH -->
      <div v-if="currentStep === 'success'" class="animate-fade-in text-center py-10">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" /></div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">Sve je dogovoreno!</h3>
        <p class="text-lg text-gray-600 max-w-md mx-auto">Zahtjev za dostavu je uspješno zaprimljen za datum <strong>{{ formattedPickupDate }}</strong>.</p>

        <div class="mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-200 inline-block text-left max-w-md shadow-sm">
          <p class="text-base font-black text-yellow-900 mb-2">Zadnji korak:</p>
          <p class="text-sm text-yellow-800 mb-4">Molimo vas da nam proslijedite PIN za preuzimanje iz IKEA paketomata čim ga zaprimite na mobitel:</p>
          <div class="space-y-2">
            <div class="text-sm font-bold text-gray-900 bg-white p-3 rounded-lg border flex items-center gap-2 shadow-sm">
              <UIcon name="i-lucide-phone" class="text-green-600 w-5 h-5" /> {{ contactConfig.phone }} (WhatsApp/SMS)
            </div>
            <div class="text-sm font-bold text-gray-900 bg-white p-3 rounded-lg border flex items-center gap-2 shadow-sm">
              <UIcon name="i-lucide-mail" class="text-blue-600 w-5 h-5" /> {{ contactConfig.email }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(15px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
