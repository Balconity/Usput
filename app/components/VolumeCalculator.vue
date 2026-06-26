<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['status-changed'])

// --- KONFIGURACIJA CIJENA ---
const pricingConfig = ref({
  standard: 3.99,
  large: 6.99,
  driveway100: 43.99,
  room400: 95.20,
  room600: 103.20,
  room1000: 111.20,
  room1400: 207.20,
  roomOver1400: 250.00,
  disposal: 30.00
})

const { data: pricingData } = await useFetch('/api/admin/settings/pricing')
if (pricingData.value?.success && pricingData.value?.data) {
  const pd = pricingData.value.data
  pricingConfig.value = {
    standard: pd.standard ? Number(pd.standard) : 3.99,
    large: pd.large ? Number(pd.large) : 6.99,
    driveway100: pd.driveway100 ? Number(pd.driveway100) : 43.99,
    room400: pd.room400 ? Number(pd.room400) : 95.20,
    room600: pd.room600 ? Number(pd.room600) : 103.20,
    room1000: pd.room1000 ? Number(pd.room1000) : 111.20,
    room1400: pd.room1400 ? Number(pd.room1400) : 207.20,
    roomOver1400: pd.roomOver1400 ? Number(pd.roomOver1400) : 250.00,
    disposal: pd.disposal ? Number(pd.disposal) : 30.00
  }
}

// --- DOHVAĆANJE VOZNOG PARKA I ZAUZEĆA ---
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

// --- FORMA I DATUMI ---
const inactiveDates = computed(() => fleet.value.inactiveDates || [])

function getDefaultDate() {
  let date = new Date()
  let found = false
  while (!found) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const dateStr = date.toISOString().split('T')[0]
    if (inactiveDates.value.includes(dateStr)) continue
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

const listUrl = ref('')
const deliveryOption = ref<'curbside' | 'room'>('curbside')
const wantsDisposal = ref(false)
const disposalItemsCount = ref(1)

const orderState = reactive({
  name: '', phone: '', email: '', ikeaOrderNumber: '', ikeaEmail: '',
  street: '', city: '', zip: '42000', objectType: 'zgrada', floor: '', hasElevator: false, notes: '', website: ''
})
const formError = ref('')
const isSubmitting = ref(false)

// Automatski prekopiraj glavni email u IKEA email ako IKEA email još nije postavljen
watch(() => orderState.email, (newVal) => {
  if (currentStep.value === 'contact_info' && !orderState.ikeaEmail) {
    orderState.ikeaEmail = newVal
  }
})

// --- KALKULATOR I REZULTATI ---
const isCalculating = ref(false)
const volumeResult = ref<{ status: 'success' | 'error', title: string, message: string } | null>(null)
const detectedItems = ref<any[]>([])
const totalVolume = ref(0)
const totalWeight = ref(0)
const deliveryPrice = ref(0)

// --- PAMETNI PREDLAGAČ DATUMA ---
const suggestedAlternativeDate = ref<string | null>(null)
const formattedSuggestedDate = computed(() => {
  if (!suggestedAlternativeDate.value) return ''
  return new Date(suggestedAlternativeDate.value).toLocaleDateString('hr-HR', { weekday: 'short', day: 'numeric', month: 'short' })
})

function findFirstAvailableDate(requiredVolume: number) {
  let checkDate = new Date(pickupDate.value)
  let foundStr = null

  for (let i = 1; i <= 30; i++) {
    checkDate.setDate(checkDate.getDate() + 1)
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue

    const dateStr = checkDate.toISOString().split('T')[0]
    if (inactiveDates.value.includes(dateStr)) continue

    const assignedVid = fleet.value.assignments[dateStr]
    const checkVehicle = fleet.value.vehicles.find(v => v.id === assignedVid) || fleet.value.vehicles[0]
    const checkMaxVol = (checkVehicle.length * checkVehicle.width * checkVehicle.height) / 1000000

    const checkBookedVol = occupancyData.value?.occupancy ? (occupancyData.value.occupancy[dateStr] || 0) : 0
    const checkRemaining = checkMaxVol - checkBookedVol

    if (checkRemaining >= requiredVolume) {
      foundStr = dateStr
      break
    }
  }
  suggestedAlternativeDate.value = foundStr
}

function acceptSuggestedDate() {
  if (suggestedAlternativeDate.value) {
    pickupDate.value = suggestedAlternativeDate.value
  }
}

watch(pickupDate, () => {
  if (totalVolume.value > 0 && detectedItems.value.length > 0) {
    suggestedAlternativeDate.value = null
    evaluateFit()
  }
})

// --- OBRADA ARTIKALA ---
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
const loadingMessages = ['Povezujemo se s IKEA sustavom...', 'Skeniram šifre artikala u košarici...', 'Čitam dimenzije paketa...', 'Provjeravam preostali prostor u kombiju...']
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
        listUrl.value = parsed.url; pickupDate.value = parsed.date; totalVolume.value = parsed.volume; deliveryPrice.value = parsed.price;
        deliveryOption.value = parsed.deliveryOption || 'curbside'
        wantsDisposal.value = parsed.wantsDisposal || false
        disposalItemsCount.value = parsed.disposalItemsCount || 1
        startReservationTimer(parsed.expires)
      } else { localStorage.removeItem('usput_reservation') }
    } catch (e) { localStorage.removeItem('usput_reservation') }
  }
})

