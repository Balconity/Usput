<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['status-changed'])

// --- KONFIGURACIJA CIJENA ---
const pricingConfig = {
  basePrice: 5, roomDeliverySurcharge: 25,
  weightTiers: [{ max: 15, add: 0 }, { max: 30, add: 5 }, { max: 100, add: 15 }, { max: 250, add: 25 }, { max: Infinity, add: 40 }],
  volumeTiers: [{ max: 0.1, add: 0 }, { max: 0.5, add: 5 }, { max: 1.0, add: 15 }, { max: Infinity, add: 25 }]
}
const contactConfig = { phone: '091 234 5678', email: 'contact@balconity.hr' }

// --- 1. DOHVAĆANJE VOZNOG PARKA I ZAUZEĆA IZ BAZE ---
const fleet = ref({ vehicles: [] as any[], assignments: {} as Record<string, string>, inactiveDates: [] as string[] })

const { data: vehicleData } = await useFetch('/api/admin/settings/vehicle')
if (vehicleData.value?.success && vehicleData.value?.data?.vehicles) {
  fleet.value = vehicleData.value.data
  if (!fleet.value.inactiveDates) fleet.value.inactiveDates = []
}

if (fleet.value.vehicles.length === 0) {
  fleet.value.vehicles.push({ id: 'fallback', name: 'Dostavno Vozilo', length: 200, width: 110, height: 90, maxWeight: 500 })
}

const { data: occupancyData, refresh: refreshOccupancy } = await useFetch('/api/public/occupancy')

// --- STANJA APLIKACIJE ---
type Step = 'calculator' | 'reserved' | 'contact_info' | 'ikea_details' | 'delivery_details' | 'success'
const currentStep = ref<Step>('calculator')

const progressPercentage = computed(() => {
  switch (currentStep.value) {
    case 'calculator': return 15; case 'reserved': return 35; case 'contact_info': return 55;
    case 'ikea_details': return 75; case 'delivery_details': return 90; case 'success': return 100;
    default: return 0
  }
})

// --- FORMA I PODACI (PAMETNO PREDLAGANJE DATUMA) ---
const inactiveDates = computed(() => fleet.value.inactiveDates || [])

function getDefaultDate() {
  let date = new Date()
  let found = false
  // Petlja traži prvi idući dan koji NIJE vikend i NIJE na popisu tvojih neradnih dana
  while (!found) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() === 0 || date.getDay() === 6) continue // Preskoči vikend

    const dateStr = date.toISOString().split('T')[0]
    if (inactiveDates.value.includes(dateStr)) continue // Preskoči tvoj neradni dan

    found = true
  }
  return date.toISOString().split('T')[0]
}

const pickupDate = ref(getDefaultDate())
const minDate = computed(() => new Date().toISOString().split('T')[0])

const formattedPickupDate = computed(() => {
  if (!pickupDate.value) return ''
  return new Date(pickupDate.value).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
})

const isDateInactive = computed(() => inactiveDates.value.includes(pickupDate.value))

// --- IZRAČUN DOSTUPNOSTI PROSTORA U REALNOM VREMENU ---
const activeVehicle = computed(() => {
  const assignedId = fleet.value.assignments[pickupDate.value]
  if (assignedId) {
    const found = fleet.value.vehicles.find(v => v.id === assignedId)
    if (found) return found
  }
  return fleet.value.vehicles[0]
})

const VEHICLE_MAX_VOLUME = computed(() => {
  return Number(((activeVehicle.value.length * activeVehicle.value.width * activeVehicle.value.height) / 1000000).toFixed(2))
})

const bookedVolumeForDate = computed(() => {
  if (!occupancyData.value?.success || !pickupDate.value) return 0
  return occupancyData.value.occupancy[pickupDate.value] || 0
})

const remainingVolumeForDate = computed(() => {
  const rem = VEHICLE_MAX_VOLUME.value - bookedVolumeForDate.value
  return rem > 0 ? Number(rem.toFixed(2)) : 0
})

