<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

const emit = defineEmits(['status-changed'])

// --- FAZE APLIKACIJE ---
type Step = 'calculator_and_date' | 'reserved' | 'contact_info' | 'pickup_details' | 'delivery_details' | 'success'
const currentStep = ref<Step>('calculator_and_date')

const progressPercentage = computed(() => {
  switch (currentStep.value) {
    case 'calculator_and_date': return 20
    case 'reserved': return 40
    case 'contact_info': return 60
    case 'pickup_details': return 80
    case 'delivery_details': return 95
    case 'success': return 100
    default: return 0
  }
})

// --- TVOJE VOZILO ---
const myVehicle = {
  name: 'Usput Dostavno Vozilo',
  maxLength: 200,
  maxWidth: 110,
  maxHeight: 90,
  weightCapacity: 500
}
const VEHICLE_VOLUME = Number(((myVehicle.maxLength * myVehicle.maxWidth * myVehicle.maxHeight) / 1000000).toFixed(2))

// --- STATE: KALKULATOR I KALENDAR ---
const listUrl = ref('')
const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'warning' | 'error', title: string, message: string } | null>(null)
const detectedItems = ref<any[]>([])
const totalVolume = ref(0)
const totalWeight = ref(0)
const isItemTooLongGlobal = ref(false)

const pickupDate = ref('')
const calendarDays = ref<Array<{ dateStr: string, dateObj: Date, isWeekend: boolean, freeVol: number, freeWt: number }>>([])

// --- STATE: REZERVACIJA ---
const reservationTimeLeft = ref(0)
let reservationInterval: any = null