onBeforeUnmount(() => {
  if (loadingInterval) clearInterval(loadingInterval); if (progressInterval) clearInterval(progressInterval); if (reservationInterval) clearInterval(reservationInterval)
})

function clearUrl() {
  listUrl.value = ''
  if (volumeResult.value) resetCheck()
}

function calculatePrice(volume: number, weight: number, option: string) {
  const p = pricingConfig.value
  let baseCalc = 0

  if (option === 'room') {
    if (weight <= 400) baseCalc = p.room400
    else if (weight <= 600) baseCalc = p.room600
    else if (weight <= 1000) baseCalc = p.room1000
    else if (weight <= 1400) baseCalc = p.room1400
    else baseCalc = p.roomOver1400
  } else {
    if (weight <= 14.99) baseCalc = p.standard
    else if (weight <= 29.99) baseCalc = p.large
    else if (weight <= 100) baseCalc = p.driveway100
    else {
      if (weight <= 400) baseCalc = p.room400
      else if (weight <= 600) baseCalc = p.room600
      else if (weight <= 1000) baseCalc = p.room1000
      else if (weight <= 1400) baseCalc = p.room1400
      else baseCalc = p.roomOver1400
    }
  }

  let disposalCalc = 0
  if (wantsDisposal.value && disposalItemsCount.value > 0) {
    disposalCalc = disposalItemsCount.value * p.disposal
  }

  return baseCalc + disposalCalc
}

function recalculatePrice() {
  deliveryPrice.value = calculatePrice(totalVolume.value, totalWeight.value, deliveryOption.value)
}

watch([deliveryOption, wantsDisposal, disposalItemsCount], () => {
  if (volumeResult.value && volumeResult.value.status === 'success') recalculatePrice()
})

function evaluateFit() {
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
    findFirstAvailableDate(totalVolume.value)
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

  recalculatePrice()
}

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
  suggestedAlternativeDate.value = null; wantsDisposal.value = false; disposalItemsCount.value = 1
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

    if (response && response.success) {
      totalVolume.value = response.data.totalVolume || 0
      totalWeight.value = response.data.totalWeight || 0
      if (response.data.parsedItems) detectedItems.value = response.data.parsedItems
      evaluateFit()
    }
  } catch (error: any) {
    volumeResult.value = { status: 'error', title: 'Greška', message: error.statusMessage || 'Nismo uspjeli očitati sustav. Provjerite link košarice.' }
  } finally {
    stopLoadingAnimation(); setTimeout(() => { isCalculating.value = false }, 500)
  }
}

function confirmReservation() {
  currentStep.value = 'reserved'
  const expiresAt = Date.now() + 30 * 60 * 1000
  localStorage.setItem('usput_reservation', JSON.stringify({
    expires: expiresAt, date: pickupDate.value, url: listUrl.value, volume: totalVolume.value, price: deliveryPrice.value,
    deliveryOption: deliveryOption.value, wantsDisposal: wantsDisposal.value, disposalItemsCount: disposalItemsCount.value
  }))
  startReservationTimer(expiresAt)
}