watch(pickupDate, () => { if (volumeResult.value) resetCheck() })

const listUrl = ref('')
const deliveryOption = ref<'curbside' | 'room'>('curbside')

const orderState = reactive({
  name: '', phone: '', email: '', ikeaOrderNumber: '', ikeaEmail: '',
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

const groupedProducts = computed(() => {
  const groups: any[] = [];
  detectedItems.value.forEach(item => {
    if (item.price > 0) groups.push({ code: item.code, name: item.name, price: item.price, image: item.image, packages: [] });
    if (item.dimensions && (item.dimensions.volume > 0 || item.dimensions.weight > 0)) {
      const currentGroup = groups[groups.length - 1];
      if (currentGroup) currentGroup.packages.push(item);
      else groups.push({ code: item.code, name: item.name, price: 0, image: item.image, packages: [item] });
    }
  });
  return groups.map(g => {
    const totalBoxes = g.packages.reduce((sum: number, p: any) => sum + p.quantity, 0);
    const totalWeight = g.packages.reduce((sum: number, p: any) => sum + (p.dimensions.weight * p.quantity), 0);
    const totalVolume = g.packages.reduce((sum: number, p: any) => sum + (p.dimensions.volume * p.quantity), 0);
    return { ...g, totalBoxes, totalWeight: Number(totalWeight.toFixed(2)), totalVolume: Number(totalVolume.toFixed(3)) };
  });
});

// --- ANIMACIJE ---
const loadingMessages = ['Povezujemo se s IKEA sustavom...', 'Skeniram šifre artikala...', 'Čitam dimenzije paketa...', 'Provjeravam preostali prostor u kombiju...']
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
        listUrl.value = parsed.url; pickupDate.value = parsed.date; totalVolume.value = parsed.volume; deliveryPrice.value = parsed.price; deliveryOption.value = parsed.deliveryOption || 'curbside'
        startReservationTimer(parsed.expires)
      } else { localStorage.removeItem('usput_reservation') }
    } catch (e) { localStorage.removeItem('usput_reservation') }
  }
})

onBeforeUnmount(() => {
  if (loadingInterval) clearInterval(loadingInterval); if (progressInterval) clearInterval(progressInterval); if (reservationInterval) clearInterval(reservationInterval)
})

function recalculatePrice() { deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value) }

function startLoadingAnimation() {
  currentLoadingMessage.value = loadingMessages[0]; simulatedProgress.value = 0; let messageIndex = 0
  loadingInterval = setInterval(() => { messageIndex = (messageIndex + 1) % loadingMessages.length; currentLoadingMessage.value = loadingMessages[messageIndex] }, 1800)
  progressInterval = setInterval(() => { if (simulatedProgress.value < 90) simulatedProgress.value += (90 - simulatedProgress.value) * 0.1 }, 300)
}

function stopLoadingAnimation() {
  if (loadingInterval) clearInterval(loadingInterval); if (progressInterval) clearInterval(progressInterval)
  simulatedProgress.value = 100
}

function resetCheck() {
  volumeResult.value = null; detectedItems.value = []; totalVolume.value = 0; totalWeight.value = 0; deliveryPrice.value = 0
}

function calculatePrice(volume: number, weight: number, option: string) {
  let price = pricingConfig.basePrice
  if (option === 'room') price += pricingConfig.roomDeliverySurcharge
  for (const tier of pricingConfig.weightTiers) { if (weight <= tier.max) { price += tier.add; break } }
  for (const tier of pricingConfig.volumeTiers) { if (volume <= tier.max) { price += tier.add; break } }
  return price
}

