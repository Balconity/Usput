<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

const emit = defineEmits(['status-changed'])

// ==========================================
// 1. CONFIG ZA CIJENE (Tvoja konkurentska prednost)
// ==========================================
const pricingConfig = {
  // Osnovna cijena (Ovo konkurira IKEA-inoj standardnoj paketnoj dostavi od 3,99 € - 6,99 €)
  basePrice: 5,

  // Opcionalni dodatak ako kupac želi da se roba nosi u kuću/stan.
  // (IKEA ovo naplaćuje 89,99 € - 119,99 €. Tvojih 25 € pokriva dodatnog radnika i dalje je drastično jeftinije!)
  roomDeliverySurcharge: 25,

  // KATEGORIJE TEŽINE (Dodatak na osnovnu cijenu)
  weightTiers: [
    { max: 15, add: 0 },    // Standardni paket (do 14.99 kg) -> Ostaje 5 €
    { max: 30, add: 5 },    // Veliki paket (do 29.99 kg) -> 5 + 5 = 10 €
    { max: 100, add: 15 },  // Početak kamionske dostave (IKEA tu uzima 40+ €) -> Ti uzimaš 20 €
    { max: 250, add: 25 },  // Veći namještaj
    { max: Infinity, add: 40 } // Iznad 250 kg
  ],

  // KATEGORIJE VOLUMENA (Dodatak na osnovnu cijenu za zauzeće prostora u vozilu)
  volumeTiers: [
    { max: 0.1, add: 0 },   // Male stvari
    { max: 0.5, add: 5 },   // Srednje stvari
    { max: 1.0, add: 15 },  // Veće (npr. kreveti, komode)
    { max: Infinity, add: 25 } // Zauzima većinu vozila
  ]
}

// Tvoji kontakt podaci na koje klijenti šalju PIN
const contactConfig = {
  phone: '091 234 5678',
  email: 'info@balconity.hr'
}

// --- FAZE APLIKACIJE ---
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

// --- TVOJE VOZILO ---
const myVehicle = { name: 'Usput Dostavno Vozilo', maxLength: 200, maxWidth: 110, maxHeight: 90, weightCapacity: 500 }
const VEHICLE_VOLUME = Number(((myVehicle.maxLength * myVehicle.maxWidth * myVehicle.maxHeight) / 1000000).toFixed(2))

// --- STATE: KALKULATOR ---
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

const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'warning' | 'error', title: string, message: string } | null>(null)
const detectedItems = ref<any[]>([])
const totalVolume = ref(0)
const totalWeight = ref(0)
const deliveryPrice = ref(0)

// Zbroj svih pojedinačnih komada (za prikaz korisniku)
const totalItemsCount = computed(() => {
  return detectedItems.value.reduce((acc, item) => acc + item.quantity, 0)
})

// --- STATE: REZERVACIJA ---
const reservationTimeLeft = ref(0)
let reservationInterval: any = null

const formattedTimeLeft = computed(() => {
  const m = Math.floor(reservationTimeLeft.value / 60).toString().padStart(2, '0')
  const s = (reservationTimeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// --- UX ANIMACIJE ---
const loadingMessages = ['Povezujemo se s IKEA sustavom...', 'Prepoznajemo proizvode s liste...', 'Skidamo dimenzije i težinu...', 'Računamo najbolju cijenu dostave...']
const currentLoadingMessage = ref(loadingMessages[0])
const simulatedProgress = ref(0)
let loadingInterval: any = null
let progressInterval: any = null

// --- STATE: FORMA ---
const orderState = reactive({
  name: '', phone: '', email: '',
  ikeaOrderNumber: '', ikeaEmail: '',
  street: '', city: '', zip: '42000', objectType: 'zgrada', floor: '', hasElevator: false, notes: '', website: ''
})
const formError = ref('')
const isSubmitting = ref(false)

// --- INICIJALIZACIJA ---
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
      } else {
        localStorage.removeItem('usput_reservation')
      }
    } catch (e) {
      localStorage.removeItem('usput_reservation')
    }
  }
})

function recalculatePrice() {
  if (volumeResult.value?.status === 'success') {
    deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value)
  }
}