const formattedTimeLeft = computed(() => {
  const m = Math.floor(reservationTimeLeft.value / 60).toString().padStart(2, '0')
  const s = (reservationTimeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// --- POMOĆNE FUNKCIJE ZA DATUME ---
function formatShortDay(dateObj: Date) {
  return dateObj.toLocaleDateString('hr-HR', { weekday: 'short' }).replace('.', '')
}
function formatShortDate(dateObj: Date) {
  return dateObj.toLocaleDateString('hr-HR', { day: 'numeric', month: 'numeric' })
}
function formatDateHR(dateString: string) {
  return new Date(dateString).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function generateCalendar() {
  const days = []
  let curr = new Date()

  for (let i = 1; i <= 14; i++) {
    curr.setDate(curr.getDate() + 1)
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6
    const randomFactor = isWeekend ? 0 : 0.2 + Math.random() * 0.8

    days.push({
      dateStr: curr.toISOString().split('T')[0],
      dateObj: new Date(curr),
      isWeekend,
      freeVol: Number((VEHICLE_VOLUME * randomFactor).toFixed(2)),
      freeWt: Math.floor(myVehicle.weightCapacity * randomFactor)
    })
  }
  calendarDays.value = days
}

// --- UX ANIMACIJE ---
const loadingMessages = ['Povezujemo se s IKEA sustavom...', 'Skeniramo dimenzije i masu paketa...', 'Uspoređujemo rezultat s kalendarom...', 'Skoro gotovo...']
const currentLoadingMessage = ref(loadingMessages[0])
const simulatedProgress = ref(0)
let loadingInterval: any = null
let progressInterval: any = null

// --- STATE: FORMA ---
const orderState = reactive({
  name: '', phone: '', email: '',
  ikeaOrderNumber: '', lockerPin: '', orderPdf: null as File | null,
  street: '', city: '', zip: '42000', objectType: 'kuca', floor: '', hasElevator: false, notes: '', website: ''
})
const formError = ref('')
const isSubmitting = ref(false)

// --- INICIJALIZACIJA ---
onMounted(() => {
  generateCalendar()

  const savedReservation = localStorage.getItem('usput_reservation')
  if (savedReservation) {
    try {
      const parsed = JSON.parse(savedReservation)
      if (parsed.expires > Date.now()) {
        currentStep.value = 'reserved'
        listUrl.value = parsed.url
        pickupDate.value = parsed.date
        totalVolume.value = parsed.volume
        startReservationTimer(parsed.expires)
      } else {
        localStorage.removeItem('usput_reservation')
      }
    } catch (e) {
      localStorage.removeItem('usput_reservation')
    }
  }
})

// --- KORAK 1: KALKULATOR I PRIKAZ KALENDARA ---
function startLoadingAnimation() {
  currentLoadingMessage.value = loadingMessages[0]
  simulatedProgress.value = 0
  let messageIndex = 0

  if (loadingInterval) clearInterval(loadingInterval)
  loadingInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[messageIndex]
  }, 2500)

  if (progressInterval) clearInterval(progressInterval)
  progressInterval = setInterval(() => {
    if (simulatedProgress.value < 90) simulatedProgress.value += (90 - simulatedProgress.value) * 0.1
  }, 500)
}

function stopLoadingAnimation() {
  if (loadingInterval) clearInterval(loadingInterval)
  if (progressInterval) clearInterval(progressInterval)
  simulatedProgress.value = 100
}

function resetCheck() {
  volumeResult.value = null
  pickupDate.value = ''
  detectedItems.value = []
  totalVolume.value = 0
  totalWeight.value = 0
  isItemTooLongGlobal.value = false
}

async function runVolumeCheck() {
  if (!listUrl.value) return
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

    if (data.parsedItems && data.parsedItems.length > 0) {
      detectedItems.value = data.parsedItems
      for (const item of data.parsedItems) {
        if (item.dimensions) {
          const maxDim = Math.max(item.dimensions.length || 0, item.dimensions.width || 0, item.dimensions.height || 0)
          if (maxDim > myVehicle.maxLength) {
            isItemTooLongGlobal.value = true
            longestItemName = item.name.replace('↳ [Dio dizajna] ', '')
            longestItemDim = maxDim
            break
          }
        }
      }
    }

    const isOverAbsoluteVolume = totalVolume.value > VEHICLE_VOLUME
    const isOverAbsoluteWeight = totalWeight.value > myVehicle.weightCapacity

    if (isItemTooLongGlobal.value) {
      volumeResult.value = { status: 'error', title: 'Predugačko za vozilo.', message: `Artikl "${longestItemName}" dug je ${longestItemDim} cm, što premašuje ukupnu dubinu našeg tovarnog prostora.` }
    } else if (isOverAbsoluteVolume || isOverAbsoluteWeight) {
      volumeResult.value = { status: 'error', title: 'Premašen kapacitet.', message: `Vaša narudžba (${totalVolume.value} m³ / ${totalWeight.value} kg) je veća od ukupnog kapaciteta potpuno praznog vozila. Ne možemo odraditi ovu dostavu odjednom.` }
    } else {
      volumeResult.value = { status: 'success', title: 'Gabariti su odobreni!', message: `Paketi stanu u vozilo. Sada odaberite slobodan datum ispod.` }
    }
  }
}

function dayFits(day: any) {
  return day.freeVol >= totalVolume.value && day.freeWt >= totalWeight.value && !day.isWeekend
}

function selectDate(day: any) {
  if (dayFits(day)) pickupDate.value = day.dateStr
}

// --- KORAK 2: REZERVACIJA ---
function confirmReservation() {
  if (!pickupDate.value) return
  currentStep.value = 'reserved'
  const expiresAt = Date.now() + 30 * 60 * 1000
  localStorage.setItem('usput_reservation', JSON.stringify({
    expires: expiresAt,
    date: pickupDate.value,
    url: listUrl.value,
    volume: totalVolume.value
  }))
  startReservationTimer(expiresAt)
}

function startReservationTimer(expiresAt: number) {
  const update = () => {
    const remaining = Math.floor((expiresAt - Date.now()) / 1000)
    if (remaining <= 0) {
      clearInterval(reservationInterval)
      alert('Vaša rezervacija je istekla.')
      currentStep.value = 'calculator_and_date'
      resetCheck()
    } else {
      reservationTimeLeft.value = remaining
    }
  }
  update()
  reservationInterval = setInterval(update, 1000)
}

// --- WIZARD NAVIGACIJA ---
function proceedToContact() { currentStep.value = 'contact_info'; emit('status-changed', true) }

function proceedToPickup() {
  formError.value = ''
  if (!orderState.name || !orderState.phone || !orderState.email) { formError.value = 'Molimo ispunite sve osobne podatke.'; return }
  currentStep.value = 'pickup_details'
}

function proceedToDelivery() {
  formError.value = ''
  if (!orderState.ikeaOrderNumber) { formError.value = 'Molimo unesite broj narudžbe.'; return }
  if (!orderState.lockerPin) { formError.value = 'Molimo unesite PIN paketomata iz SMS-a.'; return }
  if (!orderState.orderPdf) { formError.value = 'Molimo priložite PDF potvrdu narudžbe.'; return }
  currentStep.value = 'delivery_details'
}

function handlePdfUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) orderState.orderPdf = input.files[0]
}