async function runVolumeCheck() {
  if (!listUrl.value || !pickupDate.value) return
  isCalculating.value = true; resetCheck(); startLoadingAnimation()

  try {
    let targetUrl = listUrl.value
    if (!targetUrl.includes('www.ikea.com') || targetUrl.includes(' ')) {
      const parseResponse: any = await $fetch('/api/parse-cart', { method: 'POST', body: { text: targetUrl } })
      if (parseResponse && parseResponse.success) { targetUrl = parseResponse.finalWebUrl; listUrl.value = targetUrl }
    }
    const response = await $fetch('/api/list-volume', { method: 'POST', body: { url: targetUrl } })
    await new Promise(r => setTimeout(r, 800))
    handleVolumeResponse(response)
  } catch (error: any) {
    volumeResult.value = { status: 'error', title: 'Greška', message: error.statusMessage || 'Nismo uspjeli očitati sustav. Provjerite link.' }
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

    if (data.parsedItems && data.parsedItems.length > 0) detectedItems.value = data.parsedItems

    const vehicleDims = [activeVehicle.value.length, activeVehicle.value.width, activeVehicle.value.height].sort((a, b) => b - a);
    let oversizedPackage = null;

    for (const item of detectedItems.value) {
      if (item.dimensions) {
        const { length = 0, width = 0, height = 0 } = item.dimensions;
        const pkgDims = [length, width, height].sort((a, b) => b - a);
        if (pkgDims[0] > vehicleDims[0] || pkgDims[1] > vehicleDims[1] || pkgDims[2] > vehicleDims[2]) {
          oversizedPackage = item; break;
        }
      }
    }

    const prospectiveTotalVolume = bookedVolumeForDate.value + totalVolume.value

    if (prospectiveTotalVolume > VEHICLE_MAX_VOLUME.value) {
      volumeResult.value = {
        status: 'error',
        title: 'Nema dovoljno prostora u kombiju.',
        message: `Vaša narudžba zahtijeva ${totalVolume.value} m³, međutim u vozilu za odabrani dan preostalo je još samo ${remainingVolumeForDate.value} m³ slobodnog mjesta.`
      }
    } else if (totalWeight.value > activeVehicle.value.maxWeight) {
      volumeResult.value = { status: 'error', title: 'Premašena nosivost.', message: `Vaša narudžba (${totalWeight.value} kg) je teža od maksimalne preostale nosivosti vozila.` }
    } else if (oversizedPackage) {
      volumeResult.value = { status: 'error', title: 'Paket je prevelik!', message: `Artikl "${oversizedPackage.name}" svojim dimenzijama fizički ne stane u kombi planiran za ovaj datum.` }
    } else {
      volumeResult.value = { status: 'success', title: 'Sve stane!', message: `U kombiju ima dovoljno mjesta. Možemo uspješno zaprimiti Vašu dostavu.` }
    }
  }
}

function confirmReservation() {
  currentStep.value = 'reserved'
  const expiresAt = Date.now() + 30 * 60 * 1000
  localStorage.setItem('usput_reservation', JSON.stringify({
    expires: expiresAt, date: pickupDate.value, url: listUrl.value, volume: totalVolume.value, price: deliveryPrice.value, deliveryOption: deliveryOption.value
  }))
  startReservationTimer(expiresAt)
}

function startReservationTimer(expiresAt: number) {
  const update = () => {
    const remaining = Math.floor((expiresAt - Date.now()) / 1000)
    if (remaining <= 0) { clearInterval(reservationInterval); alert('Vaša rezervacija je istekla.'); cancelReservation(true) }
    else { reservationTimeLeft.value = remaining }
  }
  update()
  reservationInterval = setInterval(update, 1000)
}

function cancelReservation(autoExpired = false) {
  if (!autoExpired && !confirm('Jeste li sigurni da želite otkazati rezervaciju?')) return
  if (reservationInterval) clearInterval(reservationInterval)
  localStorage.removeItem('usput_reservation')
  currentStep.value = 'calculator'
  resetCheck(); formError.value = ''
}