// --- KORAK 1: KALKULATOR I IZRAČUN CIJENE ---
function startLoadingAnimation() {
  currentLoadingMessage.value = loadingMessages[0]
  simulatedProgress.value = 0
  let messageIndex = 0
  if (loadingInterval) clearInterval(loadingInterval)
  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[messageIndex]
  }, 1800)
  if (progressInterval) clearInterval(progressInterval)
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
    volumeResult.value = { status: 'error', title: 'Greška', message: 'Nismo uspjeli očitati listu. Provjerite link.' }
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

    let longestItemName = ''
    let longestItemDim = 0
    let isTooLong = false

    if (data.parsedItems && data.parsedItems.length > 0) {
      detectedItems.value = data.parsedItems
      for (const item of data.parsedItems) {
        if (item.dimensions) {
          const maxDim = Math.max(item.dimensions.length || 0, item.dimensions.width || 0, item.dimensions.height || 0)
          if (maxDim > myVehicle.maxLength) {
            isTooLong = true
            longestItemName = item.name.replace('↳ [Dio dizajna] ', '')
            longestItemDim = maxDim
            break
          }
        }
      }
    }

    if (isTooLong) {
      volumeResult.value = { status: 'error', title: 'Predugačko za vozilo.', message: `Artikl "${longestItemName}" dug je ${longestItemDim} cm, što premašuje maksimalnu dubinu tovarnog prostora.` }
    } else if (totalVolume.value > VEHICLE_VOLUME || totalWeight.value > myVehicle.weightCapacity) {
      volumeResult.value = { status: 'error', title: 'Premašen kapacitet.', message: `Vaša narudžba (${totalVolume.value} m³ / ${totalWeight.value} kg) je veća od ukupnog kapaciteta vozila.` }
    } else {
      deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value)
      volumeResult.value = { status: 'success', title: 'Sve stane!', message: `Ovu pošiljku možemo dovesti.` }
    }
  }
}

// --- KORAK 2: REZERVACIJA I OTKAZIVANJE ---
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
    } else {
      reservationTimeLeft.value = remaining
    }
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

// --- NAVIGACIJA WIZARDA ---
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
  if (orderState.website !== '') return
  if (!orderState.street || !orderState.city || !orderState.zip) { formError.value = 'Molimo unesite punu adresu isporuke.'; return }

  if (deliveryOption.value === 'room' && orderState.objectType === 'zgrada' && !orderState.floor) {
    formError.value = 'Molimo unesite kat na koji se roba dostavlja.'; return
  }

  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    if (reservationInterval) clearInterval(reservationInterval)
    localStorage.removeItem('usput_reservation')
    currentStep.value = 'success'
  }, 1500)
}
</script>