async function submitFinalOrder() {
  formError.value = ''
  if (orderState.website !== '') return
  if (!orderState.street || !orderState.city || !orderState.zip) { formError.value = 'Molimo unesite punu adresu isporuke.'; return }
  if (orderState.objectType === 'zgrada' && !orderState.floor) { formError.value = 'Molimo unesite kat zgrade na koji se roba dostavlja.'; return }

  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    clearInterval(reservationInterval)
    localStorage.removeItem('usput_reservation')
    currentStep.value = 'success'
  }, 1500)
}
</script>

<template>
  <div class="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

    <!-- HEADER SA PROGRESS BAROM -->
    <div class="bg-gray-900 px-6 py-5 border-b border-gray-800">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Rezervacija dostave</h2>
        <span class="text-xs font-bold bg-gray-800 text-yellow-400 px-3 py-1 rounded-full">
          Korak {{ currentStep === 'calculator_and_date' ? '1/5' : currentStep === 'reserved' ? '2/5' : currentStep === 'contact_info' ? '3/5' : currentStep === 'pickup_details' ? '4/5' : currentStep === 'delivery_details' ? '5/5' : 'Završeno' }}
        </span>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div class="bg-yellow-400 h-1.5 transition-all duration-500 ease-out" :style="`width: ${progressPercentage}%`"></div>
      </div>
    </div>

    <!-- TIJELO KOMPONENTE -->
    <div class="p-6 sm:p-8 min-h-[400px]">

      <UAlert v-if="formError" icon="i-lucide-alert-circle" color="red" variant="soft" :title="formError" class="mb-6 font-medium" />

      <!-- ==========================================
           KORAK 1: UNOS LISTE I KALENDAR
           ========================================== -->
      <div v-if="currentStep === 'calculator_and_date'" class="animate-fade-in space-y-6">

        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4"><UIcon name="i-lucide-link" class="w-6 h-6" /></div>
          <h3 class="text-xl font-extrabold text-gray-900">Unos liste i provjera termina</h3>
          <p class="text-sm text-gray-500 mt-2">Prvo provjerimo gabarite kako bismo vam ponudili samo datume u kojima ima dovoljno mjesta.</p>
        </div>

        <div v-if="!volumeResult || volumeResult.status === 'error'">
          <UFormGroup label="Poveznica popisa za kupovinu" help="U IKEA aplikaciji kliknite na popis i odaberite 'Podijeli'.">
            <UInput v-model="listUrl" type="url" placeholder="https://www.ikea.com/hr/hr/favourites/list/..." size="xl" icon="i-lucide-search" />
          </UFormGroup>

          <UAlert v-if="volumeResult && volumeResult.status === 'error'" color="red" variant="soft" :title="volumeResult.title" :description="volumeResult.message" class="mt-4" />

          <UButton block class="mt-6 font-bold shadow-md" style="background-color: #facc15; color: #000;" size="xl" :loading="isCalculating" :disabled="!listUrl" @click="runVolumeCheck">
            {{ isCalculating ? 'Analiziram...' : 'Skeniraj listu i prikaži kalendar' }}
          </UButton>
        </div>

        <div v-if="isCalculating" class="mt-6 p-6 border border-yellow-200 rounded-xl flex flex-col items-center text-center relative bg-white">
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
          <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-600" />
              <div>
                <p class="text-sm font-bold text-green-900">Gabariti odgovaraju</p>
                <p class="text-xs text-green-700">Pošiljka zauzima: <strong>{{ totalVolume }} m³</strong> i <strong>{{ totalWeight }} kg</strong></p>
              </div>
            </div>
            <button @click="resetCheck" class="text-xs font-bold text-gray-500 hover:text-gray-900 underline">Upiši drugi link</button>
          </div>

          <h4 class="text-sm font-bold text-gray-900 mb-3">Odaberite slobodan datum za ovu narudžbu:</h4>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="day in calendarDays" :key="day.dateStr"
              @click="selectDate(day)"
              :disabled="!dayFits(day)"
              class="relative p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-1"
              :class="[
                pickupDate === day.dateStr
                  ? 'bg-yellow-400 border-yellow-500 shadow-md transform scale-105 z-10'
                  : dayFits(day)
                    ? 'bg-white border-gray-200 hover:border-yellow-400 hover:shadow-sm cursor-pointer'
                    : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed grayscale'
              ]"
            >
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500" :class="pickupDate === day.dateStr ? 'text-yellow-900' : ''">{{ formatShortDay(day.dateObj) }}</span>
              <span class="text-lg font-black text-gray-900">{{ formatShortDate(day.dateObj) }}</span>

              <div class="mt-1 flex items-center justify-center w-full">
                <span v-if="day.isWeekend" class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded w-full">Ne vozimo</span>
                <span v-else-if="!dayFits(day)" class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded w-full">Popunjeno</span>
                <span v-else class="text-[10px] font-bold px-2 py-0.5 rounded w-full" :class="pickupDate === day.dateStr ? 'bg-yellow-500 text-yellow-900' : 'text-green-600 bg-green-50'">Slobodno</span>
              </div>
            </button>
          </div>

          <UButton block class="mt-8 shadow-xl transform transition-transform hover:-translate-y-1" style="background-color: #facc15; color: #000; font-weight: 900;" size="xl" icon="i-lucide-arrow-right" trailing :disabled="!pickupDate" @click="confirmReservation">
            Rezerviraj termin ({{ pickupDate ? formatDateHR(pickupDate) : 'odaberite datum' }})
          </UButton>
        </div>
      </div>

      <!-- ==========================================
           KORAK 2: REZERVACIJA & MIKRO KORAK
           ========================================== -->
      <div v-if="currentStep === 'reserved'" class="animate-fade-in text-center space-y-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-party-popper" class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-2xl font-black text-gray-900">Termin je vaš!</h3>
        <p class="text-gray-600">Datum <strong>{{ formatDateHR(pickupDate) }}</strong> je uspješno rezerviran.</p>

        <div class="bg-gray-50 border border-yellow-200 rounded-xl p-5 text-left mb-6">
          <h4 class="font-extrabold text-gray-900 flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-yellow-600" /> Što sad trebate napraviti?
          </h4>
          <ol class="list-decimal pl-5 text-sm text-gray-700 space-y-2">
            <li>Ne zatvarajte ovu stranicu.</li>
            <li>Otiđite na IKEA webshop i platite svoju košaricu.</li>
            <li>Za način preuzimanja <strong class="text-red-600 underline">OBAVEZNO</strong> odaberite <strong>IKEA Paketomat</strong>.</li>
            <li>Spremite PDF račun koji ćete dobiti na mail.</li>
          </ol>
        </div>

        <div class="bg-gray-900 text-yellow-400 text-4xl font-black rounded-xl p-4 tracking-wider shadow-inner">
          {{ formattedTimeLeft }}
        </div>

        <UButton block size="xl" style="background-color: #facc15; color: #000; font-weight: 900;" class="mt-4" @click="proceedToContact">
          Imam IKEA račun, nastavi narudžbu &rarr;
        </UButton>
      </div>

      <!-- ==========================================
           KORAK 3: OSOBNI PODACI
           ========================================== -->
      <div v-if="currentStep === 'contact_info'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Osobni podaci</h3>
          <p class="text-sm text-gray-500">Na koga glasi narudžba?</p>
        </div>

        <UFormGroup label="Ime i prezime" help="Kako je navedeno na IKEA računu" required><UInput v-model="orderState.name" placeholder="Npr. Ivan Horvat" size="lg" icon="i-lucide-user" /></UFormGroup>
        <UFormGroup label="E-mail adresa" help="Na ovu adresu šaljemo potvrdu isporuke" required><UInput v-model="orderState.email" type="email" placeholder="ivan@primjer.com" size="lg" icon="i-lucide-mail" /></UFormGroup>
        <UFormGroup label="Broj mobitela" help="Kako bismo vas kontaktirali prije dolaska na adresu" required><UInput v-model="orderState.phone" type="tel" placeholder="091 234 5678" size="lg" icon="i-lucide-phone" /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'reserved'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToPickup">Sljedeći korak &rarr;</UButton>
        </div>
      </div>

      <!-- ==========================================
           KORAK 4: PODACI ZA PREUZIMANJE (SAMO PAKETOMAT)
           ========================================== -->
      <div v-if="currentStep === 'pickup_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-package" class="w-6 h-6 text-blue-600" />
            <h3 class="text-xl font-extrabold text-gray-900">Podaci iz Paketomata</h3>
          </div>
          <p class="text-sm text-gray-500">Ovi podaci su nam nužni za otključavanje ormarića i preuzimanje robe.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Broj narudžbe" help="9-znamenkasti broj s potvrde" required>
            <UInput v-model="orderState.ikeaOrderNumber" placeholder="Npr. 123456789" size="lg" icon="i-lucide-hash" />
          </UFormGroup>

          <UFormGroup label="PIN za otvaranje" help="Sigurnosni kod iz SMS-a koji ste dobili" required>
            <UInput v-model="orderState.lockerPin" placeholder="Npr. 123456" size="lg" icon="i-lucide-key" />
          </UFormGroup>
        </div>

        <UFormGroup label="Učitajte PDF potvrdu narudžbe" help="Službeni dokument koji vam je IKEA poslala na e-mail." required class="mt-4">
          <div class="flex items-center justify-center w-full mt-2">
            <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition bg-white shadow-sm">
              <UIcon name="i-lucide-upload-cloud" class="w-10 h-10 text-blue-500 mb-2" />
              <span v-if="orderState.orderPdf" class="font-bold text-blue-700 text-lg">{{ orderState.orderPdf.name }}</span>
              <span v-else class="text-gray-600 font-bold">Kliknite za učitavanje PDF računa</span>
              <span v-if="!orderState.orderPdf" class="text-xs text-gray-400 mt-1">Maksimalna veličina: 5MB</span>
              <input type="file" accept="application/pdf" class="hidden" @change="handlePdfUpload" />
            </label>
          </div>
        </UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'contact_info'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToDelivery">Sljedeći korak &rarr;</UButton>
        </div>
      </div>

      <!-- ==========================================
           KORAK 5: DOSTAVA (S pitanjem o liftu)
           ========================================== -->
      <div v-if="currentStep === 'delivery_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4">
          <h3 class="text-xl font-extrabold text-gray-900">Adresa i istovar</h3>
          <p class="text-sm text-gray-500">Kamo dovozimo vaše pakete i kako ćemo ih istovariti?</p>
        </div>

        <input v-model="orderState.website" type="text" class="hidden" /> <!-- HONEYPOT -->

        <UFormGroup label="Ulica i kućni broj" required><UInput v-model="orderState.street" placeholder="Zagrebačka ulica 1" size="lg" icon="i-lucide-map-pin" /></UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Grad" required><UInput v-model="orderState.city" placeholder="Varaždin" size="lg" /></UFormGroup>
          <UFormGroup label="Poštanski broj" required><UInput v-model="orderState.zip" placeholder="42000" size="lg" /></UFormGroup>
        </div>

        <!-- Tip objekta, Kat i Lift -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
          <UFormGroup label="Tip objekta i kat" required>
            <div class="flex gap-4 mt-2">
              <select v-model="orderState.objectType" class="w-1/2 rounded-lg border border-gray-300 shadow-sm text-sm p-2 outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                <option value="kuca">Kuća</option>
                <option value="zgrada">Zgrada / Stan</option>
              </select>
              <UInput v-model="orderState.floor" :disabled="orderState.objectType === 'kuca'" :placeholder="orderState.objectType === 'kuca' ? 'Nije primjenjivo' : 'Koji kat (npr. 3. kat)?'" class="w-1/2" size="lg" />
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

        <UFormGroup label="Napomena za vozača (Opcionalno)" help="Ima li posebnih uputa (otežan prilaz zgradi, interfon, ne radi zvono)?"><UTextarea v-model="orderState.notes" placeholder="Napišite svoju napomenu ovdje..." /></UFormGroup>

        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'pickup_details'">Nazad</UButton>
          <UButton class="flex-1 justify-center shadow-xl" style="background-color: #facc15; color: #000; font-weight: 900;" size="xl" :loading="isSubmitting" @click="submitFinalOrder">
            Pošalji narudžbu
          </UButton>
        </div>
      </div>

      <!-- ==========================================
           KRAJ: USPJEH
           ========================================== -->
      <div v-if="currentStep === 'success'" class="animate-fade-in text-center py-10">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" /></div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">Sve je dogovoreno!</h3>
        <p class="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">Hvala vam, {{ orderState.name.split(' ')[0] }}. Uspješno smo zaprimili vaš zahtjev za dostavu i potvrdili termin za <strong class="text-black">{{ formatDateHR(pickupDate) }}</strong>.</p>
        <p class="mt-4 text-sm font-bold text-gray-500">Detalje o praćenju pošiljke poslali smo vam na e-mail.</p>
        <UButton color="gray" variant="ghost" class="mt-8 font-bold" @click="currentStep = 'calculator_and_date'; resetCheck()">Završi i vrati se na početak</UButton>
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