function proceedToContact() { currentStep.value = 'contact_info'; emit('status-changed', true) }
function proceedToIkeaDetails() {
  formError.value = ''
  if (!orderState.name || !orderState.phone || !orderState.email) { formError.value = 'Molimo ispunite sve osobne podatke.'; return }
  currentStep.value = 'ikea_details'
}
function proceedToDelivery() {
  formError.value = ''
  if (!orderState.ikeaOrderNumber || !orderState.ikeaEmail) { formError.value = 'Molimo ispunite IKEA podatke.'; return }
  currentStep.value = 'delivery_details'
}

async function submitFinalOrder() {
  formError.value = ''
  if (orderState.website !== '') return
  if (!orderState.street || !orderState.city || !orderState.zip) { formError.value = 'Molimo unesite punu adresu.'; return }

  isSubmitting.value = true
  try {
    const response = await $fetch('/api/submit-order', {
      method: 'POST',
      body: {
        personalInfo: { name: orderState.name, email: orderState.email, phone: orderState.phone },
        ikeaDetails: { orderNumber: orderState.ikeaOrderNumber, ikeaEmail: orderState.ikeaEmail, listUrl: listUrl.value },
        delivery: { date: pickupDate.value, option: deliveryOption.value, street: orderState.street, city: orderState.city, zip: orderState.zip, objectType: orderState.objectType, floor: orderState.floor, hasElevator: orderState.hasElevator, notes: orderState.notes },
        transport: { price: deliveryPrice.value, totalVolume: totalVolume.value, totalWeight: totalWeight.value, totalBoxes: groupedProducts.value.reduce((acc, g) => acc + g.totalBoxes, 0), items: groupedProducts.value }
      }
    })
    if (response && response.success) {
      if (reservationInterval) clearInterval(reservationInterval); localStorage.removeItem('usput_reservation')
      currentStep.value = 'success'
      await refreshOccupancy()
    } else formError.value = 'Dogodila se greška na poslužitelju.'
  } catch (error) {
    formError.value = 'Server je nedostupan.'; console.error(error)
  } finally { isSubmitting.value = false }
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
          <div class="text-center mb-4">
            <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4"><UIcon name="i-lucide-link" class="w-6 h-6" /></div>
            <h3 class="text-xl font-extrabold text-gray-900">Unos liste i izračun cijene</h3>
            <p class="text-sm text-gray-500 mt-1">Doznajte odmah cijenu dostave i provjerite slobodan prostor.</p>
          </div>

          <div class="bg-gray-50 border p-4 rounded-2xl space-y-3 transition-colors" :class="isDateInactive ? 'border-red-300 bg-red-50/30' : 'border-gray-200'">
            <UFormField label="Datum preuzimanja u Zagrebu">
              <UInput v-model="pickupDate" type="date" :min="minDate" size="lg" class="w-full bg-white" :class="{'ring-2 ring-red-500 border-red-500': isDateInactive}" />
            </UFormField>

            <div v-if="isDateInactive" class="flex items-center gap-2 text-sm font-bold text-red-600 mt-2">
              <UIcon name="i-lucide-ban" class="w-5 h-5 shrink-0" />
              Nažalost, za odabrani datum ne vršimo preuzimanja. Molimo odaberite drugi dan.
            </div>

            <template v-else>
              <div class="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 font-medium">
                <span class="text-gray-500">Dostupno vozilo za ovaj dan:</span>
                <span class="text-gray-900 font-bold uppercase tracking-wider">{{ activeVehicle?.name }}</span>
              </div>
              <div class="flex items-center justify-between text-xs font-medium">
                <span class="text-gray-500">Preostali slobodni prostor:</span>
                <span class="font-black text-sm" :class="remainingVolumeForDate <= 0.5 ? 'text-red-500 animate-pulse' : (remainingVolumeForDate <= 2 ? 'text-yellow-600' : 'text-green-600')">
                  {{ remainingVolumeForDate }} m³ <span class="text-[10px] font-normal text-gray-400">(od ukupno {{ VEHICLE_MAX_VOLUME }} m³)</span>
                </span>
              </div>
            </template>
          </div>

          <UFormField label="Usluga istovara na adresi">
            <div class="flex gap-4 mt-1 w-full">
              <label class="flex-1 relative flex cursor-pointer rounded-xl border p-3 hover:bg-gray-50 transition-colors" :class="deliveryOption === 'curbside' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 bg-white'">
                <input type="radio" v-model="deliveryOption" value="curbside" class="sr-only" @change="recalculatePrice" />
                <div class="text-center w-full"><p class="font-bold text-gray-900 text-sm">Do kolnog prilaza</p><p class="text-xs text-gray-500">Istovar ispred objekta</p></div>
              </label>
              <label class="flex-1 relative flex cursor-pointer rounded-xl border p-3 hover:bg-gray-50 transition-colors" :class="deliveryOption === 'room' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 bg-white'">
                <input type="radio" v-model="deliveryOption" value="room" class="sr-only" @change="recalculatePrice" />
                <div class="text-center w-full"><p class="font-bold text-gray-900 text-sm">Unos u prostoriju</p><p class="text-xs text-gray-500">+{{ pricingConfig.roomDeliverySurcharge }} € nadoplata</p></div>
              </label>
            </div>
          </UFormField>

          <UFormField label="Poveznica podijeljene košarice">
            <UInput v-model="listUrl" type="text" placeholder="Zalijepite link ili poruku s mobitela..." size="xl" icon="i-lucide-search" class="w-full" />
          </UFormField>

          <UButton block class="mt-2 font-black shadow-md" style="background-color: #facc15; color: #000;" size="xl" :disabled="!listUrl || !pickupDate || remainingVolumeForDate <= 0 || isDateInactive" @click="runVolumeCheck">
            {{ isDateInactive ? 'Odabrani dan je neradni' : (remainingVolumeForDate <= 0 ? 'Ovaj termin je popunjen' : 'Provjeri gabarite i izračunaj cijenu') }}
          </UButton>
        </div>

        <div v-if="isCalculating" class="mt-6 p-6 border border-yellow-200 rounded-xl flex flex-col items-center text-center bg-white">
          <div class="absolute inset-0 bg-yellow-50/50 animate-pulse"></div>
          <div class="relative z-10 flex flex-col items-center w-full">
            <UIcon name="i-lucide-box" class="w-10 h-10 text-yellow-600 animate-bounce mb-4" />
            <h4 class="text-lg font-extrabold text-gray-900 mb-2">Samo trenutak...</h4>
            <p class="text-sm text-gray-600 h-5">{{ currentLoadingMessage }}</p>
            <div class="w-full max-w-[240px] h-2 bg-gray-100 rounded-full mt-6 overflow-hidden"><div class="h-full bg-yellow-400 transition-all duration-300" :style="{ width: `${simulatedProgress}%` }"></div></div>
          </div>
        </div>

        <div v-if="volumeResult && !isCalculating" class="animate-fade-in space-y-6">
          <UAlert v-if="volumeResult.status === 'error'" color="red" variant="soft" icon="i-lucide-alert-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />
          <UAlert v-else color="green" variant="soft" icon="i-lucide-check-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Volumen narudžbe</p>
              <p class="text-2xl font-black text-gray-900">{{ totalVolume }} m³</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Slobodno još {{ remainingVolumeForDate }} m³</p>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Težina narudžbe</p>
              <p class="text-2xl font-black text-gray-900">{{ totalWeight }} kg</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Maks. nosivost: {{ activeVehicle.maxWeight }} kg</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <p class="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Cijena dostave</p>
              <p class="text-2xl font-black text-blue-900">{{ deliveryPrice }} €</p>
            </div>
          </div>

          <div v-if="groupedProducts.length > 0">
            <h4 class="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2"><UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-yellow-500" /> Vaši IKEA paketi</h4>
            <div class="space-y-4">
              <div v-for="group in groupedProducts" :key="group.code" class="border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white">

                <div class="bg-gray-900 p-4 flex items-center gap-3 border-b border-gray-800 text-white">
                  <img v-if="group.image" :src="group.image" class="w-14 h-14 object-contain rounded-xl border bg-white shrink-0" />
                  <div class="space-y-0.5">
                    <h5 class="font-bold text-yellow-400 text-sm sm:text-base leading-tight">{{ group.name }}</h5>
                    <div class="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-medium text-gray-400 mt-1">
                      <span class="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{{ group.code }}</span>
                      <span class="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold">📦 {{ group.totalBoxes }} kom</span>
                      <span class="bg-gray-800 px-1.5 py-0.5 rounded text-sky-400 font-bold">🧊 {{ group.totalVolume }} m³</span>
                      <span class="bg-gray-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">⚖️ {{ group.totalWeight }} kg</span>
                    </div>
                  </div>
                </div>

                <div class="p-3 bg-gray-50/50">
                  <ul class="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                    <li v-for="pkg in group.packages" :key="pkg.code" class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div class="min-w-0"><p class="font-bold text-gray-800 leading-tight">{{ pkg.name }}</p></div>

                      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6 font-medium text-gray-500 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div>
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Dimenzije</p>
                          <p class="font-mono text-gray-700 font-bold">{{ pkg.dimensions.width }}×{{ pkg.dimensions.height }}×{{ pkg.dimensions.length }} cm</p>
                        </div>
                        <div class="min-w-[60px]">
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Volumen</p>
                          <p class="text-sky-700 font-black">{{ (pkg.dimensions.volume * pkg.quantity).toFixed(3) }} m³</p>
                        </div>
                        <div class="min-w-[60px]">
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Težina</p>
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
          </div>

          <div v-if="volumeResult.status === 'success'" class="space-y-4 pt-2">
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span class="text-sm font-medium text-gray-700">Trebate li ipak unos robe u kuću/stan?</span>
              <UToggle v-model="deliveryOption" on-value="room" off-value="curbside" color="yellow" @change="recalculatePrice" />
            </div>
            <UButton block class="shadow-xl font-black" style="background-color: #facc15; color: #000;" size="xl" icon="i-lucide-arrow-right" trailing @click="confirmReservation">Sve je točno, rezerviraj termin</UButton>
          </div>

          <button @click="resetCheck" class="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-900 underline mt-4">Provjeri novi link</button>
        </div>
      </div>

      <!-- KORAKOVI OD 2 DO 6 OSTAJU ISTI ... -->
      <div v-if="currentStep === 'reserved'" class="animate-fade-in space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-black text-gray-900">Termin je vaš!</h3>
          <p class="text-gray-600">Čuvamo vam mjesto za <strong>{{ formattedPickupDate }}</strong>. Slijedite upute ispod.</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left mb-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <h4 class="font-extrabold text-blue-900 text-lg mb-3">Važno: Što sad trebate napraviti?</h4>
          <ol class="list-decimal pl-5 text-sm text-blue-800 space-y-3 font-medium">
            <li>Ostavite ovaj prozor otvorenim.</li><li>Otiđite na IKEA webshop i završite kupnju.</li><li>Odaberite <strong>IKEA Paketomat</strong>.</li><li>Za preuzimatelja upišite: <span class="bg-white px-2 py-1 rounded shadow-sm text-black border select-all">Tomislav Levkuš</span></li><li>Vratite se ovdje za nastavak.</li>
          </ol>
        </div>
        <div class="flex items-center justify-between bg-gray-900 text-white rounded-xl px-6 py-4 shadow-inner mt-4">
          <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Preostalo vrijeme:</span>
          <span class="text-3xl font-mono font-black text-yellow-400">{{ formattedTimeLeft }}</span>
        </div>
        <UButton block size="xl" style="background-color: #facc15; color: #000; font-weight: 900;" class="mt-4" @click="proceedToContact">Završio/la sam kupnju, idemo dalje &rarr;</UButton>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <div v-if="currentStep === 'contact_info'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Osobni podaci</h3></div>
        <UFormField label="Vaše ime i prezime" required><UInput v-model="orderState.name" size="lg" icon="i-lucide-user" class="w-full" /></UFormField>
        <UFormField label="E-mail adresa" required><UInput v-model="orderState.email" type="email" size="lg" icon="i-lucide-mail" class="w-full" /></UFormField>
        <UFormField label="Broj mobitela" required><UInput v-model="orderState.phone" type="tel" size="lg" icon="i-lucide-phone" class="w-full" /></UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100"><UButton variant="soft" color="gray" size="xl" @click="currentStep = 'reserved'">Nazad</UButton><UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToIkeaDetails">Sljedeći korak &rarr;</UButton></div>
      </div>

      <div v-if="currentStep === 'ikea_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Podaci iz IKEA-e</h3></div>
        <UFormField label="Broj narudžbe" required><UInput v-model="orderState.ikeaOrderNumber" size="lg" icon="i-lucide-hash" class="w-full" /></UFormField>
        <UFormField label="E-mail s kojim je naručeno" required><UInput v-model="orderState.ikeaEmail" type="email" size="lg" icon="i-lucide-mail" class="w-full" /></UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100"><UButton variant="soft" color="gray" size="xl" @click="currentStep = 'contact_info'">Nazad</UButton><UButton class="flex-1 justify-center font-bold" color="black" size="xl" @click="proceedToDelivery">Zadnji korak &rarr;</UButton></div>
      </div>

      <div v-if="currentStep === 'delivery_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Adresa isporuke</h3></div>
        <input v-model="orderState.website" type="text" class="hidden" />
        <UFormField label="Ulica i kućni broj" required><UInput v-model="orderState.street" size="lg" icon="i-lucide-map-pin" class="w-full" /></UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Grad" required><UInput v-model="orderState.city" size="lg" class="w-full" /></UFormField>
          <UFormField label="Poštanski broj" required><UInput v-model="orderState.zip" size="lg" class="w-full" /></UFormField>
        </div>
        <div v-if="deliveryOption === 'room'" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
          <UFormField label="Tip objekta i kat" required>
            <div class="flex gap-4 mt-2 w-full">
              <select v-model="orderState.objectType" class="w-1/2 rounded-lg border border-gray-300 shadow-sm p-2"><option value="kuca">Kuća</option><option value="zgrada">Zgrada / Stan</option></select>
              <UInput v-model="orderState.floor" :disabled="orderState.objectType === 'kuca'" :placeholder="orderState.objectType === 'kuca' ? 'Nije primjenjivo' : 'Koji kat?'" class="w-1/2" size="lg" />
            </div>
          </UFormField>
          <div v-if="orderState.objectType === 'zgrada'" class="mt-4 pt-4 border-t border-gray-200"><UCheckbox v-model="orderState.hasElevator" color="yellow" class="font-bold text-gray-900"><template #label>Zgrada ima <strong>prostran lift</strong></template></UCheckbox></div>
        </div>
        <UFormField label="Napomena za vozača (Opcionalno)"><UTextarea v-model="orderState.notes" class="w-full" /></UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100"><UButton variant="soft" color="gray" size="xl" @click="currentStep = 'ikea_details'">Nazad</UButton><UButton class="flex-1 justify-center shadow-xl font-black" style="background-color: #facc15; color: #000;" size="xl" :loading="isSubmitting" @click="submitFinalOrder">Pošalji narudžbu</UButton></div>
      </div>

      <div v-if="currentStep === 'success'" class="animate-fade-in text-center py-10">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" /></div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">Sve je dogovoreno!</h3>
        <p class="text-lg text-gray-600 max-w-md mx-auto">Zahtjev za dostavu je uspješno zaprimljen za <strong>{{ formattedPickupDate }}</strong>.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
</style>