<template>
  <div class="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

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

      <div v-if="currentStep === 'calculator'" class="animate-fade-in space-y-6">

        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4"><UIcon name="i-lucide-link" class="w-6 h-6" /></div>
          <h3 class="text-xl font-extrabold text-gray-900">Unos liste i izračun cijene</h3>
          <p class="text-sm text-gray-500 mt-2">Doznajte odmah cijenu dostave i provjerite stane li vaša narudžba u vozilo.</p>
        </div>

        <div v-if="!volumeResult || volumeResult.status === 'error'" class="space-y-6">
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

          <UFormGroup label="Poveznica popisa za kupovinu" help="U IKEA aplikaciji kliknite na popis i odaberite 'Podijeli'.">
            <UInput v-model="listUrl" type="url" placeholder="https://www.ikea.com/hr/hr/favourites/list/..." size="xl" icon="i-lucide-search" />
          </UFormGroup>

          <UAlert v-if="volumeResult && volumeResult.status === 'error'" color="red" variant="soft" :title="volumeResult.title" :description="volumeResult.message" class="mt-4" />

          <UButton block class="mt-2 font-bold shadow-md transform transition-transform hover:-translate-y-0.5" style="background-color: #facc15; color: #000;" size="xl" :loading="isCalculating" :disabled="!listUrl || !pickupDate" @click="runVolumeCheck">
            {{ isCalculating ? 'Analiziram...' : 'Provjeri gabarite i cijenu' }}
          </UButton>
        </div>

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

        <div v-if="volumeResult && volumeResult.status === 'success' && !isCalculating" class="animate-fade-in border-t border-gray-100 pt-6">

          <div v-if="detectedItems.length > 0" class="mb-8">
            <h4 class="text-lg font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-yellow-500" />
              Pregled košarice ({{ totalItemsCount }} kom)
            </h4>
            <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500 uppercase">Artikl</span>
                <div class="flex gap-3 text-xs font-bold text-gray-500 uppercase">
                  <span>{{ totalVolume }} m³</span>
                  <span>{{ totalWeight }} kg</span>
                </div>
              </div>
              <ul class="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                <li v-for="item in detectedItems" :key="item.code" class="p-3 flex justify-between items-center text-sm hover:bg-gray-50 transition-colors">
                  <div>
                    <span class="font-bold text-gray-900 block">{{ item.name }}</span>
                    <span class="text-[11px] font-mono text-gray-500">{{ item.code }}</span>
                  </div>
                  <div class="font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs border border-gray-200 shadow-sm">
                    {{ item.quantity }} kom
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center relative">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vaša cijena dostave</p>
              <p class="text-3xl font-black text-gray-900">{{ deliveryPrice }} €</p>
              <p class="text-[10px] text-gray-500 mt-1">{{ deliveryOption === 'room' ? 'Uključen unos u prostor' : 'Do kolnog prilaza' }}</p>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center flex flex-col justify-center">
              <p class="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Planirano za</p>
              <p class="text-base font-black text-green-900 capitalize leading-tight">{{ formattedPickupDate }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
            <span class="text-sm font-medium text-gray-700">Trebate li ipak unos robe u kuću/stan?</span>
            <UToggle v-model="deliveryOption" on-value="room" off-value="curbside" color="yellow" @change="recalculatePrice" />
          </div>

          <UButton block class="shadow-xl transform transition-transform hover:-translate-y-1" style="background-color: #facc15; color: #000; font-weight: 900;" size="xl" icon="i-lucide-arrow-right" trailing @click="confirmReservation">
            Sve je točno, rezerviraj termin
          </UButton>
          <button @click="resetCheck" class="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-900 underline mt-4">Unesi drugi link ili datum</button>
        </div>
      </div>

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
          <p>Paketomat čuva robu <strong>maksimalno 24 sata</strong>. Vrlo je važno da nam proslijedite PIN čim ga dobijete putem SMS-a od IKEA-e.</p>
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

      <div v-if="currentStep === 'contact_info'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Osobni podaci</h3>
          <p class="text-sm text-gray-500">S kim komuniciramo oko isporuke na adresu?</p>
        </div>

        <UFormGroup label="Vaše ime i prezime" required><UInput v-model="orderState.name" placeholder="Npr. Ivan Horvat" size="lg" icon="i-lucide-user" /></UFormGroup>
        <UFormGroup label="E-mail adresa" help="Na ovu adresu šaljemo potvrdu isporuke" required><UInput v-model="orderState.email" type="email" placeholder="ivan@primjer.com" size="lg" icon="i-lucide-mail" /></UFormGroup>
        <UFormGroup label="Broj mobitela" help="Kako bismo vas nazvali kada stignemo na adresu" required><UInput v-model="orderState.phone" type="tel" placeholder="091 234 5678" size="lg" icon="i-lucide-phone" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'reserved'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToIkeaDetails">Sljedeći korak &rarr;</UButton>
        </div>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <div v-if="currentStep === 'ikea_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Podaci iz IKEA-e</h3>
          <p class="text-sm text-gray-500">Ovi podaci su nam nužni za praćenje statusa pošiljke u paketomatu.</p>
        </div>

        <UFormGroup label="Broj narudžbe" help="9-znamenkasti broj s potvrde koju ste upravo dobili" required>
          <UInput v-model="orderState.ikeaOrderNumber" placeholder="Npr. 123456789" size="lg" icon="i-lucide-hash" />
        </UFormGroup>

        <UFormGroup label="E-mail s kojim je naručeno" help="E-mail koji ste upisali u IKEA webshopu (potrebno za praćenje)" required>
          <UInput v-model="orderState.ikeaEmail" type="email" placeholder="ivan@primjer.com" size="lg" icon="i-lucide-mail" />
        </UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100 mt-6">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'contact_info'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToDelivery">Zadnji korak &rarr;</UButton>
        </div>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <div v-if="currentStep === 'delivery_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Adresa isporuke</h3>
          <p class="text-sm text-gray-500">
            Kamo dovozimo vaše pakete?
            <span v-if="deliveryOption === 'curbside'" class="block mt-1 font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">Dostava do kolnog prilaza</span>
            <span v-else class="block mt-1 font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">Unos u prostoriju</span>
          </p>
        </div>

        <input v-model="orderState.website" type="text" class="hidden" /> <UFormGroup label="Ulica i kućni broj" required><UInput v-model="orderState.street" placeholder="Zagrebačka ulica 1" size="lg" icon="i-lucide-map-pin" /></UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Grad" required><UInput v-model="orderState.city" placeholder="Varaždin" size="lg" /></UFormGroup>
          <UFormGroup label="Poštanski broj" required><UInput v-model="orderState.zip" placeholder="42000" size="lg" /></UFormGroup>
        </div>

        <div v-if="deliveryOption === 'room'" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
          <UFormGroup label="Tip objekta i kat" required>
            <div class="flex gap-4 mt-2">
              <select v-model="orderState.objectType" class="w-1/2 rounded-lg border border-gray-300 shadow-sm text-sm p-2 outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                <option value="kuca">Kuća</option>
                <option value="zgrada">Zgrada / Stan</option>
              </select>
              <UInput v-model="orderState.floor" :disabled="orderState.objectType === 'kuca'" :placeholder="orderState.objectType === 'kuca' ? 'Nije primjenjivo' : 'Koji kat (npr. 3)?'" class="w-1/2" size="lg" />
            </div>
          </UFormGroup>

          <div v-if="orderState.objectType === 'zgrada'" class="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <UCheckbox v-model="orderState.hasElevator" color="yellow" class="font-bold text-gray-900">
              <template #label>
                Zgrada ima <strong>prostran lift</strong> u koji stanu paketi
              </template>
            </UCheckbox>
          </div>
        </div>

        <UFormGroup label="Napomena za vozača (Opcionalno)"><UTextarea v-model="orderState.notes" placeholder="Ima li posebnih uputa (prilaz zgradi, ne radi zvono)?" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'ikea_details'">Nazad</UButton>
          <UButton class="flex-1 justify-center shadow-xl transform transition-transform hover:-translate-y-1" style="background-color: #facc15; color: #000; font-weight: 900;" size="xl" :loading="isSubmitting" @click="submitFinalOrder">
            Pošalji narudžbu
          </UButton>
        </div>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <div v-if="currentStep === 'success'" class="animate-fade-in text-center py-10">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" /></div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">Sve je dogovoreno!</h3>
        <p class="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">Hvala vam, {{ orderState.name.split(' ')[0] || 'na povjerenju' }}. Uspješno smo zaprimili vaš zahtjev za dostavu planiranu za <strong>{{ formattedPickupDate }}</strong>.</p>

        <div class="mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-200 inline-block text-left max-w-md shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-bell-ring" class="w-6 h-6 text-yellow-600" />
            <p class="text-lg font-black text-yellow-900">Zadnji, najvažniji korak:</p>
          </div>
          <p class="text-sm text-yellow-800 mb-5 leading-relaxed">Kada vam od IKEA-e stigne SMS s PIN kodom za otključavanje paketomata, <strong>obavezno nam ga proslijedite</strong> kako bismo mogli preuzeti robu:</p>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-base font-bold text-gray-900 bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
              <div class="bg-green-100 p-2 rounded-full"><UIcon name="i-lucide-phone" class="w-5 h-5 text-green-600" /></div>
              {{ contactConfig.phone }} <span class="text-xs font-medium text-gray-500 ml-auto">(WhatsApp / SMS)</span>
            </div>
            <div class="flex items-center gap-3 text-base font-bold text-gray-900 bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
              <div class="bg-blue-100 p-2 rounded-full"><UIcon name="i-lucide-mail" class="w-5 h-5 text-blue-600" /></div>
              {{ contactConfig.email }}
            </div>
          </div>
        </div>

        <UButton color="gray" variant="ghost" class="mt-8 font-bold block mx-auto" @click="currentStep = 'calculator'; resetCheck()">Završi i vrati se na početak</UButton>
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