function startReservationTimer(expiresAt: number) {
  const update = () => {
    const remaining = Math.floor((expiresAt - Date.now()) / 1000)
    if (remaining <= 0) { clearInterval(reservationInterval); alert('Vaša rezervacija je istekla.'); cancelReservation(true) }
    else { reservationTimeLeft.value = remaining }
  }
  update(); reservationInterval = setInterval(update, 1000)
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
  if (!orderState.ikeaOrderNumber || !orderState.ikeaEmail) { formError.value = 'Molimo ispunite podatke o IKEA narudžbi.'; return }
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
        transport: {
          price: deliveryPrice.value,
          totalVolume: totalVolume.value,
          totalWeight: totalWeight.value,
          totalBoxes: groupedProducts.value.reduce((acc, g) => acc + g.totalBoxes, 0),
          items: groupedProducts.value,
          disposalRequested: wantsDisposal.value,
          disposalItemsCount: wantsDisposal.value ? disposalItemsCount.value : 0
        }
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

    <div class="bg-gray-900 px-6 py-5 border-b border-gray-800">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Rezervacija dostave</h2>
        <div class="flex items-center gap-2 sm:gap-3">
          <div v-if="currentStep !== 'calculator' && currentStep !== 'success' && reservationTimeLeft > 0"
               class="flex items-center gap-1.5 text-xs font-black bg-gray-800 px-3 py-1 rounded-full text-red-400 border border-red-500/30 shadow-inner"
               :class="{'animate-pulse': reservationTimeLeft < 300}">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
            <span class="font-mono tracking-widest">{{ formattedTimeLeft }}</span>
          </div>

          <span class="text-xs font-bold bg-gray-800 text-yellow-400 px-3 py-1 rounded-full hidden sm:inline-block">
            Korak {{ currentStep === 'calculator' ? '1/5' : currentStep === 'reserved' ? '2/5' : currentStep === 'contact_info' ? '3/5' : currentStep === 'ikea_details' ? '4/5' : currentStep === 'delivery_details' ? '5/5' : 'Završeno' }}
          </span>
        </div>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div class="bg-yellow-400 h-1.5 transition-all duration-500 ease-out" :style="`width: ${progressPercentage}%`"></div>
      </div>
    </div>

    <div class="p-6 sm:p-8 min-h-[400px]">
      <UAlert v-if="formError" icon="i-lucide-alert-circle" color="red" variant="soft" :title="formError" class="mb-6 font-medium" />

      <div v-if="currentStep === 'calculator'" class="animate-fade-in space-y-6">
        <div class="text-center mb-4 mt-4">
          <h3 class="text-xl font-extrabold text-gray-900">Izračunajte cijenu isporuke i rezervirajte datum dostave</h3>
          <p class="text-sm text-gray-500 mt-1">Unesite link IKEA košarice i provjerite stane li narudžba u vozilo.</p>
        </div>

        <div class="bg-gray-50 border p-4 rounded-2xl space-y-3 transition-colors" :class="isDateInactive ? 'border-red-300 bg-red-50/30' : 'border-gray-200'">
          <UFormField label="Odaberite datum dostave">
            <UInput v-model="pickupDate" type="date" :min="minDate" size="lg" class="w-full bg-white font-bold text-gray-900 shadow-sm" :class="{'ring-2 ring-red-500 border-red-500': isDateInactive}" />
          </UFormField>

          <div v-if="isDateInactive" class="flex items-center gap-2 text-sm font-bold text-red-600 mt-2">
            <UIcon name="i-lucide-ban" class="w-5 h-5 shrink-0" />
            Nažalost, za odabrani datum ne vršimo preuzimanja. Molimo odaberite drugi dan.
          </div>

          <template v-else>
            <div class="flex items-center justify-between text-xs pt-2 mt-1 border-t border-gray-200/60 font-medium">
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

        <div v-if="!volumeResult && !isCalculating" class="space-y-6 animate-fade-in">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Poveznica podijeljene IKEA košarice</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UIcon name="i-lucide-link" class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                v-model="listUrl"
                type="text"
                placeholder="Zalijepite ovdje link iz IKEA aplikacije..."
                class="block w-full pl-10 pr-10 py-3.5 sm:text-sm border-gray-300 rounded-xl bg-white border-2 text-gray-900 shadow-sm focus:ring-0 focus:border-blue-500 hover:border-gray-400 transition-colors font-medium placeholder-gray-400"
              />
              <div v-if="listUrl" class="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button @click="clearUrl" type="button" class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Obriši unos">
                  <UIcon name="i-lucide-x" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <UButton block class="mt-2 font-black shadow-md hover:-translate-y-0.5 transition-transform" style="background-color: #facc15; color: #000;" size="xl" :disabled="!listUrl || !pickupDate || remainingVolumeForDate <= 0 || isDateInactive" @click="runVolumeCheck">
            {{ isDateInactive ? 'Odabrani dan je neradni' : (remainingVolumeForDate <= 0 ? 'Ovaj termin je popunjen' : 'Provjeri gabarite i izračunaj cijenu') }}
          </UButton>
        </div>

        <div v-if="isCalculating" class="mt-6 p-6 border border-yellow-200 rounded-xl flex flex-col items-center text-center bg-white relative overflow-hidden">
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

        <div v-if="volumeResult && !isCalculating" class="animate-fade-in space-y-6">
          <UAlert v-if="volumeResult.status === 'error'" color="red" variant="soft" icon="i-lucide-alert-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />
          <UAlert v-else color="green" variant="soft" icon="i-lucide-check-circle" :title="volumeResult.title" :description="volumeResult.message" class="font-bold" />

          <div v-if="volumeResult.status === 'error' && suggestedAlternativeDate" class="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-2 animate-fade-in text-center shadow-inner">
            <h4 class="font-bold text-blue-900 mb-2">Pronašli smo slobodan termin za Vas!</h4>
            <p class="text-sm text-blue-700 mb-4">Svi artikli iz Vaše košarice bez problema stanu u naš kombi u sljedećem terminu:</p>
            <UButton size="lg" color="blue" class="font-black w-full justify-center shadow-md hover:-translate-y-0.5 transition-transform" @click="acceptSuggestedDate">
              Odaberi {{ formattedSuggestedDate }}
            </UButton>
          </div>

          <div v-if="volumeResult.status === 'success'" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Volumen košarice</p>
              <p class="text-2xl font-black text-gray-900">{{ totalVolume }} m³</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Slobodno još {{ remainingVolumeForDate }} m³</p>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Težina košarice</p>
              <p class="text-2xl font-black text-gray-900">{{ totalWeight }} kg</p>
              <p class="text-[10px] text-gray-500 mt-0.5">Maks. nosivost: {{ activeVehicle.maxWeight }} kg</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1 relative overflow-hidden flex flex-col justify-center transition-colors" :class="{'bg-yellow-50 border-yellow-200': wantsDisposal}">
              <div v-if="wantsDisposal" class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">S Odvozom</div>
              <p class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="wantsDisposal ? 'text-yellow-700' : 'text-blue-700'">Ukupna cijena</p>
              <p class="text-2xl font-black" :class="wantsDisposal ? 'text-yellow-900' : 'text-blue-900'">{{ Number(deliveryPrice).toFixed(2).replace('.', ',') }} €</p>
            </div>
          </div>

          <div v-if="volumeResult.status === 'success' && groupedProducts.length > 0">
            <h4 class="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2"><UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-yellow-500" /> Detalji IKEA košarice</h4>
            <div class="space-y-4 max-h-[250px] overflow-y-auto pr-1 pb-2">
              <div v-for="group in groupedProducts" :key="group.code" class="border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white">
                <div class="bg-gray-900 p-4 flex items-center gap-3 border-b border-gray-800 text-white">
                  <img v-if="group.image" :src="group.image" class="w-12 h-12 object-contain rounded-xl border bg-white shrink-0" />
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
              </div>
            </div>
          </div>

          <div v-if="volumeResult.status === 'success'" class="space-y-6 pt-4 border-t border-gray-200">

            <UFormField label="1. Odaberite način isporuke (Obavezno)">
              <div class="flex flex-col sm:flex-row gap-4 w-full mt-2">
                <label class="flex-1 relative flex cursor-pointer rounded-2xl border p-4 hover:bg-gray-50 transition-colors" :class="deliveryOption === 'curbside' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-200 bg-white'">
                  <input type="radio" v-model="deliveryOption" value="curbside" class="sr-only" @change="recalculatePrice" />
                  <div class="flex items-center gap-3 w-full">
                    <div class="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                      <UIcon name="i-lucide-truck" class="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 text-sm leading-tight">Do kolnog prilaza</p>
                      <p class="text-xs text-gray-500 mt-0.5">Istovar ispred objekta</p>
                    </div>
                  </div>
                </label>

                <label class="flex-1 relative flex cursor-pointer rounded-2xl border p-4 hover:bg-gray-50 transition-colors" :class="deliveryOption === 'room' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-200 bg-white'">
                  <input type="radio" v-model="deliveryOption" value="room" class="sr-only" @change="recalculatePrice" />
                  <div class="flex items-center gap-3 w-full">
                    <div class="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                      <UIcon name="i-lucide-arrow-up-circle" class="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 text-sm leading-tight">Unos u prostoriju</p>
                      <p class="text-xs text-gray-500 mt-0.5">Fizički unos na kat / kuću</p>
                    </div>
                  </div>
                </label>
              </div>
            </UFormField>

            <UFormField label="2. Dodatne usluge (Opcionalno)">
              <label class="mt-2 relative flex flex-col cursor-pointer rounded-2xl border hover:bg-gray-50 transition-colors overflow-hidden" :class="wantsDisposal ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'border-gray-200 bg-white'">
                <input type="checkbox" v-model="wantsDisposal" class="sr-only" />

                <div class="p-4 flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                      <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-gray-700" />
                    </div>
                    <div class="text-left">
                      <p class="font-bold text-gray-900 text-sm">Zbrinjavanje starog namještaja</p>
                      <p class="text-xs text-gray-500 mt-0.5">Odvoz i reciklaža (+{{ Number(pricingConfig.disposal).toFixed(2).replace('.', ',') }} € / kom)</p>
                    </div>
                  </div>
                  <UIcon :name="wantsDisposal ? 'i-lucide-check-square-2' : 'i-lucide-square'" class="w-6 h-6 shrink-0 transition-colors" :class="wantsDisposal ? 'text-blue-600' : 'text-gray-300'" />
                </div>

                <div v-if="wantsDisposal" class="px-4 pb-4 animate-fade-in">
                  <div class="pt-4 border-t border-blue-200/50 flex items-center justify-between">
                    <span class="text-sm font-bold text-blue-900">Koliko komada odnosimo?</span>
                    <div class="flex items-center gap-3 bg-white border border-blue-200 rounded-lg p-1 shadow-sm" @click.prevent>
                      <button @click.prevent="disposalItemsCount > 1 ? disposalItemsCount-- : null" class="w-8 h-8 rounded flex items-center justify-center text-blue-700 hover:bg-blue-50 transition-colors font-bold disabled:opacity-30 disabled:hover:bg-transparent" :disabled="disposalItemsCount <= 1">
                        <UIcon name="i-lucide-minus" class="w-4 h-4" />
                      </button>
                      <span class="font-black text-gray-900 w-4 text-center">{{ disposalItemsCount }}</span>
                      <button @click.prevent="disposalItemsCount++" class="w-8 h-8 rounded flex items-center justify-center text-blue-700 hover:bg-blue-50 transition-colors font-bold">
                        <UIcon name="i-lucide-plus" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </label>
            </UFormField>

            <UButton block class="shadow-xl font-black mt-8" style="background-color: #facc15; color: #000;" size="xl" icon="i-lucide-arrow-right" trailing @click="confirmReservation">Sve je točno, rezerviraj termin</UButton>
          </div>

          <button @click="resetCheck" class="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-900 underline mt-4">Odustani i provjeri drugu košaricu</button>
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
            <li>Ostavite ovaj prozor otvorenim.</li><li>Otiđite na IKEA webshop i završite kupnju.</li><li>Odaberite <strong>IKEA Paketomat</strong>.</li><li>Za preuzimatelja upišite: <span class="bg-white px-2 py-1 rounded shadow-sm text-black border select-all">Tomislav Levkuš</span></li><li>Vratite se ovdje za nastavak.</li>
          </ol>
        </div>
        <UButton block size="xl" style="background-color: #facc15; color: #000; font-weight: 900;" class="mt-4 hover:-translate-y-0.5 transition-transform" @click="proceedToContact">Završio/la sam kupnju, idemo dalje &rarr;</UButton>
        <button @click="cancelReservation(false)" class="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors mt-2">Odustani od rezervacije</button>
      </div>

      <div v-if="currentStep === 'contact_info'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Osobni podaci</h3></div>
        <UFormField label="Vaše ime i prezime" required><UInput v-model="orderState.name" size="lg" icon="i-lucide-user" class="w-full" /></UFormField>
        <UFormField label="E-mail adresa" required><UInput v-model="orderState.email" type="email" size="lg" icon="i-lucide-mail" class="w-full" /></UFormField>
        <UFormField label="Broj mobitela" required><UInput v-model="orderState.phone" type="tel" size="lg" icon="i-lucide-phone" class="w-full" /></UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'reserved'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold shadow-md hover:-translate-y-0.5 transition-transform" color="black" size="xl" @click="proceedToIkeaDetails">Sljedeći korak &rarr;</UButton>
        </div>
      </div>

      <div v-if="currentStep === 'ikea_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Podaci iz IKEA-e</h3></div>
        <UFormField label="Broj narudžbe" required><UInput v-model="orderState.ikeaOrderNumber" size="lg" icon="i-lucide-hash" class="w-full" /></UFormField>
        <UFormField label="E-mail s kojim je naručeno" required>
          <UInput v-model="orderState.ikeaEmail" type="email" size="lg" icon="i-lucide-mail" class="w-full" />
          <template #help><span class="text-xs text-gray-400 mt-1 block">Na ovu adresu će Vam IKEA poslati obavijesti o pošiljci.</span></template>
        </UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'contact_info'">Nazad</UButton>
          <UButton class="flex-1 justify-center font-bold shadow-md hover:-translate-y-0.5 transition-transform" color="black" size="xl" @click="proceedToDelivery">Zadnji korak &rarr;</UButton>
        </div>
      </div>

      <div v-if="currentStep === 'delivery_details'" class="animate-fade-in space-y-6">
        <div class="mb-6 border-b pb-4"><h3 class="text-xl font-extrabold text-gray-900">Adresa isporuke</h3></div>
        <input v-model="orderState.website" type="text" class="hidden" /> <UFormField label="Ulica i kućni broj" required><UInput v-model="orderState.street" size="lg" icon="i-lucide-map-pin" class="w-full" /></UFormField>
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
          <div v-if="orderState.objectType === 'zgrada'" class="mt-4 pt-4 border-t border-gray-200">
            <UCheckbox v-model="orderState.hasElevator" color="yellow" class="font-bold text-gray-900">
              <template #label>Zgrada ima <strong>prostran lift</strong></template>
            </UCheckbox>
          </div>
        </div>
        <UFormField label="Napomena za vozača (Opcionalno)"><UTextarea v-model="orderState.notes" class="w-full" /></UFormField>
        <div class="flex gap-4 pt-4 border-t border-gray-100">
          <UButton variant="soft" color="gray" size="xl" @click="currentStep = 'ikea_details'">Nazad</UButton>
          <UButton class="flex-1 justify-center shadow-xl font-black hover:-translate-y-0.5 transition-transform" style="background-color: #facc15; color: #000;" size="xl" :loading="isSubmitting" @click="submitFinalOrder">Pošalji narudžbu</UButton>
        </div>
      </div>

      <div v-if="currentStep === 'success'" class="animate-fade-in text-center py-10">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" /></div>
        <h3 class="text-3xl font-black text-gray-900 mb-4">Sve je dogovoreno!</h3>
        <p class="text-lg text-gray-600 max-w-md mx-auto mb-2">Zahtjev za dostavu je uspješno zaprimljen za <strong>{{ formattedPickupDate }}</strong>.</p>
        <p class="text-sm font-bold text-gray-500">Kopiju potvrde poslali smo Vam na e-mail.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
</style>
